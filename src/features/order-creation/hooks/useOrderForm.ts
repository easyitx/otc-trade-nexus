import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { OrderFormData, OrderCalculationResult, OrderSubmissionData, RateData, GeographyData } from "../types";
import { getDefaultExpiryDate } from "../utils/dateUtils";
import { tradePairs } from "@/data/mockData";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { calculateOrderAmount, calculateAdjustedRate, formatRate } from "@/utils/rateUtils";
import { toast } from "@/hooks/use-toast";

export const useOrderForm = () => {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  // Form steps
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Form state with default values
  const [formData, setFormData] = useState<OrderFormData>({
    selectedPair: "",
    orderType: "BUY",
    amount: "",
    amountCurrency: "USD",
    rateType: "dynamic",
    rateSource: "CBR",
    customRateValue: "",
    rateAdjustment: 0,
    serviceFee: 1, // Fixed 1% service fee
    expiryDate: getDefaultExpiryDate(),
    purpose: "",
    notes: "",
    country: "",
    city: "",
  });

  // Auto calculation flag
  const [autoCalculate, setAutoCalculate] = useState<boolean>(true);
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  // Selected pair info
  const [selectedPairInfo, setSelectedPairInfo] = useState<any>(null);
  
  // Use the currency rates hook
  const {
    rates,
    loading,
    error,
    currencyPair,
    availablePairs,
    availableSources,
    setCurrencyPair
  } = useCurrencyRates();

  // Current rates for display
  const [currentRates, setCurrentRates] = useState<Record<string, string>>({});
  
  // Calculation state
  const [calculationResult, setCalculationResult] = useState<OrderCalculationResult | null>(null);
  const [showCalculation, setShowCalculation] = useState<boolean>(false);

  // Update current rates when rates change
  useEffect(() => {
    if (!loading && rates) {
      const initialRates: Record<string, string> = {};
      
      // Convert the rates object to strings for display
      Object.entries(rates).forEach(([source, rate]) => {
        initialRates[source] = rate?.toFixed(2) || "0.00";
      });

      setCurrentRates(initialRates);
      
      // If rateSource is not in availableSources, set it to the first available source
      if (availableSources.length > 0 && !availableSources.find(source => source.code === formData.rateSource)) {
        updateFormData("rateSource", availableSources[0].code);
      }
    }
  }, [loading, rates, availableSources]);

  // When available pairs change, update selected pair if not set
  useEffect(() => {
    if (availablePairs.length > 0 && !formData.selectedPair) {
      const firstPairValue = availablePairs[0]?.value;
      if (firstPairValue) {
        updateFormData("selectedPair", firstPairValue);
      }
    }
  }, [availablePairs]);

  // Update form data with a single field
  const updateFormData = <K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  // Update multiple form fields at once
  const updateMultipleFields = (fields: Partial<OrderFormData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  // Check if the selected pair involves cash
  const isCashPair = () => {
    const pair = tradePairs.find(p => p.id === formData.selectedPair);
    return pair?.group === "RUB_CASH";
  };

  // Update selected pair info when pair changes
  useEffect(() => {
    if (formData.selectedPair) {
      const pair = tradePairs.find(p => p.id === formData.selectedPair);
      if (pair) {
        setSelectedPairInfo(pair);
        // Set initial amount currency based on the selected pair and order type
        updateAmountCurrency(pair, formData.orderType);
        
        // Update the currency pair in the hook to match the selected pair
        if (pair.baseCurrency && pair.quoteCurrency) {
          const pairString = `${pair.baseCurrency}/${pair.quoteCurrency}`;
          const matchingPair = availablePairs.find(p => p.value === pairString);
          if (matchingPair) {
            setCurrencyPair(matchingPair.value);
          }
        }
      }
    } else {
      setSelectedPairInfo(null);
    }
    // Reset calculation when pair changes
    setShowCalculation(false);
    setCalculationResult(null);
  }, [formData.selectedPair, availablePairs, setCurrencyPair]);

  // Update amount currency when order type changes
  useEffect(() => {
    if (selectedPairInfo) {
      updateAmountCurrency(selectedPairInfo, formData.orderType);
      // Re-calculate when order type changes if auto-calculate is enabled
      if (autoCalculate && formData.amount && parseFloat(formData.amount) > 0) {
        setTimeout(() => calculateOrder(), 100);
      } else {
        // Reset calculation when order type changes
        setShowCalculation(false);
        setCalculationResult(null);
      }
    }
  }, [formData.orderType]);

  // Function to update amount currency based on selected pair and order type
  const updateAmountCurrency = (pairInfo: any, type: string) => {
    if (type === "BUY") {
      // When buying base currency, amount is in quote currency
      updateFormData("amountCurrency", pairInfo.quoteCurrency);
    } else {
      // When selling base currency, amount is in base currency
      updateFormData("amountCurrency", pairInfo.baseCurrency);
    }
  };

  // Apply rate source to fixed rate value
  const applyRateSourceToFixed = (source: string) => {
    if (rates && rates[source]) {
      updateFormData("customRateValue", rates[source].toFixed(2));
    } else if (currentRates[source]) {
      updateFormData("customRateValue", currentRates[source]);
    }
  };

  // Format rate string based on selected source and adjustments
  const formatRateString = () => {
    if (formData.rateType === "fixed") {
      return formData.customRateValue ? `Фикс: ${formData.customRateValue}` : "Нет значения";
    }

    const sourceMap = {
      "CBR": "ЦБ",
      "PF": "PF",
      "IV": "IV",
      "XE": "XE"
    };

    const sourceName = sourceMap[formData.rateSource as keyof typeof sourceMap] || formData.rateSource;
    // Only include user adjustment and service fee
    const totalAdjustment = formData.rateAdjustment + formData.serviceFee;

    const sign = totalAdjustment >= 0 ? "+" : "";
    return `${sourceName}${sign}${totalAdjustment.toFixed(2)}%`;
  };

  // Format order type description
  const formatOrderTypeDescription = () => {
    if (!selectedPairInfo) return "";
    
    if (formData.orderType === "BUY") {
      return `${t('buy')} ${selectedPairInfo.baseCurrency} ${t('receive')} ${selectedPairInfo.quoteCurrency}`;
    } else {
      return `${t('sell')} ${selectedPairInfo.quoteCurrency} ${t('receive')} ${selectedPairInfo.baseCurrency}`;
    }
  };

  // Calculate order details based on inputs
  const calculateOrder = () => {
    if (!selectedPairInfo || !formData.amount || parseFloat(formData.amount) <= 0) {
      console.log("Cannot calculate: missing pair info or valid amount");
      return;
    }

    // Get base rate from source using the rates from the hook
    let baseRate = 0;
    
    if (formData.rateType === "fixed") {
      baseRate = parseFloat(formData.customRateValue) || 0;
    } else if (rates && rates[formData.rateSource]) {
      baseRate = rates[formData.rateSource];
    } else if (currentRates[formData.rateSource]) {
      baseRate = parseFloat(currentRates[formData.rateSource]);
    }

    if (isNaN(baseRate) || baseRate === 0) {
      baseRate = 90; // Fallback value для рубля/доллара
    }

    console.log(`Base rate: ${baseRate}, Source: ${formData.rateSource}`);

    // Calculate adjusted rate with the adjustment percentage
    const finalRate = calculateAdjustedRate(baseRate, formData.rateAdjustment, formData.serviceFee);
    console.log(`Final rate after adjustments: ${finalRate}`);

    const amountValue = parseFloat(formData.amount.replace(/,/g, ''));
    console.log(`Amount to convert: ${amountValue}`);
    
    // Use the refactored function for calculation
    const { youPay, youReceive } = calculateOrderAmount(
      amountValue,
      finalRate,
      formData.orderType,
      selectedPairInfo.baseCurrency,
      selectedPairInfo.quoteCurrency
    );
    
    console.log(`After calculation: Pay=${youPay}, Receive=${youReceive}`);
    
    // Determine from/to currencies based on order type
    const fromCurrency = formData.orderType === "BUY" 
      ? selectedPairInfo.quoteCurrency 
      : selectedPairInfo.baseCurrency;
    
    const toCurrency = formData.orderType === "BUY" 
      ? selectedPairInfo.baseCurrency 
      : selectedPairInfo.quoteCurrency;

    // Calculate additional values for display
    // Calculate service fee and adjustment on the appropriate amount
    let baseAmount = 0;
    
    if (formData.orderType === "BUY") {
      if (selectedPairInfo.baseCurrency === "RUB") {
        // When buying RUB, calculate on the base amount (youReceive)
        baseAmount = youReceive;
      } else {
        // When buying non-RUB, calculate on the quote amount converted at base rate
        baseAmount = amountValue * baseRate; 
      }
    } else { // SELL
      if (selectedPairInfo.baseCurrency === "RUB") {
        // When selling RUB, calculate on the amount (youPay)
        baseAmount = youPay;
      } else {
        // When selling non-RUB, calculate on the base amount converted to quote at base rate
        baseAmount = amountValue * baseRate;
      }
    }
    
    const adjustmentAmount = baseAmount * (formData.rateAdjustment / 100);
    const serviceFeeAmount = baseAmount * (formData.serviceFee / 100);

    // Set calculation result
    setCalculationResult({
      youPay: youPay.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      youReceive: youReceive.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      baseRate: baseRate.toFixed(4),
      adjustedRate: (baseRate * (1 + formData.rateAdjustment / 100)).toFixed(4),
      finalRate: finalRate.toFixed(4),
      serviceFeeAmount: serviceFeeAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      adjustmentAmount: adjustmentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      adjustmentPercentage: formData.rateAdjustment.toFixed(2),
      totalAmount: youReceive.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      fromCurrency,
      toCurrency
    });

    setShowCalculation(true);
  };

  // Format currency symbol
  const getCurrencySymbol = (currency: string) => {
    const currencySymbols: Record<string, string> = {
      USD: "$", EUR: "€", GBP: "£", JPY: "¥", 
      CNY: "¥", RUB: "₽", KRW: "₩", INR: "₹",
      THB: "฿", IDR: "Rp", VND: "₫", AED: "د.إ",
      SAR: "﷼", ILS: "₪", BRL: "R$", MXN: "$",
      ARS: "$", ZAR: "R", EGP: "£", NGN: "₦",
      BTC: "₿", ETH: "Ξ", LTC: "Ł"
    };
    
    const normalizedCurrency = currency.toUpperCase();
    return currencySymbols[normalizedCurrency] || "";
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Validate required fields
    if (!formData.selectedPair || !formData.amount || !formData.country || (isCashPair() && !formData.city)) {
      toast({
        title: t('fillRequiredFields'),
        description: t('fillRequiredFields'),
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Validate minimum amount (500,000 USD)
    const parsedAmount = parseFloat(formData.amount.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount < 500000) {
      toast({
        title: t('fillRequiredFields'),
        description: t('otcMinimumReq'),
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Prepare geography data
    const geography: GeographyData = {
      country: formData.country,
      city: formData.city || undefined
    };

    // Prepare rate data
    const rateData: RateData = {
      type: formData.rateType,
      source: formData.rateType === "dynamic" ? formData.rateSource : undefined,
      value: formData.rateType === "fixed" ? formData.customRateValue : undefined,
      adjustment: formData.rateType === "dynamic" ? formData.rateAdjustment : undefined,
      serviceFee: formData.serviceFee
    };

    const orderData: OrderSubmissionData = {
      type: formData.orderType as "BUY" | "SELL",
      amount: parsedAmount,
      amountCurrency: formData.amountCurrency,
      rate: formatRateString(),
      rateDetails: rateData,
      expiresAt: formData.expiryDate,
      purpose: formData.purpose || undefined,
      notes: formData.notes || undefined,
      geography,
      status: "ACTIVE"
    };

    const { error } = await createOrder(orderData);

    if (!error) {
      setIsSuccess(true);
    } else {
      toast({
        title: t('cancel'),
        description: error,
        variant: "destructive"
      });
    }

    setIsSubmitting(false);
  };

  return {
    // Form state
    formData,
    updateFormData,
    updateMultipleFields,
    
    // Steps
    currentStep,
    setCurrentStep,
    totalSteps,
    
    // UI
    theme,
    language,
    t,
    
    // Calculation
    calculationResult,
    showCalculation,
    setShowCalculation,
    calculateOrder,
    
    // Submission
    isSubmitting,
    isSuccess,
    setIsSuccess,
    handleSubmit,
    
    // Rates
    currentRates,
    rates,
    loading,
    error,
    availablePairs,
    availableSources,
    
    // Utilities
    selectedPairInfo,
    isCashPair,
    formatRate: formatRateString,
    applyRateSourceToFixed,
    formatOrderTypeDescription,
    getCurrencySymbol,
    
    // Flags
    autoCalculate
  };
};
