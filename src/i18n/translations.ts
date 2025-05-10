
export type Language = "en" | "ru";

export const defaultLocale: Language = "ru";

export const supportedLocales = {
  en: enUS,
};

export const translationResources = {
  en: {
    translation: require("./en.json"),
  },
  ru: {
    translation: require("./ru.json"),
  },
};

export type TranslationKey =
    // Common UI
    | "appName" | "back" | "login" | "register" | "logout" | "welcome" | "email" | "password"
    | "name" | "confirmPassword" | "alreadyHaveAccount" | "dontHaveAccount" | "dashboard"
    | "profile" | "settings" | "orders" | "leaderboard" | "chat" | "submitOrder"
    | "explanation" | "myProfile" | "updateProfile" | "updatePassword" | "fullName" | "company"
    | "telegram" | "save" | "saveChanges" | "cancel" | "updateSuccessful" | "updateFailed"
    | "passwordUpdated" | "passwordUpdateFailed" | "currentPassword" | "newPassword"
    | "confirmNewPassword" | "error" | "errorOccurred" | "success" | "successful" | "hi"
    | "viewProfile" | "home" | "dark" | "light" | "language" | "english" | "russian" 
    | "passwordsDoNotMatch" | "fieldRequired" | "invalidEmail" | "copy" | "copied" | "copyToClipboard"
    | "error404" | "oopsNotFound" | "returnHome" | "status" | "total" | "user" | "loggedOut" | "loggedOutSuccess"

    // Layout
    | "exchangeRates" | "search" | "searchPlaceholder" | "noResults" | "tradingPairs" | "quickNav"
    | "popularPairs" | "deals" | "createNewOrder"
    
    // Profile
    | "personalInfo" | "memberSince" | "notSet" | "notAvailable" | "notConnected" | "editProfile"
    
    // Dashboard
    | "tradeVolume" | "last30Days" | "acrossMarkets" | "activeTraders" | "thisWeek"

    // Notification settings
    | "notificationChannels" | "emailNotifications" | "webNotifications" | "telegramNotifications"
    | "orderCreated" | "orderStatusChanged" | "newMessage" | "newDeal" | "newProposal" | "dealCompleted"
    | "notificationSettings" | "saveNotifications"

    // 2FA Settings
    | "twoFactorAuthentication" | "enable2FA" | "disable2FA" | "scan2FACode"
    | "enter2FACode" | "verify" | "2faSetupInstructions1" | "2faSetupInstructions2" | "2faBackupCodes"
    
    // Orders
    | "submit" | "buy" | "sell" | "amount" | "currency" | "rate" | "notes" | "purpose"
    | "bankTransfer" | "cash" | "crypto" | "other" | "expires" | "expiry" | "expiryDate"
    | "step1" | "step2" | "step3" | "next" | "previous" | "additionalDetails" | "timestamp"
    | "myOrders" | "activeOrders" | "completedOrders" | "allOrders" | "createdOn" | "expireDate"
    | "action" | "view" | "edit" | "delete" | "orderDetails" | "orderExpired" | "orderCompleted"
    | "startedOn" | "proposal" | "orderExpiry" | "transactionDetails" | "discussing"
    | "agreed" | "inProgress" | "confirmMoney" | "confirmCrypto" | "completed"
    | "submitProposal" | "submitDeal" | "viewDetails" | "orderCreatedSuccess"
    | "backToDashboard" | "writeMessage" | "send" | "uploadFile" | "dropFileHere"
    | "uploadOrDrag" | "filesSupportedUpTo" | "youHaventPlacedOrdersYet" | "loadingOrders" 
    | "noDealSelected" | "noDealChat" | "selectDealToChat" | "noChatsAvailable" | "daysAgo" 
    | "hoursAgo" | "minutesAgo" | "justNow" | "loadingMessages" | "noMessages" | "details"
    
    // Order statistics
    | "orderStatistics" | "buyOrders" | "sellOrders" | "totalVolume" | "ordersByStatus" | "active"  
    | "cancelled" | "expired" | "recentOrders" | "noRecentOrders" | "seeAllOrders" 
    | "archiving" | "ordersByType" | "ordersTodayVsYesterday" | "today" | "yesterday"
    
    // Order form
    | "orderType" | "calculationTitle" | "youPay" | "youReceive" | "exchangeRate" | "totalFee"
    | "continue" | "calculateSummary" | "orderSummary" | "calculate"
    | "serviceFeeAmount" | "adjustmentAmount" | "baseExchangeRate" | "calculationDetails"
    | "paymentDetails" | "basicDetails" | "fillRequiredFields" | "otcMinimumReq" | "receive"
    
    // Currency rates management translations
    | "accessDenied" | "noPermission" | "restrictedArea" | "onlyAdminManager" | "loading"
    | "failedToLoadRates" | "dataLoadingError" | "rateFetchProblem" | "reloadPage"
    | "currencyExchangeRates" | "currencyRatesManagement" | "manageRatesDescription"
    | "refreshExternalRates" | "createNewRate" | "createNewCurrencyRate" | "addNewCurrencyPairDescription"
    | "baseCurrency" | "quoteCurrency" | "selectCurrency" | "create" | "searchCurrencyPairs"
    | "all" | "major" | "exotic" | "noCurrencyRates" | "activeRate" | "autoRate"
    | "manualRate" | "useManualRate" | "lastUpdated" | "source" | "noSource"
    | "selectSource" | "optional" | "pairExists" | "pairExistsForSource" | "sourceUpdated" 
    | "allSources" | "noCurrencyRatesForSource" | "ratesUpdatedAutomatically";

