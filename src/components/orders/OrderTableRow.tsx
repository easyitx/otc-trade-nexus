import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Order } from '@/types';
import { cn } from '@/lib/utils';

interface OrderTableRowProps {
  order: Order;
  volumePercentage: number;
  isExpiredOrArchived: boolean;
}

export const OrderTableRow: React.FC<OrderTableRowProps> = ({
                                                              order,
                                                              volumePercentage,
                                                              isExpiredOrArchived
                                                            }) => {
  const isGreen = order.type === "BUY";

  // Format large numbers with spaces as thousand separators
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "decimal",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Safe parsing function to prevent errors with undefined values
  const safeParseFloat = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    // Handle string values that might contain commas
    if (typeof value === 'string') {
      const sanitized = value?.replace(/,/g, '');
      return isNaN(parseFloat(sanitized)) ? 0 : parseFloat(sanitized);
    }
    return typeof value === 'number' ? value : 0;
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
    if (order.type === "BUY") {
      return order.rateDetails?.type === "dynamic"
          ? `ЦБ+${order.rateDetails.adjustment}%`
          : `${order.rate || 'N/A'}`;
    } else {
      return order.rateDetails?.type === "dynamic"
          ? `ЦБ+${order.rateDetails.adjustment}%`
          : `${order.rate || 'N/A'}`;
    }
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

  const { baseCurrency, quoteCurrency } = getTradePairComponents(order);
  const tradePairDisplay = `${baseCurrency}/${quoteCurrency}`;
  const tradeDirection = getTradeDirection(order);
  const formattedRate = getFormattedRateDisplay(order);
  const rateType = getRateDescription(order);

  return (
      <TableRow className={cn(
          "hover:bg-accent/20 relative",
          isExpiredOrArchived && "opacity-60"
      )}>
        {/* Background fill for table row based on volume percentage */}
        <div
            className={cn(
                "absolute inset-0 opacity-20 z-0",
                isGreen ? "bg-green-500" : "bg-red-500"
            )}
            style={{
              width: `${volumePercentage}%`,
              maxWidth: '100%'
            }}
        />
        <TableCell className={`font-medium ${isGreen ? 'text-green-500' : 'text-red-500'} relative z-10`}>
          {order.type === "BUY" ? "Покупка" : "Продажа"}
          {getOrderStatusBadge(order)}
        </TableCell>
        <TableCell className="relative z-10">{formatAmount(Number(order.amount || 0))} {order.amountCurrency}</TableCell>
        <TableCell className={`${isGreen ? 'text-green-500' : 'text-red-500'} relative z-10`}>
          {formattedRate}
        </TableCell>
        <TableCell className="relative z-10">{rateType}</TableCell>
        <TableCell className="relative z-10">{tradePairDisplay}</TableCell>
        <TableCell className="relative z-10">{tradeDirection.fullDirection}</TableCell>
        <TableCell className="relative z-10">
          {formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true, locale: ru })}
        </TableCell>
        <TableCell className="relative z-10">
          <Button
              variant="ghost"
              size="sm"
              className={cn("hover:bg-accent/30")}
              asChild
          >
            <Link to={`/orders/${order.id}`}>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </TableCell>
      </TableRow>
  );
};