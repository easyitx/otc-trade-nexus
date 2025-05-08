
import React from "react";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Calendar, FileText, Globe, CreditCard, HelpCircle } from "lucide-react";
import { countries } from "@/data/countries";
import { citiesByCountry } from "@/data/cities";
import { Button } from "@/components/ui/button";
import { addDays, format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AdditionalDetailsStep({ formProps }: { formProps: any }) {
  const {
    theme,
    t,
    language,
    expiryDate,
    setExpiryDate,
    purpose,
    setPurpose,
    notes,
    setNotes,
    country,
    setCountry,
    city,
    setCity,
    isCashPair,
    calculationResult
  } = formProps;

  // Get cities based on selected country
  const getCitiesForCountry = () => {
    return country ? citiesByCountry[country] || [] : [];
  };

  // Get currency symbol
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "RUB":
        return "₽";
      default:
        return "";
    }
  };

  // Preset date options
  const datePresets = [
    { days: 1, label: language === 'en' ? '1 day' : '1 день' },
    { days: 3, label: language === 'en' ? '3 days' : '3 дня' },
    { days: 7, label: language === 'en' ? '7 days' : '7 дней' },
    { days: 15, label: language === 'en' ? '15 days' : '15 дней' }
  ];

  // Apply preset date
  const applyDatePreset = (days: number) => {
    const newDate = addDays(new Date(), days);
    setExpiryDate(newDate);
  };

  // Set default country/city if needed
  const handlePairChange = () => {
    if (isCashPair() && !country) {
      // Set Russia as default for cash pairs
      setCountry("RU");
      // Set Moscow as default city if Russia is selected
      setCity("Moscow");
    }
  };

  // Call this whenever isCashPair changes
  React.useEffect(() => {
    handlePairChange();
  }, [isCashPair()]);

  return (
    <>
      {/* Order Lifetime with Date Picker */}
      <div className="space-y-4">
        <div className="flex items-center mb-2 gap-3">
          <Calendar className={cn(
            "w-5 h-5",
            theme === "light" ? "text-blue-600" : "text-otc-primary"
          )} />
          <Label className={cn(
            "text-lg font-medium",
            theme === "light" ? "text-gray-800" : "text-white"
          )}>
            {t('expiryDate')}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-6 w-6 p-0 rounded-full" 
                  type="button"
                >
                  <HelpCircle className={cn(
                    "h-4 w-4",
                    theme === "light" ? "text-blue-600" : "text-otc-primary"
                  )} />
                  <span className="sr-only">Help</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className={cn(
                  "max-w-xs",
                  theme === "light" 
                    ? "bg-white text-gray-700 border-gray-200"
                    : "bg-otc-card text-white border-otc-active"
                )}
              >
                {language === 'en' 
                  ? 'Order expiry date indicates how long your order will be active. After this date, it will become inactive.'
                  : 'Срок жизни заявки указывает на то сколько времени ваша заявка будет активна, по истечению срока жизни она станет не актуальна.'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="space-y-3">
          <p className={cn(
            "text-sm",
            theme === "light" ? "text-gray-600" : "text-gray-400"
          )}>
            {language === 'en' 
              ? 'Order starts today and expires on the selected date:' 
              : 'Заявка создается сегодня и истекает в выбранную дату:'}
          </p>
          
          {/* Date picker presets */}
          <div className="flex flex-wrap gap-2 mb-3">
            {datePresets.map((preset) => (
              <Button
                key={preset.days}
                type="button"
                variant={theme === "light" ? "outline" : "secondary"}
                size="sm"
                onClick={() => applyDatePreset(preset.days)}
                className={cn(
                  "text-xs",
                  expiryDate && format(expiryDate, 'yyyy-MM-dd') === format(addDays(new Date(), preset.days), 'yyyy-MM-dd')
                    ? theme === "light" 
                        ? "bg-blue-50 border-blue-300 text-blue-700" 
                        : "bg-otc-primary/20 border-otc-primary text-otc-primary"
                    : theme === "light"
                        ? "bg-white"
                        : "bg-otc-active"
                )}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          
          <EnhancedDatePicker 
            date={expiryDate}
            setDate={(date) => date && setExpiryDate(date)}
            placeholder={t('selectWhenExpires')}
            className={cn(
              "w-full",
              theme === "light" 
                ? "bg-white border-gray-300 text-gray-900" 
                : "bg-otc-active border-otc-active text-white"
            )}
          />
          <p className={cn(
            "text-sm",
            theme === "light" ? "text-gray-500" : "text-gray-400"
          )}>
            {language === 'en' ? 'Created: ' : 'Создан: '}{new Date().toLocaleDateString()} · 
            {language === 'en' ? ' Expires: ' : ' Истекает: '}{expiryDate?.toLocaleDateString()}
          </p>
        </div>
      </div>

      <Separator className={theme === "light" ? "bg-gray-200" : "bg-otc-active"} />

      {/* Geography (Country/City) */}
      <div className="space-y-4">
        <div className="flex items-center mb-2 gap-3">
          <Globe className={cn(
            "w-5 h-5",
            theme === "light" ? "text-blue-600" : "text-otc-primary"
          )} />
          <Label className={cn(
            "text-lg font-medium",
            theme === "light" ? "text-gray-800" : "text-white"
          )}>
            {t('geography')}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-6 w-6 p-0 rounded-full" 
                  type="button"
                >
                  <HelpCircle className={cn(
                    "h-4 w-4",
                    theme === "light" ? "text-blue-600" : "text-otc-primary"
                  )} />
                  <span className="sr-only">Help</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className={cn(
                  "max-w-xs",
                  theme === "light" 
                    ? "bg-white text-gray-700 border-gray-200"
                    : "bg-otc-card text-white border-otc-active"
                )}
              >
                {language === 'en' 
                  ? 'Location where the order will be executed. City is required for cash pairs.'
                  : 'Местоположение, где будет выполнен заказ. Город обязателен для наличных пар.'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Country (Required) */}
        <div className="space-y-2">
          <Label htmlFor="country" className={cn(
            "flex items-center",
            theme === "light" ? "text-gray-700" : "text-gray-300"
          )}>
            {t('country')} <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select value={country} onValueChange={(value) => {
            setCountry(value);
            setCity(""); // Reset city when country changes
          }}>
            <SelectTrigger
              id="country"
              className={cn(
                theme === "light"
                  ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                  : "bg-otc-active border-otc-active text-white"
              )}
            >
              <SelectValue placeholder={t('selectCountry')} />
            </SelectTrigger>
            <SelectContent
              className={cn(
                "max-h-[300px]",
                theme === "light"
                  ? "bg-white border-gray-200"
                  : "bg-otc-card border-otc-active"
              )}
            >
              {countries.map((countryItem) => (
                <SelectItem
                  key={countryItem.code}
                  value={countryItem.code}
                  className={theme === "light" ? "hover:bg-gray-100" : "hover:bg-otc-active"}
                >
                  {countryItem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* City (Required for cash pairs, optional for others) */}
        {country && (
          <div className="space-y-2">
            <Label htmlFor="city" className={cn(
              "flex items-center",
              theme === "light" ? "text-gray-700" : "text-gray-300"
            )}>
              {t('city')}
              {isCashPair() && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger
                id="city"
                className={cn(
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                    : "bg-otc-active border-otc-active text-white"
                )}
              >
                <SelectValue placeholder={t('selectCity')} />
              </SelectTrigger>
              <SelectContent
                className={cn(
                  "max-h-[300px]",
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : "bg-otc-card border-otc-active"
                )}
              >
                {getCitiesForCountry().map((cityItem) => (
                  <SelectItem
                    key={cityItem}
                    value={cityItem}
                    className={theme === "light" ? "hover:bg-gray-100" : "hover:bg-otc-active"}
                  >
                    {cityItem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Separator className={theme === "light" ? "bg-gray-200" : "bg-otc-active"} />

      {/* Purpose (conditional) */}
      {!isCashPair() && (
        <div className="space-y-3">
          <div className="flex items-center mb-2 gap-3">
            <CreditCard className={cn(
              "w-5 h-5",
              theme === "light" ? "text-blue-600" : "text-otc-primary"
            )} />
            <Label htmlFor="purpose" className={cn(
              "text-lg font-medium",
              theme === "light" ? "text-gray-800" : "text-white"
            )}>
              {t('paymentPurpose')}
            </Label>
          </div>
          <Input
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder={t('purposeExample')}
            className={cn(
              theme === "light"
                ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                : "bg-otc-active border-otc-active text-white"
            )}
          />
        </div>
      )}

      {/* Additional Notes */}
      <div className="space-y-3">
        <div className="flex items-center mb-2 gap-3">
          <FileText className={cn(
            "w-5 h-5",
            theme === "light" ? "text-blue-600" : "text-otc-primary"
          )} />
          <Label htmlFor="notes" className={cn(
            "text-lg font-medium",
            theme === "light" ? "text-gray-800" : "text-white"
          )}>
            {t('additionalNotes')}
          </Label>
        </div>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('notesPlaceholder')}
          className={cn(
            "min-h-[120px]",
            theme === "light"
              ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
              : "bg-otc-active border-otc-active text-white"
          )}
        />
      </div>

      {/* Order Summary */}
      {calculationResult && (
        <OrderSummary 
          theme={theme} 
          t={t} 
          calculationResult={calculationResult} 
          getCurrencySymbol={getCurrencySymbol}
        />
      )}
    </>
  );
}

// Order summary component for second step
function OrderSummary({ theme, t, calculationResult, getCurrencySymbol }: any) {
  return (
    <div className={cn(
      "mt-6 rounded-lg overflow-hidden border shadow-md animate-fade-in",
      theme === "light"
        ? "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200"
        : "bg-gradient-to-br from-otc-primary/10 to-otc-primary/5 border-otc-primary/20"
    )}>
      <div className={cn(
        "px-4 py-3 border-b",
        theme === "light" 
          ? "bg-blue-100/50 border-blue-200" 
          : "bg-otc-primary/20 border-otc-primary/30"
      )}>
        <h3 className={cn(
          "text-lg font-semibold",
          theme === "light" ? "text-blue-800" : "text-otc-primary"
        )}>
          {t('orderSummary')}
        </h3>
      </div>
      
      <div className="p-4 space-y-4">
        <div className={cn(
          "rounded-lg p-4 border",
          theme === "light" 
            ? "bg-white border-gray-200" 
            : "bg-otc-active/20 border-otc-active/40"
        )}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                {t('youPay')}:
              </span>
              <span className={cn(
                "font-medium",
                theme === "light" ? "text-gray-900" : "text-white"
              )}>
                {getCurrencySymbol(calculationResult.fromCurrency)}{calculationResult.youPay} {calculationResult.fromCurrency}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                {t('youReceive')}:
              </span>
              <span className={cn(
                "font-medium",
                theme === "light" ? "text-green-600" : "text-green-400"
              )}>
                {getCurrencySymbol(calculationResult.toCurrency)}{calculationResult.youReceive} {calculationResult.toCurrency}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                {t('exchangeRate')}:
              </span>
              <span className={cn(
                "font-medium",
                theme === "light" ? "text-blue-600" : "text-otc-primary"
              )}>
                {calculationResult.finalRate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
