
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Order as SupabaseOrder } from '@/lib/supabase-types';
import type { Order as FrontendOrder, RateDetails, Geography } from '@/types';
import { useToast } from './use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Adapter function to convert from Supabase format to frontend format
const adaptOrderFromSupabase = (order: SupabaseOrder): FrontendOrder => {
  // Ensure type is explicitly cast as "BUY" or "SELL"
  const orderType = order.type === "BUY" || order.type === "SELL" 
    ? order.type 
    : "BUY"; // Default to BUY if not matching

  // Ensure status is properly cast to expected union type
  const orderStatus = ["ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED"].includes(order.status || "")
    ? order.status as "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED"
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
    tradePairId: "USD_USDT_PAIR" 
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
  };
}

export function useOrders() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const createOrder = async (orderData: Omit<FrontendOrder, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'tradePairId'>) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create orders",
        variant: "destructive"
      });
      return { data: null, error: "Authentication required" };
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
        title: "Order created",
        description: "Your order has been successfully created"
      });

      // Invalidate the orders query to refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Convert the returned data to our frontend format
      const adaptedData = data ? adaptOrderFromSupabase(data as SupabaseOrder) : null;
      return { data: adaptedData, error: null };
    } catch (error: any) {
      toast({
        title: "Failed to create order",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async ({ page = 1, pageSize = 10, sortBy = 'amount', sortOrder = 'desc', filter = {} }: OrdersQueryParams) => {
    console.log("Fetching orders with params:", { page, pageSize, sortBy, sortOrder, filter });
    
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
    
    // Filter by trading pair if specified
    if (filter.tradePair && filter.tradePair !== 'all') {
      // This is a mock implementation since we don't have actual trade_pair_id column yet
      // In a real implementation, you would use something like:
      // query = query.eq('trade_pair_id', filter.tradePair);
      
      // For now, filter by amount_currency as a placeholder
      if (filter.tradePair.includes('RUB')) {
        query = query.eq('amount_currency', 'RUB');
      } else if (filter.tradePair.includes('USD')) {
        query = query.eq('amount_currency', 'USD');
      }
    }
    
    // Apply sorting
    // Map frontend field names to database column names
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
      console.error("Error fetching orders:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} orders. Total count: ${count}`);
    
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
      queryFn: () => fetchOrders(params)
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
        title: "Order updated",
        description: `Order status has been updated to ${status}`
      });

      // Invalidate the orders query to refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Convert the returned data to our frontend format
      const adaptedData = data ? adaptOrderFromSupabase(data as SupabaseOrder) : null;
      return { data: adaptedData, error: null };
    } catch (error: any) {
      toast({
        title: "Failed to update order",
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
    useOrdersQuery
  };
}
