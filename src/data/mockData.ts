import { User, Order, TradePair, Deal, Message, TradePairGroup } from "../types";

// Trade Pairs
export const tradePairs: TradePair[] = [
  // RUB Cash Group
  {
    id: "pair6",
    name: "RUB_CASH_USDT",
    baseCurrency: "RUB Cash",
    quoteCurrency: "USDT",
    group: "RUB_CASH" as TradePairGroup,
    displayName: "RUB Cash – USDT",
    currencyPair: 'RUB/USD'
  },
  // {
  //   id: "pair7",
  //   name: "USD_CASH_USDT",
  //   baseCurrency: "USD Cash",
  //   quoteCurrency: "USDT",
  //   group: "RUB_CASH" as TradePairGroup,
  //   displayName: "USD Cash – USDT",
  //   currencyPair: 'RUB/USD'
  // },
  // {
  //   id: "pair8",
  //   name: "EUR_CASH_USDT",
  //   baseCurrency: "EUR Cash",
  //   quoteCurrency: "USDT",
  //   group: "RUB_CASH" as TradePairGroup,
  //   displayName: "EUR Cash – USDT",
  //   currencyPair: 'RUB/USD'
  // },
  //
  // // RUB Neresident Group
  // {
  //   id: "pair1",
  //   name: "RUB_NR_USD",
  //   baseCurrency: "RUB (NR)",
  //   quoteCurrency: "USD",
  //   group: "RUB_NR" as TradePairGroup,
  //   displayName: "RUB (NR) – USD",
  //   currencyPair: 'RUB/USD'
  // },
  // {
  //   id: "pair2",
  //   name: "RUB_NR_AED",
  //   baseCurrency: "RUB (NR)",
  //   quoteCurrency: "AED",
  //   group: "RUB_NR" as TradePairGroup,
  //   displayName: "RUB (NR) – AED",
  //   currencyPair: 'RUB/USD'
  // },
  // {
  //   id: "pair3",
  //   name: "RUB_NR_EUR",
  //   baseCurrency: "RUB (NR)",
  //   quoteCurrency: "EUR",
  //   group: "RUB_NR" as TradePairGroup,
  //   displayName: "RUB (NR) – EUR",
  //   currencyPair: 'RUB/USD'
  // },
  // {
  //   id: "pair4",
  //   name: "RUB_NR_CNY",
  //   baseCurrency: "RUB (NR)",
  //   quoteCurrency: "CNY",
  //   group: "RUB_NR" as TradePairGroup,
  //   displayName: "RUB (NR) – CNY",
  //   currencyPair: 'RUB/USD'
  // },
  // {
  //   id: "pair5",
  //   name: "RUB_NR_USDT",
  //   baseCurrency: "RUB (NR)",
  //   quoteCurrency: "USDT",
  //   group: "RUB_NR" as TradePairGroup,
  //   displayName: "RUB (NR) – USDT",
  //   currencyPair: 'RUB/USD'
  // },
  //
  // // Tokenized Ruble Group
  // {
  //   id: "pair9",
  //   name: "A7A5_RUB",
  //   baseCurrency: "A7A5",
  //   quoteCurrency: "RUB",
  //   group: "TOKENIZED" as TradePairGroup,
  //   displayName: "A7A5 – RUB",
  //   currencyPair: 'RUB/USD'
  // },
  // {
  //   id: "pair10",
  //   name: "RUBT_A7A5",
  //   baseCurrency: "RUBT",
  //   quoteCurrency: "A7A5",
  //   group: "TOKENIZED" as TradePairGroup,
  //   displayName: "RUBT – A7A5",
  //   currencyPair: 'RUB/USD'
  // }
];