// Import needed for date-fns locale
import { enUS } from "date-fns/locale";

// Define the English translations
const en = {
    appName: "OTC Platform",
    back: "Back",
    login: "Login",
    register: "Register",
    logout: "Logout",
    welcome: "Welcome",
    email: "Email",
    password: "Password",
    name: "Name",
    confirmPassword: "Confirm Password",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    dashboard: "Dashboard",
    profile: "Profile",
    settings: "Settings",
    orders: "Orders",
    leaderboard: "Leaderboard",
    chat: "Chat",
    submitOrder: "Submit Order",
    explanation: "Explanation",
    myProfile: "My Profile",
    updateProfile: "Update Profile",
    updatePassword: "Update Password",
    fullName: "Full Name",
    company: "Company",
    telegram: "Telegram",
    save: "Save",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    updateSuccessful: "Update Successful",
    updateFailed: "Update Failed",
    passwordUpdated: "Password Updated",
    passwordUpdateFailed: "Password Update Failed",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    error: "Error",
    errorOccurred: "An error occurred",
    success: "Success",
    successful: "Successful",
    hi: "Hi",
    viewProfile: "View Profile",
    home: "Home",
    dark: "Dark",
    light: "Light",
    language: "Language",
    english: "English",
    russian: "Russian",
    passwordsDoNotMatch: "Passwords do not match",
    fieldRequired: "This field is required",
    invalidEmail: "Invalid email",
    copy: "Copy",
    copied: "Copied!",
    copyToClipboard: "Copy to clipboard",
    error404: "Error 404",
    oopsNotFound: "Oops. Looks like you got lost.",
    returnHome: "Return Home",
    status: "Status",
    total: "Total",
    user: "User",
    loggedOut: "Logged Out",
    loggedOutSuccess: "You have been successfully logged out",

    // Layout
    exchangeRates: "Exchange Rates",
    search: "Search",
    searchPlaceholder: "Search for orders, pairs...",
    noResults: "No results found",
    tradingPairs: "Trading Pairs",
    quickNav: "Quick Navigation",
    popularPairs: "Popular Pairs",
    deals: "Deals",
    createNewOrder: "Create Order",

    // Profile
    personalInfo: "Personal Information",
    memberSince: "Member Since",
    notSet: "Not set",
    notAvailable: "Not available",
    notConnected: "Not connected",
    editProfile: "Edit Profile",

    // Dashboard
    tradeVolume: "Trade Volume",
    last30Days: "Last 30 days",
    acrossMarkets: "Across Markets",
    activeTraders: "Active Traders",
    thisWeek: "This Week",

    // Notification settings
    notificationChannels: "Notification Channels",
    emailNotifications: "Email Notifications",
    webNotifications: "Web Notifications",
    telegramNotifications: "Telegram Notifications",
    orderCreated: "Order Created",
    orderStatusChanged: "Order Status Changed",
    newMessage: "New Message",
    newDeal: "New Deal",
    newProposal: "New Proposal",
    dealCompleted: "Deal Completed",
    notificationSettings: "Notification Settings",
    saveNotifications: "Save Notifications",

    // 2FA Settings
    twoFactorAuthentication: "Two-Factor Authentication",
    enable2FA: "Enable 2FA",
    disable2FA: "Disable 2FA",
    scan2FACode: "Scan this code with your authenticator app:",
    enter2FACode: "Enter the code from your authenticator app:",
    verify: "Verify",
    "2faSetupInstructions1": "1. Download and install an authenticator app like Google Authenticator or Authy on your smartphone.",
    "2faSetupInstructions2": "2. Scan the QR code below with the authenticator app or manually enter the provided key.",
    "2faBackupCodes": "Backup Codes",

    // Orders
    submit: "Submit",
    buy: "Buy",
    sell: "Sell",
    amount: "Amount",
    currency: "Currency",
    rate: "Rate",
    notes: "Notes",
    purpose: "Purpose",
    bankTransfer: "Bank Transfer",
    cash: "Cash",
    crypto: "Crypto",
    other: "Other",
    expires: "Expires",
    expiry: "Expiry",
    expiryDate: "Expiry Date",
    step1: "Step 1",
    step2: "Step 2",
    step3: "Step 3",
    next: "Next",
    previous: "Previous",
    additionalDetails: "Additional Details",
    timestamp: "Timestamp",
    myOrders: "My Orders",
    activeOrders: "Active Orders",
    completedOrders: "Completed Orders",
    allOrders: "All Orders",
    createdOn: "Created On",
    expireDate: "Expire Date",
    action: "Action",
    view: "View",
    edit: "Edit",
    delete: "Delete",
    orderDetails: "Order Details",
    orderExpired: "Order Expired",
    orderCompleted: "Order Completed",
    startedOn: "Started On",
    proposal: "Proposal",
    orderExpiry: "Order Expiry",
    transactionDetails: "Transaction Details",
    discussing: "Discussing",
    agreed: "Agreed",
    inProgress: "In Progress",
    confirmMoney: "Confirm Money",
    confirmCrypto: "Confirm Crypto",
    completed: "Completed",
    submitProposal: "Submit Proposal",
    submitDeal: "Submit Deal",
    viewDetails: "View Details",
    orderCreatedSuccess: "Order Created Successfully!",
    backToDashboard: "Back to Dashboard",
    writeMessage: "Write a message...",
    send: "Send",
    uploadFile: "Upload File",
    dropFileHere: "Drop file here",
    uploadOrDrag: "Upload or drag",
    filesSupportedUpTo: "Files supported up to",
    youHaventPlacedOrdersYet: "You haven't placed any orders yet.",
    loadingOrders: "Loading orders...",
    noDealSelected: "No deal selected",
    noDealChat: "No deal chat",
    selectDealToChat: "Select a deal to start chatting",
    noChatsAvailable: "No chats available",
    daysAgo: "days ago",
    hoursAgo: "hours ago",
    minutesAgo: "minutes ago",
    justNow: "Just now",
    loadingMessages: "Loading messages...",
    noMessages: "No messages",
    details: "Details",

    // Order statistics
    orderStatistics: "Order Statistics",
    buyOrders: "Buy Orders",
    sellOrders: "Sell Orders",
    totalVolume: "Total Volume",
    ordersByStatus: "Orders by Status",
    active: "Active",
    cancelled: "Cancelled",
    expired: "Expired",
    recentOrders: "Recent Orders",
    noRecentOrders: "No recent orders",
    seeAllOrders: "See All Orders",
    archiving: "Archiving",
    ordersByType: "Orders by Type",
    ordersTodayVsYesterday: "Orders Today vs Yesterday",
    today: "Today",
    yesterday: "Yesterday",

    // Order form
    orderType: "Order Type",
    calculationTitle: "Calculation",
    youPay: "You Pay",
    youReceive: "You Receive",
    exchangeRate: "Exchange Rate",
    totalFee: "Total Fee",
    continue: "Continue",
    calculateSummary: "Calculate Summary",
    orderSummary: "Order Summary",
    calculate: "Calculate",
    serviceFeeAmount: "Service Fee Amount",
    adjustmentAmount: "Adjustment Amount",
    baseExchangeRate: "Base Exchange Rate",
    calculationDetails: "Calculation Details",
    paymentDetails: "Payment Details",
    basicDetails: "Basic Details",
    fillRequiredFields: "Please fill in all required fields",
    otcMinimumReq: "Minimum order amount is 500,000 USD",
    receive: "receive",

    // Currency rates management translations
    accessDenied: "Access Denied",
    noPermission: "You don't have permission to access this page.",
    restrictedArea: "Restricted Area",
    onlyAdminManager: "This page is only accessible to administrators and managers.",
    loading: "Loading",
    failedToLoadRates: "Failed to load currency rates",
    dataLoadingError: "Data Loading Error",
    rateFetchProblem: "There was a problem fetching the currency rates. Please try again later.",
    reloadPage: "Reload Page",
    currencyExchangeRates: "Currency Exchange Rates",
    currencyRatesManagement: "Currency Rates Management",
    manageRatesDescription: "Create and manage currency exchange rates for all currency pairs.",
    refreshExternalRates: "Refresh External Rates",
    createNewRate: "Create New Rate",
    createNewCurrencyRate: "Create New Currency Rate",
    addNewCurrencyPairDescription: "Add a new currency pair and set the exchange rate.",
    baseCurrency: "Base Currency",
    quoteCurrency: "Quote Currency",
    selectCurrency: "Select Currency",
    create: "Create",
    searchCurrencyPairs: "Search currency pairs",
    all: "All",
    major: "Major",
    exotic: "Exotic",
    noCurrencyRates: "No currency rates found.",
    activeRate: "Active Rate",
    autoRate: "Auto Rate",
    manualRate: "Manual Rate",
    useManualRate: "Use Manual Rate",
    lastUpdated: "Last Updated",
    source: "Source",
    noSource: "No Source",
    selectSource: "Select Source",
    optional: "Optional",
    pairExists: "Currency pair {base}/{quote} already exists.",
    pairExistsForSource: "Currency pair {base}/{quote} for source {source} already exists.",
    sourceUpdated: "Source Updated",
    allSources: "All Sources",
    noCurrencyRatesForSource: "No currency rates found for the selected source.",
    ratesUpdatedAutomatically: "Rates are updated automatically from external sources"
};

