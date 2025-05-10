import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Order as SupabaseOrder } from '@/lib/supabase-types';
import type { Order as FrontendOrder, RateDetails, Geography } from '@/types';
import { useToast } from './use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { safeParseFloat } from '@/lib/utils';

// Adapter function to convert from Supabase format to frontend format
const adaptOrderFromSupabase = (order: SupabaseOrder): FrontendOrder => {
  // Ensure type is explicitly cast as "BUY" or "SELL"
  const orderType = order.type === "BUY" || order.type === "SELL" 
    ? order.type 
    : "BUY"; // Default to BUY if not matching

  // Ensure status is properly cast to expected union type
  const orderStatus = ["ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED", "ARCHIVED"].includes(order.status || "")
    ? order.status as "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED" | "ARCHIVED"
    : "ACTIVE"; // Default to ACTIVE if not matching

  return {
    id: order.id,
    type: orderType,
    amount: Number(order.amount),
    amountCurrency: order.amount_currency || "USD",
    rate: order.rate,
    rateDetails: order.rate_details as RateDetails | undefined,
    createdAt: new Date(order.created_at),
    updatedAt: new Date(order.updated_at),
    expiresAt: new Date(order.expires_at),
    purpose: order.purpose || undefined,
    notes: order.notes || undefined,
    userId: order.user_id,
    status: orderStatus,
    geography: order.geography as Geography | undefined,
    // Use a default tradePairId until we implement proper pair selection
    tradePairId: `${order.amount_currency || "USD"}_USDT_PAIR` 
  };
};

// Adapter function to convert from frontend format to Supabase format
const adaptOrderToSupabase = (order: Omit<FrontendOrder, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'tradePairId'>) => {
  return {
    type: order.type,
    amount: order.amount,
    amount_currency: order.amountCurrency || "USD",
    rate: order.rate,
    rate_details: order.rateDetails || null,
    expires_at: order.expiresAt.toISOString(),
    purpose: order.purpose || null,
    notes: order.notes || null,
    status: order.status,
    geography: order.geography || null
  };
};

export interface OrdersQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: {
    type?: 'BUY' | 'SELL' | 'all';
    pairGroup?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
    tradePair?: string;
    showArchived?: boolean;
  };
}

// Helper function for currency conversion with memoization optimization
const conversionCache = new Map<string, number>();

export const convertToUSD = (amount: number, currency: string, rate: string): number => {
  try {
    // For USD and USDT return value without conversion
    if (currency === "USD" || currency === "USDT") return amount;
    
    // Create cache key
    const cacheKey = `${amount}-${currency}-${rate}`;
    
    // Check if conversion is cached
    if (conversionCache.has(cacheKey)) {
      return conversionCache.get(cacheKey)!;
    }
    
    // Handle undefined or null rate
    if (!rate) {
      console.warn('Rate is undefined or null for conversion');
      return amount;
    }
    
    // Convert to USD based on rate using the safe parse function
    const numericRate = safeParseFloat(rate);
    
    // Check for valid rate and division by zero
    if (numericRate === 0) {
      console.warn(`Invalid rate for conversion: ${rate}`);
      return amount;
    }
    
    const usdAmount = amount / numericRate;
    
    // Cache the result
    if (conversionCache.size > 100) {
      // Clear cache if it gets too large to prevent memory issues
      conversionCache.clear();
    }
    conversionCache.set(cacheKey, usdAmount);
    
    return usdAmount;
  } catch (error) {
    console.error("Currency conversion error:", error);
    return amount;
  }
};

// Function to check if an order is expired
const isOrderExpired = (expiresAt: string): boolean => {
  const expirationDate = new Date(expiresAt);
  const now = new Date();
  return expirationDate < now;
};

