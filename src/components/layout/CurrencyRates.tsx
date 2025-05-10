
import React, { useState, useEffect } from 'react';
import { useCurrencyRates, CurrencyCode, CurrencyRate } from '@/hooks/useCurrencyRates';
import { Skeleton } from '../ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

export const CurrencyRates: React.FC = () => {
  const { useCurrencyRatesQuery } = useCurrencyRates();
  const { data: allRates = [], isLoading } = useCurrencyRatesQuery();
  const [selectedSource, setSelectedSource] = useState<string>("CBR");
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Filter rates by selected source
  const filteredRates = allRates.filter(rate => rate.source === selectedSource);

  // Find main currency pairs to display in the compact view
  const getMainPair = (baseCurrency: CurrencyCode, quoteCurrency: CurrencyCode): CurrencyRate | undefined => {
    return filteredRates.find(rate => 
      rate.base_currency === baseCurrency && rate.quote_currency === quoteCurrency
    );
  };

  // Get the rate value considering manual or auto rate
  const getRateValue = (rate: CurrencyRate | undefined): number | null => {
    if (!rate) return null;
    return rate.use_manual_rate && rate.manual_rate !== null ? rate.manual_rate : rate.auto_rate;
  };

  // Get main pairs to show in the navbar
  const usdRubRate = getRateValue(getMainPair('USD', 'RUB'));
  const eurRubRate = getRateValue(getMainPair('EUR', 'RUB'));
  const btcUsdtRate = getRateValue(getMainPair('BTC', 'USDT'));

  // Get all available sources from rates data
  const availableSources = React.useMemo(() => {
    const sources = Array.from(new Set(allRates.map(rate => rate.source)));
    // Ensure CBR is prioritized if available
    if (sources.includes('CBR')) {
      return ['CBR', ...sources.filter(s => s !== 'CBR')];
    }
    return sources;
  }, [allRates]);

  // Select first available source if current selection is not available
  useEffect(() => {
    if (availableSources.length > 0 && !availableSources.includes(selectedSource)) {
      setSelectedSource(availableSources[0]);
    }
  }, [availableSources, selectedSource]);

  // Compact view that shows main rate pairs in a single row
  const CompactRatesView = () => (
    <div className="flex items-center gap-3 text-sm">
      {isLoading ? (
        <div className="flex gap-3">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-20 h-4" />
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={theme === "light" ? "bg-accent" : "bg-otc-active"}>
              {selectedSource}
            </Badge>

            {usdRubRate !== null && (
              <div className="flex items-center gap-1">
                <span className="font-semibold">USD/RUB:</span>
                <span>{usdRubRate.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</span>
              </div>
            )}

            {eurRubRate !== null && (
              <div className="flex items-center gap-1">
                <span className="font-semibold">EUR/RUB:</span>
                <span>{eurRubRate.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</span>
              </div>
            )}

            {btcUsdtRate !== null && (
              <div className="flex items-center gap-1">
                <span className="font-semibold">BTC/USDT:</span>
                <span>{btcUsdtRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            )}
          </div>
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-lg">{t('exchangeRates')}</h3>
            
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={theme === "light" ? "" : "bg-otc-card border-otc-active"}>
                {availableSources.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="w-24 h-5" />
                  <Skeleton className="w-16 h-5" />
                </div>
              ))
            ) : filteredRates.length > 0 ? (
              filteredRates.slice(0, 8).map((rate) => (
                <RateItem
                  key={`${rate.id}`}
                  pair={`${rate.base_currency}/${rate.quote_currency}`}
                  rate={getRateValue(rate)}
                  quoteCurrency={rate.quote_currency}
                />
              ))
            ) : (
              <div className="text-center py-3 text-muted-foreground">
                {t('noRatesForSource').replace('{source}', selectedSource)}
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-4 text-center">
            {t('ratesUpdatedAutomatically')}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface RateItemProps {
  pair: string;
  rate: number | null;
  quoteCurrency: string;
}

const RateItem: React.FC<RateItemProps> = ({ pair, rate, quoteCurrency }) => {
  const symbol = quoteCurrency === 'RUB' ? '₽' : 
                 quoteCurrency === 'USD' || quoteCurrency === 'USDT' ? '$' : '';
  
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium">{pair}</span>
      {rate !== null ? (
        <span className="font-semibold">
          {rate.toLocaleString('ru-RU', { maximumFractionDigits: 4 })} {symbol}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
    </div>
  );
};
