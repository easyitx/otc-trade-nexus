
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import OrderFormSteps from "./components/OrderFormSteps";
import OrderSuccess from "./components/OrderSuccess";
import { getDefaultExpiryDate, getCurrencySymbol } from "./utils/dateUtils";
import { tradePairs } from "@/data/mockData";
import {useCurrencyRates} from "@/hooks/useCurrencyRates.ts";

export default function OrderForm() {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  // Auto calculation flag
  const [autoCalculate, setAutoCalculate] = useState<boolean>(true);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Form state
  const [selectedPair, setSelectedPair] = useState<string>("");
  const [orderType, setOrderType] = useState<string>("BUY");
  const [amount, setAmount] = useState<string>("");
  const [amountCurrency, setAmountCurrency] = useState<string>("USD");
  const [rateType, setRateType] = useState<"dynamic" | "fixed">("dynamic");
  const [rateSource, setRateSource] = useState<string>("ЦБ");
  const [customRateValue, setCustomRateValue] = useState<string>("");
  const [rateAdjustment, setRateAdjustment] = useState<number>(0);
  const [serviceFee] = useState<number>(1); // Fixed 1% service fee
  const [expiryDate, setExpiryDate] = useState<Date>(getDefaultExpiryDate());
  const [purpose, setPurpose] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [selectedPairInfo, setSelectedPairInfo] = useState<any>(null);
  const [currentRates, setCurrentRates] = useState<Record<string, string>>({});

  const {
    rates,
    loading,
    error,
    currencyPair,
    availablePairs,
    availableSources,
    setCurrencyPair
  } = useCurrencyRates();

  useEffect(() => {
    if (!loading && availableSources) {
      const initialRates: Record<string, string> = {};

      availableSources.forEach(source => {
        initialRates[source.code] = rates?.[source.code]?.toFixed(2) || "0.00";
      });

      setCurrentRates(initialRates);
    }
  }, [loading, availableSources, rates]);
  
  // Calculation state
  const [calculationResult, setCalculationResult] = useState<{
    youPay: string;
    youReceive: string;
    baseRate: string;
    adjustedRate: string;
    finalRate: string;
    serviceFeeAmount: string;
    adjustmentAmount: string;
    adjustmentPercentage: string;
    totalAmount: string;
    fromCurrency: string;
    toCurrency: string;
  } | null>(null);
  
  const [showCalculation, setShowCalculation] = useState<boolean>(false);

  // Проверьте, включает ли выбранная пара наличные деньги
  const isCashPair = () => {
    const pair = tradePairs.find(p => p.id === selectedPair);
    return pair?.group === "RUB_CASH";
  };

  // Обновляйте информацию о выбранной паре при изменении пары
  useEffect(() => {
    if (selectedPair) {
      const pair = tradePairs.find(p => p.id === selectedPair);
      if (pair) {
        setSelectedPairInfo(pair);
        // Set initial amount currency based on the selected pair and order type
        updateAmountCurrency(pair, orderType);
      }
    } else {
      setSelectedPairInfo(null);
    }

    setShowCalculation(false);
    setCalculationResult(null);
  }, [selectedPair]);

  // Обновляйте сумму и валюту при изменении типа заказа
  useEffect(() => {
    if (selectedPairInfo) {
      updateAmountCurrency(selectedPairInfo, orderType);
      // Re-calculate when order type changes if auto-calculate is enabled
      if (autoCalculate && amount && parseFloat(amount) > 0) {
        setTimeout(() => calculateOrder(), 100);
      } else {
        // Reset calculation when order type changes
        setShowCalculation(false);
        setCalculationResult(null);
      }
    }
  }, [orderType]);

  // Функция обновления суммы валюты в зависимости от выбранной пары и типа ордера
  const updateAmountCurrency = (pairInfo: any, type: string) => {
    if (type === "BUY") {
      // When buying base currency, amount is in quote currency
      setAmountCurrency(pairInfo.quoteCurrency);
    } else {
      // When selling base currency, amount is in base currency
      setAmountCurrency(pairInfo.baseCurrency);
    }
  };

  const applyRateSourceToFixed = (source: string) => {
    if (currentRates[source]) {
      setCustomRateValue(currentRates[source]);
    }
  };

  // Рассчитать детали заказа на основе исходных данных
  const calculateOrder = () => {
    if (!selectedPairInfo || !amount || parseFloat(amount) <= 0) {
      return;
    }

    // Get base rate from source
    let baseRate = parseFloat(
      rateType === "fixed" 
        ? customRateValue || currentRates[rateSource]
        : currentRates[rateSource]
    );

    if (isNaN(baseRate)) {
      baseRate = 0; // Fallback value
    }

    // Calculate adjusted rate with the adjustment percentage
    const adjustmentMultiplier = 1 + (rateAdjustment / 100);
    const adjustedRate = baseRate * adjustmentMultiplier;
    
    // Calculate service fee
    const serviceFeeMultiplier = 1 + (serviceFee / 100);
    
    // Calculate final rate including service fee
    const finalRate = adjustedRate * serviceFeeMultiplier;

    const amountValue = parseFloat(amount.replace(/,/g, ''));
    let youPay, youReceive, serviceFeeAmount, adjustmentAmount, totalAmount;

    // Determine pay/receive amounts based on order type
    if (orderType === "BUY") { // Buying base currency (e.g., RUB) with quote currency (e.g., USDT)
      if (selectedPairInfo.baseCurrency === "RUB") {
        // Buying RUB with USDT/USD/etc.
        youPay = amountValue; // In quote currency (USDT)
        youReceive = amountValue * finalRate; // In base currency (RUB)
        serviceFeeAmount = (amountValue * baseRate * serviceFee / 100);
        adjustmentAmount = (amountValue * baseRate * rateAdjustment / 100);
        totalAmount = youReceive; // Total is what you receive
      } else {
        // Buying USDT/USD/etc. with RUB
        youPay = amountValue; // In quote currency (RUB)
        youReceive = amountValue / finalRate; // In base currency (USDT)
        serviceFeeAmount = (amountValue / baseRate * serviceFee / 100);
        adjustmentAmount = (amountValue / baseRate * rateAdjustment / 100);
        totalAmount = youReceive; // Total is what you receive
      }
    } else { // Selling base currency (e.g., RUB) for quote currency (e.g., USDT)
      if (selectedPairInfo.baseCurrency === "RUB") {
        // Selling RUB for USDT/USD/etc.
        youPay = amountValue; // In base currency (RUB)
        youReceive = amountValue / finalRate; // In quote currency (USDT)
        serviceFeeAmount = (youReceive * serviceFee / 100);
        adjustmentAmount = (youReceive * rateAdjustment / 100);
        totalAmount = youReceive; // Total is what you receive
      } else {
        // Selling USDT/USD/etc. for RUB
        youPay = amountValue; // In base currency (USDT)
        youReceive = amountValue * finalRate; // In quote currency (RUB)
        serviceFeeAmount = (youReceive * serviceFee / 100);
        adjustmentAmount = (youReceive * rateAdjustment / 100);
        totalAmount = youReceive; // Total is what you receive
      }
    }

    // Determine from/to currencies based on order type
    const fromCurrency = orderType === "BUY" 
      ? selectedPairInfo.quoteCurrency 
      : selectedPairInfo.baseCurrency;
    
    const toCurrency = orderType === "BUY" 
      ? selectedPairInfo.baseCurrency 
      : selectedPairInfo.quoteCurrency;

    // Set calculation result
    setCalculationResult({
      youPay: youPay.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      youReceive: youReceive.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      baseRate: baseRate.toFixed(4),
      adjustedRate: adjustedRate.toFixed(4),
      finalRate: finalRate.toFixed(4),
      serviceFeeAmount: serviceFeeAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      adjustmentAmount: adjustmentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      adjustmentPercentage: rateAdjustment.toFixed(2), // Store the adjustment percentage
      totalAmount: totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      fromCurrency,
      toCurrency
    });

    setShowCalculation(true);
  };

  // Форматирование валют для отображения
  const formatOrderTypeDescription = () => {
    if (!selectedPairInfo) return "";
    
    if (orderType === "BUY") {
      return `${t('buy')} ${selectedPairInfo.baseCurrency} ${t('receive')} ${selectedPairInfo.quoteCurrency}`;
    } else {
      return `${t('sell')} ${selectedPairInfo.quoteCurrency} ${t('receive')} ${selectedPairInfo.baseCurrency}`;
    }
  };

  // Итоговый курс
  const formatRate = () => {
    if (rateType === "fixed") {
      return customRateValue ? `Фикс: ${customRateValue}` : "Нет значения";
    }

    // Only include user adjustment and service fee
    const totalAdjustment = rateAdjustment + serviceFee;

    const sign = totalAdjustment >= 0 ? "+" : "";
    return `${sign}${totalAdjustment.toFixed(2)}%`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Validate required fields
    if (!selectedPair || !amount || !country || (isCashPair() && !city)) {
      alert(t('fillRequiredFields'));
      setIsSubmitting(false);
      return;
    }

    // Validate minimum amount (500,000 USD)
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount < 500000) {
      alert(t('otcMinimumReq'));
      setIsSubmitting(false);
      return;
    }

    // Prepare geography data
    const geography = {
      country,
      city: city || undefined
    };

    // Prepare rate data
    const rateData = {
      type: rateType,
      source: rateType === "dynamic" ? rateSource : undefined,
      value: rateType === "fixed" ? customRateValue : undefined,
      adjustment: rateType === "dynamic" ? rateAdjustment : undefined,
      serviceFee
    };

    const { error } = await createOrder({
      type: orderType as "BUY" | "SELL",
      amount: parsedAmount,
      amountCurrency,
      rate: formatRate(),
      rateDetails: rateData,
      expiresAt: expiryDate,
      purpose: purpose || undefined,
      notes: notes || undefined,
      geography,
      status: "ACTIVE"
    });

    if (!error) {
      setIsSuccess(true);
    }

    setIsSubmitting(false);
  };

  if (isSuccess) {
    return <OrderSuccess setIsSuccess={setIsSuccess} theme={theme} t={t} />;
  }

  const formProps = {
    selectedPair,
    setSelectedPair,
    orderType,
    setOrderType,
    amount,
    setAmount,
    amountCurrency,
    rateType,
    setRateType,
    rateSource,
    setRateSource,
    customRateValue,
    setCustomRateValue,
    rateAdjustment,
    setRateAdjustment,
    serviceFee,
    expiryDate,
    setExpiryDate,
    purpose,
    setPurpose,
    notes,
    setNotes,
    country,
    setCountry,
    city,
    setCity,
    isSubmitting,
    selectedPairInfo,
    currentRates,
    calculationResult,
    showCalculation,
    setShowCalculation,
    isCashPair,
    formatRate,
    applyRateSourceToFixed,
    calculateOrder,
    formatOrderTypeDescription,
    handleSubmit,
    theme,
    t,
    language,
    getCurrencySymbol,
    autoCalculate,
    currentStep,
    setCurrentStep,
    totalSteps,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
          {t('createNewOrder')}
        </h1>
      </div>

      <OrderFormSteps
        currentStep={currentStep}
        formProps={formProps}
      />
    </div>
  );
}
