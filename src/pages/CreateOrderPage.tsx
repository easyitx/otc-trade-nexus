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
                )}>{t("orderCreatedSuccess")}
                </h2>
                <p className={cn(
                    "mb-6",
                    theme === "light" ? "text-gray-600" : "text-muted-foreground"
                )}>
                  {t("orderSubmitted")}
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
                    {t("createAnotherOrder")}
                  </Button>
                  <Button
                      className={cn(
                          theme === "light"
                              ? "bg-blue-600 text-white hover:bg-blue-700"
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
                <CardDescription className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                  {t("enterOrderDetails")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Type */}
                <div className="space-y-2">
                  <Label className={theme === "light" ? "text-gray-800" : "text-white"}>
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
                                  ? "border-gray-300 text-blue-600"
                                  : "border-otc-active text-otc-primary"
                          )}
                      />
                      <Label
                          htmlFor="buy"
                          className={cn(
                              "cursor-pointer",
                              theme === "light" ? "text-gray-800" : "text-white"
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
                                  ? "border-gray-300 text-blue-600"
                                  : "border-otc-active text-otc-primary"
                          )}
                      />
                      <Label
                          htmlFor="sell"
                          className={cn(
                              "cursor-pointer",
                              theme === "light" ? "text-gray-800" : "text-white"
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
                      className={theme === "light" ? "text-gray-800" : "text-white"}
                  >
                    {t("tradingPair")}
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
                            <div className={cn(
                                "px-2 py-1.5 text-xs font-medium uppercase",
                                theme === "light" ? "text-gray-500" : "text-gray-400"
                            )}>
                              {t(group as "RUB_NR" | "RUB_CASH" | "TOKENIZED")}
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

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className={theme === "light" ? "text-gray-800" : "text-white"}>
                    {t("amount")}
                  </Label>
                  <div className="relative">
                  <span className={cn(
                      "absolute left-3 top-1/2 transform -translate-y-1/2",
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                  )}>$</span>
                    <Input
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={t("minimumOrder")}
                        className={cn(
                            "pl-8",
                            theme === "light"
                                ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                                : "bg-otc-active border-otc-active text-white"
                        )}
                    />
                  </div>
                </div>

                {/* Rate */}
                <div className="space-y-2">
                  <Label className={theme === "light" ? "text-gray-800" : "text-white"}>{t("rate")}</Label>
                  <div>
                    <Label htmlFor="rateSource" className={cn(
                        "text-sm mb-1 block",
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                    )}>{t("rateSource")}</Label>
                    <Select value={rateSource} onValueChange={setRateSource}>
                      <SelectTrigger
                          id="rateSource"
                          className={cn(
                              theme === "light"
                                  ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                                  : "bg-otc-active border-otc-active text-white"
                          )}
                      >
                        <SelectValue placeholder={t("selectSource")} />
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

                  <div className={cn(
                      "rounded-md p-3 mt-2",
                      theme === "light"
                          ? "bg-blue-50 border border-blue-100 text-blue-800"
                          : "bg-otc-active/50 border border-otc-active text-white"
                  )}>
                    <div className="flex justify-between items-center">
                      <Label>{t("platformAdjustment")}: </Label>
                      <span className={cn(
                          "font-semibold",
                          theme === "light" ? "text-blue-600" : "text-otc-primary"
                      )}>
                      {getAdjustmentPercent()}%
                    </span>
                    </div>
                    <div className={cn(
                        "mt-2 pt-2",
                        theme === "light"
                            ? "border-t border-blue-100"
                            : "border-t border-otc-active"
                    )}>
                      <Label>{t("finalRate")}: {formatRate()}</Label>
                    </div>
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <Label className={theme === "light" ? "text-gray-800" : "text-white"}>{t("expiryDate")}</Label>
                  <EnhancedDatePicker
                      date={expiryDate}
                      setDate={setExpiryDate}
                      className={cn(
                          theme === "light"
                              ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                              : "bg-otc-active border-otc-active text-white"
                      )}
                      placeholder={t("selectWhenExpires")}
                  />
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Label htmlFor="purpose" className={theme === "light" ? "text-gray-800" : "text-white"}>
                    {t("paymentPurpose")}
                  </Label>
                  <Input
                      id="purpose"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder={t("purposeExample")}
                      className={cn(
                          theme === "light"
                              ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                              : "bg-otc-active border-otc-active text-white"
                      )}
                  />
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className={theme === "light" ? "text-gray-800" : "text-white"}>
                    {t("additionalNotes")}
                  </Label>
                  <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("notesPlaceholder")}
                      className={cn(
                          "min-h-[100px]",
                          theme === "light"
                              ? "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                              : "bg-otc-active border-otc-active text-white"
                      )}
                  />
                </div>
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
                  {t("cancel")}
                </Button>
                <Button
                    type="submit"
                    className={cn(
                        theme === "light"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
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
      </>
  );
}