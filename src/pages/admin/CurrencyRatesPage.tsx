import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import {apiUrl} from "../../../config.ts";

interface CurrencyPair {
  value: string;
  label: string;
}

interface RateSource {
  code: string;
  name: string;
  apiUrl: string;
}

interface ExchangeRate {
  [key: string]: number;
  lastUpdated: number;
}

const API_BASE_URL = apiUrl;

export default function CurrencyRatesPage() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [availablePairs, setAvailablePairs] = useState<CurrencyPair[]>([]);
  const [availableSources, setAvailableSources] = useState<RateSource[]>([]);
  const [rates, setRates] = useState<Record<string, ExchangeRate>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [newRate, setNewRate] = useState('');
  const [displaySource, setDisplaySource] = useState('all'); // 'all' или код источника

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const [pairsResponse, sourcesResponse, ratesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/exchange-rates/pairs`),
          axios.get(`${API_BASE_URL}/exchange-rates/sources`),
          axios.get(`${API_BASE_URL}/exchange-rates`)
        ]);

        setAvailablePairs(pairsResponse.data);
        setAvailableSources(sourcesResponse.data);
        setRates(ratesResponse.data);

        if (pairsResponse.data.length > 0) {
          setSelectedPair(pairsResponse.data[0].value);
        }
        if (sourcesResponse.data.length > 0) {
          setSelectedSource(sourcesResponse.data[0].code);
        }

      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleUpdateRate = async () => {
    if (!selectedPair || !selectedSource || !newRate) {
      toast({
        title: 'Ошибка',
        description: 'Выберите пару, источник и введите курс',
        variant: 'destructive',
      });
      return;
    }

    try {
      const rateValue = parseFloat(newRate);
      if (isNaN(rateValue)) {
        throw new Error('Некорректное значение курса');
      }

      await axios.post(`${API_BASE_URL}/exchange-rates/set-rate`, {
        pair: selectedPair,
        source: selectedSource,
        rate: rateValue
      });

      // Обновляем локальное состояние
      const updatedRates = { ...rates };
      if (!updatedRates[selectedPair]) {
        updatedRates[selectedPair] = { lastUpdated: Date.now() };
      }
      updatedRates[selectedPair][selectedSource] = rateValue;
      updatedRates[selectedPair].lastUpdated = Date.now();
      setRates(updatedRates);

      toast({
        title: 'Успешно',
        description: 'Курс обновлен',
      });

      setNewRate('');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error.response?.data?.message || 'Не удалось обновить курс',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
          <p className={cn(theme === "light" ? "text-foreground" : "text-white")}>
            Загрузка...
          </p>
        </div>
    );
  }

  // Фильтруем источники для отображения
  const displaySources = displaySource === 'all'
      ? availableSources
      : availableSources.filter(source => source.code === displaySource);

  return (
      <div className="space-y-6">
        <Card className={cn(theme === "light" ? "bg-card" : "bg-otc-card border-otc-active")}>
          <CardHeader>
            <CardTitle>Управление курсами валют</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <Select
                    value={selectedPair}
                    onValueChange={setSelectedPair}
                    disabled={availablePairs.length === 0}
                >
                  <SelectTrigger className={cn(theme === "light" ? "" : "bg-otc-active border-otc-active")}>
                    <SelectValue placeholder={availablePairs.length ? "Выберите пару" : "Нет доступных пар"} />
                  </SelectTrigger>
                  <SelectContent className={theme === "light" ? "" : "bg-otc-card border-otc-active"}>
                    {availablePairs.map(pair => (
                        <SelectItem key={pair.value} value={pair.value}>
                          {pair.label}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                    value={selectedSource}
                    onValueChange={setSelectedSource}
                    disabled={availableSources.length === 0}
                >
                  <SelectTrigger className={cn(theme === "light" ? "" : "bg-otc-active border-otc-active")}>
                    <SelectValue placeholder={availableSources.length ? "Выберите источник" : "Нет источников"} />
                  </SelectTrigger>
                  <SelectContent className={theme === "light" ? "" : "bg-otc-card border-otc-active"}>
                    {availableSources.map(source => (
                        <SelectItem key={source.code} value={source.code}>
                          {source.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Input
                    type="number"
                    step="0.0001"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    placeholder="Введите курс"
                    className={theme === "light" ? "" : "bg-otc-active border-otc-active"}
                />
              </div>

              <div>
                <Button
                    onClick={handleUpdateRate}
                    className="w-full"
                    disabled={!selectedPair || !selectedSource || !newRate}
                >
                  Обновить курс
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">Текущие курсы</h3>
                <Select
                    value={displaySource}
                    onValueChange={setDisplaySource}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Фильтр по источнику" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все источники</SelectItem>
                    {availableSources.map(source => (
                        <SelectItem key={source.code} value={source.code}>
                          {source.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPair && rates[selectedPair] ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displaySources.map(source => (
                        <div
                            key={source.code}
                            className="p-4 border rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                              {source.code}
                            </div>
                            <div>
                              <div className="font-medium">{source.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {selectedPair}
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-lg">
                      {rates[selectedPair][source.code]?.toFixed(4) || '—'}
                    </span>
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="text-center p-8 border rounded-md border-dashed">
                    <p className="text-muted-foreground">
                      Курсы для выбранной пары недоступны
                    </p>
                  </div>
              )}

              {selectedPair && rates[selectedPair] && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Последнее обновление: {new Date(rates[selectedPair].lastUpdated).toLocaleString()}
                  </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}