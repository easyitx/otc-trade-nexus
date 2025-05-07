
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '../ui/skeleton';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ExchangeRatesData {
  cbr: number;
  profinance: number;
  investing: number;
  xe: number;
}

export const CurrencyRates: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('exchange-rates');
        
        if (error) {
          throw new Error(error.message);
        }
        
        setRates(data as ExchangeRatesData);
      } catch (err) {
        console.error("Ошибка получения курсов валют:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();

    // Обновлять каждые 5 минут
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Compact view that shows multiple rates in a single row
  const CompactRatesView = () => (
    <div className="flex items-center space-x-2 text-sm">
      {loading ? (
        <div className="flex space-x-2">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
      ) : (
        <>
          <span className="flex items-center">
            <img src="/lovable-uploads/bc5cf6ea-c699-4ae0-b309-690868aa27a7.png" alt="CBR" className="h-3 w-3 mr-1" />
            <span className="font-bold">{rates?.cbr ? rates.cbr.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '—'}</span>
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="flex items-center">
            <span className="h-3 w-3 bg-blue-500 text-white flex items-center justify-center text-[8px] mr-1 rounded-sm">PF</span>
            <span>{rates?.profinance ? rates.profinance.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '—'}</span>
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="flex items-center">
            <span className="h-3 w-3 bg-black text-white flex items-center justify-center text-[8px] mr-1 rounded-sm">IV</span>
            <span>{rates?.investing ? rates.investing.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '—'}</span>
          </span>
        </>
      )}
    </div>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={cn(
          "px-2 py-1 rounded-md text-xs font-medium flex items-center transition-colors",
          theme === "light" ? "bg-accent hover:bg-accent/80" : "bg-otc-active hover:bg-otc-active/80"
        )}>
          <CompactRatesView />
        </button>
      </PopoverTrigger>
      <PopoverContent className={cn(
        "w-72 p-0",
        theme === "light" ? "bg-card border-border" : "bg-otc-card border-otc-active"
      )}>
        <div className="p-4">
          <h3 className="font-medium mb-2">{t('exchangeRates')}</h3>
          <div className="space-y-2">
            <RateItem 
              source="ЦБ РФ" 
              rate={rates?.cbr} 
              loading={loading}
              icon={<img src="/lovable-uploads/bc5cf6ea-c699-4ae0-b309-690868aa27a7.png" alt="CBR" className="h-5 w-5" />}
            />
            <RateItem 
              source="Profinance" 
              rate={rates?.profinance} 
              loading={loading}
              icon={<span className="flex items-center justify-center h-5 w-5 bg-blue-500 text-white font-bold text-xs">PF</span>}
            />
            <RateItem 
              source="Investing" 
              rate={rates?.investing} 
              loading={loading}
              icon={<span className="flex items-center justify-center h-5 w-5 bg-black text-white font-bold text-xs">IV</span>}
            />
            <RateItem 
              source="XE" 
              rate={rates?.xe} 
              loading={loading}
              icon={<span className="flex items-center justify-center h-5 w-5 rounded-full border-2 border-blue-800 text-blue-800 font-bold text-xs">xe</span>}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">{t('ratesUpdatedAutomatically')}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface RateItemProps {
  source: string;
  rate: number | null | undefined;
  loading: boolean;
  icon: React.ReactNode;
}

const RateItem: React.FC<RateItemProps> = ({ source, rate, loading, icon }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span>{source}</span>
      </div>
      {loading ? (
        <Skeleton className="w-16 h-5" />
      ) : (
        <span className="font-medium">{rate ? rate.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '—'} ₽</span>
      )}
    </div>
  );
};
