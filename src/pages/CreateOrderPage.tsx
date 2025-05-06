
import { useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
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
import { ExchangeRates } from "@/components/ExchangeRates";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const { currentUser } = useAuth();
  const { rateAdjustments, isLoading: isLoadingSettings } = usePlatformSettings();
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const [orderType, setOrderType] = useState<string>("BUY");
  const [selectedPair, setSelectedPair] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [rateSource, setRateSource] = useState<string>("cbr");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [purpose, setPurpose] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  // Group trade pairs by category
  const groupedPairs: Record<string, typeof tradePairs> = tradePairs.reduce((groups, pair) => {
    const group = pair.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(pair);
    return groups;
  }, {} as Record<string, typeof tradePairs>);

  // Get rate adjustment based on selected source
  const getAdjustmentPercent = () => {
    if (isLoadingSettings) return 0;
    return rateAdjustments[rateSource as keyof typeof rateAdjustments] || 0;
  };
  
  // Format rate string based on selected source and fixed adjustment
  const formatRate = () => {
    const sourceMap = {
      "cbr": "ЦБ",
      "profinance": "PF",
      "investing": "IV",
      "xe": "XE"
    };
    
    const sourceName = sourceMap[rateSource as keyof typeof sourceMap] || rateSource;
    const adjustment = getAdjustmentPercent();
    
    if (adjustment === 0) return sourceName;
    
    const sign = adjustment > 0 ? "+" : "";
    return `${sourceName}${sign}${adjustment}%`;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Validate minimum amount (500,000 USD)
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount < 500000) {
      alert(t("otcMinimumReq"));
      setIsSubmitting(false);
      return;
    }

    const { error } = await createOrder({
      type: orderType as "BUY" | "SELL",
      amount: parsedAmount,
      rate: formatRate(),
      expiresAt: expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      purpose: purpose || undefined,
      notes: notes || undefined,
      status: "ACTIVE"
    });

    if (!error) {
      setIsSuccess(true);
    }
    
    setIsSubmitting(false);
  };
  
  if (isSuccess) {
    return (
      <MainLayout>
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
              )}>{t("orderCreatedSuccess")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("orderSubmitted")}
              </p>
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  className={cn(
                    theme === "light" 
                      ? "border-gray-200 hover:bg-gray-50 text-gray-700" 
                      : "border-otc-active hover:bg-otc-active text-white"
                  )}
                  onClick={() => setIsSuccess(false)}
                >
                  {t("createAnotherOrder")}
                </Button>
                <Button 
                  className={cn(
                    theme === "light" 
                      ? "bg-primary text-white hover:bg-primary/90" 
                      : "bg-otc-primary text-black hover:bg-otc-primary/90"
                  )}
                  asChild
                >
                  <a href="/orders">{t("viewAllOrders")}</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <ExchangeRates className="max-w-7xl mx-auto mb-6" />
        </div>
      
        <div className="flex items-center justify-between">
          <h1 className={cn(
            "text-2xl font-bold",
            theme === "light" ? "text-gray-900" : "text-white"
          )}>{t("createNewOrder")}</h1>
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
          <AlertTitle>{t("minOrderSize")}</AlertTitle>
          <AlertDescription>
            {t("otcMinimumReq")}
          </AlertDescription>
        </Alert>
        
        <form onSubmit={handleSubmit}>
          <Card className={cn(
            theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
          )}>
            <CardHeader>
              <CardTitle className={theme === "light" ? "text-gray-900" : "text-white"}>
                {t("orderDetails")}
              </CardTitle>
              <CardDescription>
                {t("enterOrderDetails")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Type */}
              <div className="space-y-2">
                <Label className={theme === "light" ? "text-gray-800" : ""}>
                  {t("orderType")}
                </Label>
                <RadioGroup 
                  defaultValue="BUY" 
                  value={orderType}
                  onValueChange={setOrderType}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="BUY" 
                      id="buy" 
                      className={cn(
                        theme === "light" 
                          ? "border-gray-300 text-primary" 
                          : "border-otc-active text-otc-primary"
                      )} 
                    />
                    <Label 
                      htmlFor="buy" 
                      className={cn(
                        "cursor-pointer",
                        theme === "light" ? "text-gray-800" : ""
                      )}
                    >
                      {t("buy")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="SELL" 
                      id="sell" 
                      className={cn(
                        theme === "light" 
                          ? "border-gray-300 text-primary" 
                          : "border-otc-active text-otc-primary"
                      )} 
                    />
                    <Label 
                      htmlFor="sell" 
                      className={cn(
                        "cursor-pointer",
                        theme === "light" ? "text-gray-800" : ""
                      )}
                    >
                      {t("sell")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Trading Pair */}
              <div className="space-y-2">
                <Label 
                  htmlFor="tradingPair"
                  className={theme === "light" ? "text-gray-800" : ""}
                >
                  {t("tradingPair")}
                </Label>
                <Select value={selectedPair} onValueChange={setSelectedPair}>
                  <SelectTrigger 
                    id="tradingPair" 
                    className={cn(
                      theme === "light" 
                        ? "bg-white border-gray-200 text-gray-800" 
                        : "bg-otc-active border-otc-active text-white"
                    )}
                  >
                    <SelectValue placeholder={t("selectTradingPair")} />
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
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase">
                          {t(group as "RUB_NR" | "RUB_CASH" | "TOKENIZED")}
                        </div>
                        {pairs.map((pair) => (
                          <SelectItem key={pair.id} value={pair.id}>
                            {pair.displayName}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">{t("amount")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={t("minimumOrder")}
                    className="pl-8 bg-otc-active border-otc-active text-white"
                  />
                </div>
              </div>
              
              {/* Rate */}
              <div className="space-y-2">
                <Label>{t("rate")}</Label>
                <div>
                  <Label htmlFor="rateSource" className="text-sm text-muted-foreground mb-1 block">{t("rateSource")}</Label>
                  <Select value={rateSource} onValueChange={setRateSource}>
                    <SelectTrigger id="rateSource" className="bg-otc-active border-otc-active text-white">
                      <SelectValue placeholder={t("selectSource")} />
                    </SelectTrigger>
                    <SelectContent className="bg-otc-card border-otc-active">
                      <SelectItem value="cbr">ЦБ (CBR)</SelectItem>
                      <SelectItem value="profinance">Profinance (PF)</SelectItem>
                      <SelectItem value="investing">Investing (IV)</SelectItem>
                      <SelectItem value="xe">XE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-otc-active/50 rounded-md p-3 mt-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-white">{t("platformAdjustment")}: </Label>
                    <span className="text-otc-primary font-semibold">
                      {getAdjustmentPercent()}%
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-otc-active">
                    <Label className="text-white">{t("finalRate")}: {formatRate()}</Label>
                  </div>
                </div>
              </div>
              
              {/* Expiry Date */}
              <div className="space-y-2">
                <Label>{t("expiryDate")}</Label>
                <EnhancedDatePicker 
                  date={expiryDate} 
                  setDate={setExpiryDate} 
                  className="bg-otc-active border-otc-active text-white" 
                  placeholder={t("selectWhenExpires")}
                />
              </div>
              
              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose">{t("paymentPurpose")}</Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder={t("purposeExample")}
                  className="bg-otc-active border-otc-active text-white"
                />
              </div>
              
              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">{t("additionalNotes")}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("notesPlaceholder")}
                  className="bg-otc-active border-otc-active text-white min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                className={cn(
                  theme === "light" 
                    ? "border-gray-200 hover:bg-gray-50 text-gray-700" 
                    : "border-otc-active hover:bg-otc-active text-white"
                )}
                onClick={() => window.history.back()}
              >
                {t("cancel")}
              </Button>
              <Button 
                type="submit"
                className={cn(
                  theme === "light" 
                    ? "bg-primary text-white hover:bg-primary/90" 
                    : "bg-otc-primary text-black hover:bg-otc-primary/90"
                )}
                disabled={isSubmitting || !selectedPair || !amount || !rateSource}
              >
                {isSubmitting ? t("creatingOrder") : t("createOrder")}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
