
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Order } from '@/types';

interface OrderStatisticsProps {
  totalCount: number;
  buyOrdersCount: number;
  sellOrdersCount: number;
  archivedOrdersCount: number;
  showArchived: boolean;
  totalVolumeUSD: number;
  buyOrdersVolume: number;
  sellOrdersVolume: number;
}

export const OrderStatistics: React.FC<OrderStatisticsProps> = ({
  totalCount,
  buyOrdersCount,
  sellOrdersCount,
  archivedOrdersCount,
  showArchived,
  totalVolumeUSD,
  buyOrdersVolume,
  sellOrdersVolume
}) => {
  const { theme } = useTheme();
  
  return (
    <>
      <div className={cn(
        "p-3 border-b flex flex-wrap gap-4 justify-between",
        theme === "light" ? "border-border" : "border-otc-active"
      )}>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Всего заявок</p>
            <p className={cn(
              "text-xl font-bold",
              theme === "light" ? "text-foreground" : "text-white"
            )}>{totalCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Покупка</p>
            <p className="text-xl font-bold text-green-500">
              {buyOrdersCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Продажа</p>
            <p className="text-xl font-bold text-red-500">
              {sellOrdersCount}
            </p>
          </div>
          {showArchived && (
            <div>
              <p className="text-xs text-muted-foreground">Архивные</p>
              <p className="text-xl font-bold text-gray-500">
                {archivedOrdersCount}
              </p>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Общий объем на странице</p>
          <p className={cn(
            "text-xl font-bold",
            theme === "light" ? "text-foreground" : "text-white"
          )}>
            {new Intl.NumberFormat("ru-RU", {
              style: "decimal",
              maximumFractionDigits: 0,
            }).format(totalVolumeUSD)} USD
          </p>
        </div>
      </div>
      
      {/* Volume comparison chart */}
      {totalVolumeUSD > 0 && (
        <div className="px-3 py-2 border-b">
          <div className="flex h-4 w-full rounded-sm overflow-hidden">
            <div 
              className="h-full bg-green-500" 
              style={{ width: `${(buyOrdersVolume / totalVolumeUSD) * 100}%` }}
            ></div>
            <div 
              className="h-full bg-red-500" 
              style={{ width: `${(sellOrdersVolume / totalVolumeUSD) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </>
  );
};
