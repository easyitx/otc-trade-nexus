
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Order } from '@/lib/supabase-types';
import { useToast } from './use-toast';

export function useOrders() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createOrder = async (orderData: Omit<Order, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Order created",
        description: "Your order has been successfully created"
      });

      return { data, error: null };
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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
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

      return { data, error: null };
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
    fetchOrders,
    updateOrderStatus
  };
}
