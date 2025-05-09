
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "../ui/button";
import { Order } from "../../types";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { convertToUSD } from "@/hooks/useOrders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface OrdersTableProps {
  orders: Order[];
  showDetailedView?: boolean;
}

export const OrdersTable = ({ orders, showDetailedView = false }: OrdersTableProps) => {
  const { theme } = useTheme();
  
  // Split orders into buy and sell
  const buyOrders = orders.filter(order => order.type === "BUY")
    .sort((a, b) => Number(b.amount) - Number(a.amount));
  const sellOrders = orders.filter(order => order.type === "SELL")
    .sort((a, b) => Number(b.amount) - Number(a.amount));
    
  // Calculate total volume for percentages in USD equivalent for consistent comparison
  const totalBuyVolumeUSD = buyOrders.reduce((sum, order) => {
    const orderVolumeUSD = convertToUSD(Number(order.amount), order.amountCurrency || "USD", order.rate);
    return sum + orderVolumeUSD;
  }, 0);
  
  const totalSellVolumeUSD = sellOrders.reduce((sum, order) => {
    const orderVolumeUSD = convertToUSD(Number(order.amount), order.amountCurrency || "USD", order.rate);
    return sum + orderVolumeUSD;
  }, 0);

  // Для отладки выведем общие объемы
  console.log('Общий объем покупок (USD):', totalBuyVolumeUSD);
  console.log('Общий объем продаж (USD):', totalSellVolumeUSD);

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Заявки не найдены.
      </div>
    );
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "decimal",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
  
  const getFormattedRateDisplay = (order: Order) => {
    if (order.type === "BUY") {
      return order.rateDetails?.type === "dynamic" 
        ? `ЦБ+${order.rateDetails.adjustment}%` 
        : `${order.rate}`;
    } else {
      // For sell orders
      return order.rateDetails?.type === "dynamic" 
        ? `ЦБ+${order.rateDetails.adjustment}%` 
        : `${order.rate}`;
    }
  };
  
  // Улучшенная функция расчета процентного отображения объема заявки
  const calculateVolumePercentage = (order: Order, orderType: "BUY" | "SELL") => {
    try {
      // Определяем общий объем для соответствующего типа заявки
      const totalVolume = orderType === "BUY" ? totalBuyVolumeUSD : totalSellVolumeUSD;
      if (totalVolume <= 0) return 5; // Минимальное значение для отображения
      
      // Конвертируем текущую заявку в USD для корректного сравнения
      const orderVolumeUSD = convertToUSD(Number(order.amount), order.amountCurrency || "USD", order.rate);
      
      // Рассчитываем процент, но ограничиваем максимум до 100%
      const percentage = (orderVolumeUSD / totalVolume) * 100;
      
      // Лог для отладки
      console.log(`Заявка ${order.id} (${orderType}): объем ${orderVolumeUSD.toFixed(2)} USD, ${percentage.toFixed(2)}% от общего объема ${totalVolume.toFixed(2)} USD`);
      
      // Ограничиваем максимум до 100% и минимум до 5% для наглядности маленьких заявок
      return Math.min(100, Math.max(5, percentage));
    } catch (error) {
      console.error("Ошибка при расчете процента объема:", error);
      return 5; // Возвращаем минимальное значение в случае ошибки
    }
  };

  // Функция для определения торговой пары
  const getTradePairComponents = (order: Order) => {
    const baseCurrency = order.amountCurrency || "RUB";
    const quoteCurrency = baseCurrency === "RUB" ? "USDT" : "RUB";
    
    return { baseCurrency, quoteCurrency };
  };

  // Функция для получения текстового описания направления обмена
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

  const OrderRow = ({ order, type }: { order: Order, type: "BUY" | "SELL" }) => {
    const isGreen = type === "BUY";
    const volumePercentage = calculateVolumePercentage(order, type);
    const { baseCurrency, quoteCurrency } = getTradePairComponents(order);
    const tradePairDisplay = `${baseCurrency}/${quoteCurrency}`;
    const tradeDirection = getTradeDirection(order);
    const formattedRate = getFormattedRateDisplay(order);
    const rateType = getRateDescription(order);
    
    if (showDetailedView) {
      return (
        <TableRow className={cn("hover:bg-accent/20")}>
          <TableCell className={`font-medium ${isGreen ? 'text-green-500' : 'text-red-500'}`}>
            {type === "BUY" ? "Покупка" : "Продажа"}
          </TableCell>
          <TableCell>{formatAmount(Number(order.amount))} {order.amountCurrency}</TableCell>
          <TableCell className={`${isGreen ? 'text-green-500' : 'text-red-500'}`}>
            {formattedRate}
          </TableCell>
          <TableCell>{rateType}</TableCell>
          <TableCell>{tradePairDisplay}</TableCell>
          <TableCell>{tradeDirection.fullDirection}</TableCell>
          <TableCell>{formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true, locale: ru })}</TableCell>
          <TableCell>
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
    }

    return (
      <div className="relative group">
        {/* Фоновая заливка на основе процента от общего объема с улучшенной визуализацией */}
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
            {type === "BUY" ? (
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
              </div>
              <div className="text-base font-semibold">
                {formatAmount(Number(order.amount))} {order.amountCurrency}
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">{tradeDirection.fullDirection}</span> • истекает {formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true, locale: ru })}
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

  const DetailedView = () => (
    <div className="w-full overflow-auto">
      <Table className="w-full border-collapse">
        <TableHeader>
          <TableRow className={cn(
            "border-b",
            theme === "light" ? "bg-accent/50" : "bg-white/5 border-white/10"
          )}>
            <TableHead className={cn("font-medium", theme === "light" ? "text-foreground" : "text-white")}>Тип</TableHead>
            <TableHead className={cn("font-medium", theme === "light" ? "text-foreground" : "text-white")}>Объем</TableHead>
            <TableHead className={cn("font-medium", theme === "light" ? "text-foreground" : "text-white")}>Курс</TableHead>
            <TableHead className={cn("font-medium", theme === "light" ? "text-foreground" : "text-white")}>Тип курса</TableHead>
            <TableHead className={cn("font-medium", theme === "light" ? "text-foreground" : "text-white")}>Пара</TableHead>
            <TableHead className={cn("font-medium", theme === "light" ? "text-foreground" : "text-white")}>Направление</TableHead>
            <TableHead className={cn("font-medium", theme === "light" ? "text-foreground" : "text-white")}>Срок</TableHead>
            <TableHead className={cn("font-medium", theme === "light" ? "text-foreground" : "text-white w-[50px]")}></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} type={order.type} />
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const CardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
      {/* Buy Orders */}
      <div className={cn(
        "backdrop-blur-xl border rounded-lg overflow-hidden",
        theme === "light" 
          ? "bg-white border-border shadow-card" 
          : "bg-white/5 border-white/10"
      )}>
        <div className={cn(
          "p-3 border-b",
          theme === "light" ? "bg-green-500/10 border-border" : "bg-green-500/10 border-white/10"
        )}>
          <h3 className="text-sm font-semibold text-green-500">Заявки на покупку</h3>
          <p className="text-xs text-muted-foreground">
            Всего: {formatAmount(buyOrders.reduce((sum, order) => sum + Number(order.amount), 0))} {buyOrders.length > 0 ? buyOrders[0].amountCurrency || 'RUB' : 'RUB'}
          </p>
        </div>
        <div className={cn(
          "divide-y max-h-[500px] overflow-y-auto", 
          theme === "light" ? "divide-border" : "divide-white/10"
        )}>
          {buyOrders.map((order) => (
            <OrderRow key={order.id} order={order} type="BUY" />
          ))}
          {buyOrders.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              Нет активных заявок на покупку
            </div>
          )}
        </div>
      </div>

      {/* Sell Orders */}
      <div className={cn(
        "backdrop-blur-xl border rounded-lg overflow-hidden",
        theme === "light" 
          ? "bg-white border-border shadow-card" 
          : "bg-white/5 border-white/10"
      )}>
        <div className={cn(
          "p-3 border-b",
          theme === "light" ? "bg-red-500/10 border-border" : "bg-red-500/10 border-white/10"
        )}>
          <h3 className="text-sm font-semibold text-red-500">Заявки на продажу</h3>
          <p className="text-xs text-muted-foreground">
            Всего: {formatAmount(sellOrders.reduce((sum, order) => sum + Number(order.amount), 0))} {sellOrders.length > 0 ? sellOrders[0].amountCurrency || 'RUB' : 'RUB'}
          </p>
        </div>
        <div className={cn(
          "divide-y max-h-[500px] overflow-y-auto", 
          theme === "light" ? "divide-border" : "divide-white/10"
        )}>
          {sellOrders.map((order) => (
            <OrderRow key={order.id} order={order} type="SELL" />
          ))}
          {sellOrders.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              Нет активных заявок на продажу
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return showDetailedView ? <DetailedView /> : <CardsView />;
};
