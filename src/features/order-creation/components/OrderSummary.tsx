
import React from "react";
import { cn } from "@/lib/utils";
import { OrderCalculationResult } from "../types";

interface OrderSummaryProps {
  theme: string;
  t: (key: string) => string;
  calculationResult: OrderCalculationResult;
  getCurrencySymbol: (currency: string) => string;
}

export default function OrderSummary({ 
  theme, 
  t, 
  calculationResult, 
  getCurrencySymbol 
}: OrderSummaryProps) {
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
                {getCurrencySymbol(calculationResult.fromCurrency)}
                {calculationResult.youPay} {calculationResult.fromCurrency}
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
                {getCurrencySymbol(calculationResult.toCurrency)}
                {calculationResult.youReceive} {calculationResult.toCurrency}
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
