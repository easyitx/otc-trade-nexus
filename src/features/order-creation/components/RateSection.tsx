
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { FormProps } from "../types";
import DynamicRateOptions from "./DynamicRateOptions";
import FixedRateOptions from "./FixedRateOptions";

export default function RateSection({ formProps }: { formProps: FormProps }) {
  const {
    theme, 
    t, 
    formData,
    updateFormData,
    formatRate,
    serviceFee
  } = formProps;

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between">
        <Label className={cn(
          "text-base",
          theme === "light" ? "text-gray-800" : "text-white"
        )}>{t('rate')}</Label>

        <div className={cn(
          "text-sm font-medium px-3 py-1 rounded-full",
          theme === "light"
            ? "bg-blue-100 text-blue-700"
            : "bg-otc-primary/20 text-otc-primary"
        )}>
          {formatRate()}
        </div>
      </div>

      {/* Rate Type Selection */}
      <div className={cn(
        "p-4 rounded-lg border",
        theme === "light"
          ? "bg-gray-50 border-gray-200"
          : "bg-otc-active/30 border-otc-active"
      )}>
        <div className="space-y-4">
          <Label className={cn(
            "block font-medium",
            theme === "light" ? "text-gray-700" : "text-gray-300"
          )}>
            {t('rateType')}
          </Label>
          <RadioGroup
            value={formData.rateType}
            onValueChange={(value) => updateFormData("rateType", value as "dynamic" | "fixed")}
            className="flex gap-4"
          >
            <div className={cn(
              "flex items-center gap-2 p-3 rounded-lg border transition-all",
              formData.rateType === "dynamic" ? (
                theme === "light"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-otc-primary/10 border-otc-primary/30"
              ) : (
                theme === "light"
                  ? "bg-white border-gray-200"
                  : "bg-otc-active border-otc-active"
              )
            )}>
              <RadioGroupItem
                value="dynamic"
                id="dynamic-rate"
                className={cn(
                  theme === "light"
                    ? "border-gray-300 text-blue-600"
                    : "border-otc-active text-otc-primary"
                )}
              />
              <Label
                htmlFor="dynamic-rate"
                className={cn(
                  "cursor-pointer",
                  theme === "light" ? "text-gray-800" : "text-white"
                )}
              >
                {t('dynamicRate')}
              </Label>
            </div>

            <div className={cn(
              "flex items-center gap-2 p-3 rounded-lg border transition-all",
              formData.rateType === "fixed" ? (
                theme === "light"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-otc-primary/10 border-otc-primary/30"
              ) : (
                theme === "light"
                  ? "bg-white border-gray-200"
                  : "bg-otc-active border-otc-active"
              )
            )}>
              <RadioGroupItem
                value="fixed"
                id="fixed-rate"
                className={cn(
                  theme === "light"
                    ? "border-gray-300 text-blue-600"
                    : "border-otc-active text-otc-primary"
                )}
              />
              <Label
                htmlFor="fixed-rate"
                className={cn(
                  "cursor-pointer",
                  theme === "light" ? "text-gray-800" : "text-white"
                )}
              >
                {t('fixedRate')}
              </Label>
            </div>
          </RadioGroup>

          {/* Dynamic Rate Options */}
          {formData.rateType === "dynamic" && <DynamicRateOptions formProps={formProps} />}

          {/* Fixed Rate Input with Source Selection */}
          {formData.rateType === "fixed" && <FixedRateOptions formProps={formProps} />}

          {/* Rate Summary */}
          <div className={cn(
            "rounded-lg p-4 mt-4 border",
            theme === "light"
              ? "bg-blue-50 border-blue-100 text-blue-800"
              : "bg-otc-primary/10 border-otc-primary/20 text-white"
          )}>
            <div className="flex justify-between items-center">
              <Label>{t('serviceFee')}: </Label>
              <span className={cn(
                "font-semibold",
                theme === "light" ? "text-blue-700" : "text-otc-primary"
              )}>
                {serviceFee}%
              </span>
            </div>
            <div className={cn(
              "mt-3 pt-3",
              theme === "light"
                ? "border-t border-blue-200"
                : "border-t border-otc-primary/20"
            )}>
              <div className="flex justify-between items-center">
                <Label>{t('finalRate')}: </Label>
                <span className={cn(
                  "font-medium",
                  theme === "light" ? "text-blue-700" : "text-otc-primary"
                )}>
                  {formatRate()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
