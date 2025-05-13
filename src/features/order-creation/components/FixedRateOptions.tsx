
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormProps } from "../types";

export default function FixedRateOptions({ formProps }: { formProps: FormProps }) {
  const {
    theme,
    t,
    language,
    formData,
    updateFormData,
    currentRates,
    applyRateSourceToFixed,
    availableSources,
    loading,
    calculateOrder,
    autoCalculate
  } = formProps;

  return (
    <div className="space-y-4 pt-2 mt-2 border-t border-dashed">
      <div className="space-y-3">
        <Label className={cn(
          "block mb-1",
          theme === "light" ? "text-gray-700" : "text-gray-300"
        )}>
          {language === 'en' ? 'Quick Select Rate' : 'Быстрый выбор курса'}
        </Label>
        <div className="flex flex-wrap gap-2">
          {availableSources.map((source) => (
            <Button 
              key={source.code}
              type="button"
              size="sm" 
              variant={theme === "light" ? "outline" : "secondary"}
              onClick={() => {
                applyRateSourceToFixed(source.code);
                if (autoCalculate && formData.amount && parseFloat(formData.amount) > 0) {
                  setTimeout(() => calculateOrder(), 100);
                }
              }}
              className={cn(
                "gap-2",
                currentRates[source.code] === formData.customRateValue ? (
                  theme === "light" 
                    ? "bg-blue-50 border-blue-300 text-blue-700" 
                    : "bg-otc-primary/20 border-otc-primary text-white"
                ) : (
                  theme === "light" 
                    ? "border-gray-200 bg-white" 
                    : "border-otc-active bg-otc-active"
                )
              )}
              disabled={loading}
            >
              <span>{source.name}:</span>
              <span className="font-mono">{currentRates[source.code] || "—"}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fixedRate" className={cn(
          theme === "light" ? "text-gray-700" : "text-gray-300"
        )}>
          {language === 'en' ? 'Custom Rate Value' : 'Значение курса'}
        </Label>
        <Input
          id="fixedRate"
          value={formData.customRateValue}
          onChange={(e) => {
            updateFormData("customRateValue", e.target.value);
            if (autoCalculate && formData.amount && parseFloat(formData.amount) > 0) {
              setTimeout(() => calculateOrder(), 100);
            }
          }}
          placeholder={language === 'en' ? 'Enter rate value' : 'Введите значение курса'}
          className={cn(
            "text-lg font-mono",
            theme === "light"
              ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
              : "bg-otc-active border-otc-active text-white"
          )}
        />
      </div>
    </div>
  );
}
