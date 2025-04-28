
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Order } from "../../types";
import { tradePairs } from "../../data/mockData";

interface OrdersTableProps {
  orders: Order[];
}

export const OrdersTable = ({ orders }: OrdersTableProps) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No orders found matching your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {orders.map((order) => {
        const pair = tradePairs[0]; // Using default pair for now
        
        return (
          <div
            key={order.id}
            className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 transition-all duration-200 hover:bg-white/15"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                order.type === "BUY" 
                  ? "bg-green-900/30 text-green-500" 
                  : "bg-red-900/30 text-red-500"
              }`}>
                {order.type}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pair</span>
                <span className="text-white font-medium">{pair?.displayName || "Unknown"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-white font-medium">
                  ${Number(order.amount).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span className="text-white font-medium">{order.rate}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span className="text-white font-medium">
                  {formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full border-white/20 hover:bg-white/20 text-white transition-colors"
                asChild
              >
                <Link to={`/orders/${order.id}`}>
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
