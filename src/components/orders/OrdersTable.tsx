
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
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
    .sort((a, b) => Number(b.rate) - Number(a.rate));
  const sellOrders = orders.filter(order => order.type === "SELL")
    .sort((a, b) => Number(a.rate) - Number(b.rate));

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No orders found matching your filters.
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

  const OrderRow = ({ order, type }: { order: Order, type: "BUY" | "SELL" }) => {
    const pair = tradePairs[0];
    const isGreen = type === "BUY";
    const volume = (Number(order.amount) / Number(order.rate)).toFixed(3);
    const rateType = order.rateDetails?.type === "dynamic" ? "Динамический" : "Фиксированный";
    
    if (showDetailedView) {
      return (
        <TableRow className={cn("hover:bg-accent/20")}>
          <TableCell className={`font-medium ${isGreen ? 'text-green-500' : 'text-red-500'}`}>
            {type}
          </TableCell>
          <TableCell>{formatAmount(Number(order.amount))} {order.amountCurrency}</TableCell>
          <TableCell>{formatAmount(Number(volume))} USDT</TableCell>
          <TableCell className={`${isGreen ? 'text-green-500' : 'text-red-500'}`}>
            {order.rate}
          </TableCell>
          <TableCell>{rateType}</TableCell>
          <TableCell>{formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true })}</TableCell>
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
      <div className="group relative">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent",
          "group-hover:from-accent/20 group-hover:via-accent/20 group-hover:to-transparent transition-all duration-300"
        )} />
        <div className={cn(
          "relative flex items-center justify-between p-4 border-b",
          theme === "light" ? "border-border" : "border-white/10"
        )}>
          <div className="flex items-center space-x-4">
            {type === "BUY" ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <div>
              <div className={`text-lg font-medium ${isGreen ? 'text-green-500' : 'text-red-500'}`}>
                {order.rate}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatAmount(Number(order.amount))} {order.amountCurrency}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatAmount(Number(volume))} USDT
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                {pair?.displayName || "RUB/USDT"}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true })}
              </div>
              <div className={cn("text-xs", theme === "light" ? "text-foreground/70" : "text-white/70")}>
                {rateType}
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
            <TableHead className={cn("font-medium", theme === "light" ? "text-foreground" : "text-white")}>Количество</TableHead>
            <TableHead className={cn("font-medium", theme === "light" ? "text-foreground" : "text-white")}>Объём (USDT)</TableHead>
            <TableHead className={cn("font-medium", theme === "light" ? "text-foreground" : "text-white")}>Курс</TableHead>
            <TableHead className={cn("font-medium", theme === "light" ? "text-foreground" : "text-white")}>Тип курса</TableHead>
            <TableHead className={cn("font-medium", theme === "light" ? "text-foreground" : "text-white")}>Срок действия</TableHead>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* Buy Orders */}
      <div className={cn(
        "backdrop-blur-xl border rounded-2xl overflow-hidden",
        theme === "light" 
          ? "bg-white border-border shadow-card" 
          : "bg-white/5 border-white/10"
      )}>
        <div className={cn(
          "p-4 border-b",
          theme === "light" ? "bg-green-500/10 border-border" : "bg-green-500/10 border-white/10"
        )}>
          <h3 className="text-lg font-semibold text-green-500">Buy Orders</h3>
          <p className="text-sm text-muted-foreground">
            Total Volume: {formatAmount(buyOrders.reduce((sum, order) => sum + Number(order.amount), 0))} RUB
          </p>
        </div>
        <div className={cn(
          "divide-y", 
          theme === "light" ? "divide-border" : "divide-white/10"
        )}>
          {buyOrders.map((order) => (
            <OrderRow key={order.id} order={order} type="BUY" />
          ))}
        </div>
      </div>

      {/* Sell Orders */}
      <div className={cn(
        "backdrop-blur-xl border rounded-2xl overflow-hidden",
        theme === "light" 
          ? "bg-white border-border shadow-card" 
          : "bg-white/5 border-white/10"
      )}>
        <div className={cn(
          "p-4 border-b",
          theme === "light" ? "bg-red-500/10 border-border" : "bg-red-500/10 border-white/10"
        )}>
          <h3 className="text-lg font-semibold text-red-500">Sell Orders</h3>
          <p className="text-sm text-muted-foreground">
            Total Volume: {formatAmount(sellOrders.reduce((sum, order) => sum + Number(order.amount), 0))} RUB
          </p>
        </div>
        <div className={cn(
          "divide-y", 
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