export function useOrders() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const createOrder = async (orderData: Omit<FrontendOrder, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'tradePairId'>) => {
    if (!currentUser) {
      toast({
        title: "Требуется авторизация",
        description: "Вы должны быть авторизованы, чтобы создавать заявки",
        variant: "destructive"
      });
      return { data: null, error: "Требуется авторизация" };
    }

    setLoading(true);
    try {
      const supabaseOrderData = adaptOrderToSupabase(orderData);

      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...supabaseOrderData,
          user_id: currentUser.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Заявка создана",
        description: "Ваша заявка успешно создана"
      });

      // Invalidate the orders query to refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Convert the returned data to our frontend format
      const adaptedData = data ? adaptOrderFromSupabase(data as SupabaseOrder) : null;
      return { data: adaptedData, error: null };
    } catch (error: any) {
      toast({
        title: "Не удалось создать заявку",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async ({ page = 1, pageSize = 10, sortBy = 'amount', sortOrder = 'desc', filter = {} }: OrdersQueryParams) => {
    console.log("Loading orders with params:", { page, pageSize, sortBy, sortOrder, filter });
    
    // Start building our query
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' });
    
    // Apply filtering
    if (filter.type && filter.type !== 'all') {
      query = query.eq('type', filter.type);
    }
    
    if (filter.minAmount !== undefined) {
      query = query.gte('amount', filter.minAmount);
    }
    
    if (filter.maxAmount !== undefined) {
      query = query.lte('amount', filter.maxAmount);
    }
    
    if (filter.search) {
      query = query.or(`purpose.ilike.%${filter.search}%,notes.ilike.%${filter.search}%`);
    }
    
    // Улучшенный фильтр по торговым парам
    if (filter.tradePair && filter.tradePair !== 'all') {
      // Извлекаем информацию о валюте из названия пары
      const pairCurrency = filter.tradePair.includes('RUB') ? 'RUB' : 
                           filter.tradePair.includes('USD') ? 'USD' : 
                           filter.tradePair.includes('USDT') ? 'USDT' : undefined;
      
      if (pairCurrency) {
        console.log(`Filtering by pair currency: ${pairCurrency}`);
        query = query.eq('amount_currency', pairCurrency);
      }
    }

    // Исправленная логика фильтра архивных заявок
    if (filter.showArchived === true) {
      // Когда фильтр архива включен, показываем заявки, у которых:
      // 1. Статус уже установлен как ARCHIVED ИЛИ
      // 2. Заявка истекла (expires_at в прошлом)
      console.log("Showing ARCHIVED orders");
      const now = new Date().toISOString();
      query = query.or(`status.eq.ARCHIVED,expires_at.lt.${now}`);
    } else {
      // Когда фильтр архива отключен, скрываем заявки со статусом ARCHIVED
      console.log("Hiding ARCHIVED orders");
      query = query.neq('status', 'ARCHIVED');
      
      // И также исключаем истёкшие заявки (которые должны быть архивными)
      const now = new Date().toISOString();
      query = query.gte('expires_at', now);
    }
    
    // Apply sorting - Map frontend field names to database column names
    let sortColumn = sortBy;
    if (sortBy === 'volume') sortColumn = 'amount';
    if (sortBy === 'createdAt') sortColumn = 'created_at';
    if (sortBy === 'rate') sortColumn = 'rate';
    
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    console.log("Executing query with range:", from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error("Error loading orders:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} orders. Total: ${count}`);

    // Проверка на истекшие заказы и обновление их до статуса ARCHIVED при необходимости
    const expiredOrderIds: string[] = [];
    data?.forEach(order => {
      if (order.status === 'ACTIVE' && isOrderExpired(order.expires_at)) {
        expiredOrderIds.push(order.id);
        order.status = 'ARCHIVED';
      }
    });

    // Обновляем истекшие заказы в базе данных
    if (expiredOrderIds.length > 0) {
      console.log(`Updating ${expiredOrderIds.length} expired orders to ARCHIVED status`);
      await supabase
        .from('orders')
        .update({ status: 'ARCHIVED' })
        .in('id', expiredOrderIds);
    }
    
    // Convert data to frontend format
    const orders = data.map(order => adaptOrderFromSupabase(order as SupabaseOrder));
    
    return {
      orders,
      totalCount: count || 0,
      page,
      pageSize,
      totalPages: count ? Math.ceil(count / pageSize) : 0
    };
  };

  const useOrdersQuery = (params: OrdersQueryParams = {}) => {
    return useQuery({
      queryKey: ['orders', params],
      queryFn: () => fetchOrders(params),
      staleTime: 30000, // Add staleTime to reduce flashing
      placeholderData: (previousData) => previousData // Use inline function for preserving previous data
    });
  };

  const updateOrderStatus = async (orderId: string, status: FrontendOrder['status']) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Заявка обновлена",
        description: `Статус заявки изменен на ${status}`
      });

      // Invalidate the orders query to refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Convert the returned data to our frontend format
      const adaptedData = data ? adaptOrderFromSupabase(data as SupabaseOrder) : null;
      return { data: adaptedData, error: null };
    } catch (error: any) {
      toast({
        title: "Не удалось обновить заявку",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createOrder,
    updateOrderStatus,
    useOrdersQuery,
    convertToUSD,
    safeParseFloat // Export the safe parsing function
  };
}
