
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

export type CurrencyCode = 'USD' | 'EUR' | 'RUB' | 'GBP' | 'CNY' | 'JPY' | 
  'CHF' | 'CAD' | 'AUD' | 'HKD' | 'SGD' | 'AED' | 'TRY' | 
  'INR' | 'BTC' | 'ETH' | 'USDT' | 'USDC';

export type CurrencyRate = {
  id: string;
  base_currency: CurrencyCode;
  quote_currency: CurrencyCode;
  manual_rate: number | null;
  auto_rate: number | null;
  use_manual_rate: boolean;
  last_updated: string;
  updated_by: string | null;
  source: string | null;
  source_timestamp: string | null;
};

export type CurrencyRateUpdate = {
  id: string;
  manual_rate: number | null;
  use_manual_rate: boolean;
};

export function useCurrencyRates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Fetch all currency rates
  const fetchCurrencyRates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('currency_rates')
        .select('*')
        .order('base_currency', { ascending: true })
        .order('quote_currency', { ascending: true });

      if (error) throw error;
      return data as CurrencyRate[];
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update currency rate
  const updateCurrencyRate = async ({ id, manual_rate, use_manual_rate }: CurrencyRateUpdate) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('currency_rates')
        .update({ 
          manual_rate,
          use_manual_rate,
          last_updated: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating currency rate:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create new currency rate
  const createCurrencyRate = async (newRate: {
    base_currency: CurrencyCode;
    quote_currency: CurrencyCode;
    manual_rate?: number | null;
    use_manual_rate?: boolean;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('currency_rates')
        .insert({
          ...newRate,
          last_updated: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating currency rate:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch latest rates from external sources and update database
  const refreshExternalRates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('currency-rates', {
        body: { 
          automated: true
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error refreshing external rates:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // React Query hooks
  const useCurrencyRatesQuery = () => {
    return useQuery({
      queryKey: ['currency-rates'],
      queryFn: fetchCurrencyRates,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const updateRateMutation = useMutation({
    mutationFn: updateCurrencyRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currency-rates'] });
      toast({
        title: "Rate updated",
        description: "The currency rate has been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update rate",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const createRateMutation = useMutation({
    mutationFn: createCurrencyRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currency-rates'] });
      toast({
        title: "Rate created",
        description: "The new currency rate has been created successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create rate",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const refreshRatesMutation = useMutation({
    mutationFn: refreshExternalRates,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currency-rates'] });
      toast({
        title: "Rates refreshed",
        description: `Successfully updated ${data?.updatedCount || 0} currency rates from external sources.`
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to refresh rates",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    loading,
    useCurrencyRatesQuery,
    updateRate: updateRateMutation.mutate,
    createRate: createRateMutation.mutate,
    refreshExternalRates: refreshRatesMutation.mutate,
  };
}
