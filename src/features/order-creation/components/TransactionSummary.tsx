
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Settings } from "lucide-react";

export default function TransactionSummary({ 
  theme, t, calculationResult, getCurrencySymbol, setCurrentStep 
}: { 
  theme: string; 
  t: (key: string) => string; 
  calculationResult: any;
  getCurrencySymbol: (currency: string) => string;
  setCurrentStep: (step: number) => void;
}) {
  return (
    <div className={cn(
      "mt-10 rounded-lg p-4 border animate-fade-in",
      theme === "light"
        ? "bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-md"
        : "bg-gradient-to-br from-otc-active/40 to-otc-card border-otc-active shadow-md"
    )}>
      <h3 className={cn(
        "text-2xl font-semibold mb-6 flex items-center",
        theme === "light" ? "text-gray-900" : "text-white"
      )}>
        <Settings className="w-5 h-5 mr-2" />
        {t('orderSummary')}
      </h3>
      
      <div className="space-y-6">
        <div className={cn(
          "rounded-lg overflow-hidden border shadow-sm",
          theme === "light" 
            ? "bg-white border-gray-200" 
            : "bg-otc-card border border-otc-active"
        )}>
          {/* Transaction Summary Header */}
          <div className={cn(
            "px-4 py-3",
            theme === "light" 
              ? "bg-gray-50 border-b border-gray-200" 
              : "bg-otc-active border-b border-otc-active"
          )}>
            <h4 className={cn(
              "font-medium",
              theme === "light" ? "text-gray-700" : "text-gray-300"
            )}>
              {calculationResult.fromCurrency === "RUB" ?
                calculationResult.toCurrency === "USD" || calculationResult.toCurrency === "USDT" ?
                  `${t('sell')} ${calculationResult.fromCurrency} ${t('for')} ${calculationResult.toCurrency}` :
                  `${t('buy')} ${calculationResult.toCurrency} ${t('with')} ${calculationResult.fromCurrency}`
                :
                calculationResult.toCurrency === "RUB" ?
                  `${t('buy')} ${calculationResult.toCurrency} ${t('with')} ${calculationResult.fromCurrency}` :
                  `${t('sell')} ${calculationResult.fromCurrency} ${t('for')} ${calculationResult.toCurrency}`
              }
            </h4>
          </div>
          
          {/* Transaction Flow */}
          <div className="px-4 py-5 space-y-6">
            <div className="flex flex-col space-y-6">
              <div className="flex justify-between items-center">
                <div className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                  {t('youPay')}:
                </div>
                <div className={cn(
                  "font-medium text-lg",
                  theme === "light" ? "text-gray-900" : "text-white"
                )}>
                  {getCurrencySymbol(calculationResult.fromCurrency)}{calculationResult.youPay} {calculationResult.fromCurrency}
                </div>
              </div>
              
              <div className="flex justify-center relative">
                <div className={cn(
                  "absolute left-0 right-0 top-1/2 border-t border-dashed",
                  theme === "light" ? "border-gray-300" : "border-gray-600"
                )}></div>
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center z-10",
                  theme === "light" ? "bg-blue-50 text-blue-600" : "bg-otc-primary/20 text-otc-primary"
                )}>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                  {t('youReceive')}:
                </div>
                <div className={cn(
                  "font-medium text-xl",
                  theme === "light" ? "text-green-600" : "text-green-400"
                )}>
                  {getCurrencySymbol(calculationResult.toCurrency)}{calculationResult.youReceive} {calculationResult.toCurrency}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Calculation Details */}
        <div className={cn(
          "rounded-lg border p-4",
          theme === "light" 
            ? "bg-gray-50 border-gray-200" 
            : "bg-otc-active/30 border-otc-active"
        )}>
          <h4 className={cn(
            "text-sm font-medium mb-4",
            theme === "light" ? "text-gray-700" : "text-gray-300"
          )}>
            {t('calculationDetails')}
          </h4>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                {t('baseExchangeRate')}:
              </div>
              <div className={cn(
                "text-right font-mono",
                theme === "light" ? "text-gray-800" : "text-white"
              )}>
                1:{calculationResult.baseRate}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                {t('adjustment')}:
              </div>
              <div className={cn(
                "text-right font-mono",
                parseFloat(calculationResult.adjustmentAmount) > 0 
                  ? "text-green-600" 
                  : parseFloat(calculationResult.adjustmentAmount) < 0 
                    ? "text-red-500" 
                    : theme === "light" ? "text-gray-800" : "text-white"
              )}>
                {getCurrencySymbol(calculationResult.toCurrency)}{calculationResult.adjustmentAmount}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                {t('serviceFee')}:
              </div>
              <div className={cn(
                "text-right font-mono",
                theme === "light" ? "text-gray-800" : "text-white"
              )}>
                {getCurrencySymbol(calculationResult.toCurrency)}{calculationResult.serviceFeeAmount}
              </div>
            </div>
            
            <div className={cn(
              "grid grid-cols-2 gap-2 pt-2 mt-2",
              theme === "light"
                ? "border-t border-gray-200"
                : "border-t border-otc-active"
            )}>
              <div className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                {t('finalRate')}:
              </div>
              <div className={cn(
                "text-right font-mono font-medium",
                theme === "light" ? "text-blue-600" : "text-otc-primary"
              )}>
                1:{calculationResult.finalRate}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Button
            type="button"
            onClick={() => setCurrentStep(2)}
            variant={theme === "light" ? "gradient" : "default"}
            className={cn(
              "w-full py-6 text-lg group",
              theme === "light"
                ? ""
                : "bg-otc-primary text-black hover:bg-otc-primary/90"
            )}
          >
            <span className="flex items-center gap-2">
              {t('continue')}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
