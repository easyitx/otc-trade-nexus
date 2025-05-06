
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ChartBarIcon, TrendingUpIcon, ArrowUpRightIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';

// Defining trading pairs and their groups
const tradingPairs = {
  RUB_NR: [
    { id: 'RUB_NR_USD', name: 'RUB (NR) – USD', displayName: 'Нерезидентский рубль – USD' },
    { id: 'RUB_NR_AED', name: 'RUB (NR) – AED', displayName: 'Нерезидентский рубль – AED' },
    { id: 'RUB_NR_EUR', name: 'RUB (NR) – EUR', displayName: 'Нерезидентский рубль – EUR' },
    { id: 'RUB_NR_CNY', name: 'RUB (NR) – CNY', displayName: 'Нерезидентский рубль – CNY' },
    { id: 'RUB_NR_USDT', name: 'RUB (NR) – USDT', displayName: 'Нерезидентский рубль – USDT' },
  ],
  RUB_CASH: [
    { id: 'RUB_CASH_USDT', name: 'RUB Cash – USDT', displayName: 'Наличный рубль – USDT' },
    { id: 'USD_CASH_USDT', name: 'USD Cash – USDT', displayName: 'Наличный доллар США – USDT' },
    { id: 'EUR_CASH_USDT', name: 'EUR Cash – USDT', displayName: 'Наличный доллар Евро – USDT' },
  ],
  TOKENIZED: [
    { id: 'A7A5_RUB', name: 'A7A5 – RUB', displayName: 'A7A5 – RUB' },
    { id: 'RUBT_A7A5', name: 'RUBT – A7A5', displayName: 'RUBT – A7A5' },
    { id: 'OTHER_ASSETS', name: 'Other Assets', displayName: 'Другие активы' },
  ]
};

// Define the statistics types we'll fetch and display
interface OrderStats {
  totalVolume: number;
  totalOrders: number;
  activeOrders: number;
  pairStats: Record<string, {
    volume: number;
    count: number;
    buyCount: number;
    sellCount: number;
  }>;
}

// Custom tooltip component for the chart
const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={cn(
        "p-3 border rounded-md shadow-md",
        theme === "light" 
          ? "bg-white border-gray-200" 
          : "bg-otc-card border-otc-active"
      )}>
        <p className={cn(
          "font-medium", 
          theme === "light" ? "text-gray-900" : "text-white"
        )}>{label}</p>
        <p className="text-green-400">Покупка: {payload[0].value}</p>
        <p className="text-red-400">Продажа: {payload[1].value}</p>
      </div>
    );
  }

  return null;
};

