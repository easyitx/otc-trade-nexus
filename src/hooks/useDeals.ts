
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Deal } from '@/types';
import { useToast } from './use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useDeals() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Старая функция для создания сделки напрямую между пользователями
  const createDeal = async (orderId: string, sellerId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a deal",
        variant: "destructive"
      });
      return { data: null, error: "Authentication required" };
    }

    try {
      const { data, error } = await supabase
        .from('deals')
        .insert({
          order_id: orderId,
          buyer_id: currentUser.id,
          seller_id: sellerId,
          status: 'NEGOTIATING'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Deal created",
        description: "You can now start chatting with the counterparty"
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Failed to create deal",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error: error.message };
    }
  };

  // Новая функция для создания сделки с менеджером
  const createDealWithManager = async (orderId: string, initialMessage: string, reserveAmount?: number, dealType: string = 'OTC') => {
    if (!currentUser) {
      toast({
        title: "Требуется авторизация",
        description: "Вы должны быть авторизованы для создания сделки",
        variant: "destructive"
      });
      return { data: null, error: "Требуется авторизация" };
    }

    try {
      // Получаем информацию о заказе
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Находим менеджера (для демо просто берем любого с ролью менеджера или админа)
      const { data: managers, error: managerError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['manager', 'admin'])
        .limit(1);

      if (managerError) throw managerError;
      
      if (!managers || managers.length === 0) {
        throw new Error("Нет доступных менеджеров");
      }
      
      const managerId = managers[0].user_id;
      
      // Создаем сделку между пользователем и менеджером
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .insert({
          order_id: orderId,
          // В зависимости от типа ордера определяем кто покупатель, а кто продавец
          buyer_id: orderData.type === 'BUY' ? currentUser.id : managerId,
          seller_id: orderData.type === 'SELL' ? currentUser.id : managerId,
          status: 'NEGOTIATING',
          // Метаданные о сделке храним в сериализованном JSON
          deal_metadata: JSON.stringify({
            dealType: dealType,
            reserveAmount: reserveAmount || orderData.amount,
            isWithManager: true,
          })
        })
        .select()
        .single();

      if (dealError) throw dealError;

      // Отправляем первое сообщение от пользователя
      await supabase
        .from('messages')
        .insert({
          deal_id: dealData.id,
          content: initialMessage,
          sender_id: currentUser.id
        });
      
      // Отправляем автоматическое сообщение от системы с деталями заказа
      let systemMessage = `Создана заявка: ${dealData.id.slice(-6)} ${currentUser.company || 'Клиент'} <> MP ${dealType}`;
      
      if (reserveAmount) {
        systemMessage += `\nРезерв: $${reserveAmount.toLocaleString()} из $${Number(orderData.amount).toLocaleString()}`;
      } else {
        systemMessage += `\nПолный объем: $${Number(orderData.amount).toLocaleString()}`;
      }
      
      await supabase
        .from('messages')
        .insert({
          deal_id: dealData.id,
          content: systemMessage,
          sender_id: managerId, // Отправляется от имени менеджера
        });

      toast({
        title: "Заявка создана",
        description: "Вы можете начать общение с менеджером"
      });

      return { data: dealData, error: null };
    } catch (error: any) {
      toast({
        title: "Не удалось создать заявку",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error: error.message };
    }
  };

  const getDealByOrderId = async (orderId: string) => {
    if (!currentUser) return null;

    const { data } = await supabase
      .from('deals')
      .select('*')
      .eq('order_id', orderId)
      .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
      .maybeSingle();

    return data;
  };

  return {
    createDeal,
    createDealWithManager,
    getDealByOrderId
  };
}
