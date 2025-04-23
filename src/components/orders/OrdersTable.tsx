
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { Order, TradePair } from "../../types";
import { tradePairs, users } from "../../data/mockData";

interface OrdersTableProps {
  orders: Order[];
}

export const OrdersTable = ({ orders }: OrdersTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-otc-active">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Pair</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rate</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Expires</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-otc-active">
          {orders.map((order) => {
            const pair = tradePairs.find(p => p.id === order.tradePairId);
            const user = users.find(u => u.id === order.userId);
            
            return (
              <tr key={order.id} className="hover:bg-otc-active/50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`text-sm font-semibold rounded-full px-2 py-0.5 ${
                    order.type === "BUY" ? "bg-green-900/30 text-green-500" : "bg-red-900/30 text-red-500"
                  }`}>
                    {order.type}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                  {pair?.displayName || "Unknown Pair"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                  ${order.amount.toLocaleString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                  {order.rate}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {user?.company || "Unknown"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  <Button variant="ghost" size="sm" className="hover:bg-otc-active hover:text-white" asChild>
                    <Link to={`/orders/${order.id}`}>
                      Details <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            );
          })}
          
          {orders.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                No orders found matching your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
