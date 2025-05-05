
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Order } from "../../types";
import { tradePairs } from "../../data/mockData";
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
    
    if (showDetailedView) {
      return (
        <TableRow className="hover:bg-white/5">
          <TableCell className={`font-medium ${isGreen ? 'text-green-500' : 'text-red-500'}`}>
            {type}
          </TableCell>
          <TableCell>{formatAmount(Number(order.amount))} RUB</TableCell>
          <TableCell>{formatAmount(Number(volume))} T</TableCell>
          <TableCell className={`${isGreen ? 'text-green-500' : 'text-red-500'}`}>
            {order.rate}
          </TableCell>
          <TableCell>Фиксированный</TableCell>
          <TableCell>{formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true })}</TableCell>
          <TableCell>
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-white/10"
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
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-white/5 group-hover:via-white/5 group-hover:to-transparent transition-all duration-300" />
        <div className="relative flex items-center justify-between p-4 border-b border-white/10">
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
                {formatAmount(Number(order.amount))} RUB
              </div>
              <div className="text-xs text-muted-foreground">
                {formatAmount(Number(volume))} T
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
              <div className="text-xs text-white/70">
                Фиксированный
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
          <TableRow className="bg-white/5 border-b border-white/10">
            <TableHead className="text-white font-medium">Тип</TableHead>
            <TableHead className="text-white font-medium">Количество (RUB)</TableHead>
            <TableHead className="text-white font-medium">Объём (T)</TableHead>
            <TableHead className="text-white font-medium">Курс</TableHead>
            <TableHead className="text-white font-medium">Тип курса</TableHead>
            <TableHead className="text-white font-medium">Срок действия</TableHead>
            <TableHead className="text-white font-medium w-[50px]"></TableHead>
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
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 bg-green-500/10 border-b border-white/10">
          <h3 className="text-lg font-semibold text-green-500">Buy Orders</h3>
          <p className="text-sm text-muted-foreground">
            Total Volume: {formatAmount(buyOrders.reduce((sum, order) => sum + Number(order.amount), 0))} RUB
          </p>
        </div>
        <div className="divide-y divide-white/10">
          {buyOrders.map((order) => (
            <OrderRow key={order.id} order={order} type="BUY" />
          ))}
        </div>
      </div>

      {/* Sell Orders */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 bg-red-500/10 border-b border-white/10">
          <h3 className="text-lg font-semibold text-red-500">Sell Orders</h3>
          <p className="text-sm text-muted-foreground">
            Total Volume: {formatAmount(sellOrders.reduce((sum, order) => sum + Number(order.amount), 0))} RUB
          </p>
        </div>
        <div className="divide-y divide-white/10">
          {sellOrders.map((order) => (
            <OrderRow key={order.id} order={order} type="SELL" />
          ))}
        </div>
      </div>
    </div>
  );

  return showDetailedView ? <DetailedView /> : <CardsView />;
};
