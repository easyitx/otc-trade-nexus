import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tradePairs } from "@/data/mockData";
import TransactionSummary from "./TransactionSummary";
import { Calculator } from "lucide-react";

interface BasicDetailsStepProps {
  formProps: any;
}

export default function BasicDetailsStep({ formProps }: BasicDetailsStepProps) {
  const {
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
    selectedPairInfo,
    showCalculation,
    setShowCalculation,
    formatRate,
    applyRateSourceToFixed,
    calculateOrder,
    formatOrderTypeDescription,
    theme,
    t,
    calculationResult,
    availableSources,
    autoCalculate,
    getCurrencySymbol,
    setCurrentStep,
    safeParseFloat
  } = formProps;

  // Group pairs for easier selection
  const groupedPairs: Record<string, any[]> = {};
  tradePairs.forEach((pair) => {
    if (!groupedPairs[pair.group]) {
      groupedPairs[pair.group] = [];
    }
    groupedPairs[pair.group].push(pair);
  });

  // Sort available sources to ensure CBR is first
  const sortedSources = [...(availableSources || [])].sort((a, b) => {
    if (a === "CBR") return -1;
    if (b === "CBR") return 1;
    return a.localeCompare(b);
  });

  const handleRateTypeChange = (type: "dynamic" | "fixed") => {
    setRateType(type);
    setShowCalculation(false);
  };

  // Format number input with commas
  const formatNumberWithCommas = (value: string) => {
    // Remove existing commas
    const sanitized = value.replace(/,/g, '');
    // Check if it's a valid number
    if (isNaN(parseFloat(sanitized))) {
      return '';
    }
    // Format with commas for thousands
    return new Intl.NumberFormat().format(parseFloat(sanitized));
  };

  // Helper to check if amount is valid for enabling calculate button
  const isAmountValid = () => {
    if (!amount) return false;
    const sanitized = amount.toString().replace(/,/g, '');
    const parsed = parseFloat(sanitized);
    return !isNaN(parsed) && parsed > 0;
  };

  return (
    <div className="space-y-6">
      {/* Currency pair selection */}
      <Card className={theme === "light" ? "" : "bg-otc-card border-otc-active"}>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pair-group">{t("tradingPair")}</Label>
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger
                id="pair-group"
                className={theme === "light" ? "" : "bg-otc-active border-otc-active"}
              >
                <SelectValue placeholder={t("selectTradingPair")} />
              </SelectTrigger>
              <SelectContent className={theme === "light" ? "" : "bg-otc-card border-otc-active"}>
                {Object.keys(groupedPairs).map((group) => (
                  <React.Fragment key={group}>
                    <div className="px-2 py-1.5 text-sm font-semibold">
                      {group === "RUB_NR"
                        ? t("rubNonCash")
                        : group === "RUB_CASH"
                        ? t("rubCash")
                        : t("tokenized")}
                    </div>
                    {groupedPairs[group].map((pair) => (
                      <SelectItem key={pair.id} value={pair.id}>
                        {pair.displayName}
                      </SelectItem>
                    ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPairInfo && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order-type">{t("orderType")}</Label>
                  <Select value={orderType} onValueChange={setOrderType}>
                    <SelectTrigger
                      id="order-type"
                      className={theme === "light" ? "" : "bg-otc-active border-otc-active"}
                    >
                      <SelectValue placeholder={t("selectOrderType")} />
                    </SelectTrigger>
                    <SelectContent className={theme === "light" ? "" : "bg-otc-card border-otc-active"}>
                      <SelectItem value="BUY">{t("buy")}</SelectItem>
                      <SelectItem value="SELL">{t("sell")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {formatOrderTypeDescription()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {t("amount")} ({amountCurrency})
                  </Label>
                  <Input
                    id="amount"
                    type="text"
                    value={amount}
                    onChange={(e) => {
                      const formatted = formatNumberWithCommas(e.target.value);
                      setAmount(formatted);
                      setShowCalculation(false);
                    }}
                    className={theme === "light" ? "" : "bg-otc-active border-otc-active"}
                    placeholder="500,000.00"
                  />
                  <p className="text-sm text-muted-foreground">
                    {t("minAmount")}: 500,000 {amountCurrency}
                  </p>
                </div>
              </div>

              {/* Rate Source Selection */}
              <div className="space-y-2">
                <Label htmlFor="rate-source">{t("rateSource")}</Label>
                <Select 
                  value={rateSource} 
                  onValueChange={(value) => {
                    if (rateType === "fixed") {
                      applyRateSourceToFixed(value);
                    } else {
                      setRateSource(value);
                      setShowCalculation(false);
                    }
                  }}
                >
                  <SelectTrigger
                    id="rate-source"
                    className={theme === "light" ? "" : "bg-otc-active border-otc-active"}
                  >
                    <SelectValue placeholder={t("selectRateSource")} />
                  </SelectTrigger>
                  <SelectContent className={theme === "light" ? "" : "bg-otc-card border-otc-active"}>
                    {sortedSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {t("currentRate")}: {formatRate()}
                </p>
              </div>

              {/* Rate Type Selection */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rate-type-toggle">
                    {t("rateType")}:{" "}
                    <span className="font-medium">
                      {rateType === "dynamic" ? t("dynamic") : t("fixed")}
                    </span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <span
                      className={cn(
                        "text-sm",
                        rateType === "dynamic" ? "font-medium" : "text-muted-foreground"
                      )}
                    >
                      {t("dynamic")}
                    </span>
                    <Switch
                      id="rate-type-toggle"
                      checked={rateType === "fixed"}
                      onCheckedChange={(checked) =>
                        handleRateTypeChange(checked ? "fixed" : "dynamic")
                      }
                    />
                    <span
                      className={cn(
                        "text-sm",
                        rateType === "fixed" ? "font-medium" : "text-muted-foreground"
                      )}
                    >
                      {t("fixed")}
                    </span>
                  </div>
                </div>

                {rateType === "dynamic" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="rate-adjustment">
                          {t("rateAdjustment")}:{" "}
                          <span
                            className={
                              rateAdjustment > 0
                                ? "text-green-500"
                                : rateAdjustment < 0
                                ? "text-red-500"
                                : ""
                            }
                          >
                            {rateAdjustment > 0 ? "+" : ""}
                            {rateAdjustment}%
                          </span>
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {t("serviceFee")}: +{serviceFee}%
                        </span>
                      </div>
                      <Slider
                        id="rate-adjustment"
                        defaultValue={[0]}
                        value={[rateAdjustment]}
                        onValueChange={(values) => {
                          setRateAdjustment(values[0]);
                          setShowCalculation(false);
                        }}
                        min={-10}
                        max={10}
                        step={0.1}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>-10%</span>
                        <span>0%</span>
                        <span>+10%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="custom-rate">{t("customRate")}</Label>
                    <Input
                      id="custom-rate"
                      type="number"
                      step="0.000001"
                      min="0.000001"
                      value={customRateValue}
                      onChange={(e) => {
                        setCustomRateValue(e.target.value);
                        setShowCalculation(false);
                      }}
                      className={theme === "light" ? "" : "bg-otc-active border-otc-active"}
                      placeholder="0.000000"
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={calculateOrder}
                    className={cn(
                      "gap-2",
                      theme === "light" ? "bg-primary" : "bg-otc-primary text-black"
                    )}
                    disabled={!selectedPairInfo || !isAmountValid()}
                  >
                    <Calculator className="h-4 w-4" />
                    {t("calculate")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      {showCalculation && calculationResult && (
        <TransactionSummary 
          calculationResult={calculationResult} 
          theme={theme} 
          t={t} 
          getCurrencySymbol={getCurrencySymbol} 
          setCurrentStep={setCurrentStep}
        />
      )}
    </div>
  );
}
