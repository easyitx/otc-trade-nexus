
import { useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Filter, Plus, Search } from "lucide-react";
import { tradePairs } from "../data/mockData";
import { Link } from "react-router-dom";
import { OrdersTable } from "../components/orders/OrdersTable";
import { useOrders } from "@/hooks/useOrders";

export default function OrdersPage() {
  const { orders, isLoadingOrders } = useOrders();
  const [filteredOrders, setFilteredOrders] = useState(orders || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPairGroup, setSelectedPairGroup] = useState<string>("all");

  useEffect(() => {
    if (!orders) return;
    
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
  }, [searchTerm, selectedType, selectedPairGroup, orders]);

  if (isLoadingOrders) {
    return (
      <MainLayout>
        <div>Loading orders...</div>
      </MainLayout>
    );
  }
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
                <Select value={selectedType} onValueChange={value => setSelectedType(value)}>
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
                <Select value={selectedPairGroup} onValueChange={value => setSelectedPairGroup(value)}>
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
          <OrdersTable orders={filteredOrders} />
        </div>
      </div>
    </MainLayout>
  );
}
