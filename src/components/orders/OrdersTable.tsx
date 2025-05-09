import { useTheme } from "@/contexts/ThemeContext";
import { Order } from "@/types";
import { cn } from "@/lib/utils";
import { convertToUSD } from "@/hooks/useOrders";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { OrderCard } from "./OrderCard";
import { OrderTableRow } from "./OrderTableRow";

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

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Заявки не найдены.
      </div>
    );
  }

  // Calculate volume percentage for visual representation
  const calculateVolumePercentage = (order: Order, orderType: "BUY" | "SELL") => {
    try {
      // Determine total volume for corresponding order type
      const totalVolume = orderType === "BUY" ? totalBuyVolumeUSD : totalSellVolumeUSD;
      if (totalVolume <= 0) return 5; // Minimum value for display
      
      // Convert current order to USD for consistent comparison
      const orderVolumeUSD = convertToUSD(Number(order.amount), order.amountCurrency || "USD", order.rate);
      
      // Calculate percentage but limit maximum to 100%
      const percentage = (orderVolumeUSD / totalVolume) * 100;
      
      // Limit maximum to 100% and minimum to 5% for visibility of small orders
      return Math.min(100, Math.max(5, percentage));
    } catch (error) {
      console.error("Error calculating volume percentage:", error);
      return 5; // Return minimum value in case of error
    }
  };

  // Check if order is expired or archived
  const isExpiredOrArchived = (order: Order): boolean => {
    return order.status === "ARCHIVED" || new Date(order.expiresAt) < new Date();
  };

  // Table view for detailed display
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
            <OrderTableRow 
              key={order.id} 
              order={order} 
              volumePercentage={calculateVolumePercentage(order, order.type)}
              isExpiredOrArchived={isExpiredOrArchived(order)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Card view for compact display
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
            Всего: {new Intl.NumberFormat("ru-RU", {
              style: "decimal",
              maximumFractionDigits: 2,
              minimumFractionDigits: 0,
            }).format(buyOrders.reduce((sum, order) => sum + Number(order.amount), 0))} {buyOrders.length > 0 ? buyOrders[0].amountCurrency || 'RUB' : 'RUB'}
          </p>
        </div>
        <div className={cn(
          "divide-y max-h-[500px] overflow-y-auto", 
          theme === "light" ? "divide-border" : "divide-white/10"
        )}>
          {buyOrders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              volumePercentage={calculateVolumePercentage(order, "BUY")}
              isExpiredOrArchived={isExpiredOrArchived(order)}
            />
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
            Всего: {new Intl.NumberFormat("ru-RU", {
              style: "decimal",
              maximumFractionDigits: 2,
              minimumFractionDigits: 0,
            }).format(sellOrders.reduce((sum, order) => sum + Number(order.amount), 0))} {sellOrders.length > 0 ? sellOrders[0].amountCurrency || 'RUB' : 'RUB'}
          </p>
        </div>
        <div className={cn(
          "divide-y max-h-[500px] overflow-y-auto", 
          theme === "light" ? "divide-border" : "divide-white/10"
        )}>
          {sellOrders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              volumePercentage={calculateVolumePercentage(order, "SELL")}
              isExpiredOrArchived={isExpiredOrArchived(order)}
            />
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

  // Return the appropriate view based on the showDetailedView prop
  return showDetailedView ? <DetailedView /> : <CardsView />;
};
