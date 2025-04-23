
export const translations = {
  en: {
    // Auth
    login: "Login",
    register: "Register",
    logout: "Logout",
    profile: "Profile",
    settings: "Settings",
    connectTelegram: "Connect Telegram",
    
    // Dashboard
    welcome: "Welcome",
    tradeVolume: "Total Trading Volume",
    last30Days: "Last 30 days",
    activeOrders: "Active Orders",
    acrossMarkets: "Across all markets",
    avgSettlement: "Average Settlement",
    orderToCompletion: "Order to completion",
    activeTraders: "Active Traders",
    thisWeek: "This week",
    createNewOrder: "Create New Order",
    activeMarketOrders: "Active Market Orders",
    viewAllOrders: "View all orders",
    allPairs: "All Pairs",
    noActiveOrders: "No active orders found for this category.",
    
    // Create Order
    orderDetails: "Order Details",
    enterOrderDetails: "Enter the details of your OTC order.",
    orderType: "Order Type",
    buy: "Buy",
    sell: "Sell",
    tradingPair: "Trading Pair",
    selectTradingPair: "Select Trading Pair",
    amount: "Amount (USD equivalent)",
    rate: "Rate",
    ratePlaceholder: "e.g., CB+1.5%, Market Price, etc.",
    expiryDate: "Expiry Date",
    paymentPurpose: "Payment Purpose",
    purposePlaceholder: "e.g., Import payment, Export revenue, etc.",
    notes: "Additional Notes",
    notesPlaceholder: "Any additional details or requirements for this order",
    cancel: "Cancel",
    creating: "Creating...",
    create: "Create Order",
    minOrderSize: "Minimum order size",
    minOrderDesc: "OTC Desk requires a minimum order size of $500,000 USD equivalent.",
    
    // Success messages
    orderCreated: "Order Created Successfully",
    orderCreatedDesc: "Your order has been submitted to the OTC Desk and is now visible to potential counterparties.",
    createAnother: "Create Another Order",
    
    // Search
    search: "Search orders, pairs, or commands...",
    noResults: "No results found.",
    quickNav: "Quick Navigation",
    dashboard: "Dashboard",
    deals: "Deals & Messages",
    orders: "All Orders",
  },
  ru: {
    // Auth
    login: "Войти",
    register: "Регистрация",
    logout: "Выйти",
    profile: "Профиль",
    settings: "Настройки",
    connectTelegram: "Подключить Telegram",
    
    // Dashboard
    welcome: "Добро пожаловать",
    tradeVolume: "Общий объем торгов",
    last30Days: "За 30 дней",
    activeOrders: "Активные ордера",
    acrossMarkets: "По всем рынкам",
    avgSettlement: "Среднее время расчета",
    orderToCompletion: "От ордера до завершения",
    activeTraders: "Активные трейдеры",
    thisWeek: "На этой неделе",
    createNewOrder: "Создать новый ордер",
    activeMarketOrders: "Активные рыночные ордера",
    viewAllOrders: "Посмотреть все ордера",
    allPairs: "Все пары",
    noActiveOrders: "Нет активных ордеров в этой категории.",
    
    // Create Order
    orderDetails: "Детали ордера",
    enterOrderDetails: "Введите детали вашего внебиржевого ордера.",
    orderType: "Тип ордера",
    buy: "Купить",
    sell: "Продать",
    tradingPair: "Торговая пара",
    selectTradingPair: "Выберите торговую пару",
    amount: "Сумма (эквивалент USD)",
    rate: "Курс",
    ratePlaceholder: "например, ЦБ+1.5%, Рыночная цена и т.д.",
    expiryDate: "Дата истечения",
    paymentPurpose: "Цель платежа",
    purposePlaceholder: "например, Оплата импорта, Экспортная выручка и т.д.",
    notes: "Дополнительные примечания",
    notesPlaceholder: "Любые дополнительные детали или требования к ордеру",
    cancel: "Отмена",
    creating: "Создание...",
    create: "Создать ордер",
    minOrderSize: "Минимальный размер ордера",
    minOrderDesc: "OTC Desk требует минимальный размер ордера эквивалентный $500,000 USD.",
    
    // Success messages
    orderCreated: "Ордер успешно создан",
    orderCreatedDesc: "Ваш ордер отправлен на OTC Desk и теперь виден потенциальным контрагентам.",
    createAnother: "Создать другой ордер",
    
    // Search
    search: "Поиск ордеров, пар или команд...",
    noResults: "Результаты не найдены.",
    quickNav: "Быстрая навигация",
    dashboard: "Дашборд",
    deals: "Сделки и сообщения",
    orders: "Все ордера",
  }
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
