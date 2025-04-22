
import { useEffect, useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { ArrowRight, ArrowUpRight, CircleDollarSign, TrendingUp, Clock, Users } from "lucide-react";
import { orders, tradePairs } from "../data/mockData";
import { Order, TradePair, TradePairGroup } from "../types";
import { Link } from "react-router-dom";

// Order card component for the dashboard
const OrderCard = ({ order }: { order: Order }) => {
  const pair = tradePairs.find(p => p.id === order.tradePairId);
  
  return (
    <Card className="bg-otc-card border-otc-active">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <span className={`text-sm font-semibold rounded-full px-2 py-0.5 ${
              order.type === "BUY" ? "bg-green-900/30 text-green-500" : "bg-red-900/30 text-red-500"
            }`}>
              {order.type}
            </span>
            <span className="ml-2 text-white font-medium">
              {pair?.displayName || "Unknown Pair"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Amount:</span>
            <span className="text-white font-medium">${order.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Rate:</span>
            <span className="text-white font-medium">{order.rate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Expires:</span>
            <span className="text-white font-medium">
              {new Date(order.expiresAt).toLocaleDateString()}
            </span>
          </div>
          {order.purpose && (
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Purpose:</span>
              <span className="text-white font-medium">{order.purpose}</span>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="w-full border-otc-active hover:bg-otc-active hover:text-white"
          >
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Stats card component
interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: number;
}

const StatsCard = ({ title, value, description, icon, trend }: StatsCardProps) => (
  <Card className="bg-otc-card border-otc-active">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="h-8 w-8 rounded-full bg-otc-icon-bg flex items-center justify-center">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
      <p className="text-xs text-muted-foreground mt-1 flex items-center">
        {description}
        {trend && (
          <span className={`ml-2 flex items-center ${trend > 0 ? "text-green-500" : "text-red-500"}`}>
            {trend > 0 ? "+" : ""}{trend}%
            <ArrowUpRight className="h-3 w-3 ml-0.5" />
          </span>
        )}
      </p>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    // In a real app, we would fetch this data from an API
    setActiveOrders(orders.filter(order => order.status === "ACTIVE"));
  }, []);
  
  const filterOrdersByGroup = (orders: Order[], group: string): Order[] => {
    if (group === "all") return orders;
    
    return orders.filter(order => {
      const pair = tradePairs.find(p => p.id === order.tradePairId);
      return pair?.group === group;
    });
  };

  const filteredOrders = filterOrdersByGroup(activeOrders, activeTab);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-lg bg-gradient-to-r from-otc-active to-otc-card p-6 border border-otc-active">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome, {currentUser?.fullName.split(' ')[0]}
              </h1>
              <p className="text-muted-foreground mt-1">
                Trade larger volumes with minimal slippage through our OTC desk.
              </p>
            </div>
            <Button className="mt-4 md:mt-0 bg-otc-primary text-black hover:bg-otc-primary/90">
              Create New Order
            </Button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Trading Volume"
            value="$24.5M"
            description="Last 30 days"
            icon={<CircleDollarSign className="h-5 w-5 text-otc-icon" />}
            trend={12}
          />
          <StatsCard 
            title="Active Orders"
            value={activeOrders.length.toString()}
            description="Across all markets"
            icon={<TrendingUp className="h-5 w-5 text-otc-icon" />}
          />
          <StatsCard 
            title="Average Settlement"
            value="4.2 hrs"
            description="Order to completion"
            icon={<Clock className="h-5 w-5 text-otc-icon" />}
            trend={-8}
          />
          <StatsCard 
            title="Active Traders"
            value="142"
            description="This week"
            icon={<Users className="h-5 w-5 text-otc-icon" />}
            trend={5}
          />
        </div>
        
        {/* Market Orders */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Active Market Orders</h2>
            <Link to="/orders" className="text-otc-primary hover:underline text-sm flex items-center">
              View all orders <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-otc-active mb-6">
              <TabsTrigger value="all">All Pairs</TabsTrigger>
              <TabsTrigger value="RUB_NR">RUB (NR)</TabsTrigger>
              <TabsTrigger value="RUB_CASH">RUB (Cash)</TabsTrigger>
              <TabsTrigger value="TOKENIZED">Tokenized</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-otc-card rounded-lg border border-otc-active">
                  <p className="text-muted-foreground">No active orders found for this category.</p>
                  <Button className="mt-4 bg-otc-primary text-black hover:bg-otc-primary/90">
                    Create Order
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
