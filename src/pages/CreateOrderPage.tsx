
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { EnhancedDatePicker } from "../components/ui/enhanced-date-picker";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { tradePairs } from "../data/mockData";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { CheckCircle, Info, ArrowRight, CreditCard, Calendar, MapPin, FileText, ArrowRightCircle, Settings, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { countries } from "@/data/countries";
import { citiesByCountry } from "@/data/cities";
import { TranslationKey } from "@/i18n/translations";
import { Separator } from "@/components/ui/separator";

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const { currentUser } = useAuth();
  const { rateAdjustments, isLoading: isLoadingSettings } = usePlatformSettings();
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  // Form steps
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Form state
  const [selectedPair, setSelectedPair] = useState<string>("");
  const [orderType, setOrderType] = useState<string>("BUY");
  const [amount, setAmount] = useState<string>("");
  const [amountCurrency, setAmountCurrency] = useState<string>("USD");
  const [rateType, setRateType] = useState<"dynamic" | "fixed">("dynamic");
  const [rateSource, setRateSource] = useState<string>("cbr");
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
  const [currentRates, setCurrentRates] = useState<Record<string, string>>({
    cbr: "90.50",
    profinance: "91.25",
    investing: "90.75",
    xe: "91.00"
  });
  
  // Calculation state
  const [calculationResult, setCalculationResult] = useState<{
    youPay: string;
    youReceive: string;
    baseRate: string;
    adjustedRate: string;
    finalRate: string;
    serviceFeeAmount: string;
    adjustmentAmount: string;
    totalAmount: string;
    fromCurrency: string;
    toCurrency: string;
  } | null>(null);
  
  const [showCalculation, setShowCalculation] = useState<boolean>(false);

  const form = useForm({
    defaultValues: {
      rateAdjustment: 0,
    }
  });

  // Function to get default expiry date (7 days from now)
  function getDefaultExpiryDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  }

  // Check if the selected pair involves cash
  const isCashPair = () => {
    const pair = tradePairs.find(p => p.id === selectedPair);
    return pair?.group === "RUB_CASH";
  };

  // Update selected pair info when pair changes
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
    // Reset calculation when pair changes
    setShowCalculation(false);
    setCalculationResult(null);
  }, [selectedPair]);

  // Update amount currency when order type changes
  useEffect(() => {
    if (selectedPairInfo) {
      updateAmountCurrency(selectedPairInfo, orderType);
      // Reset calculation when order type changes
      setShowCalculation(false);
      setCalculationResult(null);
    }
  }, [orderType]);

  // Function to update amount currency based on selected pair and order type
  const updateAmountCurrency = (pairInfo: any, type: string) => {
    if (type === "BUY") {
      // When buying base currency, amount is in quote currency
      setAmountCurrency(pairInfo.quoteCurrency);
    } else {
      // When selling base currency, amount is in base currency
      setAmountCurrency(pairInfo.baseCurrency);
    }
  };

  // Apply selected rate source value to custom rate when in fixed mode
  const applyRateSourceToFixed = (source: string) => {
    if (currentRates[source]) {
      setCustomRateValue(currentRates[source]);
    }
  };

  // Get cities based on selected country
  const getCitiesForCountry = () => {
    return country ? citiesByCountry[country] || [] : [];
  };

  // Group trade pairs by category
  const groupedPairs: Record<string, typeof tradePairs> = tradePairs.reduce((groups, pair) => {
    const group = pair.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(pair);
    return groups;
  }, {} as Record<string, typeof tradePairs>);

  // Format currencies for display
  const formatOrderTypeDescription = () => {
    if (!selectedPairInfo) return "";
    
    if (orderType === "BUY") {
      return `${t('buy')} ${selectedPairInfo.baseCurrency} ${t('with')} ${selectedPairInfo.quoteCurrency}`;
    } else {
      return `${t('sell')} ${selectedPairInfo.baseCurrency} ${t('for')} ${selectedPairInfo.quoteCurrency}`;
    }
  };

  // Format rate string based on selected source and adjustments
  const formatRate = () => {
    if (rateType === "fixed") {
      return customRateValue ? `FIXED: ${customRateValue}` : "FIXED: (enter value)";
    }

    const sourceMap = {
      "cbr": "ЦБ",
      "profinance": "PF",
      "investing": "IV",
      "xe": "XE"
    };

    const sourceName = sourceMap[rateSource as keyof typeof sourceMap] || rateSource;
    // Only include user adjustment and service fee
    const totalAdjustment = rateAdjustment + serviceFee;

    const sign = totalAdjustment >= 0 ? "+" : "";
    return `${sourceName}${sign}${totalAdjustment.toFixed(2)}%`;
  };

  // Get currency symbol
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "RUB":
        return "₽";
      default:
        return "";
    }
  };

  // Calculate order details based on inputs
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
      baseRate = 90.0; // Fallback value
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
        totalAmount = youPay;
      } else {
        // Buying USDT/USD/etc. with RUB
        youPay = amountValue; // In quote currency (RUB)
        youReceive = amountValue / finalRate; // In base currency (USDT)
        serviceFeeAmount = (amountValue / baseRate * serviceFee / 100);
        adjustmentAmount = (amountValue / baseRate * rateAdjustment / 100);
        totalAmount = youPay;
      }
    } else { // Selling base currency (e.g., RUB) for quote currency (e.g., USDT)
      if (selectedPairInfo.baseCurrency === "RUB") {
        // Selling RUB for USDT/USD/etc.
        youPay = amountValue; // In base currency (RUB)
        youReceive = amountValue / finalRate; // In quote currency (USDT)
        serviceFeeAmount = (youReceive * serviceFee / 100);
        adjustmentAmount = (youReceive * rateAdjustment / 100);
        totalAmount = youPay;
      } else {
        // Selling USDT/USD/etc. for RUB
        youPay = amountValue; // In base currency (USDT)
        youReceive = amountValue * finalRate; // In quote currency (RUB)
        serviceFeeAmount = (youReceive * serviceFee / 100);
        adjustmentAmount = (youReceive * rateAdjustment / 100);
        totalAmount = youPay;
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
      totalAmount: totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      fromCurrency,
      toCurrency
    });

    setShowCalculation(true);
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
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className={cn(
          "w-full max-w-2xl shadow-lg transform transition-all duration-300 animate-fade-in",
          theme === "light" 
            ? "bg-white border-gray-200" 
            : "bg-otc-card border-otc-active"
        )}>
          <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center text-center">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mb-6",
              theme === "light" 
                ? "bg-green-50 text-green-500" 
                : "bg-green-900/20 text-green-400"
            )}>
              <CheckCircle className="h-10 w-10" />
            </div>
            <h2 className={cn(
              "text-3xl font-bold mb-4",
              theme === "light" ? "text-gray-900" : "text-white"
            )}>
              {t('orderCreatedSuccess')}
            </h2>
            <p className={cn(
              "text-lg mb-8 max-w-md",
              theme === "light" ? "text-gray-600" : "text-muted-foreground"
            )}>
              {t('orderSubmitted')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Button
                variant={theme === "light" ? "outline" : "secondary"}
                className={cn(
                  "flex-1 py-6",
                  theme === "light"
                    ? "border-gray-300 hover:bg-gray-100 text-gray-700"
                    : "border-otc-active hover:bg-otc-active/30 text-white"
                )}
                onClick={() => setIsSuccess(false)}
              >
                {t('createAnotherOrder')}
              </Button>
              <Button
                variant={theme === "light" ? "default" : "default"}
                className={cn(
                  "flex-1 py-6",
                  theme === "light"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-otc-primary text-black hover:bg-otc-primary/90"
                )}
                asChild
              >
                <a href="/orders">{t('viewAllOrders')}</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className={cn(
          "text-3xl font-bold",
          theme === "light" ? "text-gray-900" : "text-white"
        )}>
          {t('createNewOrder')}
        </h1>
      </div>

      <Alert className={cn(
        "border-l-4 shadow-sm",
        theme === "light"
          ? "bg-blue-50 border-blue-500 text-blue-800"
          : "bg-otc-secondary/20 border-l-otc-primary text-white"
      )}>
        <div className="flex items-start">
          <Info className={cn(
            "h-5 w-5 mt-0.5",
            theme === "light" ? "text-blue-600" : "text-otc-primary"
          )} />
          <div className="ml-3">
            <AlertTitle className="mb-1 font-semibold">{t('minOrderSize')}</AlertTitle>
            <AlertDescription>
              {t('otcMinimumReq')}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className={cn(
          "shadow-md border overflow-hidden",
          theme === "light" 
            ? "bg-white border-gray-200" 
            : "bg-otc-card border-otc-active"
        )}>
          <CardHeader className="pb-6">
            <CardTitle className={cn(
              "text-2xl flex items-center gap-3",
              theme === "light" ? "text-gray-900" : "text-white"
            )}>
              {currentStep === 1 ? (
                <>
                  <CreditCard className="w-6 h-6" /> 
                  {t('basicDetails')}
                </>
              ) : (
                <>
                  <FileText className="w-6 h-6" /> 
                  {t('additionalDetails')}
                </>
              )}
            </CardTitle>
            <CardDescription className={cn(
              "text-base",
              theme === "light" ? "text-gray-600" : "text-gray-400"
            )}>
              {currentStep === 1 ? t('enterOrderDetails') : t('paymentDetails')}
            </CardDescription>

            {/* Step indicator */}
            <div className="mt-6 relative">
              <div className={cn(
                "absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2",
                theme === "light" ? "bg-gray-200" : "bg-otc-active"
              )}></div>
              <div className="flex justify-between relative z-10">
                {Array.from({length: totalSteps}, (_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div 
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                        i + 1 === currentStep 
                          ? theme === "light" 
                              ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100" 
                              : "bg-otc-primary text-black shadow-md ring-4 ring-otc-primary/20"
                          : i + 1 < currentStep
                            ? theme === "light" 
                                ? "bg-green-500 text-white" 
                                : "bg-green-600 text-white"
                            : theme === "light" 
                                ? "bg-white text-gray-500 border border-gray-300" 
                                : "bg-otc-active text-gray-400 border border-otc-active"
                      )}
                    >
                      {i + 1 < currentStep ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={cn(
                      "mt-2 text-sm font-medium transition-colors",
                      i + 1 === currentStep
                        ? theme === "light" ? "text-blue-600" : "text-otc-primary"
                        : theme === "light" ? "text-gray-500" : "text-gray-400"
                    )}>
                      {i === 0 ? t('basicDetails') : t('additionalDetails')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8 pt-4">
            {/* Step 1 - Basic Details */}
            {currentStep === 1 && (
              <>
                {/* Trading Pair */}
                <div className="space-y-3">
                  <Label
                    htmlFor="tradingPair"
                    className={cn(
                      "text-base",
                      theme === "light" ? "text-gray-800" : "text-white"
                    )}
                  >
                    {t('tradingPair')} <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedPair} onValueChange={setSelectedPair}>
                    <SelectTrigger
                      id="tradingPair"
                      className={cn(
                        "h-12 text-base",
                        theme === "light"
                          ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                          : "bg-otc-active border-otc-active text-white"
                      )}
                    >
                      <SelectValue placeholder={t('selectTradingPair')} />
                    </SelectTrigger>
                    <SelectContent
                      className={cn(
                        "max-h-[300px]",
                        theme === "light"
                          ? "bg-white border-gray-200"
                          : "bg-otc-card border-otc-active"
                      )}
                    >
                      {Object.entries(groupedPairs).map(([group, pairs]) => (
                        <div key={group}>
                          <div className={cn(
                            "sticky top-0 px-2 py-2 text-xs uppercase tracking-wider font-medium backdrop-blur-sm z-10",
                            theme === "light" 
                              ? "bg-gray-50 text-gray-500 border-b border-gray-200" 
                              : "bg-otc-active/80 text-gray-400 border-b border-otc-active"
                          )}>
                            {t(group.replace(/\s+/g, '_') as TranslationKey)}
                          </div>
                          {pairs.map((pair) => (
                            <SelectItem
                              key={pair.id}
                              value={pair.id}
                              className={cn(
                                theme === "light"
                                  ? "hover:bg-gray-100 focus:bg-gray-100"
                                  : "hover:bg-otc-active focus:bg-otc-active"
                              )}
                            >
                              {pair.displayName}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPair && (
                  <>
                    {/* Order Type */}
                    <div className="space-y-3">
                      <Label className={cn(
                        "text-base",
                        theme === "light" ? "text-gray-800" : "text-white"
                      )}>
                        {t('orderType')} <span className="text-red-500">*</span>
                      </Label>
                      
                      {selectedPairInfo && (
                        <RadioGroup
                          value={orderType}
                          onValueChange={setOrderType}
                          className="flex flex-col sm:flex-row gap-3"
                        >
                          <div className={cn(
                            "relative flex-1 rounded-lg overflow-hidden transition-all duration-300",
                            orderType === "BUY" ? (
                              theme === "light" 
                                ? "ring-2 ring-blue-500 shadow-md" 
                                : "ring-2 ring-otc-primary shadow-md"
                            ) : "",
                            theme === "light" 
                              ? "bg-white border border-gray-200" 
                              : "bg-otc-active/30 border border-otc-active"
                          )}>
                            <label 
                              htmlFor="buy-option" 
                              className="p-4 flex items-start cursor-pointer w-full h-full"
                            >
                              <RadioGroupItem 
                                value="BUY" 
                                id="buy-option"
                                className={cn(
                                  "mt-1",
                                  theme === "light"
                                    ? "border-gray-300 text-blue-600"
                                    : "border-otc-active text-otc-primary"
                                )}
                              />
                              <div className="ml-3">
                                <div className={cn(
                                  "font-medium text-lg",
                                  theme === "light" ? "text-gray-900" : "text-white"
                                )}>
                                  {t('buy')} {selectedPairInfo.baseCurrency}
                                </div>
                                <div className={cn(
                                  "text-sm mt-1",
                                  theme === "light" ? "text-gray-600" : "text-gray-400"
                                )}>
                                  {t('with')} {selectedPairInfo.quoteCurrency}
                                </div>
                              </div>
                            </label>
                          </div>
                          
                          <div className={cn(
                            "relative flex-1 rounded-lg overflow-hidden transition-all duration-300",
                            orderType === "SELL" ? (
                              theme === "light" 
                                ? "ring-2 ring-blue-500 shadow-md" 
                                : "ring-2 ring-otc-primary shadow-md"
                            ) : "",
                            theme === "light" 
                              ? "bg-white border border-gray-200" 
                              : "bg-otc-active/30 border border-otc-active"
                          )}>
                            <label 
                              htmlFor="sell-option" 
                              className="p-4 flex items-start cursor-pointer w-full h-full"
                            >
                              <RadioGroupItem 
                                value="SELL" 
                                id="sell-option"
                                className={cn(
                                  "mt-1",
                                  theme === "light"
                                    ? "border-gray-300 text-blue-600"
                                    : "border-otc-active text-otc-primary"
                                )}
                              />
                              <div className="ml-3">
                                <div className={cn(
                                  "font-medium text-lg",
                                  theme === "light" ? "text-gray-900" : "text-white"
                                )}>
                                  {t('sell')} {selectedPairInfo.baseCurrency}
                                </div>
                                <div className={cn(
                                  "text-sm mt-1",
                                  theme === "light" ? "text-gray-600" : "text-gray-400"
                                )}>
                                  {t('for')} {selectedPairInfo.quoteCurrency}
                                </div>
                              </div>
                            </label>
                          </div>
                        </RadioGroup>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="space-y-3">
                      <Label htmlFor="amount" className={cn(
                        "text-base",
                        theme === "light" ? "text-gray-800" : "text-white"
                      )}>
                        {t('amount')} <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex space-x-3">
                        <div className="relative flex-grow">
                          <Input
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={t('minimumOrder')}
                            className={cn(
                              "pl-8 h-12 text-lg",
                              theme === "light"
                                ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                                : "bg-otc-active border-otc-active text-white"
                            )}
                          />
                          <span className={cn(
                            "absolute left-3 top-1/2 transform -translate-y-1/2 text-lg",
                            theme === "light" ? "text-gray-500" : "text-gray-400"
                          )}>
                            {getCurrencySymbol(amountCurrency)}
                          </span>
                        </div>
                        <div className="w-24">
                          <div className={cn(
                            "h-12 px-3 flex items-center justify-center rounded-md border font-medium text-lg",
                            theme === "light"
                              ? "bg-white border-gray-300 text-gray-900"
                              : "bg-otc-active border-otc-active text-white"
                          )}>
                            {amountCurrency}
                          </div>
                        </div>
                      </div>
                      {selectedPairInfo && (
                        <p className={cn(
                          "text-sm",
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        )}>
                          {orderType === "BUY" 
                            ? `${t('amount')} ${t('in')} ${selectedPairInfo.quoteCurrency}`
                            : `${t('amount')} ${t('in')} ${selectedPairInfo.baseCurrency}`}
                        </p>
                      )}
                    </div>

                    {/* Rate */}
                    <div className="space-y-6 pt-2">
                      <div className="flex items-center justify-between">
                        <Label className={cn(
                          "text-base",
                          theme === "light" ? "text-gray-800" : "text-white"
                        )}>{t('rate')}</Label>
                        
                        <div className={cn(
                          "text-sm font-medium px-3 py-1 rounded-full",
                          theme === "light" 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-otc-primary/20 text-otc-primary"
                        )}>
                          {formatRate()}
                        </div>
                      </div>
                      
                      {/* Rate Type Selection */}
                      <div className={cn(
                        "p-4 rounded-lg border",
                        theme === "light" 
                          ? "bg-gray-50 border-gray-200" 
                          : "bg-otc-active/30 border-otc-active"
                      )}>
                        <div className="space-y-4">
                          <Label className={cn(
                            "block font-medium",
                            theme === "light" ? "text-gray-700" : "text-gray-300"
                          )}>
                            {t('rateType')}
                          </Label>
                          <RadioGroup
                            value={rateType}
                            onValueChange={(value) => setRateType(value as "dynamic" | "fixed")}
                            className="flex gap-4"
                          >
                            <div className={cn(
                              "flex items-center gap-2 p-3 rounded-lg border transition-all",
                              rateType === "dynamic" ? (
                                theme === "light" 
                                  ? "bg-blue-50 border-blue-200" 
                                  : "bg-otc-primary/10 border-otc-primary/30"
                              ) : (
                                theme === "light" 
                                  ? "bg-white border-gray-200" 
                                  : "bg-otc-active border-otc-active"
                              )
                            )}>
                              <RadioGroupItem
                                value="dynamic"
                                id="dynamic-rate"
                                className={cn(
                                  theme === "light"
                                    ? "border-gray-300 text-blue-600"
                                    : "border-otc-active text-otc-primary"
                                )}
                              />
                              <Label
                                htmlFor="dynamic-rate"
                                className={cn(
                                  "cursor-pointer",
                                  theme === "light" ? "text-gray-800" : "text-white"
                                )}
                              >
                                {t('dynamicRate')}
                              </Label>
                            </div>
                            
                            <div className={cn(
                              "flex items-center gap-2 p-3 rounded-lg border transition-all",
                              rateType === "fixed" ? (
                                theme === "light" 
                                  ? "bg-blue-50 border-blue-200" 
                                  : "bg-otc-primary/10 border-otc-primary/30"
                              ) : (
                                theme === "light" 
                                  ? "bg-white border-gray-200" 
                                  : "bg-otc-active border-otc-active"
                              )
                            )}>
                              <RadioGroupItem
                                value="fixed"
                                id="fixed-rate"
                                className={cn(
                                  theme === "light"
                                    ? "border-gray-300 text-blue-600"
                                    : "border-otc-active text-otc-primary"
                                )}
                              />
                              <Label
                                htmlFor="fixed-rate"
                                className={cn(
                                  "cursor-pointer",
                                  theme === "light" ? "text-gray-800" : "text-white"
                                )}
                              >
                                {t('fixedRate')}
                              </Label>
                            </div>
                          </RadioGroup>

                          {/* Dynamic Rate Options */}
                          {rateType === "dynamic" && (
                            <div className="space-y-4 pt-2 mt-2 border-t border-dashed">
                              {/* Rate Source */}
                              <div>
                                <Label htmlFor="rateSource" className={cn(
                                  "block mb-2",
                                  theme === "light" ? "text-gray-700" : "text-gray-300"
                                )}>{t('rateSource')}</Label>
                                <Select value={rateSource} onValueChange={setRateSource}>
                                  <SelectTrigger
                                    id="rateSource"
                                    className={cn(
                                      theme === "light"
                                        ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                                        : "bg-otc-active border-otc-active text-white"
                                    )}
                                  >
                                    <SelectValue placeholder={t('selectSource')} />
                                  </SelectTrigger>
                                  <SelectContent className={cn(
                                    theme === "light"
                                      ? "bg-white border-gray-200"
                                      : "bg-otc-card border-otc-active"
                                  )}>
                                    <div className={cn(
                                      "grid grid-cols-2 gap-1",
                                      theme === "light" ? "bg-gray-50" : "bg-otc-active/40"
                                    )}>
                                      {[
                                        { id: "cbr", name: "ЦБ (CBR)", value: currentRates.cbr },
                                        { id: "profinance", name: "Profinance (PF)", value: currentRates.profinance },
                                        { id: "investing", name: "Investing (IV)", value: currentRates.investing },
                                        { id: "xe", name: "XE", value: currentRates.xe }
                                      ].map(source => (
                                        <SelectItem
                                          key={source.id}
                                          value={source.id}
                                          className={cn(
                                            "flex justify-between items-center",
                                            theme === "light" ? "hover:bg-gray-100" : "hover:bg-otc-active"
                                          )}
                                        >
                                          <span>{source.name}</span>
                                          <span className={cn(
                                            "font-mono text-sm",
                                            theme === "light" ? "text-blue-600" : "text-otc-primary"
                                          )}>
                                            {source.value}
                                          </span>
                                        </SelectItem>
                                      ))}
                                    </div>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Rate Adjustment Slider */}
                              <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center">
                                  <Label className={cn(
                                    theme === "light" ? "text-gray-700" : "text-gray-300"
                                  )}>
                                    {t('rate')} {t('adjustment')}: 
                                    <span className={cn(
                                      "ml-1 font-semibold",
                                      rateAdjustment > 0 
                                        ? "text-green-600"
                                        : rateAdjustment < 0 
                                          ? "text-red-500" 
                                          : ""
                                    )}>
                                      {rateAdjustment > 0 ? "+" : ""}{rateAdjustment}%
                                    </span>
                                  </Label>
                                </div>
                                <Slider
                                  defaultValue={[0]}
                                  min={-5}
                                  max={5}
                                  step={0.5}
                                  value={[rateAdjustment]}
                                  onValueChange={(values) => setRateAdjustment(values[0])}
                                  className={cn(
                                    "py-1",
                                    theme === "light" ? "text-blue-600" : "text-otc-primary"
                                  )}
                                />
                                <div className="flex justify-between text-xs mt-1 px-1">
                                  <span className={theme === "light" ? "text-red-500" : "text-red-400"}>-5%</span>
                                  <span>0%</span>
                                  <span className={theme === "light" ? "text-green-600" : "text-green-400"}>+5%</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Fixed Rate Input with Source Selection */}
                          {rateType === "fixed" && (
                            <div className="space-y-4 pt-2 mt-2 border-t border-dashed">
                              <div className="space-y-3">
                                <Label className={cn(
                                  "block mb-1",
                                  theme === "light" ? "text-gray-700" : "text-gray-300"
                                )}>
                                  {language === 'en' ? 'Quick Select Rate' : 'Быстрый выбор курса'}
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                  {[
                                    { id: "cbr", label: "ЦБ", value: currentRates.cbr },
                                    { id: "profinance", label: "PF", value: currentRates.profinance },
                                    { id: "investing", label: "IV", value: currentRates.investing },
                                    { id: "xe", label: "XE", value: currentRates.xe }
                                  ].map(source => (
                                    <Button 
                                      key={source.id}
                                      type="button"
                                      size="sm" 
                                      variant={theme === "light" ? "outline" : "secondary"}
                                      onClick={() => applyRateSourceToFixed(source.id)}
                                      className={cn(
                                        "gap-2",
                                        customRateValue === source.value ? (
                                          theme === "light" 
                                            ? "bg-blue-50 border-blue-300 text-blue-700" 
                                            : "bg-otc-primary/20 border-otc-primary text-white"
                                        ) : (
                                          theme === "light" 
                                            ? "border-gray-200 bg-white" 
                                            : "border-otc-active bg-otc-active"
                                        )
                                      )}
                                    >
                                      <span>{source.label}:</span>
                                      <span className="font-mono">{source.value}</span>
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="fixedRate" className={cn(
                                  theme === "light" ? "text-gray-700" : "text-gray-300"
                                )}>
                                  {language === 'en' ? 'Custom Rate Value' : 'Значение курса'}
                                </Label>
                                <Input
                                  id="fixedRate"
                                  value={customRateValue}
                                  onChange={(e) => setCustomRateValue(e.target.value)}
                                  placeholder={language === 'en' ? 'Enter rate value' : 'Введите значение курса'}
                                  className={cn(
                                    "text-lg font-mono",
                                    theme === "light"
                                      ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                                      : "bg-otc-active border-otc-active text-white"
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          {/* Rate Summary */}
                          <div className={cn(
                            "rounded-lg p-4 mt-4 border",
                            theme === "light"
                              ? "bg-blue-50 border-blue-100 text-blue-800"
                              : "bg-otc-primary/10 border-otc-primary/20 text-white"
                          )}>
                            <div className="flex justify-between items-center">
                              <Label>{t('serviceFee')}: </Label>
                              <span className={cn(
                                "font-semibold",
                                theme === "light" ? "text-blue-700" : "text-otc-primary"
                              )}>
                                {serviceFee}%
                              </span>
                            </div>
                            <div className={cn(
                              "mt-3 pt-3",
                              theme === "light"
                                ? "border-t border-blue-200"
                                : "border-t border-otc-primary/20"
                            )}>
                              <div className="flex justify-between items-center">
                                <Label>{t('finalRate')}: </Label>
                                <span className={cn(
                                  "font-medium",
                                  theme === "light" ? "text-blue-700" : "text-otc-primary"
                                )}>
                                  {formatRate()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Calculate and show transaction details */}
                    <div className="mt-8">
                      <Button
                        type="button"
                        onClick={calculateOrder}
                        variant={theme === "light" ? "gradient" : "default"}
                        className={cn(
                          "w-full py-6 text-lg relative overflow-hidden group transition-all",
                          theme === "light"
                            ? ""
                            : "bg-otc-primary text-black hover:bg-otc-primary/90"
                        )}
                        disabled={!selectedPair || !amount || parseFloat(amount) <= 0}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {t('calculateSummary')}
                          <ArrowRightCircle className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Button>
                    </div>

                    {/* Transaction Calculation Results */}
                    {showCalculation && calculationResult && (
                      <div className={cn(
                        "mt-10 rounded-lg p-4 border animate-fade-in",
                        theme === "light"
                          ? "bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-md"
                          : "bg-gradient-to-br from-otc-active/40 to-otc-card border-otc-active shadow-md"
                      )}>
                        <h3 className={cn(
                          "text-2xl font-semibold mb-6 flex items-center",
                          theme === "light" ? "text-gray-900" : "text-white"
                        )}>
                          <Settings className="w-5 h-5 mr-2" />
                          {t('orderSummary')}
                        </h3>
                        
                        <div className="space-y-6">
                          <div className={cn(
                            "rounded-lg overflow-hidden border shadow-sm",
                            theme === "light" 
                              ? "bg-white border-gray-200" 
                              : "bg-otc-card border border-otc-active"
                          )}>
                            {/* Transaction Summary Header */}
                            <div className={cn(
                              "px-4 py-3",
                              theme === "light" 
                                ? "bg-gray-50 border-b border-gray-200" 
                                : "bg-otc-active border-b border-otc-active"
                            )}>
                              <h4 className={cn(
                                "font-medium",
                                theme === "light" ? "text-gray-700" : "text-gray-300"
                              )}>
                                {formatOrderTypeDescription()}
                              </h4>
                            </div>
                            
                            {/* Transaction Flow */}
                            <div className="px-4 py-5 space-y-6">
                              <div className="flex flex-col space-y-6">
                                <div className="flex justify-between items-center">
                                  <div className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                                    {t('youPay')}:
                                  </div>
                                  <div className={cn(
                                    "font-medium text-lg",
                                    theme === "light" ? "text-gray-900" : "text-white"
                                  )}>
                                    {getCurrencySymbol(calculationResult.fromCurrency)}{calculationResult.youPay} {calculationResult.fromCurrency}
                                  </div>
                                </div>
                                
                                <div className="flex justify-center relative">
                                  <div className={cn(
                                    "absolute left-0 right-0 top-1/2 border-t border-dashed",
                                    theme === "light" ? "border-gray-300" : "border-gray-600"
                                  )}></div>
                                  <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center z-10",
                                    theme === "light" ? "bg-blue-50 text-blue-600" : "bg-otc-primary/20 text-otc-primary"
                                  )}>
                                    <ArrowRight className="h-5 w-5" />
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <div className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                                    {t('youReceive')}:
                                  </div>
                                  <div className={cn(
                                    "font-medium text-xl",
                                    theme === "light" ? "text-green-600" : "text-green-400"
                                  )}>
                                    {getCurrencySymbol(calculationResult.toCurrency)}{calculationResult.youReceive} {calculationResult.toCurrency}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Calculation Details */}
                          <div className={cn(
                            "rounded-lg border p-4",
                            theme === "light" 
                              ? "bg-gray-50 border-gray-200" 
                              : "bg-otc-active/30 border-otc-active"
                          )}>
                            <h4 className={cn(
                              "text-sm font-medium mb-4",
                              theme === "light" ? "text-gray-700" : "text-gray-300"
                            )}>
                              {t('calculationDetails')}
                            </h4>
                            
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                                  {t('baseExchangeRate')}:
                                </div>
                                <div className={cn(
                                  "text-right font-mono",
                                  theme === "light" ? "text-gray-800" : "text-white"
                                )}>
                                  1:{calculationResult.baseRate}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                                  {t('adjustment')} ({rateAdjustment}%):
                                </div>
                                <div className={cn(
                                  "text-right font-mono",
                                  rateAdjustment > 0 
                                    ? "text-green-600" 
                                    : rateAdjustment < 0 
                                      ? "text-red-500" 
                                      : theme === "light" ? "text-gray-800" : "text-white"
                                )}>
                                  {getCurrencySymbol(calculationResult.toCurrency)}{calculationResult.adjustmentAmount}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                                  {t('serviceFee')} ({serviceFee}%):
                                </div>
                                <div className={cn(
                                  "text-right font-mono",
                                  theme === "light" ? "text-gray-800" : "text-white"
                                )}>
                                  {getCurrencySymbol(calculationResult.toCurrency)}{calculationResult.serviceFeeAmount}
                                </div>
                              </div>
                              
                              <div className={cn(
                                "grid grid-cols-2 gap-2 pt-2 mt-2",
                                theme === "light"
                                  ? "border-t border-gray-200"
                                  : "border-t border-otc-active"
                              )}>
                                <div className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                                  {t('finalRate')}:
                                </div>
                                <div className={cn(
                                  "text-right font-mono font-medium",
                                  theme === "light" ? "text-blue-600" : "text-otc-primary"
                                )}>
                                  1:{calculationResult.finalRate}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <Button
                              type="button"
                              onClick={() => setCurrentStep(2)}
                              variant={theme === "light" ? "gradient" : "default"}
                              className={cn(
                                "w-full py-6 text-lg group",
                                theme === "light"
                                  ? ""
                                  : "bg-otc-primary text-black hover:bg-otc-primary/90"
                              )}
                            >
                              <span className="flex items-center gap-2">
                                {t('continue')}
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Step 2 - Additional Details */}
            {currentStep === 2 && (
              <>
                {/* Order Lifetime - Step 5 with Date Picker */}
                <div className="space-y-4">
                  <div className="flex items-center mb-2 gap-3">
                    <Calendar className={cn(
                      "w-5 h-5",
                      theme === "light" ? "text-blue-600" : "text-otc-primary"
                    )} />
                    <Label className={cn(
                      "text-lg font-medium",
                      theme === "light" ? "text-gray-800" : "text-white"
                    )}>
                      {t('expiryDate')}
                    </Label>
                  </div>
                  <div className="space-y-3">
                    <p className={cn(
                      "text-sm",
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    )}>
                      {language === 'en' 
                        ? 'Order starts today and expires on the selected date:' 
                        : 'Заявка создается сегодня и истекает в выбранную дату:'}
                    </p>
                    <EnhancedDatePicker 
                      date={expiryDate}
                      setDate={(date) => date && setExpiryDate(date)}
                      placeholder={t('selectWhenExpires')}
                      className={cn(
                        "w-full",
                        theme === "light" 
                          ? "bg-white border-gray-300 text-gray-900" 
                          : "bg-otc-active border-otc-active text-white"
                      )}
                    />
                    <p className={cn(
                      "text-sm",
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    )}>
                      {language === 'en' ? 'Created: ' : 'Создан: '}{new Date().toLocaleDateString()} · 
                      {language === 'en' ? ' Expires: ' : ' Истекает: '}{expiryDate?.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator className={theme === "light" ? "bg-gray-200" : "bg-otc-active"} />

                {/* Geography (Country/City) */}
                <div className="space-y-4">
                  <div className="flex items-center mb-2 gap-3">
                    <Globe className={cn(
                      "w-5 h-5",
                      theme === "light" ? "text-blue-600" : "text-otc-primary"
                    )} />
                    <Label className={cn(
                      "text-lg font-medium",
                      theme === "light" ? "text-gray-800" : "text-white"
                    )}>
                      {t('geography')}
                    </Label>
                  </div>
                  
                  {/* Country (Required) */}
                  <div className="space-y-2">
                    <Label htmlFor="country" className={cn(
                      "flex items-center",
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    )}>
                      {t('country')} <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select value={country} onValueChange={(value) => {
                      setCountry(value);
                      setCity(""); // Reset city when country changes
                    }}>
                      <SelectTrigger
                        id="country"
                        className={cn(
                          theme === "light"
                            ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                            : "bg-otc-active border-otc-active text-white"
                        )}
                      >
                        <SelectValue placeholder={t('selectCountry')} />
                      </SelectTrigger>
                      <SelectContent
                        className={cn(
                          "max-h-[300px]",
                          theme === "light"
                            ? "bg-white border-gray-200"
                            : "bg-otc-card border-otc-active"
                        )}
                      >
                        {countries.map((countryItem) => (
                          <SelectItem
                            key={countryItem.code}
                            value={countryItem.code}
                            className={theme === "light" ? "hover:bg-gray-100" : "hover:bg-otc-active"}
                          >
                            {countryItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* City (Required for cash pairs, optional for others) */}
                  {country && (
                    <div className="space-y-2">
                      <Label htmlFor="city" className={cn(
                        "flex items-center",
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      )}>
                        {t('city')}
                        {isCashPair() && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <Select value={city} onValueChange={setCity}>
                        <SelectTrigger
                          id="city"
                          className={cn(
                            theme === "light"
                              ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                              : "bg-otc-active border-otc-active text-white"
                          )}
                        >
                          <SelectValue placeholder={t('selectCity')} />
                        </SelectTrigger>
                        <SelectContent
                          className={cn(
                            "max-h-[300px]",
                            theme === "light"
                              ? "bg-white border-gray-200"
                              : "bg-otc-card border-otc-active"
                          )}
                        >
                          {getCitiesForCountry().map((cityItem) => (
                            <SelectItem
                              key={cityItem}
                              value={cityItem}
                              className={theme === "light" ? "hover:bg-gray-100" : "hover:bg-otc-active"}
                            >
                              {cityItem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Separator className={theme === "light" ? "bg-gray-200" : "bg-otc-active"} />

                {/* Purpose (conditional) */}
                {!isCashPair() && (
                  <div className="space-y-3">
                    <div className="flex items-center mb-2 gap-3">
                      <CreditCard className={cn(
                        "w-5 h-5",
                        theme === "light" ? "text-blue-600" : "text-otc-primary"
                      )} />
                      <Label htmlFor="purpose" className={cn(
                        "text-lg font-medium",
                        theme === "light" ? "text-gray-800" : "text-white"
                      )}>
                        {t('paymentPurpose')}
                      </Label>
                    </div>
                    <Input
                      id="purpose"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder={t('purposeExample')}
                      className={cn(
                        theme === "light"
                          ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                          : "bg-otc-active border-otc-active text-white"
                      )}
                    />
                  </div>
                )}

                {/* Additional Notes */}
                <div className="space-y-3">
                  <div className="flex items-center mb-2 gap-3">
                    <FileText className={cn(
                      "w-5 h-5",
                      theme === "light" ? "text-blue-600" : "text-otc-primary"
                    )} />
                    <Label htmlFor="notes" className={cn(
                      "text-lg font-medium",
                      theme === "light" ? "text-gray-800" : "text-white"
                    )}>
                      {t('additionalNotes')}
                    </Label>
                  </div>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('notesPlaceholder')}
                    className={cn(
                      "min-h-[120px]",
                      theme === "light"
                        ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                        : "bg-otc-active border-otc-active text-white"
                    )}
                  />
                </div>

                {/* Order Summary */}
                {calculationResult && (
                  <div className={cn(
                    "mt-6 rounded-lg overflow-hidden border shadow-md animate-fade-in",
                    theme === "light"
                      ? "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200"
                      : "bg-gradient-to-br from-otc-primary/10 to-otc-primary/5 border-otc-primary/20"
                  )}>
                    <div className={cn(
                      "px-4 py-3 border-b",
                      theme === "light" 
                        ? "bg-blue-100/50 border-blue-200" 
                        : "bg-otc-primary/20 border-otc-primary/30"
                    )}>
                      <h3 className={cn(
                        "text-lg font-semibold",
                        theme === "light" ? "text-blue-800" : "text-otc-primary"
                      )}>
                        {t('orderSummary')}
                      </h3>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <div className={cn(
                        "rounded-lg p-4 border",
                        theme === "light" 
                          ? "bg-white border-gray-200" 
                          : "bg-otc-active/20 border-otc-active/40"
                      )}>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                              {t('youPay')}:
                            </span>
                            <span className={cn(
                              "font-medium",
                              theme === "light" ? "text-gray-900" : "text-white"
                            )}>
                              {getCurrencySymbol(calculationResult.fromCurrency)}{calculationResult.youPay} {calculationResult.fromCurrency}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                              {t('youReceive')}:
                            </span>
                            <span className={cn(
                              "font-medium",
                              theme === "light" ? "text-green-600" : "text-green-400"
                            )}>
                              {getCurrencySymbol(calculationResult.toCurrency)}{calculationResult.youReceive} {calculationResult.toCurrency}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                              {t('exchangeRate')}:
                            </span>
                            <span className={cn(
                              "font-medium",
                              theme === "light" ? "text-blue-600" : "text-otc-primary"
                            )}>
                              1:{calculationResult.finalRate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "flex-1 py-6",
                theme === "light"
                  ? "border-gray-300 hover:bg-gray-100 text-gray-700"
                  : "border-otc-active hover:bg-otc-active/30 text-white"
              )}
              onClick={() => currentStep === 1 ? window.history.back() : setCurrentStep(1)}
            >
              {currentStep === 1 ? t('cancel') : language === 'en' ? 'Back' : 'Назад'}
            </Button>
            
            {currentStep === 2 ? (
              <Button
                type="submit"
                variant={theme === "light" ? "gradient" : "default"}
                className={cn(
                  "flex-1 py-6 group",
                  theme === "light"
                    ? ""
                    : "bg-otc-primary text-black hover:bg-otc-primary/90"
                )}
                disabled={isSubmitting || !selectedPair || !amount || !country || (isCashPair() && !city)}
              >
                <span className="flex items-center gap-2">
                  {isSubmitting ? t('creatingOrder') : t('createOrder')}
                  {!isSubmitting && (
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  )}
                </span>
              </Button>
            ) : (
              <Button
                type="button"
                variant={theme === "light" ? "gradient" : "default"}
                className={cn(
                  "flex-1 py-6",
                  theme === "light"
                    ? ""
                    : "bg-otc-primary text-black hover:bg-otc-primary/90"
                )}
                onClick={calculateOrder}
                disabled={!selectedPair || !amount || parseFloat(amount) <= 0}
              >
                {t('calculateSummary')}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
