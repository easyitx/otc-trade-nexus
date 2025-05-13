
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CurrencyRate, CurrencyRateUpdate } from '@/hooks/useCurrencyRates';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Edit2, Save, RefreshCw, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CurrencyRateCardProps {
    rate: CurrencyRate;
    onUpdate: (update: CurrencyRateUpdate) => void;
}

export const CurrencyRateCard: React.FC<CurrencyRateCardProps> = ({ rate, onUpdate }) => {
    const { theme } = useTheme();
    const { t, language } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [manualRate, setManualRate] = useState(rate.manual_rate !== null ? rate.manual_rate.toString() : '');
    const [useManualRate, setUseManualRate] = useState(rate.use_manual_rate);

    // Format date to readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US');
    };

    // Handle save changes
    const handleSave = () => {
        onUpdate({
            id: rate.id,
            manual_rate: manualRate ? parseFloat(manualRate) : null,
            use_manual_rate: useManualRate
        });
        setIsEditing(false);
    };

    // Get active rate (manual or auto based on preference)
    const getActiveRate = () => {
        if (rate.use_manual_rate && rate.manual_rate !== null) {
            return rate.manual_rate;
        }
        return rate.auto_rate;
    };

    const activeRate = getActiveRate();

    return (
        <Card className={cn(
            "w-full",
            theme === "light" ? "bg-card" : "bg-otc-card border-otc-active"
        )}>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
          <span>
            {rate.base_currency}/{rate.quote_currency}
          </span>
                    {rate.source && (
                        <Badge
                            variant="outline"
                            className={cn(
                                "ml-2 font-normal text-xs",
                                theme === "light" ? "bg-accent/50" : "bg-otc-active/50"
                            )}
                        >
                            {rate.source}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Current rate display */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('activeRate')}:</span>
                    <span className="text-xl font-bold">
            {activeRate !== null
                ? activeRate.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 6 })
                : '—'}
          </span>
                </div>

                {/* Auto rate display */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('autoRate')}:</span>
                    <span>
            {rate.auto_rate !== null
                ? rate.auto_rate.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 6 })
                : '—'}
          </span>
                </div>

                {/* Manual rate input or display */}
                {isEditing ? (
                    <div className="space-y-2">
                        <Label htmlFor={`rate-${rate.id}`}>{t('manualRate')}:</Label>
                        <Input
                            id={`rate-${rate.id}`}
                            type="number"
                            step="0.000001"
                            value={manualRate}
                            onChange={(e) => setManualRate(e.target.value)}
                            className={theme === "light" ? "" : "bg-otc-active border-otc-active"}
                        />
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t('manualRate')}:</span>
                        <span>
              {rate.manual_rate !== null
                  ? rate.manual_rate.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 6 })
                  : '—'}
            </span>
                    </div>
                )}

                {/* Use manual rate toggle */}
                {isEditing && (
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor={`use-manual-${rate.id}`}>{t('useManualRate')}:</Label>
                        <Switch
                            id={`use-manual-${rate.id}`}
                            checked={useManualRate}
                            onCheckedChange={setUseManualRate}
                        />
                    </div>
                )}

                {/* Source and timestamp info */}
                {rate.source_timestamp && (
                    <div className="text-xs text-muted-foreground">
                        {t('sourceUpdated')}: {formatDate(rate.source_timestamp)}
                    </div>
                )}

                {/* Last updated info */}
                <div className="text-xs text-muted-foreground">
                    {t('lastUpdated')}: {formatDate(rate.last_updated)}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                {isEditing ? (
                    <Button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {t('saveChanges')}
                    </Button>
                ) : (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-otc-primary hover:bg-otc-primary/90 text-black"
                    >
                        <Edit2 className="h-4 w-4 mr-2" />
                        {t('edit')}
                    </Button>
                )}

                {isEditing && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            setManualRate(rate.manual_rate !== null ? rate.manual_rate.toString() : '');
                            setUseManualRate(rate.use_manual_rate);
                            setIsEditing(false);
                        }}
                    >
                        {t('cancel')}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};