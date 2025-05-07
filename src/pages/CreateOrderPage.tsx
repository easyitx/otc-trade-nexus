
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
  const { t } = useLanguage();
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
  const [orderLifetime, setOrderLifetime] = useState<number>(7); // Default 7 days
  const [purpose, setPurpose] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [selectedPairInfo, setSelectedPairInfo] = useState<any>(null);

  const form = useForm({
    defaultValues: {
      rateAdjustment: 0,
      orderLifetime: 7,
    }
  });

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
      }
    } else {
      setSelectedPairInfo(null);
    }
  }, [selectedPair]);

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
      return `Buy ${selectedPairInfo.baseCurrency} with ${selectedPairInfo.quoteCurrency}`;
    } else {
      return `Sell ${selectedPairInfo.baseCurrency} for ${selectedPairInfo.quoteCurrency}`;
    }
  };

  // Calculate expiry date based on order lifetime (days)
  const calculateExpiryDate = (): Date => {
    const date = new Date();
    date.setDate(date.getDate() + orderLifetime);
    return date;
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
    // Only include user adjustment and service fee (removed platform adjustment)
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

    const expiryDate = calculateExpiryDate();

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
                Order Created Successfully
              </h2>
              <p className={cn(
                "mb-6",
                theme === "light" ? "text-gray-600" : "text-muted-foreground"
              )}>
                Your order has been submitted and is now active.
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
                  Create Another Order
                </Button>
                <Button
                  className={cn(
                    theme === "light"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-otc-primary text-black hover:bg-otc-primary/90"
                  )}
                  asChild
                >
                  <a href="/orders">View All Orders</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={cn(
            "text-2xl font-bold",
            theme === "light" ? "text-gray-900" : "text-white"
          )}>Create New Order</h1>
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
          <AlertTitle>Minimum Order Size</AlertTitle>
          <AlertDescription>
            Minimum order amount for OTC operations is 500,000 USD.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          <Card className={cn(
            theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
          )}>
            <CardHeader>
              <CardTitle className={theme === "light" ? "text-gray-900" : "text-white"}>
                Order Details
              </CardTitle>
              <CardDescription className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                Enter the details of your order below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trading Pair - Step 1 */}
              <div className="space-y-2">
                <Label
                  htmlFor="tradingPair"
                  className={theme === "light" ? "text-gray-800" : "text-white"}
                >
                  Trading Pair <span className="text-red-500">*</span>
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
                    <SelectValue placeholder="Select a trading pair" />
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
                          {group}
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
                      Order Type <span className="text-red-500">*</span>
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
                              Buy {selectedPairInfo.baseCurrency}
                            </div>
                            <div className={cn(
                              "text-sm mt-1",
                              theme === "light" ? "text-gray-600" : "text-gray-400"
                            )}>
                              Pay with {selectedPairInfo.quoteCurrency}
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
                              Sell {selectedPairInfo.baseCurrency}
                            </div>
                            <div className={cn(
                              "text-sm mt-1",
                              theme === "light" ? "text-gray-600" : "text-gray-400"
                            )}>
                              Receive {selectedPairInfo.quoteCurrency}
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                  </div>

                  {/* Amount - Step 3 */}
                  <div className="space-y-2">
                    <Label htmlFor="amount" className={theme === "light" ? "text-gray-800" : "text-white"}>
                      Amount <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex space-x-3">
                      <div className="relative flex-grow">
                        <Input
                          id="amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Minimum 500,000"
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
                          {amountCurrency === "USD" ? "$" : 
                           amountCurrency === "EUR" ? "€" : 
                           amountCurrency === "RUB" ? "₽" : ""}
                        </span>
                      </div>
                      <div className="w-24">
                        <Select value={amountCurrency} onValueChange={setAmountCurrency}>
                          <SelectTrigger
                            className={cn(
                              theme === "light"
                                ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                                : "bg-otc-active border-otc-active text-white"
                            )}
                          >
                            <SelectValue placeholder="USD" />
                          </SelectTrigger>
                          <SelectContent className={cn(
                            theme === "light"
                              ? "bg-white border-gray-200"
                              : "bg-otc-card border-otc-active"
                          )}>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="RUB">RUB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Rate - Step 4 */}
                  <div className="space-y-4">
                    <Label className={theme === "light" ? "text-gray-800" : "text-white"}>Rate</Label>
                    
                    {/* Rate Type Selection */}
                    <div className="space-y-2">
                      <Label className={cn(
                        "text-sm",
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      )}>
                        Rate Type
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
                            Dynamic Rate
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
                            Fixed Rate
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
                          )}>Rate Source</Label>
                          <Select value={rateSource} onValueChange={setRateSource}>
                            <SelectTrigger
                              id="rateSource"
                              className={cn(
                                theme === "light"
                                  ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                                  : "bg-otc-active border-otc-active text-white"
                              )}
                            >
                              <SelectValue placeholder="Select source" />
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
                              Rate Adjustment: {rateAdjustment > 0 ? "+" : ""}{rateAdjustment}%
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

                    {/* Fixed Rate Input */}
                    {rateType === "fixed" && (
                      <div className="space-y-2">
                        <Label htmlFor="fixedRate" className={cn(
                          theme === "light" ? "text-gray-700" : "text-gray-300"
                        )}>
                          Enter Fixed Rate
                        </Label>
                        <Input
                          id="fixedRate"
                          value={customRateValue}
                          onChange={(e) => setCustomRateValue(e.target.value)}
                          placeholder="Enter rate value"
                          className={cn(
                            theme === "light"
                              ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                              : "bg-otc-active border-otc-active text-white"
                          )}
                        />
                      </div>
                    )}

                    {/* Rate Summary (Removed Platform Adjustment) */}
                    <div className={cn(
                      "rounded-md p-3 mt-2",
                      theme === "light"
                        ? "bg-blue-50 border border-blue-100 text-blue-800"
                        : "bg-otc-active/50 border border-otc-active text-white"
                    )}>
                      <div className="flex justify-between items-center mt-1">
                        <Label>Service Fee: </Label>
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
                        <Label>Final Rate: {formatRate()}</Label>
                      </div>
                    </div>
                  </div>

                  {/* Order Lifetime - Step 5 */}
                  <div className="space-y-4">
                    <Label className={theme === "light" ? "text-gray-800" : "text-white"}>
                      Order Lifetime
                    </Label>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={theme === "light" ? "text-gray-700" : "text-gray-300"}>
                          {orderLifetime} {orderLifetime === 1 ? "day" : "days"}
                        </span>
                      </div>
                      <Slider
                        defaultValue={[7]}
                        min={1}
                        max={30}
                        step={1}
                        value={[orderLifetime]}
                        onValueChange={(values) => setOrderLifetime(values[0])}
                        className={cn(
                          theme === "light" ? "text-blue-600" : "text-otc-primary"
                        )}
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span>1 day</span>
                        <span>15 days</span>
                        <span>30 days</span>
                      </div>
                    </div>
                    <div className={cn(
                      "text-sm",
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    )}>
                      Expires on: {calculateExpiryDate().toLocaleDateString()}
                    </div>
                  </div>

                  {/* Purpose (conditional) - Step 6 */}
                  {!isCashPair() && (
                    <div className="space-y-2">
                      <Label htmlFor="purpose" className={theme === "light" ? "text-gray-800" : "text-white"}>
                        Payment Purpose
                      </Label>
                      <Input
                        id="purpose"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="e.g. Contract Payment, Investment"
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
                      Geography
                    </Label>
                    
                    {/* Country (Required) */}
                    <div className="space-y-2">
                      <Label htmlFor="country" className={cn(
                        "text-sm",
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      )}>
                        Country <span className="text-red-500">*</span>
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
                          <SelectValue placeholder="Select country" />
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
                          City 
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
                            <SelectValue placeholder="Select city" />
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
                      Additional Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any special requirements or information"
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
                Cancel
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
                {isSubmitting ? "Creating Order..." : "Create Order"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </>
  );
}
