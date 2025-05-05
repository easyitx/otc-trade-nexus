
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface ExchangeRatesProps {
  className?: string;
}

interface ExchangeRatesData {
  cbr: number;
  profinance: number;
  investing: number;
  xe: number;
}

export const ExchangeRates: React.FC<ExchangeRatesProps> = ({ className }) => {
  const [rates, setRates] = useState<ExchangeRatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('exchange-rates');
        
        if (error) {
          throw new Error(error.message);
        }
        
        setRates(data as ExchangeRatesData);
      } catch (err: any) {
        console.error("Error fetching exchange rates:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();

    // Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatRate = (rate: number | null | undefined): string => {
    if (rate === null || rate === undefined) return "—";
    return rate.toLocaleString('ru-RU', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).replace('.', ',');
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <RateCard
        icon={<img src="/lovable-uploads/bc5cf6ea-c699-4ae0-b309-690868aa27a7.png" alt="CBR" className="h-6 w-6" />}
        source="CBR"
        rate={formatRate(rates?.cbr)}
        loading={loading}
      />
      
      <RateCard
        icon={<span className="flex items-center justify-center h-6 w-6 bg-blue-500 text-white font-bold text-xs">PF</span>}
        source="PF"
        rate={formatRate(rates?.profinance)}
        loading={loading}
      />
      
      <RateCard
        icon={<span className="flex items-center justify-center h-6 w-6 bg-black text-white font-bold text-xs">IV</span>}
        source="IV"
        rate={formatRate(rates?.investing)}
        loading={loading}
      />
      
      <RateCard
        icon={<span className="flex items-center justify-center h-6 w-6 rounded-full border-2 border-blue-800 text-blue-800 font-bold text-xs">xe</span>}
        source="XE"
        rate={formatRate(rates?.xe)}
        loading={loading}
      />
    </div>
  );
};

interface RateCardProps {
  icon: React.ReactNode;
  source: string;
  rate: string;
  loading: boolean;
}

const RateCard: React.FC<RateCardProps> = ({ icon, source, rate, loading }) => {
  return (
    <Card className="flex items-center gap-2 p-2 bg-white/5 border-white/10 min-w-[160px]">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-lg font-medium">{source}</span>
        {loading ? (
          <Skeleton className="w-20 h-6" />
        ) : (
          <span className="text-lg font-medium">{rate} ₽</span>
        )}
      </div>
    </Card>
  );
};
