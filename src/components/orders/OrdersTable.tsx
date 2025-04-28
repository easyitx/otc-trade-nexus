
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Order } from "../../types";
import { tradePairs } from "../../data/mockData";

interface OrdersTableProps {
  orders: Order[];
}

export const OrdersTable = ({ orders }: OrdersTableProps) => {
  // Split orders into buy and sell
  const buyOrders = orders.filter(order => order.type === "BUY")
    .sort((a, b) => Number(b.rate) - Number(a.rate));
  const sellOrders = orders.filter(order => order.type === "SELL")
    .sort((a, b) => Number(b.rate) - Number(a.rate));

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No orders found matching your filters.
      </div>
    );
  }

  const OrderRow = ({ order, type }: { order: Order, type: "BUY" | "SELL" }) => {
    const pair = tradePairs[0];
    const isGreen = type === "BUY";
    
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
                ${Number(order.amount).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                {pair?.displayName}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true })}
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* Buy Orders */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 bg-green-500/10 border-b border-white/10">
          <h3 className="text-lg font-semibold text-green-500">Buy Orders</h3>
          <p className="text-sm text-muted-foreground">
            Total Volume: ${buyOrders.reduce((sum, order) => sum + Number(order.amount), 0).toLocaleString()}
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
            Total Volume: ${sellOrders.reduce((sum, order) => sum + Number(order.amount), 0).toLocaleString()}
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
};
