
import { toast } from "@/hooks/use-toast";

/**
 * Convert a rate to a formatted string with a specified number of decimal places
 */
export function formatRate(rate: number | null | undefined, decimals: number = 2): string {
  if (rate === null || rate === undefined || isNaN(Number(rate))) {
    return "—";
  }
  return Number(rate).toLocaleString('ru-RU', { maximumFractionDigits: decimals });
}

/**
 * Format a rate with additional adjustment and service fee as a display string
 */
export function formatRateWithAdjustment(
  rateType: "dynamic" | "fixed",
  rateSource: string,
  rateValue: string | number | null,
  rateAdjustment: number,
  serviceFee: number
): string {
  if (rateType === "fixed") {
    return rateValue ? `Фикс: ${rateValue}` : "Нет значения";
  }

  const sourceMap: Record<string, string> = {
    "CBR": "ЦБ",
    "PF": "PF",
    "IV": "IV",
    "XE": "XE"
  };

  const sourceName = sourceMap[rateSource] || rateSource;
  const totalAdjustment = rateAdjustment + serviceFee;
  const sign = totalAdjustment >= 0 ? "+" : "";
  
  return `${sourceName}${sign}${totalAdjustment.toFixed(2)}%`;
}

/**
 * Calculate adjusted rate from base rate with adjustment percentage and service fee
 */
export function calculateAdjustedRate(
  baseRate: number,
  adjustmentPercent: number,
  serviceFeePercent: number
): number {
  if (isNaN(baseRate) || baseRate === 0) {
    return 0;
  }
  
  const adjustmentMultiplier = 1 + (adjustmentPercent / 100);
  const adjustedRate = baseRate * adjustmentMultiplier;
  
  const serviceFeeMultiplier = 1 + (serviceFeePercent / 100);
  return adjustedRate * serviceFeeMultiplier;
}

/**
 * Apply rate to order amount calculation
 */
export function calculateOrderAmount(
  amount: number,
  rate: number,
  orderType: string,
  baseCurrency: string,
  quoteCurrency: string
): { youPay: number, youReceive: number } {
  if (isNaN(amount) || amount <= 0 || isNaN(rate) || rate === 0) {
    return { youPay: 0, youReceive: 0 };
  }

  console.log(`Calculate order: amount=${amount}, rate=${rate}, orderType=${orderType}, base=${baseCurrency}, quote=${quoteCurrency}`);

  let youPay = amount; // Default: user always pays the input amount
  let youReceive = 0;

  // Special handling for USDT/RUB pairs
  if ((baseCurrency === "USDT" && quoteCurrency === "RUB") || 
      (baseCurrency === "RUB" && quoteCurrency === "USDT")) {
    
    // USDT/RUB pair
    if (baseCurrency === "USDT" && quoteCurrency === "RUB") {
      if (orderType === "BUY") {
        // Buying USDT with RUB
        youPay = amount; // in RUB
        youReceive = amount / rate; // in USDT
      } else {
        // Selling USDT for RUB
        youPay = amount; // in USDT
        youReceive = amount * rate; // in RUB
      }
    } 
    // RUB/USDT pair
    else {
      if (orderType === "BUY") {
        // Buying RUB with USDT
        youPay = amount; // in USDT
        youReceive = amount * rate; // in RUB
      } else {
        // Selling RUB for USDT
        youPay = amount; // in RUB
        youReceive = amount / rate; // in USDT
      }
    }
  }
  // Standard USD/RUB pairs
  else if ((baseCurrency === "USD" && quoteCurrency === "RUB") || 
           (baseCurrency === "RUB" && quoteCurrency === "USD")) {
    
    // USD/RUB pair
    if (baseCurrency === "USD" && quoteCurrency === "RUB") {
      if (orderType === "BUY") {
        // Buying USD with RUB
        youPay = amount; // in RUB
        youReceive = amount / rate; // in USD
      } else {
        // Selling USD for RUB
        youPay = amount; // in USD
        youReceive = amount * rate; // in RUB
      }
    } 
    // RUB/USD pair
    else {
      if (orderType === "BUY") {
        // Buying RUB with USD
        youPay = amount; // in USD
        youReceive = amount * rate; // in RUB
      } else {
        // Selling RUB for USD
        youPay = amount; // in RUB
        youReceive = amount / rate; // in USD
      }
    }
  }
  // Generic case for any other currency pairs
  else {
    if (orderType === "BUY") { // Buy base currency
      youPay = amount; // in quote currency
      youReceive = amount / rate; // in base currency
    } else { // Sell base currency
      youPay = amount; // in base currency
      youReceive = amount * rate; // in quote currency
    }
  }

  console.log(`Result: youPay=${youPay}, youReceive=${youReceive}`);
  return { youPay, youReceive };
}

/**
 * Get rate from current rates object for specified source
 * @returns rate value or undefined if not found
 */
export function getRateForSource(
  rates: Record<string, number> | null,
  source: string
): number | undefined {
  if (!rates || !rates[source]) {
    toast({
      title: "Курс не найден",
      description: `Не удалось получить курс для источника ${source}`,
      variant: "destructive"
    });
    return undefined;
  }
  
  return rates[source];
}

/**
 * Converts the rates object to a record of string values for display
 */
export function ratesToStringRecord(
  rates: Record<string, number> | null,
  decimals: number = 2
): Record<string, string> {
  const result: Record<string, string> = {};
  
  if (!rates) {
    return result;
  }
  
  Object.entries(rates).forEach(([source, rate]) => {
    result[source] = formatRate(rate, decimals);
  });
  
  return result;
}
