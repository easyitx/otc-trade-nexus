
export interface User {
  id: string;
  fullName: string;
  full_name: string; // Adding this property for compatibility
  company: string;
  email: string;
  telegramId?: string;
  referralCode?: string;
  registrationDate: Date;
  lastUpdated: Date;
  isVerified: boolean;
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

export interface Order {
  id: string;
  type: OrderType;
  amount: number;
  rate: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  purpose?: string;
  notes?: string;
  userId: string;
  tradePairId: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
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
