
import React from "react";

// Map of currency codes to their symbols
const CURRENCY_SYMBOLS: Record<string, string> = {
  // Major currencies
  USD: "$",     // US Dollar
  EUR: "€",     // Euro
  GBP: "£",     // British Pound
  JPY: "¥",     // Japanese Yen
  CNY: "¥",     // Chinese Yuan
  RUB: "₽",     // Russian Ruble
  
  // Asian currencies
  KRW: "₩",     // South Korean Won
  INR: "₹",     // Indian Rupee
  THB: "฿",     // Thai Baht
  IDR: "Rp",    // Indonesian Rupiah
  VND: "₫",     // Vietnamese Dong
  
  // Middle East
  AED: "د.إ",   // UAE Dirham
  SAR: "﷼",     // Saudi Riyal
  ILS: "₪",     // Israeli Shekel
  
  // Latin America
  BRL: "R$",    // Brazilian Real
  MXN: "$",     // Mexican Peso
  ARS: "$",     // Argentine Peso
  
  // Africa
  ZAR: "R",     // South African Rand
  EGP: "£",     // Egyptian Pound
  NGN: "₦",     // Nigerian Naira
  
  // Cryptocurrencies
  BTC: "₿",     // Bitcoin
  ETH: "Ξ",     // Ethereum
  LTC: "Ł",     // Litecoin
  USDT: "$"     // Tether (USD equivalent)
};

export interface CurrencySymbolProps {
  currency: string;
  className?: string;
}

/**
 * Component for displaying currency symbols
 */
export const CurrencySymbol: React.FC<CurrencySymbolProps> = ({ currency, className = "" }) => {
  const normalizedCurrency = (currency || "").toUpperCase();
  const symbol = CURRENCY_SYMBOLS[normalizedCurrency] || "";
  
  return <span className={className}>{symbol}</span>;
};

/**
 * Helper function to get currency symbol
 */
export const getCurrencySymbol = (currency: string): string => {
  const normalizedCurrency = (currency || "").toUpperCase();
  return CURRENCY_SYMBOLS[normalizedCurrency] || "";
};

export default CurrencySymbol;