// Mock Users
export const users: User[] = [
  {
    id: "user1",
    fullName: "Alexei Ivanov",
    full_name: "Alexei Ivanov", // Added for compatibility
    company: "Global Finance Ltd",
    email: "a.ivanov@example.com",
    telegramId: "@alexei_trader",
    referralCode: "REF001",
    registrationDate: new Date("2025-01-15"),
    lastUpdated: new Date("2025-03-10"),
    isVerified: true
  },
  {
    id: "user2",
    fullName: "Marina Petrova",
    full_name: "Marina Petrova", // Added for compatibility
    company: "Eastern Export Co",
    email: "m.petrova@example.com",
    telegramId: "@marina_trade",
    referralCode: "REF002",
    registrationDate: new Date("2025-02-01"),
    lastUpdated: new Date("2025-03-15"),
    isVerified: true
  },
  {
    id: "user3",
    fullName: "Dmitry Sokolov",
    full_name: "Dmitry Sokolov", // Added for compatibility
    company: "Crypto Exchange LLC",
    email: "d.sokolov@example.com",
    registrationDate: new Date("2025-02-20"),
    lastUpdated: new Date("2025-02-20"),
    isVerified: false
  }
];

// Mock Orders
export const orders: Order[] = [
  {
    id: "order1",
    type: "SELL",
    amount: 1500000,
    rate: "CB+1.5%",
    createdAt: new Date("2025-04-15"),
    updatedAt: new Date("2025-04-15"),
    expiresAt: new Date("2025-04-22"),
    purpose: "Export revenue conversion",
    notes: "Need quick processing",
    userId: "user1",
    tradePairId: "pair1",
    status: "ACTIVE"
  },
  {
    id: "order2",
    type: "BUY",
    amount: 2000000,
    rate: "CB+1.2%",
    createdAt: new Date("2025-04-16"),
    updatedAt: new Date("2025-04-16"),
    expiresAt: new Date("2025-04-25"),
    purpose: "Import payment settlement",
    userId: "user2",
    tradePairId: "pair3",
    status: "ACTIVE"
  },
  {
    id: "order3",
    type: "SELL",
    amount: 800000,
    rate: "Market price",
    createdAt: new Date("2025-04-17"),
    updatedAt: new Date("2025-04-17"),
    expiresAt: new Date("2025-04-24"),
    notes: "Premium client, priority processing",
    userId: "user3",
    tradePairId: "pair5",
    status: "ACTIVE"
  },
  {
    id: "order4",
    type: "BUY",
    amount: 750000,
    rate: "CB+0.8%",
    createdAt: new Date("2025-04-14"),
    updatedAt: new Date("2025-04-15"),
    expiresAt: new Date("2025-04-21"),
    purpose: "Corporate treasury operation",
    notes: "Open to negotiation on rate",
    userId: "user2",
    tradePairId: "pair4",
    status: "ACTIVE"
  },
  {
    id: "order5",
    type: "SELL",
    amount: 1000000,
    rate: "CB+1.0%",
    createdAt: new Date("2025-04-13"),
    updatedAt: new Date("2025-04-13"),
    expiresAt: new Date("2025-04-20"),
    userId: "user1",
    tradePairId: "pair7",
    status: "ACTIVE"
  }
];

// Mock Deals
export const deals: Deal[] = [
  {
    id: "deal1",
    orderId: "order1",
    buyerId: "user3",
    sellerId: "user1",
    status: "NEGOTIATING",
    createdAt: new Date("2025-04-16"),
    updatedAt: new Date("2025-04-16"),
    telegramChatId: "@otc_deal_123"
  }
];

// Mock Messages
export const messages: Message[] = [
  {
    id: "msg1",
    senderId: "user1",
    content: "I can offer a better rate if we settle by tomorrow.",
    timestamp: new Date("2025-04-16T10:30:00"),
    dealId: "deal1",
    isRead: true
  },
  {
    id: "msg2",
    senderId: "user3",
    content: "That works for me. Can you send the payment details?",
    timestamp: new Date("2025-04-16T10:35:00"),
    dealId: "deal1",
    isRead: true
  },
  {
    id: "msg3",
    senderId: "user1",
    content: "Yes, I'll send them via secure message. Let me confirm the final rate: CB+1.3%",
    timestamp: new Date("2025-04-16T10:40:00"),
    dealId: "deal1",
    isRead: false
  }
];
