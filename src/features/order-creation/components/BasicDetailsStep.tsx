
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { TranslationKey } from "@/i18n/translations";
import { ArrowRight, ArrowRightCircle } from "lucide-react";
import { tradePairs } from "@/data/mockData";
import TransactionSummary from "./TransactionSummary";

export default function BasicDetailsStep({ formProps }: { formProps: any }) {
  const {
    theme,
    t,
    language,
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
    currentRates,
    selectedPairInfo,
    calculationResult,
    showCalculation,
    formatRate,
    applyRateSourceToFixed,
    calculateOrder,
    setCurrentStep,
    autoCalculate
  } = formProps;

  // Group trade pairs by category
  const groupedPairs: Record<string, typeof tradePairs> = tradePairs.reduce((groups, pair) => {
    const group = pair.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(pair);
    return groups;
  }, {} as Record<string, typeof tradePairs>);

  // Get currency symbol
  const getCurrencySymbol = (currency: string) => {
    const currencySymbols: Record<string, string> = {
      // Основные валюты
      USD: "$",     // Доллар США
      EUR: "€",     // Евро
      GBP: "£",     // Фунт стерлингов
      JPY: "¥",     // Японская иена
      CNY: "¥",     // Китайский юань
      RUB: "₽",     // Российский рубль

      // Азиатские валюты
      KRW: "₩",     // Южнокорейская вона
      INR: "₹",     // Индийская рупия
      THB: "฿",     // Тайский бат
      IDR: "Rp",    // Индонезийская рупия
      VND: "₫",     // Вьетнамский донг

      // Ближний Восток
      AED: "د.إ",   // Дирхам ОАЭ
      SAR: "﷼",     // Саудовский риял
      ILS: "₪",     // Израильский шекель

      // Латинская Америка
      BRL: "R$",    // Бразильский реал
      MXN: "$",     // Мексиканское песо
      ARS: "$",     // Аргентинское песо

      // Африка
      ZAR: "R",     // Южноафриканский рэнд
      EGP: "£",     // Египетский фунт
      NGN: "₦",     // Нигерийская найра

      // Криптовалюты
      BTC: "₿",     // Биткоин
      ETH: "Ξ",     // Эфириум
      LTC: "Ł",     // Лайткоин

      // Другие
      CHF: "CHF",   // Швейцарский франк
      AUD: "A$",    // Австралийский доллар
      CAD: "C$",    // Канадский доллар
      SGD: "S$",    // Сингапурский доллар
      HKD: "HK$",   // Гонконгский доллар
      NZD: "NZ$",   // Новозеландский доллар
      SEK: "kr",    // Шведская крона
      NOK: "kr",    // Норвежская крона
      DKK: "kr",    // Датская крона
      PLN: "zł",    // Польский злотый
      TRY: "₺",     // Турецкая лира
      CZK: "Kč",    // Чешская крона
      HUF: "Ft",    // Венгерский форинт
      RON: "lei",   // Румынский лей
      HRK: "kn",    // Хорватская куна
      PHP: "₱",     // Филиппинское песо
      MYR: "RM",    // Малайзийский ринггит
    };

    // Приводим валюту к верхнему регистру для унификации
    const normalizedCurrency = currency.toUpperCase();

    // Возвращаем символ или пустую строку, если валюта не найдена
    return currencySymbols[normalizedCurrency] || "";
  };

  return (
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
        <Select
          value={selectedPair}
          onValueChange={(value) => {
            setSelectedPair(value);
            if (autoCalculate && amount && parseFloat(amount) > 0) {
              setTimeout(() => calculateOrder(), 100);
            }
          }}
        >
          <SelectTrigger
              id="tradingPair"
              className={cn(
                  "h-12 text-sm",
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
            <div className="space-y-2">
              <Label className={cn(
                  "text-sm font-medium",
                  theme === "light" ? "text-gray-700" : "text-gray-200"
              )}>
                {t('orderType')} <span className="text-red-500">*</span>
              </Label>

              {selectedPairInfo && (
                  <RadioGroup
                      value={orderType}
                      onValueChange={(value) => {
                        setOrderType(value);
                        if (autoCalculate && amount && parseFloat(amount) > 0) {
                          setTimeout(() => calculateOrder(), 100);
                        }
                      }}
                      className="grid grid-cols-2 gap-2"
                  >
                    {/* Buy Option */}
                    <div className={cn(
                        "relative rounded-lg transition-all duration-300 border overflow-hidden",
                        orderType === "BUY" ? (
                            theme === "light"
                                ? "ring-1 ring-blue-400 shadow-sm"
                                : "ring-1 ring-emerald-400 shadow-md"
                        ) : "",
                        theme === "light"
                            ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
                            : "bg-gradient-to-br from-otc-card to-otc-active/30 border-otc-active/50"
                    )}>
                      <label
                          htmlFor="buy-option"
                          className="p-3 flex items-start cursor-pointer w-full h-full"
                      >
                        <RadioGroupItem
                            value="BUY"
                            id="buy-option"
                            className={cn(
                                "mt-0.5 h-4 w-4",
                                theme === "light"
                                    ? "border-gray-300 text-blue-600"
                                    : "border-emerald-400 text-emerald-400"
                            )}
                        />
                        <div className="ml-2">
                          <div className={cn(
                              "font-medium text-base flex items-center",
                              theme === "light" ? "text-gray-800" : "text-white"
                          )}>
              <span className={cn(
                  "mr-1.5 text-xl",
                  theme === "light" ? "text-green-600" : "text-emerald-400"
              )}>+</span>
                            Получаю {selectedPairInfo.baseCurrency}
                          </div>
                          <div className={cn(
                              "text-xs mt-1",
                              theme === "light" ? "text-gray-500" : "text-gray-300"
                          )}>
                            Отдаю {selectedPairInfo.quoteCurrency}
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Sell Option */}
                    <div className={cn(
                        "relative rounded-lg transition-all duration-300 border overflow-hidden",
                        orderType === "SELL" ? (
                            theme === "light"
                                ? "ring-1 ring-blue-400 shadow-sm"
                                : "ring-1 ring-rose-400 shadow-md"
                        ) : "",
                        theme === "light"
                            ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
                            : "bg-gradient-to-br from-otc-card to-otc-active/30 border-otc-active/50"
                    )}>
                      <label
                          htmlFor="sell-option"
                          className="p-3 flex items-start cursor-pointer w-full h-full"
                      >
                        <RadioGroupItem
                            value="SELL"
                            id="sell-option"
                            className={cn(
                                "mt-0.5 h-4 w-4",
                                theme === "light"
                                    ? "border-gray-300 text-blue-600"
                                    : "border-rose-400 text-rose-400"
                            )}
                        />
                        <div className="ml-2">
                          <div className={cn(
                              "font-medium text-base flex items-center",
                              theme === "light" ? "text-gray-800" : "text-white"
                          )}>
              <span className={cn(
                  "mr-1.5 text-xl",
                  theme === "light" ? "text-red-600" : "text-rose-400"
              )}>-</span>
                            Отдаю {selectedPairInfo.quoteCurrency}
                          </div>
                          <div className={cn(
                              "text-xs mt-1",
                              theme === "light" ? "text-gray-500" : "text-gray-300"
                          )}>
                            Получаю {selectedPairInfo.baseCurrency}
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
                  "text-sm font-medium",
                  theme === "light" ? "text-gray-700" : "text-gray-200"
              )}>
                Сколько отдаете <span className="text-red-500">*</span>
              </Label>
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  {/*Минимальная сумма должна быть в эквиваленте к доллару = 500 000$*/}
                  <Input
                      id="amount"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        if (autoCalculate && selectedPair && e.target.value && parseFloat(e.target.value) > 0) {
                          calculateOrder();
                        }
                      }}
                      placeholder={t('minimumOrder')}
                      className={cn(
                          "pl-7 h-11 text-base",
                          theme === "light"
                              ? "bg-white border-gray-300 text-gray-800 hover:border-gray-400"
                              : "bg-otc-active border-otc-active text-white"
                      )}
                  />
                  <span className={cn(
                      "absolute left-2.5 top-1/2 transform -translate-y-1/2 text-base",
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                  )}>
      {getCurrencySymbol(amountCurrency)}
    </span>
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
            <RateSection
                theme={theme}
                t={t}
                language={language}
                rateType={rateType}
                setRateType={(value) => {
                  setRateType(value);
                }}
                rateSource={rateSource}
                setRateSource={(value) => {
                  setRateSource(value);
                  if (autoCalculate && amount && parseFloat(amount) > 0) {
                    setTimeout(() => calculateOrder(), 100);
                  }
                }}
                customRateValue={customRateValue}
                setCustomRateValue={(value) => {
                  setCustomRateValue(value);
                  if (autoCalculate && amount && parseFloat(amount) > 0) {
                    setTimeout(() => calculateOrder(), 100);
                  }
                }}
                rateAdjustment={rateAdjustment}
                setRateAdjustment={(value) => {
                  setRateAdjustment(value);
                  if (autoCalculate && amount && parseFloat(amount) > 0) {
                    setTimeout(() => calculateOrder(), 100);
                  }
                }}
                serviceFee={serviceFee}
                currentRates={currentRates}
                formatRate={formatRate}
                applyRateSourceToFixed={(source) => {
                  applyRateSourceToFixed(source);
                }}
            />

            {/* Transaction Calculation Results */}
            {showCalculation && calculationResult && (
                <div className="mt-6">
                  <TransactionSummary
                      theme={theme}
                      t={t}
                      calculationResult={calculationResult}
                      getCurrencySymbol={getCurrencySymbol}
                      setCurrentStep={setCurrentStep}
                  />
                </div>
            )}
          </>
      )}
    </>
  );
}

