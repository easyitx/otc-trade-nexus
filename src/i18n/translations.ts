
export type Language = 'en' | 'ru';

export type TranslationKey = 
    | 'loading'
    | 'error'
    | 'success'
    | 'submit'
    | 'cancel'
    | 'edit'
    | 'delete'
    | 'save'
    | 'saveChanges'
    | 'create'
    | 'update'
    | 'view'
    | 'search'
    | 'filter'
    | 'sort'
    | 'clear'
    | 'close'
    | 'confirm'
    | 'yes'
    | 'no'
    | 'back'
    | 'next'
    | 'previous'
    | 'settings'
    | 'profile'
    | 'logout'
    | 'login'
    | 'register'
    | 'forgotPassword'
    | 'resetPassword'
    | 'changePassword'
    | 'name'
    | 'email'
    | 'password'
    | 'confirmPassword'
    | 'phone'
    | 'address'
    | 'city'
    | 'country'
    | 'zipCode'
    | 'company'
    | 'role'
    | 'date'
    | 'time'
    | 'amount'
    | 'status'
    | 'type'
    | 'description'
    | 'title'
    | 'price'
    | 'quantity'
    | 'total'
    | 'subtotal'
    | 'tax'
    | 'discount'
    | 'shipping'
    | 'payment'
    | 'order'
    | 'orders'
    | 'product'
    | 'products'
    | 'customer'
    | 'customers'
    | 'supplier'
    | 'suppliers'
    | 'employee'
    | 'employees'
    | 'dashboard'
    | 'reports'
    | 'analytics'
    | 'sales'
    | 'purchases'
    | 'inventory'
    | 'accounting'
    | 'finance'
    | 'marketing'
    | 'hr'
    | 'admin'
    | 'user'
    | 'users'
    | 'permission'
    | 'permissions'
    | 'notification'
    | 'notifications'
    | 'message'
    | 'messages'
    | 'chat'
    | 'conversations'
    | 'calendar'
    | 'events'
    | 'tasks'
    | 'projects'
    | 'invoices'
    | 'quotes'
    | 'expenses'
    | 'income'
    | 'balance'
    | 'transactions'
    | 'accounts'
    | 'budget'
    | 'charts'
    | 'statistics'
    | 'createNewOrder'
    | 'buy'
    | 'sell'
    | 'receive'
    | 'otcMinimumReq'
    | 'fillRequiredFields'
    | 'activeRate'
    | 'autoRate'
    | 'manualRate'
    | 'useManualRate'
    | 'sourceUpdated'
    | 'lastUpdated'
    | 'currency'
    | 'rates'
    | 'selectCurrencyPair'
    | 'noRatesAvailable'
    | 'searchPlaceholder'
    | 'noResults'
    | 'tradingPairs'
    | 'quickNav'
    | 'deals'
    | 'popularPairs'
    | 'currencyRates'
    | 'loggedOut'
    | 'loggedOutSuccess'
    | 'exchangeRates'
    | 'ratesUpdatedAutomatically'
    | 'welcome'
    | 'tradeVolume'
    | 'last30Days'
    | 'activeOrders'
    | 'acrossMarkets'
    | 'activeTraders'
    | 'thisWeek'
    | 'error404'
    | 'oopsNotFound'
    | 'returnHome'
    | 'personalInfo'
    | 'fullName'
    | 'notSet'
    | 'memberSince'
    | 'notAvailable'
    | 'notConnected'
    | 'editProfile'
    // Order creation specific translations
    | 'basicDetails'
    | 'additionalDetails'
    | 'enterOrderDetails'
    | 'paymentDetails'
    | 'continue'
    | 'calculateSummary'
    | 'creatingOrder'
    | 'createOrder'
    | 'minOrderSize'
    | 'selectWhenExpires'
    | 'geography'
    | 'selectCountry'
    | 'selectCity'
    | 'paymentPurpose'
    | 'purposeExample'
    | 'additionalNotes'
    | 'notesPlaceholder'
    | 'orderSummary'
    | 'youPay'
    | 'youReceive'
    | 'exchangeRate'
    | 'expiryDate'
    | 'orderType';

type TranslationType = Record<TranslationKey, string>;

