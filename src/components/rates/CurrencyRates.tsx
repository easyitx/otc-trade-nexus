
import React from 'react';
import { Skeleton } from '../ui/skeleton';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover";
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import { useCurrencyRates } from '@/hooks/useCurrencyRates';

interface RateBadgeProps {
    icon: React.ReactNode;
    rate: number | null | undefined;
    highlight?: boolean;
}

const RateBadge: React.FC<RateBadgeProps> = ({ icon, rate, highlight = false }) => {
    return (
        <div className="flex items-center gap-1">
            <div className="shrink-0">
                {icon}
            </div>
            <span className={cn(
                "text-xs font-medium",
                highlight ? "font-bold" : "text-muted-foreground"
            )}>
        {rate ? rate.toLocaleString('ru-RU', { maximumFractionDigits: 4 }) : '—'}
      </span>
        </div>
    );
};

interface RateItemProps {
    source: string;
    rate: number | null | undefined;
    loading: boolean;
    icon: React.ReactNode;
    highlight?: boolean;
    currencyPair: string;
}

const RateItem: React.FC<RateItemProps> = ({
                                               source,
                                               rate,
                                               loading,
                                               icon,
                                               highlight = false,
                                               currencyPair
                                           }) => {
    const [, toCurrency] = currencyPair.split('/');

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="shrink-0">
                    {icon}
                </div>
                <span className={cn(
                    "text-sm",
                    highlight ? "font-semibold" : ""
                )}>
          {source}
        </span>
            </div>
            {loading ? (
                <Skeleton className="w-16 h-5" />
            ) : (
                <span className={cn(
                    "font-medium",
                    highlight ? "text-lg" : ""
                )}>
          {rate ? rate.toLocaleString('ru-RU', { maximumFractionDigits: 4 }) : '—'} {toCurrency}
        </span>
            )}
        </div>
    );
};

export const CurrencyRates: React.FC = () => {
    const {
        rates,
        loading,
        error,
        currencyPair,
        availablePairs,
        availableSources,
        setCurrencyPair
    } = useCurrencyRates();

    const { t } = useLanguage();
    const { theme } = useTheme();

    // Compact view с динамическими источниками
    const CompactRatesView = () => {
        if (error) {
            return <span className="text-xs text-red-500">{error}</span>;
        }

        return (
            <div className="flex items-center gap-3 text-sm">
                {loading ? (
                    <div className="flex gap-3">
                        {availableSources.map((_, index) => (
                            <Skeleton key={index} className="w-12 h-4" />
                        ))}
                    </div>
                ) : (
                    <>
                        {availableSources.map(source => (
                            <RateBadge
                                key={source.code}
                                icon={
                                    <div
                                        className="h-5 w-5 rounded-sm flex items-center justify-center"
                                        style={{ backgroundColor: '#666' }}
                                    >
                    <span className="text-white text-[10px] font-bold leading-none">
                      {source.code}
                    </span>
                                    </div>
                                }
                                rate={rates?.[source.code] ?? undefined}
                            />
                        ))}
                    </>
                )}
            </div>
        );
    };

    if (!currencyPair && !loading) {
        return <div className="text-sm text-muted-foreground">Курсы валют не доступны</div>;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className={cn(
                    "px-3 py-1.5 rounded-lg flex items-center transition-colors",
                    theme === "light"
                        ? "bg-accent hover:bg-accent/80 text-accent-foreground"
                        : "bg-otc-active hover:bg-otc-active/80 text-white"
                )}>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{currencyPair}</span>
                        <CompactRatesView />
                    </div>
                </button>
            </PopoverTrigger>
            <PopoverContent className={cn(
                "w-80 p-0",
                theme === "light" ? "bg-card border-border" : "bg-otc-card border-otc-active"
            )}>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-lg">{t('exchangeRates')}</h3>
                        <Select
                            value={currencyPair}
                            onValueChange={setCurrencyPair}
                            disabled={loading}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder='Выберите валютную пару' />
                            </SelectTrigger>
                            <SelectContent>
                                {availablePairs.map((pair) => (
                                    <SelectItem key={pair.value} value={pair.value}>
                                        {pair.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {error ? (
                        <div className="text-red-500 text-sm text-center py-4">{error}</div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {availableSources.map(source => (
                                    <RateItem
                                        key={source.code}
                                        source={source.name}
                                        rate={rates?.[source.code] || undefined}
                                        loading={loading}
                                        icon={
                                            <div
                                                className="h-6 w-6 rounded-sm flex items-center justify-center"
                                                style={{ backgroundColor: '#666' }}
                                            >
                        <span className="text-white text-xs font-bold">
                          {source.code}
                        </span>
                                            </div>
                                        }
                                        highlight={source.code === 'CBR'}
                                        currencyPair={currencyPair}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-4 text-center">
                                {t('ratesUpdatedAutomatically')}
                            </p>
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
