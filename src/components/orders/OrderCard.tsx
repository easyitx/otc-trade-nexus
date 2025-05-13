import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowRight, ArrowUpRight, ArrowDownRight, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive } from 'lucide-react';
import { Order } from '@/types';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const isGreen = order.type === "BUY";

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

  // Format large numbers with spaces as thousand separators
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "decimal",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate and format volume (amount * rate)
  const formatVolume = (amount: number, rate: string | undefined) => {
    try {
      if (!rate) return formatAmount(amount);

      const numericRate = safeParseFloat(rate);
      if (numericRate === 0) return formatAmount(amount);

      const volume = amount * numericRate;
      return formatAmount(volume);
    } catch (error) {
      console.error("Error calculating volume:", error);
      return formatAmount(amount);
    }
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
        : `${order.rate || 'N/A'}`;
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
          <Badge variant="outline" className="bg-gray-100 text-gray-500 flex items-center gap-1 text-[10px] py-0 h-5">
            <Archive className="h-3 w-3" />
            Архивная
          </Badge>
      );
    }

    if (order.status === "CANCELLED") {
      return (
          <Badge variant="outline" className="bg-red-100 text-red-500 text-[10px] py-0 h-5">
            Отменена
          </Badge>
      );
    }

    if (isOrderExpired(new Date(order.expiresAt))) {
      return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 text-[10px] py-0 h-5">
            Истекла
          </Badge>
      );
    }

    return null;
  };

  // Function to copy order ID to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
        .then(() => {
          toast({
            title: "ID скопирован",
            description: "ID заявки скопирован в буфер обмена",
          });
        })
        .catch(err => {
          console.error("Failed to copy:", err);
          toast({
            title: "Ошибка",
            description: "Не удалось скопировать ID",
            variant: "destructive"
          });
        });
  };

  const tradeDirection = getTradeDirection(order);
  const formattedRate = getFormattedRateDisplay(order);
  const rateType = getRateDescription(order);
  const { baseCurrency, quoteCurrency } = getTradePairComponents(order);

  // Get location info if available
  const locationInfo = order.geography ?
      `${order.geography.country || ''}${order.geography.country && order.geography.city ? ', ' : ''}${order.geography.city || ''}` :
      '';

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
            "relative flex flex-col p-2 border-b z-10",
            theme === "light" ? "border-border" : "border-white/10",
        )}>
          {/* Header with order ID, type icon and actions */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              {isGreen ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
              <div
                  className="flex items-center cursor-pointer group/copy"
                  onClick={() => copyToClipboard(order.id)}
              >
                <span className="text-xs text-muted-foreground">ID: {order.id.slice(0, 8)}...</span>
                <Copy className="h-3 w-3 ml-0.5 text-muted-foreground opacity-50 group-hover/copy:opacity-100" />
              </div>
              {getOrderStatusBadge(order)}
            </div>

            <Link to={`/orders/${order.id}`}>
              <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Main Content in a compact layout */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-sm">
            {/* Left column - Volume and Amount */}
            <div>
              {/* Volume - Amount * Rate */}
              <div className="font-medium">
                Объем: {formatVolume(Number(order.amount || 0), order.rate)} {quoteCurrency}
              </div>

              {/* Quantity - Original Amount */}
              <div className="font-medium">
                Количество: {formatAmount(Number(order.amount || 0))} {baseCurrency}
              </div>
            </div>

            {/* Right column - Rate and Details */}
            <div>
              {/* Rate with details and location */}
              <div className="">
              <span className={`font-medium ${isGreen ? 'text-green-500' : 'text-red-500'}`}>
                Курс: {formattedRate} 
              </span>
                <div className="text-xs text-muted-foreground">
                  {rateType}
                  {locationInfo && <span className="block italic">{locationInfo}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Trade direction and expiration at the bottom */}
          <div className="text-xs text-muted-foreground mt-1 border-t border-dashed pt-0.5">
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
  );
};
