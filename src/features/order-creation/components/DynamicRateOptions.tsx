
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { FormProps } from "../types";

export default function DynamicRateOptions({ formProps }: { formProps: FormProps }) {
  const {
    theme,
    t,
    formData,
    updateFormData,
    currentRates,
    availableSources,
    loading,
    calculateOrder,
    autoCalculate
  } = formProps;

  return (
    <div className="space-y-4 pt-2 mt-2 border-t border-dashed">
      {/* Rate Source */}
      <div>
        <Label htmlFor="rateSource" className={cn(
          "block mb-2",
          theme === "light" ? "text-gray-700" : "text-gray-300"
        )}>{t('rateSource')}</Label>
        <Select 
          value={formData.rateSource} 
          onValueChange={(value) => {
            updateFormData("rateSource", value);
            if (autoCalculate && formData.amount && parseFloat(formData.amount) > 0) {
              setTimeout(() => calculateOrder(), 100);
            }
          }} 
          disabled={loading}
        >
          <SelectTrigger
            id="rateSource"
            className={cn(
              theme === "light"
                ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                : "bg-otc-active border-otc-active text-white"
            )}
          >
            <SelectValue placeholder={t('selectSource')} />
          </SelectTrigger>
          <SelectContent className={cn(
            theme === "light"
              ? "bg-white border-gray-200"
              : "bg-otc-card border-otc-active"
          )}>
            <div className={cn(
              "grid grid-cols-2 gap-1",
              theme === "light" ? "bg-gray-50" : "bg-otc-active/40"
            )}>
              {availableSources.map((source) => (
                <SelectItem
                  key={source.code}
                  value={source.code}
                  className={cn(
                    "flex justify-between items-center",
                    theme === "light" ? "hover:bg-gray-100" : "hover:bg-otc-active"
                  )}
                >
                  <span>{source.name} </span>
                  <span className={cn(
                    "font-mono text-sm",
                    theme === "light" ? "text-blue-600" : "text-otc-primary"
                  )}>
                    {currentRates[source.code] || "—"}
                  </span>
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>
      </div>

      {/* Rate Adjustment Slider */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <Label className={cn(
            theme === "light" ? "text-gray-700" : "text-gray-300"
          )}>
            {t('rate')} {t('adjustment')}: 
            <span className={cn(
              "ml-1 font-semibold",
              formData.rateAdjustment > 0 
                ? "text-green-600"
                : formData.rateAdjustment < 0 
                  ? "text-red-500" 
                  : ""
            )}>
              {formData.rateAdjustment > 0 ? "+" : ""}{formData.rateAdjustment}%
            </span>
          </Label>
        </div>
        <Slider
          defaultValue={[0]}
          min={-5}
          max={5}
          step={0.5}
          value={[formData.rateAdjustment]}
          onValueChange={(values) => {
            updateFormData("rateAdjustment", values[0]);
            if (autoCalculate && formData.amount && parseFloat(formData.amount) > 0) {
              setTimeout(() => calculateOrder(), 100);
            }
          }}
          className={cn(
            "py-1",
            theme === "light" ? "text-blue-600" : "text-otc-primary"
          )}
        />
        <div className="flex justify-between text-xs mt-1 px-1">
          <span className={theme === "light" ? "text-red-500" : "text-red-400"}>-5%</span>
          <span>0%</span>
          <span className={theme === "light" ? "text-green-600" : "text-green-400"}>+5%</span>
        </div>
      </div>
    </div>
  );
}
