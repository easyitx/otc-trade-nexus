import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Order as SupabaseOrder } from '@/lib/supabase-types';
import type { Order as FrontendOrder, RateDetails, Geography } from '@/types';
import { useToast } from './use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient, keepPrevious } from '@tanstack/react-query';

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
    
    // Remove non-numeric characters from rate string, except decimal point
    const cleanRate = String(rate).replace(/[^0-9.]/g, '');
    
    // Convert to USD based on rate
    const numericRate = parseFloat(cleanRate);
    
    // Check for valid rate and division by zero
    if (isNaN(numericRate) || numericRate === 0) {
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
    
    // Enhanced trading pair filter
    if (filter.tradePair && filter.tradePair !== 'all') {
      // Extract currency info from pair name
      if (filter.tradePair.includes('RUB')) {
        query = query.eq('amount_currency', 'RUB');
      } else if (filter.tradePair.includes('USD')) {
        query = query.eq('amount_currency', 'USD');
      } else if (filter.tradePair.includes('USDT')) {
        // Additional handling for pairs containing USDT
        // This is a placeholder until proper trade_pair_id is implemented
        query = query.or('amount_currency.eq.USDT,amount_currency.eq.USD');
      }
    }

    // Fixed archived filter logic
    if (filter.showArchived === true) {
      // When showing archived, include archived status
      // No additional filter needed
    } else {
      // When not showing archived, exclude orders with ARCHIVED status
      query = query.neq('status', 'ARCHIVED');
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

    // Check for expired orders and update them to ARCHIVED status if needed
    const expiredOrderIds: string[] = [];
    data?.forEach(order => {
      if (order.status === 'ACTIVE' && isOrderExpired(order.expires_at)) {
        expiredOrderIds.push(order.id);
        order.status = 'ARCHIVED';
      }
    });

    // Update expired orders in the database
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
      placeholderData: keepPrevious // Use keepPrevious function instead of string
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
    convertToUSD
  };
}
