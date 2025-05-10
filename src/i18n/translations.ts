
import { enUS } from "date-fns/locale";

// Import the JSON files using dynamic imports
import en_translations from "./en.json";
import ru_translations from "./ru.json";

export type Language = "en" | "ru";

export const defaultLocale: Language = "ru";

export const supportedLocales = {
  en: enUS,
};

// Translation keys type definition
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
    | "popularPairs" | "deals" | "createNewOrder" | "noRatesForSource" | "ratesUpdatedAutomatically"
    
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
    | "serviceFee" | "adjustment" | "finalExchangeRate" | "selectTradingPair" | "selectOrderType"
    | "minAmount" | "rateSource" | "selectRateSource" | "rateType" | "dynamic" | "fixed"
    | "customRate" | "rateAdjustment" | "currentRate" | "rubNonCash" | "rubCash" | "tokenized";

// Define translations object with imported JSON
export const translations = {
  en: en_translations,
  ru: ru_translations
};

// Update translation resources with the correct format for i18next if needed
export const translationResources = {
  en: {
    translation: en_translations
  },
  ru: {
    translation: ru_translations
  }
};