// Define the Russian translations
const ru = {
    appName: "OTC Платформа",
    back: "Назад",
    login: "Войти",
    register: "Зарегистрироваться",
    logout: "Выйти",
    welcome: "Добро пожаловать",
    email: "Электронная почта",
    password: "Пароль",
    name: "Имя",
    confirmPassword: "Подтвердить пароль",
    alreadyHaveAccount: "Уже есть аккаунт?",
    dontHaveAccount: "Нет аккаунта?",
    dashboard: "Панель управления",
    profile: "Профиль",
    settings: "Настройки",
    orders: "Заказы",
    leaderboard: "Таблица лидеров",
    chat: "Чат",
    submitOrder: "Разместить ордер",
    explanation: "Объяснение",
    myProfile: "Мой профиль",
    updateProfile: "Обновить профиль",
    updatePassword: "Обновить пароль",
    fullName: "Полное имя",
    company: "Компания",
    telegram: "Телеграм",
    save: "Сохранить",
    saveChanges: "Сохранить изменения",
    cancel: "Отменить",
    updateSuccessful: "Обновление успешно",
    updateFailed: "Ошибка обновления",
    passwordUpdated: "Пароль обновлен",
    passwordUpdateFailed: "Ошибка обновления пароля",
    currentPassword: "Текущий пароль",
    newPassword: "Новый пароль",
    confirmNewPassword: "Подтвердить новый пароль",
    error: "Ошибка",
    errorOccurred: "Произошла ошибка",
    success: "Успех",
    successful: "Успешно",
    hi: "Привет",
    viewProfile: "Просмотреть профиль",
    home: "Главная",
    dark: "Темная",
    light: "Светлая",
    language: "Язык",
    english: "Английский",
    russian: "Русский",
    passwordsDoNotMatch: "Пароли не совпадают",
    fieldRequired: "Это поле обязательно для заполнения",
    invalidEmail: "Неверный email",
    copy: "Копировать",
    copied: "Скопировано!",
    copyToClipboard: "Скопировать в буфер обмена",
    error404: "Ошибка 404",
    oopsNotFound: "Ой. Похоже, вы заблудились.",
    returnHome: "Вернуться домой",
    status: "Статус",
    total: "Итого",
    user: "Пользователь",
    loggedOut: "Вы вышли из системы",
    loggedOutSuccess: "Вы успешно вышли из системы",

    // Layout
    exchangeRates: "Курсы валют",
    search: "Поиск",
    searchPlaceholder: "Поиск ордеров, пар...",
    noResults: "Результаты не найдены",
    tradingPairs: "Торговые пары",
    quickNav: "Быстрая навигация",
    popularPairs: "Популярные пары",
    deals: "Сделки",
    createNewOrder: "Создать ордер",

    // Profile
    personalInfo: "Персональная информация",
    memberSince: "Зарегистрирован с",
    notSet: "Не указано",
    notAvailable: "Недоступно",
    notConnected: "Не подключено",
    editProfile: "Редактировать профиль",

    // Dashboard
    tradeVolume: "Объем торговли",
    last30Days: "Последние 30 дней",
    acrossMarkets: "По всем рынкам",
    activeTraders: "Активных трейдеров",
    thisWeek: "На этой неделе",

    // Notification settings
    notificationChannels: "Каналы уведомлений",
    emailNotifications: "Уведомления по электронной почте",
    webNotifications: "Веб-уведомления",
    telegramNotifications: "Уведомления в Telegram",
    orderCreated: "Ордер создан",
    orderStatusChanged: "Статус ордера изменен",
    newMessage: "Новое сообщение",
    newDeal: "Новая сделка",
    newProposal: "Новое предложение",
    dealCompleted: "Сделка завершена",
    notificationSettings: "Настройки уведомлений",
    saveNotifications: "Сохранить уведомления",

    // 2FA Settings
    twoFactorAuthentication: "Двухфакторная аутентификация",
    enable2FA: "Включить 2FA",
    disable2FA: "Выключить 2FA",
    scan2FACode: "Отсканируйте этот код с помощью приложения для аутентификации:",
    enter2FACode: "Введите код из приложения для аутентификации:",
    verify: "Подтвердить",
    "2faSetupInstructions1": "1. Загрузите и установите приложение для аутентификации, такое как Google Authenticator или Authy, на свой смартфон.",
    "2faSetupInstructions2": "2. Отсканируйте QR-код ниже с помощью приложения для аутентификации или вручную введите предоставленный ключ.",
    "2faBackupCodes": "Резервные коды",

    // Orders
    submit: "Разместить",
    buy: "Купить",
    sell: "Продать",
    amount: "Сумма",
    currency: "Валюта",
    rate: "Курс",
    notes: "Заметки",
    purpose: "Цель",
    bankTransfer: "Банковский перевод",
    cash: "Наличные",
    crypto: "Криптовалюта",
    other: "Другое",
    expires: "Истекает",
    expiry: "Срок действия",
    expiryDate: "Дата истечения",
    step1: "Шаг 1",
    step2: "Шаг 2",
    step3: "Шаг 3",
    next: "Далее",
    previous: "Предыдущий",
    additionalDetails: "Дополнительные детали",
    timestamp: "Временная метка",
    myOrders: "Мои заказы",
    activeOrders: "Активные заказы",
    completedOrders: "Завершенные заказы",
    allOrders: "Все заказы",
    createdOn: "Создан",
    expireDate: "Дата истечения",
    action: "Действие",
    view: "Просмотр",
    edit: "Изменить",
    delete: "Удалить",
    orderDetails: "Детали заказа",
    orderExpired: "Срок действия заказа истек",
    orderCompleted: "Заказ выполнен",
    startedOn: "Начался",
    proposal: "Предложение",
    orderExpiry: "Срок действия заказа",
    transactionDetails: "Детали транзакции",
    discussing: "Обсуждается",
    agreed: "Согласовано",
    inProgress: "В процессе",
    confirmMoney: "Подтвердить деньги",
    confirmCrypto: "Подтвердить криптовалюту",
    completed: "Завершен",
    submitProposal: "Отправить предложение",
    submitDeal: "Заключить сделку",
    viewDetails: "Посмотреть детали",
    orderCreatedSuccess: "Заказ успешно создан!",
    backToDashboard: "Вернуться на панель управления",
    writeMessage: "Написать сообщение...",
    send: "Отправить",
    uploadFile: "Загрузить файл",
    dropFileHere: "Перетащите файл сюда",
    uploadOrDrag: "Загрузить или перетащить",
    filesSupportedUpTo: "Поддерживаемые файлы до",
    youHaventPlacedOrdersYet: "Вы еще не разместили ни одного заказа.",
    loadingOrders: "Загрузка заказов...",
    noDealSelected: "Сделка не выбрана",
    noDealChat: "Нет чата по сделке",
    selectDealToChat: "Выберите сделку, чтобы начать общение",
    noChatsAvailable: "Нет доступных чатов",
    daysAgo: "дней назад",
    hoursAgo: "часов назад",
    minutesAgo: "минут назад",
    justNow: "Только что",
    loadingMessages: "Загрузка сообщений...",
    noMessages: "Нет сообщений",
    details: "Детали",

    // Order statistics
    orderStatistics: "Статистика заказов",
    buyOrders: "Заказы на покупку",
    sellOrders: "Заказы на продажу",
    totalVolume: "Общий объем",
    ordersByStatus: "Заказы по статусу",
    active: "Активные",
    cancelled: "Отмененные",
    expired: "Просроченные",
    recentOrders: "Недавние заказы",
    noRecentOrders: "Нет недавних заказов",
    seeAllOrders: "Посмотреть все заказы",
    archiving: "Архивирование",
    ordersByType: "Заказы по типу",
    ordersTodayVsYesterday: "Заказы сегодня vs вчера",
    today: "Сегодня",
    yesterday: "Вчера",

    // Order form
    orderType: "Тип ордера",
    calculationTitle: "Расчет",
    youPay: "Вы платите",
    youReceive: "Вы получаете",
    exchangeRate: "Курс обмена",
    totalFee: "Общая комиссия",
    continue: "Продолжить",
    calculateSummary: "Рассчитать сводку",
    orderSummary: "Сводка заказа",
    calculate: "Рассчитать",
    serviceFeeAmount: "Сумма комиссии сервиса",
    adjustmentAmount: "Сумма корректировки",
    baseExchangeRate: "Базовый курс обмена",
    calculationDetails: "Детали расчета",
    paymentDetails: "Детали платежа",
    basicDetails: "Основные детали",
    fillRequiredFields: "Пожалуйста, заполните все обязательные поля",
    otcMinimumReq: "Минимальная сумма ордера составляет 500,000 USD",
    receive: "получить",

    // Currency rates management translations
    accessDenied: "Доступ запрещен",
    noPermission: "У вас нет разрешения на доступ к этой странице.",
    restrictedArea: "Ограниченная зона",
    onlyAdminManager: "Эта страница доступна только администраторам и менеджерам.",
    loading: "Загрузка",
    failedToLoadRates: "Не удалось загрузить курсы валют",
    dataLoadingError: "Ошибка загрузки данных",
    rateFetchProblem: "Возникла проблема с получением курсов валют. Пожалуйста, попробуйте позже.",
    reloadPage: "Перезагрузить страницу",
    currencyExchangeRates: "Курсы обмена валют",
    currencyRatesManagement: "Управление валютными курсами",
    manageRatesDescription: "Создание и управление курсами обмена валют для всех валютных пар.",
    refreshExternalRates: "Обновить внешние курсы",
    createNewRate: "Создать новый курс",
    createNewCurrencyRate: "Создать новый обменный курс",
    addNewCurrencyPairDescription: "Добавьте новую валютную пару и установите обменный курс.",
    baseCurrency: "Базовая валюта",
    quoteCurrency: "Котируемая валюта",
    selectCurrency: "Выберите валюту",
    create: "Создать",
    searchCurrencyPairs: "Поиск валютных пар",
    all: "Все",
    major: "Основные",
    exotic: "Экзотические",
    noCurrencyRates: "Курсы валют не найдены.",
    activeRate: "Активный курс",
    autoRate: "Авто курс",
    manualRate: "Ручной курс",
    useManualRate: "Использовать ручной курс",
    lastUpdated: "Последнее обновление",
    source: "Источник",
    noSource: "Без источника",
    selectSource: "Выберите источник",
    optional: "Необязательно",
    pairExists: "Валютная пара {base}/{quote} уже существует.",
    pairExistsForSource: "Валютная пара {base}/{quote} для источника {source} уже существует.",
    sourceUpdated: "Источник обновлен",
    allSources: "Все источники",
    noCurrencyRatesForSource: "Курсы валют для выбранного источника не найдены.",
    ratesUpdatedAutomatically: "Курсы обновляются автоматически из внешних источников"
};

// Export translations object that combines all languages
export const translations = { en, ru };
