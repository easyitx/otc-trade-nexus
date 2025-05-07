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

  // Compact view that shows all rates in a single row
  const CompactRatesView = () => (
      <div className="flex items-center gap-3 text-sm">
        {loading ? (
            <div className="flex gap-3">
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-12 h-4" />
            </div>
        ) : (
            <>
              <RateBadge
                  icon={
                    <div className="h-5 w-5 rounded-sm bg-gray-600 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold leading-none">ЦБ</span>
                    </div>
                  }
                  rate={rates?.cbr}
                  highlight
              />

              <RateBadge
                  icon={
                    <div className="h-5 w-5 rounded-sm bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold leading-none">PF</span>
                    </div>
                  }
                  rate={rates?.profinance}
              />

              <RateBadge
                  icon={
                    <div className="h-5 w-5 rounded-sm bg-black flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold leading-none">IN</span>
                    </div>
                  }
                  rate={rates?.investing}
              />

              <RateBadge
                  icon={
                    <div className="h-5 w-5 rounded-full border border-blue-800 flex items-center justify-center">
                      <span className="text-blue-800 text-[10px] font-bold leading-none">XE</span>
                    </div>
                  }
                  rate={rates?.xe}
              />
            </>
        )}
      </div>
  );

  return (
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn(
              "px-3 py-1.5 rounded-lg flex items-center transition-colors",
              theme === "light"
                  ? "bg-accent hover:bg-accent/80 text-accent-foreground"
                  : "bg-otc-active hover:bg-otc-active/80 text-white"
          )}>
            <CompactRatesView />
          </button>
        </PopoverTrigger>
        <PopoverContent className={cn(
            "w-72 p-0",
            theme === "light" ? "bg-card border-border" : "bg-otc-card border-otc-active"
        )}>
          <div className="p-4">
            <h3 className="font-medium mb-3 text-lg">{t('exchangeRates')}</h3>
            <div className="space-y-3">
              <RateItem
                  source="ЦБ РФ"
                  rate={rates?.cbr}
                  loading={loading}
                  icon={
                    <img
                        src="/uploads/bc5cf6ea-c699-4ae0-b309-690868aa27a7.png"
                        alt="CBR"
                        className="h-6 w-6 rounded-full object-contain"
                    />
                  }
                  highlight
              />
              <RateItem
                  source="Profinance"
                  rate={rates?.profinance}
                  loading={loading}
                  icon={
                    <div className="h-6 w-6 rounded-sm bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">PF</span>
                    </div>
                  }
              />
              <RateItem
                  source="Investing"
                  rate={rates?.investing}
                  loading={loading}
                  icon={
                    <div className="h-6 w-6 rounded-sm bg-black flex items-center justify-center">
                      <span className="text-white text-xs font-bold">IN</span>
                    </div>
                  }
              />
              <RateItem
                  source="XE"
                  rate={rates?.xe}
                  loading={loading}
                  icon={
                    <div className="h-6 w-6 rounded-full border-2 border-blue-800 flex items-center justify-center">
                      <span className="text-blue-800 text-xs font-bold">XE</span>
                    </div>
                  }
              />
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              {t('ratesUpdatedAutomatically')}
            </p>
          </div>
        </PopoverContent>
      </Popover>
  );
};

interface RateBadgeProps {
  icon: React.ReactNode;
  rate: number | null | undefined;
  highlight?: boolean;
}

const RateBadge: React.FC<RateBadgeProps> = ({ icon, rate, highlight = false }) => {
  return (
      <div className="flex items-center gap-1">
        <div className="shrink-0">
          {icon}
        </div>
        <span className={cn(
            "text-xs font-medium",
            highlight ? "font-bold" : "text-muted-foreground"
        )}>
        {rate ? rate.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '—'}
      </span>
      </div>
  );
};

interface RateItemProps {
  source: string;
  rate: number | null | undefined;
  loading: boolean;
  icon: React.ReactNode;
  highlight?: boolean;
}

const RateItem: React.FC<RateItemProps> = ({ source, rate, loading, icon, highlight = false }) => {
  return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            {icon}
          </div>
          <span className={cn(
              "text-sm",
              highlight ? "font-semibold" : ""
          )}>
          {source}
        </span>
        </div>
        {loading ? (
            <Skeleton className="w-16 h-5" />
        ) : (
            <span className={cn(
                "font-medium",
                highlight ? "text-lg" : ""
            )}>
          {rate ? rate.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '—'} ₽
        </span>
        )}
      </div>
  );
};