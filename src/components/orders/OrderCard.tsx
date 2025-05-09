
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive } from 'lucide-react';
import { Order } from '@/types';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface OrderCardProps {
  order: Order;
  volumePercentage: number;
  isExpiredOrArchived: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  volumePercentage,
  isExpiredOrArchived
}) => {
  const { theme } = useTheme();
  const isGreen = order.type === "BUY";

  // Format large numbers with spaces as thousand separators
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "decimal",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get rate description 
  const getRateDescription = (order: Order) => {
    if (!order.rateDetails) return "Фиксированный";
    
    if (order.rateDetails.type === "dynamic") {
      const source = order.rateDetails.source || "ЦБ";
      const adjustment = order.rateDetails.adjustment !== undefined 
        ? `+${order.rateDetails.adjustment}%` 
        : "";
      return `Динамичный ${source}${adjustment}`;
    }
    
    return "Фиксированный";
  };
  
  // Format rate display
  const getFormattedRateDisplay = (order: Order) => {
    return order.rateDetails?.type === "dynamic" 
      ? `ЦБ+${order.rateDetails.adjustment}%` 
      : `${order.rate}`;
  };

  // Function to determine trading pair components
  const getTradePairComponents = (order: Order) => {
    const baseCurrency = order.amountCurrency || "RUB";
    const quoteCurrency = baseCurrency === "RUB" ? "USDT" : "RUB";
    return { baseCurrency, quoteCurrency };
  };

  // Function to get text description of trade direction
  const getTradeDirection = (order: Order) => {
    const { baseCurrency, quoteCurrency } = getTradePairComponents(order);
    
    if (order.type === "BUY") {
      return {
        buying: quoteCurrency,
        selling: baseCurrency,
        direction: `Покупает ${quoteCurrency} за ${baseCurrency}`,
        fullDirection: `Хочет купить ${quoteCurrency} и отдать ${baseCurrency}`
      };
    } else {
      return {
        buying: baseCurrency,
        selling: quoteCurrency,
        direction: `Продает ${baseCurrency} за ${quoteCurrency}`,
        fullDirection: `Хочет продать ${baseCurrency} и получить ${quoteCurrency}`
      };
    }
  };

  // Check if the order is expired
  const isOrderExpired = (expiresAt: Date): boolean => {
    return expiresAt < new Date();
  };

  // Display order status badge
  const getOrderStatusBadge = (order: Order) => {
    if (order.status === "ARCHIVED") {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-500 flex items-center gap-1 ml-2">
          <Archive className="h-3 w-3" /> 
          Архивная
        </Badge>
      );
    }
    
    if (order.status === "CANCELLED") {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-500 ml-2">
          Отменена
        </Badge>
      );
    }
    
    if (isOrderExpired(new Date(order.expiresAt))) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-700 ml-2">
          Истекла
        </Badge>
      );
    }
    
    return null;
  };

  const tradeDirection = getTradeDirection(order);
  const formattedRate = getFormattedRateDisplay(order);
  const rateType = getRateDescription(order);

  return (
    <div className={cn(
      "relative group", 
      isExpiredOrArchived && "opacity-60"
    )}>
      {/* Background fill based on volume percentage */}
      <div 
        className={cn(
          "absolute inset-0 opacity-20 z-0 left-0",
          isGreen ? "bg-green-500" : "bg-red-500"
        )}
        style={{
          width: `${volumePercentage}%`,
          maxWidth: '100%'
        }}
      />
      <div className={cn(
        "relative flex items-center justify-between p-3 border-b z-10",
        theme === "light" ? "border-border" : "border-white/10",
      )}>
        <div className="flex items-center space-x-2">
          {isGreen ? (
            <ArrowUpRight className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <ArrowDownRight className="h-5 w-5 text-red-500 flex-shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-medium ${isGreen ? 'text-green-500' : 'text-red-500'}`}>
                {formattedRate}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {rateType}
              </span>
              {getOrderStatusBadge(order)}
            </div>
            <div className="text-base font-semibold flex items-center gap-1">
              <span>{formatAmount(Number(order.amount))} {order.amountCurrency}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">{tradeDirection.fullDirection}</span> • 
              {order.status === "ARCHIVED" ? (
                <span className="ml-1">архивная</span>
              ) : (
                <span className="ml-1">
                  истекает {formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true, locale: ru })}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          asChild
        >
          <Link to={`/orders/${order.id}`}>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
