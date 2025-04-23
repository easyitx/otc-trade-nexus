
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Deal } from '@/types';
import { useToast } from './use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useDeals() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

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
    getDealByOrderId
  };
}
