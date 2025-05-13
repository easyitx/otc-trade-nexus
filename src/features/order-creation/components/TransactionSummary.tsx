
import { cn } from "@/lib/utils";
import { ArrowRight, Calculator, EuroIcon, DollarSign, BadgePercent, RussianRubleIcon } from "lucide-react";

export default function TransactionSummary({
                                             theme, t, calculationResult, getCurrencySymbol, setCurrentStep
                                           }: {
  theme: string;
  t: (key: string) => string;
  calculationResult: any;
  getCurrencySymbol: (currency: string) => string;
  setCurrentStep: (step: number) => void;
}) {
  // Получаем правильные иконки валют
  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case "EUR":
        return <EuroIcon className="w-6 h-6 mr-3 text-white" />;
      case "RUB":
        return <RussianRubleIcon className="w-6 h-6 mr-3 text-white" />;
      default:
        return <DollarSign className="w-6 h-6 mr-3 text-white" />;
    }
  };

  // Format the display value based on currency
  const formatCurrencyValue = (value: string, currency: string) => {
    // Parse the numeric value, handling potential formatting like commas
    const numericValue = parseFloat(value.replace(/,/g, ''));
    
    // For debugging
    console.log(`Formatting ${value} as ${currency}`, numericValue);
    
    if (isNaN(numericValue)) return value;
    
    // Return appropriate format based on currency
    return numericValue.toLocaleString(undefined, { 
      maximumFractionDigits: 2,
      minimumFractionDigits: currency === "RUB" ? 0 : 2
    });
  };

  return (
    <div className={cn(
        "mt-6 rounded-xl p-6 border animate-fade-in",
        theme === "light"
            ? "bg-white border-gray-200 shadow-lg"
            : "bg-gray-800 border-gray-600 shadow-lg"
    )}>
      <h3 className={cn(
          "text-2xl font-bold mb-6 flex items-center",
          theme === "light" ? "text-gray-800" : "text-white"
      )}>
        <Calculator className="w-6 h-6 mr-3" />
        {t('orderSummary')}
      </h3>

      <div className="space-y-6">
        {/* Основная информация о транзакции */}
        <div className={cn(
            "rounded-lg p-5",
            theme === "light"
                ? "bg-blue-50/60 border border-blue-100"
                : "bg-blue-900/20 border border-blue-800/50"
        )}>
          <div className="flex justify-between items-center mb-4">
            <span className={cn(
                "text-sm font-medium",
                theme === "light" ? "text-gray-600" : "text-gray-300"
            )}>
              {calculationResult.fromCurrency === "RUB" ?
                  calculationResult.toCurrency === "USD" || calculationResult.toCurrency === "USDT" ?
                      `${t('sell')} ${calculationResult.fromCurrency}` :
                      `${t('buy')} ${calculationResult.toCurrency}`
                  :
                  calculationResult.toCurrency === "RUB" ?
                      `${t('buy')} ${calculationResult.toCurrency}` :
                      `${t('sell')} ${calculationResult.fromCurrency}`
              }
            </span>
            <span className={cn(
                "text-xs px-2 py-1 rounded",
                theme === "light"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-blue-800/50 text-blue-200"
            )}>
              {calculationResult.fromCurrency} → {calculationResult.toCurrency}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className={cn(
                  "text-sm mb-1",
                  theme === "light" ? "text-gray-500" : "text-gray-400"
              )}>
                {t('youPay')}
              </div>
              <div className={cn(
                  "text-xl font-bold",
                  theme === "light" ? "text-gray-900" : "text-white"
              )}>
                {getCurrencySymbol(calculationResult.fromCurrency)}
                {formatCurrencyValue(calculationResult.youPay, calculationResult.fromCurrency)} {calculationResult.fromCurrency}
              </div>
            </div>

            <div className={cn(
                "mx-4 p-2 rounded-full",
                theme === "light"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-blue-800/50 text-blue-300"
            )}>
              <ArrowRight className="h-5 w-5" />
            </div>

            <div>
              <div className={cn(
                  "text-sm mb-1",
                  theme === "light" ? "text-gray-500" : "text-gray-400"
              )}>
                {t('youReceive')}
              </div>
              <div className={cn(
                  "text-xl font-bold",
                  theme === "light" ? "text-green-600" : "text-green-400"
              )}>
                {getCurrencySymbol(calculationResult.toCurrency)}
                {formatCurrencyValue(calculationResult.youReceive, calculationResult.toCurrency)} {calculationResult.toCurrency}
              </div>
            </div>
          </div>
        </div>

        {/* Детали расчета */}
        <div className={cn(
            "rounded-lg p-5 space-y-4",
            theme === "light"
                ? "bg-gray-50 border border-gray-200"
                : "bg-gray-700/50 border border-gray-600"
        )}>
          <h4 className={cn(
              "font-semibold flex items-center text-sm",
              theme === "light" ? "text-gray-700" : "text-gray-300"
          )}>
            <BadgePercent className="w-4 h-4 mr-2" />
            {t('calculationDetails')}
          </h4>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                {t('baseExchangeRate')}:
              </span>
              <span className={theme === "light" ? "text-gray-800" : "text-white"}>
                1 {calculationResult.fromCurrency} = {calculationResult.baseRate} {calculationResult.toCurrency}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                {t('adjustment')} ({calculationResult.adjustmentPercentage}%):
              </span>
              <span className={
                parseFloat(calculationResult.adjustmentAmount) > 0
                    ? "text-green-500"
                    : parseFloat(calculationResult.adjustmentAmount) < 0
                        ? "text-red-500"
                        : theme === "light" ? "text-gray-800" : "text-white"
              }>
                {getCurrencySymbol(calculationResult.toCurrency)}
                {Math.abs(parseFloat(calculationResult.adjustmentAmount.toString().replace(/,/g, ''))).toLocaleString()} {calculationResult.toCurrency}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                {t('serviceFee')} (1%):
              </span>
              <span className={theme === "light" ? "text-gray-800" : "text-white"}>
                {getCurrencySymbol(calculationResult.toCurrency)}
                {calculationResult.serviceFeeAmount} {calculationResult.toCurrency}
              </span>
            </div>

            <div className={cn(
                "flex justify-between pt-3 mt-3 border-t",
                theme === "light" ? "border-gray-300" : "border-gray-600"
            )}>
              <span className={cn(
                  "font-semibold",
                  theme === "light" ? "text-gray-700" : "text-gray-300"
              )}>
                {t('total')}:
              </span>
              <span className={cn(
                  "font-bold",
                  theme === "light" ? "text-gray-900" : "text-white"
              )}>
                {getCurrencySymbol(calculationResult.toCurrency)}
                {formatCurrencyValue(calculationResult.totalAmount, calculationResult.toCurrency)} {calculationResult.toCurrency}
              </span>
            </div>
          </div>
        </div>

        {/* Итоговый курс и кнопка подтверждения */}
        <div className={cn(
            "rounded-lg p-5",
            theme === "light"
                ? "bg-gradient-to-r from-blue-500 to-blue-600"
                : "bg-gradient-to-r from-blue-600 to-blue-700"
        )}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              {getCurrencyIcon(calculationResult.fromCurrency)}
              <div>
                <div className="text-xs text-white/80 uppercase tracking-wider">
                  {t('finalExchangeRate')}
                </div>
                <div className="text-xl font-bold text-white">
                  1 {calculationResult.fromCurrency} = {calculationResult.finalRate} {calculationResult.toCurrency}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
