
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCurrencyRates } from '@/hooks/useCurrencyRates';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export const ExchangeRates: React.FC = () => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { rates, loading, error, currencyPair, availablePairs, availableSources, setCurrencyPair } = useCurrencyRates();
  const [selectedPair, setSelectedPair] = useState<string>('');

  useEffect(() => {
    if (availablePairs.length > 0 && !selectedPair) {
      const firstPair = availablePairs[0]?.value;
      if (firstPair) {
        setSelectedPair(firstPair);
        setCurrencyPair(firstPair);
      }
    }
  }, [availablePairs, selectedPair, setCurrencyPair]);

  const handlePairChange = (value: string) => {
    setSelectedPair(value);
    setCurrencyPair(value);
  };

  if (loading) {
    return (
      <Card className={cn(
        "w-full",
        theme === "light" ? "bg-card" : "bg-otc-card border-otc-active"
      )}>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn(
        "w-full",
        theme === "light" ? "bg-card" : "bg-otc-card border-otc-active"
      )}>
        <CardContent className="pt-6">
          <div className="text-center text-red-500 py-8">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "w-full",
      theme === "light" ? "bg-card" : "bg-otc-card border-otc-active"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {t('currency')} {t('rates')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="currency-pair">{t('selectCurrencyPair')}</Label>
          <Select value={selectedPair} onValueChange={handlePairChange}>
            <SelectTrigger id="currency-pair" className={cn(
              theme === "light" ? "bg-background" : "bg-otc-active border-otc-active"
            )}>
              <SelectValue placeholder={t('selectCurrencyPair')} />
            </SelectTrigger>
            <SelectContent className={cn(
              theme === "light" ? "bg-background" : "bg-otc-card border-otc-active"
            )}>
              {availablePairs.map((pair) => (
                <SelectItem key={pair.value} value={pair.value}>
                  {pair.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {rates && Object.entries(rates).map(([source, rate]) => (
            <div key={source} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-200 dark:border-gray-700">
              <div className="font-semibold">{source}</div>
              <div className="text-xl">
                {typeof rate === 'number' 
                  ? rate.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 6 }) 
                  : '—'}
              </div>
            </div>
          ))}

          {rates && Object.keys(rates).length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              {t('noRatesAvailable')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExchangeRates;
