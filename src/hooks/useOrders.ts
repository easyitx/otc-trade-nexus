
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Order as SupabaseOrder } from '@/lib/supabase-types';
import type { Order as FrontendOrder, Geography, RateDetails } from '@/types';
import { useToast } from './use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Json } from '@/integrations/supabase/types';

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

  // Convert geography from JSON to Geography type
  const geography: Geography = order.geography as unknown as Geography || { country: undefined, city: undefined };

  // Convert rate_details from JSON to RateDetails type
  const rateDetails: RateDetails | undefined = order.rate_details ? order.rate_details as unknown as RateDetails : undefined;

  return {
    id: order.id,
    type: orderType,
    amount: Number(order.amount),
    amountCurrency: order.amount_currency || "USD",
    rate: order.rate,
    rateDetails: rateDetails,
    createdAt: new Date(order.created_at),
    updatedAt: new Date(order.updated_at),
    expiresAt: new Date(order.expires_at),
    purpose: order.purpose || undefined,
    notes: order.notes || undefined,
    userId: order.user_id,
    status: orderStatus,
    geography: geography,
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
    rate_details: order.rateDetails as unknown as Json || null,
    expires_at: order.expiresAt.toISOString(),
    purpose: order.purpose || null,
    notes: order.notes || null,
    status: order.status,
    geography: order.geography as unknown as Json || null
  };
};

export function useOrders() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: Omit<FrontendOrder, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'tradePairId'>) => {
      if (!currentUser) {
        throw new Error("Authentication required");
      }
      
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
      
      return data ? adaptOrderFromSupabase(data as SupabaseOrder) : null;
    },
    onSuccess: () => {
      toast({
        title: "Order created",
        description: "Your order has been successfully created"
      });
      
      // Invalidate and refetch orders query to update the list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create order",
        description: error.message,
        variant: "destructive"
      });
    }
  });

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
      const result = await createOrderMutation.mutateAsync(orderData);
      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert all orders to our frontend format
      return data.map((order) => adaptOrderFromSupabase(order as SupabaseOrder));
    },
    enabled: !!currentUser // Only fetch orders if user is logged in
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: FrontendOrder['status'] }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      
      return data ? adaptOrderFromSupabase(data as SupabaseOrder) : null;
    },
    onSuccess: () => {
      toast({
        title: "Order updated",
        description: "Order status has been successfully updated"
      });
      
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update order",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    loading,
    orders,
    isLoadingOrders,
    createOrder,
    updateOrderStatus: (orderId: string, status: FrontendOrder['status']) => 
      updateOrderStatus.mutateAsync({ orderId, status })
  };
}