export const OrderStatistics = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'RUB_NR' | 'RUB_CASH' | 'TOKENIZED'>('RUB_NR');

  // Fetch order statistics from the database
  const { data: stats, isLoading } = useQuery({
    queryKey: ['order-statistics'],
    queryFn: async (): Promise<OrderStats> => {
      // Get all orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*');

      if (error) {
        console.error('Error fetching orders for statistics:', error);
        throw new Error(error.message);
      }

      // Initialize statistics
      const stats: OrderStats = {
        totalVolume: 0,
        totalOrders: orders.length,
        activeOrders: 0,
        pairStats: {}
      };

      // Initialize stats for each pair
      Object.values(tradingPairs).flat().forEach(pair => {
        stats.pairStats[pair.id] = {
          volume: 0,
          count: 0,
          buyCount: 0,
          sellCount: 0
        };
      });

      // Calculate statistics from orders
      orders.forEach(order => {
        // Add to total volume
        stats.totalVolume += Number(order.amount);
        
        // Count active orders
        if (order.status === 'ACTIVE') {
          stats.activeOrders++;
        }

        // For demo purposes, map orders to pairs randomly since we don't have pair data
        // In a real scenario, you'd use the actual pair from the order
        const groupKeys = Object.keys(tradingPairs);
        const randomGroup = groupKeys[Math.floor(Math.random() * groupKeys.length)] as keyof typeof tradingPairs;
        const pairsInGroup = tradingPairs[randomGroup];
        const randomPair = pairsInGroup[Math.floor(Math.random() * pairsInGroup.length)];
        
        // Add to pair stats
        if (stats.pairStats[randomPair.id]) {
          stats.pairStats[randomPair.id].volume += Number(order.amount);
          stats.pairStats[randomPair.id].count += 1;
          if (order.type === 'BUY') {
            stats.pairStats[randomPair.id].buyCount += 1;
          } else {
            stats.pairStats[randomPair.id].sellCount += 1;
          }
        }
      });

      return stats;
    },
    refetchOnWindowFocus: false
  });

  // Prepare chart data for the current active tab
  const chartData = stats ? tradingPairs[activeTab].map(pair => ({
    name: pair.displayName,
    buy: stats.pairStats[pair.id]?.buyCount || 0,
    sell: stats.pairStats[pair.id]?.sellCount || 0,
  })) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className={cn(
          "h-40 animate-pulse rounded-lg",
          theme === "light" ? "bg-gray-100" : "bg-otc-card"
        )}></div>
        <div className={cn(
          "h-80 animate-pulse rounded-lg",
          theme === "light" ? "bg-gray-100" : "bg-otc-card"
        )}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={cn(
          theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Общий объем торгов
            </CardTitle>
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              theme === "light" ? "bg-blue-50" : "bg-otc-icon-bg"
            )}>
              <ChartBarIcon className={cn(
                "h-5 w-5",
                theme === "light" ? "text-primary" : "text-otc-icon"
              )} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              theme === "light" ? "text-gray-900" : "text-white"
            )}>
              ${stats?.totalVolume.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              За все время
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего ордеров
            </CardTitle>
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              theme === "light" ? "bg-blue-50" : "bg-otc-icon-bg"
            )}>
              <TrendingUpIcon className={cn(
                "h-5 w-5",
                theme === "light" ? "text-primary" : "text-otc-icon"
              )} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              theme === "light" ? "text-gray-900" : "text-white"
            )}>
              {stats?.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              {stats?.activeOrders} активных ордеров
              <span className="ml-2 flex items-center text-green-500">
                <ArrowUpRightIcon className="h-3 w-3 ml-0.5" />
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Средний объем ордера
            </CardTitle>
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              theme === "light" ? "bg-blue-50" : "bg-otc-icon-bg"
            )}>
              <ChartBarIcon className={cn(
                "h-5 w-5",
                theme === "light" ? "text-primary" : "text-otc-icon"
              )} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              theme === "light" ? "text-gray-900" : "text-white"
            )}>
              ${stats?.totalOrders ? Math.floor(stats.totalVolume / stats.totalOrders).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              В среднем за ордер
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trading Pairs Statistics */}
      <Card className={cn(
        theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
      )}>
        <CardHeader>
          <CardTitle className={cn(
            "text-lg font-medium",
            theme === "light" ? "text-gray-900" : "text-white"
          )}>
            Статистика торговых пар
          </CardTitle>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => setActiveTab('RUB_NR')}
              className={cn(
                "px-3 py-1 rounded-md text-sm",
                activeTab === 'RUB_NR' 
                  ? theme === "light"
                    ? "bg-primary text-white"
                    : "bg-otc-primary text-black"
                  : theme === "light"
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-otc-active text-white hover:bg-otc-active/80"
              )}
            >
              RUB (Нерезидентский)
            </button>
            <button
              onClick={() => setActiveTab('RUB_CASH')}
              className={cn(
                "px-3 py-1 rounded-md text-sm",
                activeTab === 'RUB_CASH' 
                  ? theme === "light"
                    ? "bg-primary text-white"
                    : "bg-otc-primary text-black"
                  : theme === "light"
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-otc-active text-white hover:bg-otc-active/80"
              )}
            >
              RUB (Наличный)
            </button>
            <button
              onClick={() => setActiveTab('TOKENIZED')}
              className={cn(
                "px-3 py-1 rounded-md text-sm",
                activeTab === 'TOKENIZED' 
                  ? theme === "light"
                    ? "bg-primary text-white"
                    : "bg-otc-primary text-black"
                  : theme === "light"
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-otc-active text-white hover:bg-otc-active/80"
              )}
            >
              Токенизированный
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bar Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "light" ? "#e5e7eb" : "#444"} />
                <XAxis 
                  dataKey="name" 
                  stroke={theme === "light" ? "#6b7280" : "#888"} 
                  tick={{ fill: theme === "light" ? "#6b7280" : "#888" }} 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis 
                  stroke={theme === "light" ? "#6b7280" : "#888"} 
                  tick={{ fill: theme === "light" ? "#6b7280" : "#888" }} 
                />
                <Tooltip content={<CustomTooltip theme={theme} />} />
                <Bar dataKey="buy" fill="#4ade80" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sell" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Table */}
          <div className="mt-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className={cn(
                  "border-b",
                  theme === "light" ? "border-gray-200" : "border-otc-active"
                )}>
                  <th className="text-left py-2 px-2 text-muted-foreground">Торговая пара</th>
                  <th className="text-right py-2 px-2 text-muted-foreground">Объем</th>
                  <th className="text-right py-2 px-2 text-muted-foreground">Ордера</th>
                </tr>
              </thead>
              <tbody>
                {tradingPairs[activeTab].map((pair) => (
                  <tr key={pair.id} className={cn(
                    "border-b hover:bg-opacity-20",
                    theme === "light" 
                      ? "border-gray-100 hover:bg-gray-50" 
                      : "border-otc-active/30 hover:bg-otc-active/20"
                  )}>
                    <td className={cn(
                      "py-2 px-2",
                      theme === "light" ? "text-gray-900" : "text-white"
                    )}>
                      {pair.displayName}
                    </td>
                    <td className={cn(
                      "text-right py-2 px-2",
                      theme === "light" ? "text-gray-900" : "text-white"
                    )}>
                      ${stats?.pairStats[pair.id]?.volume.toLocaleString() || '0'}
                    </td>
                    <td className="text-right py-2 px-2">
                      <span className={theme === "light" ? "text-gray-900" : "text-white"}>
                        {stats?.pairStats[pair.id]?.count || 0}
                      </span>
                      <span className="text-xs ml-2">
                        (<span className="text-green-400">{stats?.pairStats[pair.id]?.buyCount || 0}</span>/<span className="text-red-400">{stats?.pairStats[pair.id]?.sellCount || 0}</span>)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
