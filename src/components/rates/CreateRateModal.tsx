
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CurrencyCode } from '@/hooks/useCurrencyRates';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface CreateRateModalProps {
  onCreateRate: (newRate: {
    base_currency: CurrencyCode;
    quote_currency: CurrencyCode;
    manual_rate?: number | null;
    use_manual_rate?: boolean;
    source?: string | null;
  }) => void;
  existingPairs: { base: CurrencyCode; quote: CurrencyCode; source?: string | null }[];
  sources?: string[]; 
}

export const CreateRateModal: React.FC<CreateRateModalProps> = ({ 
  onCreateRate, 
  existingPairs,
  sources = ['CBR', 'Binance', 'CoinMarketCap']
}) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>('USD');
  const [quoteCurrency, setQuoteCurrency] = useState<CurrencyCode>('RUB');
  const [manualRate, setManualRate] = useState<string>('');
  const [useManualRate, setUseManualRate] = useState<boolean>(false);
  const [source, setSource] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // List of available currency codes
  const currencyCodes: CurrencyCode[] = [
    'USD', 'EUR', 'RUB', 'GBP', 'CNY', 'JPY', 'CHF', 'CAD', 'AUD', 
    'HKD', 'SGD', 'AED', 'TRY', 'INR', 'BTC', 'ETH', 'USDT', 'USDC'
  ];
  
  // Reset form
  const resetForm = () => {
    setBaseCurrency('USD');
    setQuoteCurrency('RUB');
    setManualRate('');
    setUseManualRate(false);
    setSource('');
    setError('');
  };
  
  // Handle create
  const handleCreate = () => {
    // Check if pair already exists
    const existingPair = existingPairs.find(pair => 
      pair.base === baseCurrency && 
      pair.quote === quoteCurrency &&
      (source === '' || pair.source === source)
    );
    
    if (existingPair) {
      setError(source 
        ? t('pairExistsForSource', { base: baseCurrency, quote: quoteCurrency, source })
        : t('pairExists', { base: baseCurrency, quote: quoteCurrency })
      );
      return;
    }
    
    onCreateRate({
      base_currency: baseCurrency,
      quote_currency: quoteCurrency,
      manual_rate: manualRate ? parseFloat(manualRate) : null,
      use_manual_rate: useManualRate,
      source: source || null
    });
    
    setIsOpen(false);
    resetForm();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="bg-otc-primary hover:bg-otc-primary/90 text-black">
          <Plus className="mr-2 h-4 w-4" />
          {t('createNewRate')}
        </Button>
      </DialogTrigger>
      <DialogContent className={theme === "light" ? "" : "bg-otc-card border-otc-active"}>
        <DialogHeader>
          <DialogTitle>{t('createNewCurrencyRate')}</DialogTitle>
          <DialogDescription>
            {t('addNewCurrencyPairDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="source">{t('source')}</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger id="source" className={theme === "light" ? "" : "bg-otc-active border-otc-active"}>
                <SelectValue placeholder={t('selectSource')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('noSource')}</SelectItem>
                {sources.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base-currency">{t('baseCurrency')}</Label>
              <Select value={baseCurrency} onValueChange={(value) => setBaseCurrency(value as CurrencyCode)}>
                <SelectTrigger id="base-currency" className={theme === "light" ? "" : "bg-otc-active border-otc-active"}>
                  <SelectValue placeholder={t('selectCurrency')} />
                </SelectTrigger>
                <SelectContent>
                  {currencyCodes.map(code => (
                    <SelectItem key={code} value={code}>{code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quote-currency">{t('quoteCurrency')}</Label>
              <Select value={quoteCurrency} onValueChange={(value) => setQuoteCurrency(value as CurrencyCode)}>
                <SelectTrigger id="quote-currency" className={theme === "light" ? "" : "bg-otc-active border-otc-active"}>
                  <SelectValue placeholder={t('selectCurrency')} />
                </SelectTrigger>
                <SelectContent>
                  {currencyCodes.map(code => (
                    <SelectItem key={code} value={code}>{code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="manual-rate">{t('manualRate')} ({t('optional')})</Label>
            <Input 
              id="manual-rate"
              type="number"
              step="0.000001"
              value={manualRate}
              onChange={(e) => setManualRate(e.target.value)}
              placeholder="0.000000"
              className={theme === "light" ? "" : "bg-otc-active border-otc-active"}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="use-manual" 
              checked={useManualRate} 
              onCheckedChange={setUseManualRate} 
            />
            <Label htmlFor="use-manual">{t('useManualRate')}</Label>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} className={theme === "light" ? "" : "bg-otc-active border-otc-active"}>
            {t('cancel')}
          </Button>
          <Button onClick={handleCreate} className="bg-otc-primary hover:bg-otc-primary/90 text-black">
            {t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
