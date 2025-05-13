
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { TranslationKey } from "@/i18n/translationTypes";
import { tradePairs } from "@/data/mockData";
import TransactionSummary from "./TransactionSummary";
import { FormProps } from "../types";
import RateSection from "./RateSection";

export default function BasicDetailsStep({ formProps }: { formProps: FormProps }) {
  const {
    theme,
    t,
    formData,
    updateFormData,
    selectedPairInfo,
    calculationResult,
    showCalculation,
    calculateOrder,
    currentRates,
    setCurrentStep,
    autoCalculate,
    availablePairs,
    getCurrencySymbol
  } = formProps;

  // Group trade pairs by category
  const groupedPairs: Record<string, typeof tradePairs> = tradePairs.reduce((groups, pair) => {
    const group = pair.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(pair);
    return groups;
  }, {} as Record<string, typeof tradePairs>);

  return (
    <>
      {/* Trading Pair */}
      <div className="space-y-3">
        <Label
          htmlFor="tradingPair"
          className={cn(
            "text-base",
            theme === "light" ? "text-gray-800" : "text-white"
          )}
        >
          {t('tradingPair')} <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.selectedPair}
          onValueChange={(value) => {
            updateFormData("selectedPair", value);
            if (autoCalculate && formData.amount && parseFloat(formData.amount) > 0) {
              setTimeout(() => calculateOrder(), 100);
            }
          }}
        >
          <SelectTrigger
              id="tradingPair"
              className={cn(
                  "h-12 text-sm",
                  theme === "light"
                      ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                      : "bg-otc-active border-otc-active text-white"
              )}
          >
            <SelectValue placeholder={t('selectTradingPair')} />
          </SelectTrigger>
          <SelectContent
            className={cn(
              "max-h-[300px]",
              theme === "light"
                ? "bg-white border-gray-200"
                : "bg-otc-card border-otc-active"
            )}
          >
            {Object.entries(groupedPairs).map(([group, pairs]) => (
              <div key={group}>
                <div className={cn(
                  "sticky top-0 px-2 py-2 text-xs uppercase tracking-wider font-medium backdrop-blur-sm z-10",
                  theme === "light"
                    ? "bg-gray-50 text-gray-500 border-b border-gray-200"
                    : "bg-otc-active/80 text-gray-400 border-b border-otc-active"
                )}>
                  {t(group.replace(/\s+/g, '_') as TranslationKey)}
                </div>
                {pairs.map((pair) => (
                  <SelectItem
                    key={pair.id}
                    value={pair.id}
                    className={cn(
                      theme === "light"
                        ? "hover:bg-gray-100 focus:bg-gray-100"
                        : "hover:bg-otc-active focus:bg-otc-active"
                    )}
                  >
                    {pair.displayName}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.selectedPair && (
        <>
          {/* Order Type */}
          <div className="space-y-2">
            <Label className={cn(
              "text-sm font-medium",
              theme === "light" ? "text-gray-700" : "text-gray-200"
            )}>
              {t('orderType')} <span className="text-red-500">*</span>
            </Label>

            {selectedPairInfo && (
              <RadioGroup
                value={formData.orderType}
                onValueChange={(value) => {
                  updateFormData("orderType", value as "BUY" | "SELL");
                  if (autoCalculate && formData.amount && parseFloat(formData.amount) > 0) {
                    setTimeout(() => calculateOrder(), 100);
                  }
                }}
                className="grid grid-cols-2 gap-2"
              >
                {/* Buy Option */}
                <div className={cn(
                  "relative rounded-lg transition-all duration-300 border overflow-hidden",
                  formData.orderType === "BUY" ? (
                      theme === "light"
                          ? "ring-1 ring-blue-400 shadow-sm"
                          : "ring-1 ring-emerald-400 shadow-md"
                  ) : "",
                  theme === "light"
                      ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
                      : "bg-gradient-to-br from-otc-card to-otc-active/30 border-otc-active/50"
                )}>
                  <label
                    htmlFor="buy-option"
                    className="p-3 flex items-start cursor-pointer w-full h-full"
                  >
                    <RadioGroupItem
                      value="BUY"
                      id="buy-option"
                      className={cn(
                        "mt-0.5 h-4 w-4",
                        theme === "light"
                            ? "border-gray-300 text-blue-600"
                            : "border-emerald-400 text-emerald-400"
                      )}
                    />
                    <div className="ml-2">
                      <div className={cn(
                        "font-medium text-base flex items-center",
                        theme === "light" ? "text-gray-800" : "text-white"
                      )}>
                        <span className={cn(
                          "mr-1.5 text-xl",
                          theme === "light" ? "text-green-600" : "text-emerald-400"
                        )}>+</span>
                        Получаю {selectedPairInfo.baseCurrency}
                      </div>
                      <div className={cn(
                        "text-xs mt-1",
                        theme === "light" ? "text-gray-500" : "text-gray-300"
                      )}>
                        Отдаю {selectedPairInfo.quoteCurrency}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Sell Option */}
                <div className={cn(
                  "relative rounded-lg transition-all duration-300 border overflow-hidden",
                  formData.orderType === "SELL" ? (
                      theme === "light"
                          ? "ring-1 ring-blue-400 shadow-sm"
                          : "ring-1 ring-rose-400 shadow-md"
                  ) : "",
                  theme === "light"
                      ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
                      : "bg-gradient-to-br from-otc-card to-otc-active/30 border-otc-active/50"
                )}>
                  <label
                    htmlFor="sell-option"
                    className="p-3 flex items-start cursor-pointer w-full h-full"
                  >
                    <RadioGroupItem
                      value="SELL"
                      id="sell-option"
                      className={cn(
                        "mt-0.5 h-4 w-4",
                        theme === "light"
                            ? "border-gray-300 text-blue-600"
                            : "border-rose-400 text-rose-400"
                      )}
                    />
                    <div className="ml-2">
                      <div className={cn(
                        "font-medium text-base flex items-center",
                        theme === "light" ? "text-gray-800" : "text-white"
                      )}>
                        <span className={cn(
                          "mr-1.5 text-xl",
                          theme === "light" ? "text-red-600" : "text-rose-400"
                        )}>-</span>
                        Отдаю {selectedPairInfo.quoteCurrency}
                      </div>
                      <div className={cn(
                        "text-xs mt-1",
                        theme === "light" ? "text-gray-500" : "text-gray-300"
                      )}>
                        Получаю {selectedPairInfo.baseCurrency}
                      </div>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-3">
            <Label htmlFor="amount" className={cn(
              "text-sm font-medium",
              theme === "light" ? "text-gray-700" : "text-gray-200"
            )}>
              Сколько отдаете <span className="text-red-500">*</span>
            </Label>
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <Input
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => {
                    updateFormData("amount", e.target.value);
                    if (autoCalculate && formData.selectedPair && e.target.value && parseFloat(e.target.value) > 0) {
                      calculateOrder();
                    }
                  }}
                  placeholder={t('minimumOrder')}
                  className={cn(
                    "pl-7 h-11 text-base",
                    theme === "light"
                        ? "bg-white border-gray-300 text-gray-800 hover:border-gray-400"
                        : "bg-otc-active border-otc-active text-white"
                  )}
                />
                <span className={cn(
                  "absolute left-2.5 top-1/2 transform -translate-y-1/2 text-base",
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                )}>
                  {getCurrencySymbol(formData.amountCurrency)}
                </span>
              </div>
            </div>
            {selectedPairInfo && (
              <p className={cn(
                "text-sm",
                theme === "light" ? "text-gray-600" : "text-gray-400"
              )}>
                {formData.orderType === "BUY"
                  ? `${t('amount')} ${t('in')} ${selectedPairInfo.quoteCurrency}`
                  : `${t('amount')} ${t('in')} ${selectedPairInfo.baseCurrency}`}
              </p>
            )}
          </div>

          {/* Rate Section */}
          <RateSection formProps={formProps} />

          {/* Transaction Calculation Results */}
          {showCalculation && calculationResult && (
            <div className="mt-6">
              <TransactionSummary
                theme={theme}
                t={t}
                calculationResult={calculationResult}
                getCurrencySymbol={getCurrencySymbol}
                setCurrentStep={setCurrentStep}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
