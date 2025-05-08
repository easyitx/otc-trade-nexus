
import React from "react";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { countries } from "@/data/countries";
import { citiesByCountry } from "@/data/cities";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { addDays } from "date-fns";

interface AdditionalDetailsStepProps {
  formProps: any;
}

export default function AdditionalDetailsStep({ formProps }: AdditionalDetailsStepProps) {
  const { 
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
    theme,
    t,
    language,
    isCashPair
  } = formProps;
  
  // Calculate preset dates for easy selection
  const presetDates = [
    { days: 1, label: t('1day') },
    { days: 3, label: t('3days') },
    { days: 7, label: t('7days') },
    { days: 15, label: t('15days') },
    { days: 30, label: t('30days') }
  ];
  
  // Handle preset date selection
  const handlePresetDate = (days: number) => {
    const newDate = addDays(new Date(), days);
    setExpiryDate(newDate);
  };

  // Get filtered cities based on selected country code
  const filteredCities = country ? citiesByCountry[country] || [] : [];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="expiryDate">{t('expiryDate')}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                    <Info className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  {t('expiryDateTooltip') || "Order expiry date indicates when your order will become inactive. After this date, the order will be marked as expired."}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="space-y-3">
            <EnhancedDatePicker
              date={expiryDate}
              setDate={setExpiryDate}
              placeholder={t('selectExpiryDate')}
            />

            <div className="flex flex-wrap gap-2 mt-2">
              {presetDates.map((preset) => (
                <Button
                  key={preset.days}
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn(
                    "text-xs",
                    theme === "light" 
                      ? "hover:bg-accent" 
                      : "hover:bg-otc-active"
                  )}
                  onClick={() => handlePresetDate(preset.days)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">{t('purpose')}</Label>
          <Input
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder={t('purposeDescription')}
            className={cn(
              theme === "light" 
                ? "bg-white border-gray-200" 
                : "bg-otc-active border-otc-active text-white"
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t('notes')}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('additionalNotes')}
          className={cn(
            theme === "light" 
              ? "bg-white border-gray-200 min-h-[120px]" 
              : "bg-otc-active border-otc-active text-white min-h-[120px]"
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="country">{t('country')}</Label>
            {isCashPair() && (
              <span className="text-xs text-red-500">*</span>
            )}
          </div>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger 
              className={cn(
                theme === "light" 
                  ? "bg-white border-gray-200" 
                  : "bg-otc-active border-otc-active text-white"
              )}
            >
              <SelectValue placeholder={t('selectCountry')} />
            </SelectTrigger>
            <SelectContent
              className={cn(
                theme === "light" 
                  ? "bg-white border-gray-200" 
                  : "bg-otc-card border-otc-active"
              )}
            >
              {countries.sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(country && (isCashPair() || filteredCities.length > 0)) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="city">{t('city')}</Label>
              {isCashPair() && (
                <span className="text-xs text-red-500">*</span>
              )}
            </div>
            {filteredCities.length > 0 ? (
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger 
                  className={cn(
                    theme === "light" 
                      ? "bg-white border-gray-200" 
                      : "bg-otc-active border-otc-active text-white"
                  )}
                >
                  <SelectValue placeholder={t('selectCity')} />
                </SelectTrigger>
                <SelectContent
                  className={cn(
                    theme === "light" 
                      ? "bg-white border-gray-200" 
                      : "bg-otc-card border-otc-active" 
                  )}
                >
                  {filteredCities.sort((a, b) => a.localeCompare(b)).map((cityName) => (
                    <SelectItem key={cityName} value={cityName}>
                      {cityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t('enterCity')}
                className={cn(
                  theme === "light" 
                    ? "bg-white border-gray-200" 
                    : "bg-otc-active border-otc-active text-white"
                )}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
