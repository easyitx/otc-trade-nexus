
export type Language = 'en' | 'ru';

// Create a union type of all available translation keys
export type TranslationKey = 
  // Order creation keys
  | 'createNewOrder' | 'orderType' | 'buy' | 'sell' | 'amount' | 'currency'
  | 'rateType' | 'dynamic' | 'fixed' | 'rateSource' | 'customRate' | 'rateAdjustment'
  | 'expiryDate' | 'purpose' | 'notes' | 'country' | 'city' | 'submit'
  | 'fillRequiredFields' | 'otcMinimumReq' | 'orderSuccess' | 'backToOrders'
  | 'orderSummary' | 'youPay' | 'youReceive' | 'calculationDetails' | 'baseExchangeRate'
  | 'adjustment' | 'serviceFee' | 'total' | 'finalExchangeRate' | 'receive' | 'fallbackRate'
  // UI Components
  | 'searchPlaceholder' | 'noResults' | 'tradingPairs' | 'quickNav' | 'deals'
  | 'popularPairs' | 'currencyRates' | 'loggedOut' | 'loggedOutSuccess'
  | 'exchangeRates' | 'ratesUpdatedAutomatically'
  // Dashboard
  | 'welcome' | 'tradeVolume' | 'last30Days' | 'activeOrders' | 'acrossMarkets'
  | 'activeTraders' | 'thisWeek'
  // Error pages
  | 'error404' | 'oopsNotFound' | 'returnHome'
  // Profile
  | 'personalInfo' | 'fullName' | 'notSet' | 'memberSince' | 'notAvailable'
  | 'notConnected' | 'editProfile'
  // Trade functionality
  | 'tradingPair' | 'selectTradingPair' | 'minimumOrder' | 'rate' | 'rateSource'
  | 'dynamicRate' | 'fixedRate' | 'selectSource' | 'adjustment' | 'finalRate' | 'in';
