
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "../ui/button";
import { Order } from "../../types";
import { tradePairs } from "../../data/mockData";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
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
    
  // Calculate total volume for percentages
  const totalBuyVolume = buyOrders.reduce((sum, order) => {
    // Convert to USD equivalent for consistent comparison
    const orderVolumeUSD = order.amountCurrency === "USD" || order.amountCurrency === "USDT" 
      ? Number(order.amount) 
      : Number(order.amount) / Number(order.rate);
    return sum + orderVolumeUSD;
  }, 0);
  
  const totalSellVolume = sellOrders.reduce((sum, order) => {
    // Convert to USD equivalent for consistent comparison
    const orderVolumeUSD = order.amountCurrency === "USD" || order.amountCurrency === "USDT" 
      ? Number(order.amount) 
      : Number(order.amount) / Number(order.rate);
    return sum + orderVolumeUSD;
  }, 0);

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
  
  // Calculate the percentage of the total volume an order represents
  const calculateVolumePercentage = (order: Order, orderType: "BUY" | "SELL") => {
    const totalVolume = orderType === "BUY" ? totalBuyVolume : totalSellVolume;
    if (totalVolume === 0) return 0;
    
    // Convert to USD equivalent for consistent comparison
    const orderVolumeUSD = order.amountCurrency === "USD" || order.amountCurrency === "USDT" 
      ? Number(order.amount) 
      : Number(order.amount) / Number(order.rate);
      
    return (orderVolumeUSD / totalVolume) * 100;
  };

  const OrderRow = ({ order, type }: { order: Order, type: "BUY" | "SELL" }) => {
    const isGreen = type === "BUY";
    const volumePercentage = calculateVolumePercentage(order, type);
    const tradePairDisplay = order.amountCurrency === "RUB" ? "RUB/USDT" : "USDT/RUB";
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
        {/* Background fill based on percentage of total volume */}
        <div 
          className={cn(
            "absolute inset-0 opacity-20 z-0",
            isGreen ? "bg-green-500" : "bg-red-500"
          )}
          style={{
            width: `${volumePercentage}%`,
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
                {tradePairDisplay} • истекает {formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true, locale: ru })}
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 p-0">
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
        </div>
      </div>
    </div>
  );

  return showDetailedView ? <DetailedView /> : <CardsView />;
};

