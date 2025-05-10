
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, AlertTriangle, Search } from 'lucide-react';
import { CurrencyRateCard } from '@/components/rates/CurrencyRateCard';
import { CreateRateModal } from '@/components/rates/CreateRateModal';
import { useCurrencyRates, CurrencyCode } from '@/hooks/useCurrencyRates';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function CurrencyRatesPage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { useCurrencyRatesQuery, updateRate, createRate, refreshExternalRates } = useCurrencyRates();
  const { userRoles, isLoadingRoles } = usePlatformSettings();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: rates = [], isLoading, isError } = useCurrencyRatesQuery();

  // Filter rates based on search and active tab
  const filteredRates = rates.filter((rate) => {
    const searchMatch = 
      `${rate.base_currency}${rate.quote_currency}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${rate.base_currency}/${rate.quote_currency}`.toLowerCase().includes(searchQuery.toLowerCase());

    const tabMatch = 
      activeTab === 'all' || 
      (activeTab === 'major' && isMajorPair(rate.base_currency, rate.quote_currency)) ||
      (activeTab === 'crypto' && isCryptoPair(rate.base_currency, rate.quote_currency)) ||
      (activeTab === 'exotic' && !isMajorPair(rate.base_currency, rate.quote_currency) && !isCryptoPair(rate.base_currency, rate.quote_currency));

    return searchMatch && tabMatch;
  });

  // Get existing pairs for create modal validation
  const existingPairs = rates.map(rate => ({
    base: rate.base_currency,
    quote: rate.quote_currency
  }));

  // Check if a pair is a major pair (commonly traded)
  function isMajorPair(base: CurrencyCode, quote: CurrencyCode) {
    const majorCurrencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'RUB'];
    return majorCurrencies.includes(base) && majorCurrencies.includes(quote);
  }

  // Check if a pair involves cryptocurrencies
  function isCryptoPair(base: CurrencyCode, quote: CurrencyCode) {
    const cryptoCurrencies: CurrencyCode[] = ['BTC', 'ETH', 'USDT', 'USDC'];
    return cryptoCurrencies.includes(base) || cryptoCurrencies.includes(quote);
  }

  // Handle refresh of external rates
  const handleRefreshRates = () => {
    refreshExternalRates();
  };

  // Check if user has permissions
  if (!isLoadingRoles && !userRoles?.isManager && !userRoles?.isAdmin) {
    return (
      <>
        <div className="flex items-center justify-center h-full">
          <Card className={cn(
            "w-full max-w-md",
            theme === "light" ? "bg-card" : "bg-otc-card border-otc-active"
          )}>
            <CardHeader>
              <CardTitle>{t('accessDenied')}</CardTitle>
              <CardDescription>
                {t('noPermission')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-red-900/20 border-red-500">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertTitle>{t('restrictedArea')}</AlertTitle>
                <AlertDescription>
                  {t('onlyAdminManager')}
                </AlertDescription>
              </Alert>
            </CardContent>
            <div className="p-6">
              <Button onClick={() => navigate('/')}>
                {t('returnHome')}
              </Button>
            </div>
          </Card>
        </div>
      </>
    );
  }
  
  if (isLoading || isLoadingRoles) {
    return (
      <>
        <div className="flex items-center justify-center h-full">
          <p className={theme === "light" ? "text-foreground" : "text-white"}>{t('loading')}...</p>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className={cn(
          "w-full max-w-md",
          theme === "light" ? "bg-card" : "bg-otc-card border-otc-active"
        )}>
          <CardHeader>
            <CardTitle>{t('error')}</CardTitle>
            <CardDescription>
              {t('failedToLoadRates')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-red-900/20 border-red-500">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertTitle>{t('dataLoadingError')}</AlertTitle>
              <AlertDescription>
                {t('rateFetchProblem')}
              </AlertDescription>
            </Alert>
          </CardContent>
          <div className="p-6">
            <Button onClick={() => window.location.reload()}>
              {t('reloadPage')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={cn(
            "text-2xl font-bold", 
            theme === "light" ? "text-foreground" : "text-white"
          )}>
            {t('currencyRatesManagement')}
          </h1>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleRefreshRates} 
              variant="outline"
              className={cn(
                theme === "light" ? "bg-accent" : "bg-otc-active border-otc-active"
              )}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('refreshExternalRates')}
            </Button>
            
            <CreateRateModal 
              onCreateRate={createRate}
              existingPairs={existingPairs}
            />
          </div>
        </div>
        
        <Card className={cn(
          theme === "light" ? "bg-card" : "bg-otc-card border-otc-active"
        )}>
          <CardHeader>
            <CardTitle>{t('currencyExchangeRates')}</CardTitle>
            <CardDescription>
              {t('manageRatesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchCurrencyPairs')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "pl-8",
                      theme === "light" ? "" : "bg-otc-active border-otc-active"
                    )}
                  />
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className={theme === "light" ? "bg-accent" : "bg-otc-active"}>
                    <TabsTrigger value="all">{t('all')}</TabsTrigger>
                    <TabsTrigger value="major">{t('major')}</TabsTrigger>
                    <TabsTrigger value="crypto">{t('crypto')}</TabsTrigger>
                    <TabsTrigger value="exotic">{t('exotic')}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {filteredRates.length === 0 ? (
                <div className="text-center p-8 border rounded-md border-dashed">
                  <p className="text-muted-foreground">{t('noCurrencyRates')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRates.map((rate) => (
                    <CurrencyRateCard
                      key={rate.id}
                      rate={rate}
                      onUpdate={updateRate}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
