
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CurrencyCode } from '@/hooks/useCurrencyRates';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface CreateRateModalProps {
  onCreateRate: (newRate: {
    base_currency: CurrencyCode;
    quote_currency: CurrencyCode;
    manual_rate?: number | null;
    use_manual_rate?: boolean;
  }) => void;
  existingPairs: { base: CurrencyCode; quote: CurrencyCode }[];
}

export const CreateRateModal: React.FC<CreateRateModalProps> = ({ 
  onCreateRate,
  existingPairs
}) => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>('USD');
  const [quoteCurrency, setQuoteCurrency] = useState<CurrencyCode>('RUB');
  const [manualRate, setManualRate] = useState('');
  const [useManualRate, setUseManualRate] = useState(false);

  // List of available currencies
  const currencies: CurrencyCode[] = [
    'USD', 'EUR', 'RUB', 'GBP', 'CNY', 'JPY', 
    'CHF', 'CAD', 'AUD', 'HKD', 'SGD', 
    'AED', 'TRY', 'INR', 'BTC', 'ETH', 'USDT', 'USDC'
  ];

  // Check if pair already exists
  const isPairExists = () => {
    return existingPairs.some(pair => 
      pair.base === baseCurrency && pair.quote === quoteCurrency
    );
  };

  const handleCreateRate = () => {
    if (baseCurrency === quoteCurrency) {
      alert("Base currency and quote currency cannot be the same");
      return;
    }
    
    if (isPairExists()) {
      alert("This currency pair already exists");
      return;
    }
    
    onCreateRate({
      base_currency: baseCurrency,
      quote_currency: quoteCurrency,
      manual_rate: manualRate ? parseFloat(manualRate) : null,
      use_manual_rate: useManualRate
    });
    
    // Reset form and close modal
    setManualRate('');
    setUseManualRate(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Currency Pair</Button>
      </DialogTrigger>
      <DialogContent className={cn(
        "sm:max-w-[425px]",
        theme === "light" ? "bg-card" : "bg-otc-card border-otc-active"
      )}>
        <DialogHeader>
          <DialogTitle>Add New Currency Pair</DialogTitle>
          <DialogDescription>
            Create a new currency exchange rate pair.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="base-currency" className="text-right">
              Base:
            </Label>
            <Select 
              value={baseCurrency} 
              onValueChange={(value) => setBaseCurrency(value as CurrencyCode)}
            >
              <SelectTrigger id="base-currency" className={cn(
                "col-span-3",
                theme === "light" ? "" : "bg-otc-active border-otc-active"
              )}>
                <SelectValue placeholder="Select base currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={`base-${currency}`} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quote-currency" className="text-right">
              Quote:
            </Label>
            <Select 
              value={quoteCurrency} 
              onValueChange={(value) => setQuoteCurrency(value as CurrencyCode)}
            >
              <SelectTrigger id="quote-currency" className={cn(
                "col-span-3",
                theme === "light" ? "" : "bg-otc-active border-otc-active"
              )}>
                <SelectValue placeholder="Select quote currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={`quote-${currency}`} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="manual-rate" className="text-right">
              Manual Rate:
            </Label>
            <Input
              id="manual-rate"
              type="number"
              step="0.000001"
              value={manualRate}
              onChange={(e) => setManualRate(e.target.value)}
              className={cn(
                "col-span-3",
                theme === "light" ? "" : "bg-otc-active border-otc-active"
              )}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="use-manual-rate" className="text-right">
              Use Manual:
            </Label>
            <div className="col-span-3 flex items-center">
              <Switch
                id="use-manual-rate"
                checked={useManualRate}
                onCheckedChange={setUseManualRate}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleCreateRate}
            className="bg-otc-primary hover:bg-otc-primary/90 text-black"
          >
            Create Pair
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
