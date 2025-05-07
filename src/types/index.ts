
export interface User {
  id: string;
  fullName?: string;
  full_name?: string;
  company: string;
  email: string;
  telegramId?: string;
  referralCode?: string;
  registrationDate: Date;
  lastUpdated: Date;
  isVerified: boolean;
  [key: string]: any; // Добавляем индексную сигнатуру для безопасного доступа к произвольным свойствам
}

export type OrderType = "BUY" | "SELL";

export type TradePairGroup = "RUB_NR" | "RUB_CASH" | "TOKENIZED";

export interface TradePair {
  id: string;
  name: string;
  baseCurrency: string;
  quoteCurrency: string;
  group: TradePairGroup;
  displayName: string;
}

export interface RateDetails {
  type: "dynamic" | "fixed";
  source?: string;
  value?: string;
  adjustment?: number;
  serviceFee: number;
}

export interface Geography {
  country?: string;
  city?: string;
}

export interface Order {
  id: string;
  type: OrderType;
  amount: number;
  amountCurrency?: string;
  rate: string;
  rateDetails?: RateDetails;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  purpose?: string;
  notes?: string;
  userId: string;
  tradePairId: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
  geography?: Geography;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  dealId: string;
  isRead: boolean;
}

export interface Deal {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  status: "NEGOTIATING" | "AGREED" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
  telegramChatId?: string;
  dealMetadata?: {
    dealType: "OTC" | "CROSS-BOARD" | "INVOICE";
    reserveAmount?: number;
    isWithManager?: boolean;
  };
}

// Import the TranslationKey type from the i18n file to avoid duplication
import { TranslationKey } from "@/i18n/translations";

// Re-export the TranslationKey type
export type { TranslationKey };
