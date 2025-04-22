
import { useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ArrowDownUp, Search, Plus, ArrowRight, Filter } from "lucide-react";
import { orders, tradePairs, users } from "../data/mockData";
import { Order, OrderType, TradePair, TradePairGroup } from "../types";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router-dom";

export default function OrdersPage() {
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPairGroup, setSelectedPairGroup] = useState<string>("all");

  useEffect(() => {
    let result = [...orders];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(order => {
        const pair = tradePairs.find(p => p.id === order.tradePairId);
        const pairName = pair?.displayName || "";
        const searchLower = searchTerm.toLowerCase();
        
        return (
          pairName.toLowerCase().includes(searchLower) || 
          order.purpose?.toLowerCase().includes(searchLower) ||
          order.notes?.toLowerCase().includes(searchLower) ||
          order.rate.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Filter by order type
    if (selectedType !== "all") {
      result = result.filter(order => order.type === selectedType);
    }
    
    // Filter by pair group
    if (selectedPairGroup !== "all") {
      result = result.filter(order => {
        const pair = tradePairs.find(p => p.id === order.tradePairId);
        return pair?.group === selectedPairGroup;
      });
    }
    
    setFilteredOrders(result);
  }, [searchTerm, selectedType, selectedPairGroup]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };
  
  const handleGroupChange = (value: string) => {
    setSelectedPairGroup(value);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Market Orders</h1>
          <Button className="bg-otc-primary text-black hover:bg-otc-primary/90" asChild>
            <Link to="/create-order">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Link>
          </Button>
        </div>
        
        {/* Filters */}
        <Card className="bg-otc-card border-otc-active p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="w-40">
                <Select value={selectedType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="bg-otc-active border-otc-active text-white">
                    <SelectValue placeholder="Order Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-otc-card border-otc-active">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="BUY">Buy Orders</SelectItem>
                    <SelectItem value="SELL">Sell Orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-40">
                <Select value={selectedPairGroup} onValueChange={handleGroupChange}>
                  <SelectTrigger className="bg-otc-active border-otc-active text-white">
                    <SelectValue placeholder="Pair Group" />
                  </SelectTrigger>
                  <SelectContent className="bg-otc-card border-otc-active">
                    <SelectItem value="all">All Groups</SelectItem>
                    <SelectItem value="RUB_NR">RUB (NR)</SelectItem>
                    <SelectItem value="RUB_CASH">RUB (Cash)</SelectItem>
                    <SelectItem value="TOKENIZED">Tokenized</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" className="border-otc-active hover:bg-otc-active text-white">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Orders table */}
        <div className="bg-otc-card border border-otc-active rounded-lg overflow-hidden">
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
                {filteredOrders.map((order) => {
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
                
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No orders found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
