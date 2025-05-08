
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
import { CheckCircle, Info } from "lucide-react";
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
import { TranslationKey } from "@/types";

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const { currentUser } = useAuth();
  const { rateAdjustments, isLoading: isLoadingSettings } = usePlatformSettings();
  const { t, language } = useLanguage();
  const { theme } = useTheme();

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
    cbr: "",
    profinance: "",
    investing: "",
    xe: ""
  });

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
  }, [selectedPair]);

  // Update amount currency when order type changes
  useEffect(() => {
    if (selectedPairInfo) {
      updateAmountCurrency(selectedPairInfo, orderType);
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

  // Simulate fetching current rates (in a real app, this would come from an API)
  useEffect(() => {
    // Mock data for demonstration
    setCurrentRates({
      cbr: "90.50",
      profinance: "91.25",
      investing: "90.75",
      xe: "91.00"
    });
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Validate required fields
    if (!selectedPair || !amount || !country || (isCashPair() && !city)) {
      alert("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    // Validate minimum amount (500,000 USD)
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount < 500000) {
      alert("Minimum order amount is 500,000 USD");
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
      <>
        <div className="flex items-center justify-center h-full">
          <Card className={cn(
            "w-full max-w-2xl",
            theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
          )}>
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                theme === "light" ? "bg-green-50" : "bg-green-900/20"
              )}>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className={cn(
                "text-2xl font-bold mb-2",
                theme === "light" ? "text-gray-900" : "text-white"
              )}>
                {t('orderCreatedSuccess')}
              </h2>
              <p className={cn(
                "mb-6",
                theme === "light" ? "text-gray-600" : "text-muted-foreground"
              )}>
                {t('orderSubmitted')}
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  className={cn(
                    theme === "light"
                      ? "border-gray-300 hover:bg-gray-100 text-gray-700"
                      : "border-otc-active hover:bg-otc-active/30 text-white"
                  )}
                  onClick={() => setIsSuccess(false)}
                >
                  {t('createAnotherOrder')}
                </Button>
                <Button
                  className={cn(
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
      </>
    );
  }

  // Helper to get currency symbol
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={cn(
            "text-2xl font-bold",
            theme === "light" ? "text-gray-900" : "text-white"
          )}>{t('createNewOrder')}</h1>
        </div>

        <Alert className={cn(
          theme === "light"
            ? "bg-blue-50 border-blue-200 text-blue-800"
            : "bg-otc-secondary/20 border-otc-icon text-white"
        )}>
          <Info className={cn(
            "h-4 w-4",
            theme === "light" ? "text-blue-600" : "text-otc-icon"
          )} />
          <AlertTitle>{t('minOrderSize')}</AlertTitle>
          <AlertDescription>
            {t('otcMinimumReq')}
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          <Card className={cn(
            theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
          )}>
            <CardHeader>
              <CardTitle className={theme === "light" ? "text-gray-900" : "text-white"}>
                {t('orderDetails')}
              </CardTitle>
              <CardDescription className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                {t('enterOrderDetails')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trading Pair - Step 1 */}
              <div className="space-y-2">
                <Label
                  htmlFor="tradingPair"
                  className={theme === "light" ? "text-gray-800" : "text-white"}
                >
                  {t('tradingPair')} <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedPair} onValueChange={setSelectedPair}>
                  <SelectTrigger
                    id="tradingPair"
                    className={cn(
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
                          "px-2 py-1.5 text-xs font-medium uppercase",
                          theme === "light" ? "text-gray-500" : "text-gray-400"
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
                  {/* Order Type - Step 2 (Now user selectable) */}
                  <div className="space-y-2">
                    <Label className={theme === "light" ? "text-gray-800" : "text-white"}>
                      {t('orderType')} <span className="text-red-500">*</span>
                    </Label>
                    
                    {selectedPairInfo && (
                      <RadioGroup
                        value={orderType}
                        onValueChange={setOrderType}
                        className="flex flex-col space-y-2"
                      >
                        <div className={cn(
                          "flex items-center space-x-3 rounded-md p-3",
                          theme === "light" 
                            ? "bg-gray-50 border border-gray-200" 
                            : "bg-otc-active/30 border border-otc-active"
                        )}>
                          <RadioGroupItem 
                            value="BUY" 
                            id="buy-option"
                            className={cn(
                              theme === "light"
                                ? "border-gray-300 text-blue-600"
                                : "border-otc-active text-otc-primary"
                            )}
                          />
                          <Label 
                            htmlFor="buy-option" 
                            className={cn(
                              "cursor-pointer flex-1",
                              theme === "light" ? "text-gray-800" : "text-white"
                            )}
                          >
                            <div className="font-medium">
                              {t('buy')} {selectedPairInfo.baseCurrency}
                            </div>
                            <div className={cn(
                              "text-sm mt-1",
                              theme === "light" ? "text-gray-600" : "text-gray-400"
                            )}>
                              {t('with')} {selectedPairInfo.quoteCurrency}
                            </div>
                          </Label>
                        </div>
                        
                        <div className={cn(
                          "flex items-center space-x-3 rounded-md p-3",
                          theme === "light" 
                            ? "bg-gray-50 border border-gray-200" 
                            : "bg-otc-active/30 border border-otc-active"
                        )}>
                          <RadioGroupItem 
                            value="SELL" 
                            id="sell-option"
                            className={cn(
                              theme === "light"
                                ? "border-gray-300 text-blue-600"
                                : "border-otc-active text-otc-primary"
                            )}
                          />
                          <Label 
                            htmlFor="sell-option" 
                            className={cn(
                              "cursor-pointer flex-1",
                              theme === "light" ? "text-gray-800" : "text-white"
                            )}
                          >
                            <div className="font-medium">
                              {t('sell')} {selectedPairInfo.baseCurrency}
                            </div>
                            <div className={cn(
                              "text-sm mt-1",
                              theme === "light" ? "text-gray-600" : "text-gray-400"
                            )}>
                              {t('for')} {selectedPairInfo.quoteCurrency}
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                  </div>

                  {/* Amount - Step 3 */}
                  <div className="space-y-2">
                    <Label htmlFor="amount" className={theme === "light" ? "text-gray-800" : "text-white"}>
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
                            "pl-8",
                            theme === "light"
                              ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                              : "bg-otc-active border-otc-active text-white"
                          )}
                        />
                        <span className={cn(
                          "absolute left-3 top-1/2 transform -translate-y-1/2",
                          theme === "light" ? "text-gray-500" : "text-gray-400"
                        )}>
                          {getCurrencySymbol(amountCurrency)}
                        </span>
                      </div>
                      <div className="w-24">
                        <div className={cn(
                          "h-10 px-3 flex items-center justify-center rounded-md border",
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
                        "text-sm mt-1",
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      )}>
                        {orderType === "BUY" 
                          ? `${t('amount')} ${t('in')} ${selectedPairInfo.quoteCurrency}`
                          : `${t('amount')} ${t('in')} ${selectedPairInfo.baseCurrency}`}
                      </p>
                    )}
                  </div>

                  {/* Rate - Step 4 */}
                  <div className="space-y-4">
                    <Label className={theme === "light" ? "text-gray-800" : "text-white"}>{t('rate')}</Label>
                    
                    {/* Rate Type Selection */}
                    <div className="space-y-2">
                      <Label className={cn(
                        "text-sm",
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      )}>
                        {t('rateType')}
                      </Label>
                      <RadioGroup
                        value={rateType}
                        onValueChange={(value) => setRateType(value as "dynamic" | "fixed")}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
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
                            {language === 'en' ? 'Dynamic Rate' : 'Динамический курс'}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
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
                            {language === 'en' ? 'Fixed Rate' : 'Фиксированный курс'}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Dynamic Rate Options */}
                    {rateType === "dynamic" && (
                      <>
                        {/* Rate Source */}
                        <div>
                          <Label htmlFor="rateSource" className={cn(
                            "text-sm mb-1 block",
                            theme === "light" ? "text-gray-600" : "text-gray-400"
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
                              <SelectItem
                                value="cbr"
                                className={theme === "light" ? "hover:bg-gray-100" : "hover:bg-otc-active"}
                              >
                                ЦБ (CBR)
                              </SelectItem>
                              <SelectItem
                                value="profinance"
                                className={theme === "light" ? "hover:bg-gray-100" : "hover:bg-otc-active"}
                              >
                                Profinance (PF)
                              </SelectItem>
                              <SelectItem
                                value="investing"
                                className={theme === "light" ? "hover:bg-gray-100" : "hover:bg-otc-active"}
                              >
                                Investing (IV)
                              </SelectItem>
                              <SelectItem
                                value="xe"
                                className={theme === "light" ? "hover:bg-gray-100" : "hover:bg-otc-active"}
                              >
                                XE
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Rate Adjustment Slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className={cn(
                              theme === "light" ? "text-gray-700" : "text-gray-300"
                            )}>
                              {t('rate')} {t('adjustment')}: {rateAdjustment > 0 ? "+" : ""}{rateAdjustment}%
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
                              theme === "light" ? "text-blue-600" : "text-otc-primary"
                            )}
                          />
                          <div className="flex justify-between text-xs mt-1">
                            <span>-5%</span>
                            <span>0%</span>
                            <span>+5%</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Fixed Rate Input with Source Selection */}
                    {rateType === "fixed" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className={cn(
                            "text-sm mb-1 block",
                            theme === "light" ? "text-gray-600" : "text-gray-400"
                          )}>
                            {language === 'en' ? 'Select Rate Source' : 'Выбрать источник курса'}
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              type="button"
                              size="sm" 
                              variant={theme === "light" ? "outline" : "secondary"}
                              onClick={() => applyRateSourceToFixed("cbr")}
                              className={cn(
                                theme === "light" 
                                  ? "border-gray-200 bg-white" 
                                  : "border-otc-active bg-otc-active"
                              )}
                            >
                              ЦБ: {currentRates.cbr || "N/A"}
                            </Button>
                            <Button 
                              type="button"
                              size="sm" 
                              variant={theme === "light" ? "outline" : "secondary"}
                              onClick={() => applyRateSourceToFixed("profinance")}
                              className={cn(
                                theme === "light" 
                                  ? "border-gray-200 bg-white" 
                                  : "border-otc-active bg-otc-active"
                              )}
                            >
                              PF: {currentRates.profinance || "N/A"}
                            </Button>
                            <Button 
                              type="button"
                              size="sm" 
                              variant={theme === "light" ? "outline" : "secondary"}
                              onClick={() => applyRateSourceToFixed("investing")}
                              className={cn(
                                theme === "light" 
                                  ? "border-gray-200 bg-white" 
                                  : "border-otc-active bg-otc-active"
                              )}
                            >
                              IV: {currentRates.investing || "N/A"}
                            </Button>
                            <Button 
                              type="button"
                              size="sm" 
                              variant={theme === "light" ? "outline" : "secondary"}
                              onClick={() => applyRateSourceToFixed("xe")}
                              className={cn(
                                theme === "light" 
                                  ? "border-gray-200 bg-white" 
                                  : "border-otc-active bg-otc-active"
                              )}
                            >
                              XE: {currentRates.xe || "N/A"}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fixedRate" className={cn(
                            theme === "light" ? "text-gray-700" : "text-gray-300"
                          )}>
                            {language === 'en' ? 'Fixed Rate Value (editable)' : 'Значение фиксированного курса (редактируемое)'}
                          </Label>
                          <Input
                            id="fixedRate"
                            value={customRateValue}
                            onChange={(e) => setCustomRateValue(e.target.value)}
                            placeholder={language === 'en' ? 'Enter or select rate value' : 'Введите или выберите значение курса'}
                            className={cn(
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
                      "rounded-md p-3 mt-2",
                      theme === "light"
                        ? "bg-blue-50 border border-blue-100 text-blue-800"
                        : "bg-otc-active/50 border border-otc-active text-white"
                    )}>
                      <div className="flex justify-between items-center mt-1">
                        <Label>{t('serviceFee')}: </Label>
                        <span className={cn(
                          "font-semibold",
                          theme === "light" ? "text-blue-600" : "text-otc-primary"
                        )}>
                          {serviceFee}%
                        </span>
                      </div>
                      <div className={cn(
                        "mt-2 pt-2",
                        theme === "light"
                          ? "border-t border-blue-100"
                          : "border-t border-otc-active"
                      )}>
                        <Label>{t('finalRate')}: {formatRate()}</Label>
                      </div>
                    </div>
                  </div>

                  {/* Order Lifetime - Step 5 with Date Picker */}
                  <div className="space-y-4">
                    <Label className={theme === "light" ? "text-gray-800" : "text-white"}>
                      {t('expiryDate')}
                    </Label>
                    <div className="space-y-2">
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
                        "text-sm mt-2",
                        theme === "light" ? "text-gray-500" : "text-gray-400"
                      )}>
                        {language === 'en' ? 'Created: ' : 'Создан: '}{new Date().toLocaleDateString()} · 
                        {language === 'en' ? ' Expires: ' : ' Истекает: '}{expiryDate?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Purpose (conditional) - Step 6 */}
                  {!isCashPair() && (
                    <div className="space-y-2">
                      <Label htmlFor="purpose" className={theme === "light" ? "text-gray-800" : "text-white"}>
                        {t('paymentPurpose')}
                      </Label>
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

                  {/* Geography (Country/City) - Step 7 */}
                  <div className="space-y-4">
                    <Label className={theme === "light" ? "text-gray-800" : "text-white"}>
                      {language === 'en' ? 'Geography' : 'География'}
                    </Label>
                    
                    {/* Country (Required) */}
                    <div className="space-y-2">
                      <Label htmlFor="country" className={cn(
                        "text-sm",
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      )}>
                        {language === 'en' ? 'Country' : 'Страна'} <span className="text-red-500">*</span>
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
                          <SelectValue placeholder={language === 'en' ? 'Select country' : 'Выберите страну'} />
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
                          "text-sm flex items-center",
                          theme === "light" ? "text-gray-700" : "text-gray-300"
                        )}>
                          {language === 'en' ? 'City' : 'Город'} 
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
                            <SelectValue placeholder={language === 'en' ? 'Select city' : 'Выберите город'} />
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

                  {/* Additional Notes - Step 8 */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className={theme === "light" ? "text-gray-800" : "text-white"}>
                      {t('additionalNotes')}
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('notesPlaceholder')}
                      className={cn(
                        "min-h-[100px]",
                        theme === "light"
                          ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                          : "bg-otc-active border-otc-active text-white"
                      )}
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                className={cn(
                  theme === "light"
                    ? "border-gray-300 hover:bg-gray-100 text-gray-700"
                    : "border-otc-active hover:bg-otc-active/30 text-white"
                )}
                onClick={() => window.history.back()}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                className={cn(
                  theme === "light"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-otc-primary text-black hover:bg-otc-primary/90"
                )}
                disabled={isSubmitting || !selectedPair || !amount || !country || (isCashPair() && !city)}
              >
                {isSubmitting ? t('creatingOrder') : t('createOrder')}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </>
  );
}