// RateSection component to make the BasicDetailsStep more manageable
function RateSection({
                       theme, t, language, rateType, setRateType, rateSource, setRateSource,
                       customRateValue, setCustomRateValue, rateAdjustment, setRateAdjustment,
                       serviceFee, currentRates, formatRate, applyRateSourceToFixed
                     }: any) {
  return (
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
            <DynamicRateOptions 
              theme={theme}
              t={t}
              rateSource={rateSource}
              setRateSource={setRateSource}
              rateAdjustment={rateAdjustment}
              setRateAdjustment={setRateAdjustment}
              currentRates={currentRates}
            />
          )}

          {/* Fixed Rate Input with Source Selection */}
          {rateType === "fixed" && (
            <FixedRateOptions 
              theme={theme}
              t={t}
              language={language}
              customRateValue={customRateValue}
              setCustomRateValue={setCustomRateValue}
              currentRates={currentRates}
              applyRateSourceToFixed={applyRateSourceToFixed}
            />
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
  );
}

// DynamicRateOptions component for further modularization
function DynamicRateOptions({ theme, t, rateSource, setRateSource, rateAdjustment, setRateAdjustment, currentRates }: any) {
  return (
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
  );
}

// FixedRateOptions component for further modularization
function FixedRateOptions({ theme, t, language, customRateValue, setCustomRateValue, currentRates, applyRateSourceToFixed }: any) {
  return (
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
  );
}