export const translations: Record<Language, TranslationType> = {
  en: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    submit: "Submit",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    saveChanges: "Save Changes",
    create: "Create",
    update: "Update",
    view: "View",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    clear: "Clear",
    close: "Close",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    back: "Back",
    next: "Next",
    previous: "Previous",
    settings: "Settings",
    profile: "Profile",
    logout: "Logout",
    login: "Login",
    register: "Register",
    forgotPassword: "Forgot Password",
    resetPassword: "Reset Password",
    changePassword: "Change Password",
    name: "Name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    phone: "Phone",
    address: "Address",
    city: "City",
    country: "Country",
    zipCode: "Zip Code",
    company: "Company",
    role: "Role",
    date: "Date",
    time: "Time",
    amount: "Amount",
    status: "Status",
    type: "Type",
    description: "Description",
    title: "Title",
    price: "Price",
    quantity: "Quantity",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Tax",
    discount: "Discount",
    shipping: "Shipping",
    payment: "Payment",
    order: "Order",
    orders: "Orders",
    product: "Product",
    products: "Products",
    customer: "Customer",
    customers: "Customers",
    supplier: "Supplier",
    suppliers: "Suppliers",
    employee: "Employee",
    employees: "Employees",
    dashboard: "Dashboard",
    reports: "Reports",
    analytics: "Analytics",
    sales: "Sales",
    purchases: "Purchases",
    inventory: "Inventory",
    accounting: "Accounting",
    finance: "Finance",
    marketing: "Marketing",
    hr: "HR",
    admin: "Admin",
    user: "User",
    users: "Users",
    permission: "Permission",
    permissions: "Permissions",
    notification: "Notification",
    notifications: "Notifications",
    message: "Message",
    messages: "Messages",
    chat: "Chat",
    conversations: "Conversations",
    calendar: "Calendar",
    events: "Events",
    tasks: "Tasks",
    projects: "Projects",
    invoices: "Invoices",
    quotes: "Quotes",
    expenses: "Expenses",
    income: "Income",
    balance: "Balance",
    transactions: "Transactions",
    accounts: "Accounts",
    budget: "Budget",
    charts: "Charts",
    statistics: "Statistics",
    createNewOrder: "Create New Order",
    buy: "Buy",
    sell: "Sell",
    receive: "Receive",
    otcMinimumReq: "OTC minimum requirement is 500,000 USD",
    fillRequiredFields: "Please fill in all required fields",
    activeRate: "Active Rate",
    autoRate: "Auto Rate",
    manualRate: "Manual Rate",
    useManualRate: "Use Manual Rate",
    sourceUpdated: "Source Updated",
    lastUpdated: "Last Updated",
    currency: "Currency",
    rates: "Rates",
    selectCurrencyPair: "Select Currency Pair",
    noRatesAvailable: "No rates available for this currency pair",
    // Add new translations for English
    searchPlaceholder: "Search for currency pairs, orders, or help...",
    noResults: "No results found",
    tradingPairs: "Trading Pairs",
    quickNav: "Quick Navigation",
    deals: "Deals",
    popularPairs: "Popular Pairs",
    currencyRates: "Currency Rates",
    loggedOut: "Logged Out",
    loggedOutSuccess: "You have been successfully logged out",
    exchangeRates: "Exchange Rates",
    ratesUpdatedAutomatically: "Rates are updated automatically",
    welcome: "Welcome",
    tradeVolume: "Trade Volume",
    last30Days: "Last 30 days",
    activeOrders: "Active Orders",
    acrossMarkets: "Across all markets",
    activeTraders: "Active Traders",
    thisWeek: "This week",
    error404: "404 Error",
    oopsNotFound: "Oops! The page you're looking for doesn't exist.",
    returnHome: "Return to Home",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    notSet: "Not set",
    memberSince: "Member Since",
    notAvailable: "Not available",
    notConnected: "Not connected",
    editProfile: "Edit Profile",
    // Order creation specific translations
    basicDetails: "Basic Details",
    additionalDetails: "Additional Details",
    enterOrderDetails: "Enter order details and amount",
    paymentDetails: "Payment and location details",
    continue: "Continue",
    calculateSummary: "Calculate Summary",
    creatingOrder: "Creating Order...",
    createOrder: "Create Order",
    minOrderSize: "Minimum Order Size",
    selectWhenExpires: "Select when this order expires",
    geography: "Geography",
    selectCountry: "Select country",
    selectCity: "Select city",
    paymentPurpose: "Payment Purpose",
    purposeExample: "e.g. Payment for services",
    additionalNotes: "Additional Notes",
    notesPlaceholder: "Add any additional notes or instructions for this order",
    orderSummary: "Order Summary",
    youPay: "You Pay",
    youReceive: "You Receive",
    exchangeRate: "Exchange Rate",
    expiryDate: "Expiry Date",
    orderType: "Order Type"
  },
  ru: {
    loading: "Загрузка...",
    error: "Ошибка",
    success: "Успешно",
    submit: "Отправить",
    cancel: "Отменить",
    edit: "Редактировать",
    delete: "Удалить",
    save: "Сохранить",
    saveChanges: "Сохранить изменения",
    create: "Создать",
    update: "Обновить",
    view: "Просмотреть",
    search: "Поиск",
    filter: "Фильтр",
    sort: "Сортировать",
    clear: "Очистить",
    close: "Закрыть",
    confirm: "Подтвердить",
    yes: "Да",
    no: "Нет",
    back: "Назад",
    next: "Далее",
    previous: "Предыдущий",
    settings: "Настройки",
    profile: "Профиль",
    logout: "Выйти",
    login: "Войти",
    register: "Регистрация",
    forgotPassword: "Забыли пароль",
    resetPassword: "Сброс пароля",
    changePassword: "Изменить пароль",
    name: "Имя",
    email: "Эл. почта",
    password: "Пароль",
    confirmPassword: "Подтвердите пароль",
    phone: "Телефон",
    address: "Адрес",
    city: "Город",
    country: "Страна",
    zipCode: "Почтовый индекс",
    company: "Компания",
    role: "Роль",
    date: "Дата",
    time: "Время",
    amount: "Сумма",
    status: "Статус",
    type: "Тип",
    description: "Описание",
    title: "Заголовок",
    price: "Цена",
    quantity: "Количество",
    total: "Итого",
    subtotal: "Подитог",
    tax: "Налог",
    discount: "Скидка",
    shipping: "Доставка",
    payment: "Оплата",
    order: "Заказ",
    orders: "Заказы",
    product: "Товар",
    products: "Товары",
    customer: "Клиент",
    customers: "Клиенты",
    supplier: "Поставщик",
    suppliers: "Поставщики",
    employee: "Сотрудник",
    employees: "Сотрудники",
    dashboard: "Панель управления",
    reports: "Отчеты",
    analytics: "Аналитика",
    sales: "Продажи",
    purchases: "Закупки",
    inventory: "Запасы",
    accounting: "Бухгалтерия",
    finance: "Финансы",
    marketing: "Маркетинг",
    hr: "HR",
    admin: "Администратор",
    user: "Пользователь",
    users: "Пользователи",
    permission: "Разрешение",
    permissions: "Разрешения",
    notification: "Уведомление",
    notifications: "Уведомления",
    message: "Сообщение",
    messages: "Сообщения",
    chat: "Чат",
    conversations: "Беседы",
    calendar: "Календарь",
    events: "События",
    tasks: "Задачи",
    projects: "Проекты",
    invoices: "Счета",
    quotes: "Предложения",
    expenses: "Расходы",
    income: "Доходы",
    balance: "Баланс",
    transactions: "Транзакции",
    accounts: "Аккаунты",
    budget: "Бюджет",
    charts: "Графики",
    statistics: "Статистика",
    createNewOrder: "Создать новую заявку",
    buy: "Купить",
    sell: "Продать",
    receive: "Получить",
    otcMinimumReq: "Минимальная сумма для OTC сделки составляет 500 000 USD",
    fillRequiredFields: "Пожалуйста, заполните все обязательные поля",
    activeRate: "Активный курс",
    autoRate: "Автоматический курс",
    manualRate: "Ручной курс",
    useManualRate: "Использовать ручной курс",
    sourceUpdated: "Источник обновлен",
    lastUpdated: "Последнее обновление",
    currency: "Валюта",
    rates: "Курсы",
    selectCurrencyPair: "Выберите валютную пару",
    noRatesAvailable: "Нет доступных курсов для этой валютной пары",
    // Add new translations for Russian
    searchPlaceholder: "Поиск по валютным парам, заявкам или справке...",
    noResults: "Результаты не найдены",
    tradingPairs: "Торговые пары",
    quickNav: "Быстрая навигация",
    deals: "Сделки",
    popularPairs: "Популярные пары",
    currencyRates: "Курсы валют",
    loggedOut: "Выход выполнен",
    loggedOutSuccess: "Вы успешно вышли из системы",
    exchangeRates: "Обменные курсы",
    ratesUpdatedAutomatically: "Курсы обновляются автоматически",
    welcome: "Добро пожаловать",
    tradeVolume: "Объем торгов",
    last30Days: "За последние 30 дней",
    activeOrders: "Активные заявки",
    acrossMarkets: "По всем рынкам",
    activeTraders: "Активные трейдеры",
    thisWeek: "На этой неделе",
    error404: "Ошибка 404",
    oopsNotFound: "Упс! Страница, которую вы ищете, не существует.",
    returnHome: "Вернуться на главную",
    personalInfo: "Личная информация",
    fullName: "Полное имя",
    notSet: "Не указано",
    memberSince: "Участник с",
    notAvailable: "Недоступно",
    notConnected: "Не подключено",
    editProfile: "Редактировать профиль",
    // Order creation specific translations
    basicDetails: "Основные детали",
    additionalDetails: "Дополнительные детали",
    enterOrderDetails: "Введите детали заявки и сумму",
    paymentDetails: "Детали оплаты и местоположения",
    continue: "Продолжить",
    calculateSummary: "Рассчитать итог",
    creatingOrder: "Создание заявки...",
    createOrder: "Создать заявку",
    minOrderSize: "Минимальный размер заявки",
    selectWhenExpires: "Выберите, когда истекает эта заявка",
    geography: "География",
    selectCountry: "Выберите страну",
    selectCity: "Выберите город",
    paymentPurpose: "Назначение платежа",
    purposeExample: "например, Оплата за услуги",
    additionalNotes: "Дополнительные примечания",
    notesPlaceholder: "Добавьте любые дополнительные примечания или инструкции для этой заявки",
    orderSummary: "Сводка заявки",
    youPay: "Вы платите",
    youReceive: "Вы получаете",
    exchangeRate: "Обменный курс",
    expiryDate: "Срок действия",
    orderType: "Тип заявки"
  }
};
