
import React, { useEffect } from "react";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Calendar, FileText, Globe, HelpCircle } from "lucide-react";
import { countries } from "@/data/countries";
import { citiesByCountry } from "@/data/cities";
import { Button } from "@/components/ui/button";
import { addDays } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FormProps } from "../types";
import OrderSummary from "./OrderSummary";

export default function AdditionalDetailsStep({ formProps }: { formProps: FormProps }) {
  const {
    theme,
    t,
    language,
    formData,
    updateFormData,
    isCashPair,
    calculationResult,
    getCurrencySymbol
  } = formProps;

  const { expiryDate, purpose, notes, country, city } = formData;

  // Get cities based on selected country
  const getCitiesForCountry = () => {
    return country ? citiesByCountry[country] || [] : [];
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
    updateFormData("expiryDate", newDate);
  };

  // Set default country/city if needed
  const handlePairChange = () => {
    if (isCashPair() && !country) {
      // Set Russia as default for cash pairs
      updateFormData("country", "RU");
      // Set Moscow as default city if Russia is selected
      updateFormData("city", "Moscow");
    }
  };

  // Call this whenever isCashPair changes
  useEffect(() => {
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
                  expiryDate && 
                    addDays(new Date(), preset.days).toDateString() === expiryDate.toDateString()
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
            setDate={(date) => date && updateFormData("expiryDate", date)}
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
          <Select 
            value={country} 
            onValueChange={(value) => {
              updateFormData("country", value);
              updateFormData("city", ""); // Reset city when country changes
            }}
          >
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
            <Select value={city} onValueChange={value => updateFormData("city", value)}>
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
            <FileText className={cn(
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
            onChange={(e) => updateFormData("purpose", e.target.value)}
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
          onChange={(e) => updateFormData("notes", e.target.value)}
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
