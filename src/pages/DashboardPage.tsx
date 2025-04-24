import { useEffect, useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { ArrowRight, CircleDollarSign, TrendingUp, Clock, Users, ArrowUpRight } from "lucide-react";
import { tradePairs } from "../data/mockData";
import { Order, OrderType } from "../types";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

// Order card component for the dashboard
const OrderCard = ({ order }: { order: Order }) => {
  // Since tradePairId doesn't exist in the DB yet, we'll use a default pair
  const pair = tradePairs[0];
  
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
            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Amount:</span>
            <span className="text-white font-medium">${Number(order.amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Rate:</span>
            <span className="text-white font-medium">{order.rate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Expires:</span>
            <span className="text-white font-medium">
              {formatDistanceToNow(new Date(order.expiresAt), { addSuffix: true })}
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
            asChild
          >
            <Link to={`/orders/${order.id}`}>
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
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
  const { currentUser, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch active orders
  const { data: activeOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['active-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching active orders:", error);
        return [];
      }

      return data.map(order => ({
        ...order,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at),
        expiresAt: new Date(order.expires_at),
        userId: order.user_id,
        tradePairId: "USD_USDT_PAIR", // Add default tradePairId
        // Explicitly cast the type to OrderType
        type: order.type === "BUY" || order.type === "SELL" 
          ? order.type as OrderType 
          : "BUY", // Default to BUY if not matching
        // Ensure status is cast to the proper union type
        status: ["ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED"].includes(order.status || "")
          ? order.status as "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED"
          : "ACTIVE" // Default to ACTIVE if not matching
      }));
    }
  });

  // Fetch platform statistics
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('amount, created_at, status');

  if (ordersError) {
    console.error("Error fetching orders for stats:", ordersError);
    return {
      totalVolume: 0,
      activeOrders: 0,
      avgSettlement: "N/A",
      activeTraders: 0
    };
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

  // Calculate total volume from last 30 days
  const totalVolume = ordersData
    .filter(order => new Date(order.created_at) >= thirtyDaysAgo)
    .reduce((sum, order) => sum + Number(order.amount), 0);

  // Count active orders
  const activeOrders = ordersData.filter(order => order.status === 'ACTIVE').length;

  // Get unique traders count for this week
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, created_at');

  const weekAgo = new Date(now.setDate(now.getDate() - 7));
  const activeTraders = profiles?.filter(profile => 
    new Date(profile.created_at) >= weekAgo
  ).length || 0;

  return {
    totalVolume,
    activeOrders,
    avgSettlement: "4.2 hrs", // This would need real data calculation
    activeTraders
  };
  
  const filterOrdersByGroup = (orders: Order[], group: string): Order[] => {
    if (group === "all") return orders;
    
    return orders.filter(order => {
      const pair = tradePairs.find(p => p.id === "USD_USDT_PAIR"); // Using default pair for now
      return pair?.group === group;
    });
  };

  const filteredOrders = filterOrdersByGroup(activeOrders, activeTab);
  
  if (isLoadingOrders) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-otc-primary"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-lg bg-gradient-to-r from-otc-active to-otc-card p-6 border border-otc-active">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome, {profile?.full_name ? profile.full_name.split(' ')[0] : 'User'}
              </h1>
              <p className="text-muted-foreground mt-1">
                Trade larger volumes with minimal slippage through our OTC desk.
              </p>
            </div>
            <Button className="mt-4 md:mt-0 bg-otc-primary text-black hover:bg-otc-primary/90" asChild>
              <Link to="/create-order">Create New Order</Link>
            </Button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Trading Volume"
            value={`$${(stats?.totalVolume || 0).toLocaleString()}`}
            description="Last 30 days"
            icon={<CircleDollarSign className="h-5 w-5 text-otc-icon" />}
          />
          <StatsCard 
            title="Active Orders"
            value={String(stats?.activeOrders || 0)}
            description="Across all markets"
            icon={<TrendingUp className="h-5 w-5 text-otc-icon" />}
          />
          <StatsCard 
            title="Average Settlement"
            value={stats?.avgSettlement || "N/A"}
            description="Order to completion"
            icon={<Clock className="h-5 w-5 text-otc-icon" />}
          />
          <StatsCard 
            title="Active Traders"
            value={String(stats?.activeTraders || 0)}
            description="This week"
            icon={<Users className="h-5 w-5 text-otc-icon" />}
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
                  <Button className="mt-4 bg-otc-primary text-black hover:bg-otc-primary/90" asChild>
                    <Link to="/create-order">Create Order</Link>
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
