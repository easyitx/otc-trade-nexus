
import React, { useState, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import { Button } from '../ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { tradePairs } from '../../data/mockData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TradePair {
  id: string;
  displayName: string;
  group: string;
  baseCurrency: string;
  quoteCurrency: string;
}

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Получаем список пар для поиска
  const currencyPairs: TradePair[] = [
    // RUB (NR) группа
    { id: 'RUB_NR_USD', displayName: 'RUB (NR) - USD', group: 'RUB_NR', baseCurrency: 'RUB', quoteCurrency: 'USD' },
    { id: 'RUB_NR_AED', displayName: 'RUB (NR) - AED', group: 'RUB_NR', baseCurrency: 'RUB', quoteCurrency: 'AED' },
    { id: 'RUB_NR_EUR', displayName: 'RUB (NR) - EUR', group: 'RUB_NR', baseCurrency: 'RUB', quoteCurrency: 'EUR' },
    { id: 'RUB_NR_CNY', displayName: 'RUB (NR) - CNY', group: 'RUB_NR', baseCurrency: 'RUB', quoteCurrency: 'CNY' },
    { id: 'RUB_NR_USDT', displayName: 'RUB (NR) - USDT', group: 'RUB_NR', baseCurrency: 'RUB', quoteCurrency: 'USDT' },
    
    // RUB Cash группа
    { id: 'RUB_CASH_USDT', displayName: 'RUB Cash - USDT', group: 'RUB_CASH', baseCurrency: 'RUB', quoteCurrency: 'USDT' },
    { id: 'USD_CASH_USDT', displayName: 'USD Cash - USDT', group: 'RUB_CASH', baseCurrency: 'USD', quoteCurrency: 'USDT' },
    { id: 'EUR_CASH_USDT', displayName: 'EUR Cash - USDT', group: 'RUB_CASH', baseCurrency: 'EUR', quoteCurrency: 'USDT' },
    
    // Токенизированные активы
    { id: 'A7A5_RUB', displayName: 'A7A5 - RUB', group: 'TOKENIZED', baseCurrency: 'A7A5', quoteCurrency: 'RUB' },
    { id: 'RUBT_A7A5', displayName: 'RUBT - A7A5', group: 'TOKENIZED', baseCurrency: 'RUBT', quoteCurrency: 'A7A5' },
  ];

  // Fetch active orders
  const { data: activeOrders = [] } = useQuery({
    queryKey: ['search-active-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Ошибка при получении активных ордеров:", error);
        return [];
      }

      return data;
    }
  });

  // Поиск по всем данным
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    
    // Поиск по валютным парам
    const matchingPairs = currencyPairs
      .filter(pair => 
        pair.displayName.toLowerCase().includes(searchTermLower) ||
        pair.baseCurrency.toLowerCase().includes(searchTermLower) ||
        pair.quoteCurrency.toLowerCase().includes(searchTermLower)
      )
      .slice(0, 5);
    
    // Поиск по ордерам
    const matchingOrders = activeOrders
      .filter((order: any) => {
        const pair = currencyPairs.find(p => p.id === order.trade_pair_id) || 
                    { displayName: "Неизвестная пара" };
        
        return (
          pair.displayName.toLowerCase().includes(searchTermLower) ||
          (order.purpose && order.purpose.toLowerCase().includes(searchTermLower)) ||
          (order.notes && order.notes.toLowerCase().includes(searchTermLower)) ||
          (order.rate && order.rate.toLowerCase().includes(searchTermLower)) ||
          order.amount.toString().includes(searchTermLower)
        );
      })
      .slice(0, 5);
    
    setSearchResults([...matchingPairs, ...matchingOrders]);
  }, [searchTerm, activeOrders]);

  // Обработка выбора из поиска
  const handleCommandSelect = (value: string) => {
    setOpen(false);
    navigate(value);
  };

  // Добавляем горячие клавиши для поиска
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="flex-grow mx-4 max-w-2xl">
      <Button
        variant="outline"
        className="w-full justify-start text-sm text-muted-foreground bg-otc-active border-otc-active"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="mr-2 h-4 w-4" />
        {t('search')}
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder={t('searchPlaceholder')} 
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>{t('noResults')}</CommandEmpty>
          
          {searchResults.length > 0 && (
            <>
              {/* Валютные пары в результатах поиска */}
              <CommandGroup heading={t('tradingPairs')}>
                {searchResults
                  .filter((result) => 'displayName' in result)
                  .map((pair) => (
                    <CommandItem 
                      key={pair.id} 
                      value={`/orders?pair=${pair.id}`}
                      onSelect={handleCommandSelect}
                    >
                      <span className="mr-2">{pair.displayName}</span>
                      <Badge variant="outline" className="ml-auto">
                        {t(pair.group)}
                      </Badge>
                    </CommandItem>
                  ))}
              </CommandGroup>
              
              {/* Ордера в результатах поиска */}
              {searchResults.filter((result) => !('displayName' in result)).length > 0 && (
                <CommandGroup heading={t('orders')}>
                  {searchResults
                    .filter((result) => !('displayName' in result))
                    .map((order) => {
                      const pair = currencyPairs.find(p => p.id === order.trade_pair_id) || 
                                  { displayName: "Неизвестная пара" };
                      
                      return (
                        <CommandItem 
                          key={order.id} 
                          value={`/orders/${order.id}`}
                          onSelect={handleCommandSelect}
                          className="flex justify-between"
                        >
                          <div className="flex items-center">
                            <span className={`mr-2 h-2 w-2 rounded-full ${order.type === "BUY" ? "bg-green-500" : "bg-red-500"}`}></span>
                            <span>{pair.displayName} - ${Number(order.amount).toLocaleString()}</span>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {order.type === "BUY" ? t('buy') : t('sell')}
                          </Badge>
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
              )}
            </>
          )}
          
          <CommandSeparator />
          
          <CommandGroup heading={t('quickNav')}>
            <CommandItem value="/" onSelect={handleCommandSelect}>
              {t('dashboard')}
            </CommandItem>
            <CommandItem value="/orders" onSelect={handleCommandSelect}>
              {t('orders')}
            </CommandItem>
            <CommandItem value="/create-order" onSelect={handleCommandSelect}>
              {t('createNewOrder')}
            </CommandItem>
            <CommandItem value="/deals" onSelect={handleCommandSelect}>
              {t('deals')}
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading={t('popularPairs')}>
            <CommandItem value="/orders?pair=RUB_NR_USD" onSelect={handleCommandSelect}>
              RUB (NR) - USD
            </CommandItem>
            <CommandItem value="/orders?pair=RUB_NR_USDT" onSelect={handleCommandSelect}>
              RUB (NR) - USDT
            </CommandItem>
            <CommandItem value="/orders?pair=RUB_CASH_USDT" onSelect={handleCommandSelect}>
              RUB Cash - USDT
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
