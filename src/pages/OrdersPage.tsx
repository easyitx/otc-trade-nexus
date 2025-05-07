
import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Filter, Plus, Search, ArrowDownUp, List, LayoutGrid } from "lucide-react";
import { tradePairs } from "../data/mockData";
import { Link } from "react-router-dom";
import { OrdersTable } from "../components/orders/OrdersTable";
import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/types";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const { orders, isLoadingOrders } = useOrders();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPairGroup, setSelectedPairGroup] = useState<string>("all");
  const [minVolume, setMinVolume] = useState(0);
  const [maxVolume, setMaxVolume] = useState(100000000);
  const [volumeRange, setVolumeRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const { theme } = useTheme();

  // Calculate actual volume range based on orders
  useEffect(() => {
    if (orders && orders.length > 0) {
      const volumes = orders.map(order => Number(order.amount));
      const min = Math.min(...volumes);
      const max = Math.max(...volumes);
      
      setMinVolume(min);
      setMaxVolume(max);
      setVolumeRange([0, 100]);
    }
  }, [orders]);

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

    // Filter by volume
    const actualMinVolume = minVolume + (maxVolume - minVolume) * volumeRange[0] / 100;
    const actualMaxVolume = minVolume + (maxVolume - minVolume) * volumeRange[1] / 100;
    
    result = result.filter(order => {
      const amount = Number(order.amount);
      return amount >= actualMinVolume && amount <= actualMaxVolume;
    });
    
    // Sort orders
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "highest_rate":
        result.sort((a, b) => Number(b.rate) - Number(a.rate));
        break;
      case "lowest_rate":
        result.sort((a, b) => Number(a.rate) - Number(b.rate));
        break;
      case "highest_volume":
        result.sort((a, b) => Number(b.amount) - Number(a.amount));
        break;
      case "lowest_volume":
        result.sort((a, b) => Number(a.amount) - Number(b.amount));
        break;
      default:
        break;
    }
    
    setFilteredOrders(result);
  }, [searchTerm, selectedType, selectedPairGroup, volumeRange, sortBy, orders, minVolume, maxVolume]);

  if (isLoadingOrders) {
    return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-otc-primary"></div>
        </div>
    );
  }
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const formatVolumeLabel = (value: number) => {
    const actualValue = minVolume + (maxVolume - minVolume) * value / 100;
    return new Intl.NumberFormat("ru-RU", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(actualValue);
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={cn(
            "text-2xl font-bold", 
            theme === "light" ? "text-foreground" : "text-white"
          )}>ОТС Заявки</h1>
          <Button className="bg-otc-primary text-black hover:bg-otc-primary/90" asChild>
            <Link to="/create-order">
              <Plus className="mr-2 h-4 w-4" />
              Новая заявка
            </Link>
          </Button>
        </div>
        
        {/* Filters */}
        <Card className={cn(
          "p-4",
          theme === "light" 
            ? "bg-card border-border" 
            : "bg-otc-card border-otc-active"
        )}>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск заявок..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className={cn(
                    "pl-10",
                    theme === "light" 
                      ? "bg-accent/50 border-accent" 
                      : "bg-otc-active border-otc-active text-white"
                  )}
                />
              </div>
              
              <div className="flex gap-4">
                <div className="w-40">
                  <Select value={selectedType} onValueChange={value => setSelectedType(value)}>
                    <SelectTrigger className={cn(
                      theme === "light" 
                        ? "bg-accent/50 border-accent" 
                        : "bg-otc-active border-otc-active text-white"
                    )}>
                      <SelectValue placeholder="Тип заявки" />
                    </SelectTrigger>
                    <SelectContent className={cn(
                      theme === "light" 
                        ? "bg-card border-border" 
                        : "bg-otc-card border-otc-active"
                    )}>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="BUY">Покупка</SelectItem>
                      <SelectItem value="SELL">Продажа</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-40">
                  <Select value={selectedPairGroup} onValueChange={value => setSelectedPairGroup(value)}>
                    <SelectTrigger className={cn(
                      theme === "light" 
                        ? "bg-accent/50 border-accent" 
                        : "bg-otc-active border-otc-active text-white"
                    )}>
                      <SelectValue placeholder="Группа пар" />
                    </SelectTrigger>
                    <SelectContent className={cn(
                      theme === "light" 
                        ? "bg-card border-border" 
                        : "bg-otc-card border-otc-active"
                    )}>
                      <SelectItem value="all">Все группы</SelectItem>
                      <SelectItem value="RUB_NR">RUB (NR)</SelectItem>
                      <SelectItem value="RUB_CASH">RUB (Cash)</SelectItem>
                      <SelectItem value="TOKENIZED">Tokenized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant={viewMode === "cards" ? "default" : "outline"} 
                  size="icon"
                  className={cn(
                    viewMode === "cards"
                      ? "bg-otc-primary hover:bg-otc-primary/90"
                      : theme === "light" 
                        ? "border-border hover:bg-accent" 
                        : "border-otc-active hover:bg-otc-active",
                    theme === "light" && viewMode !== "cards" ? "text-foreground" : "text-black",
                  )}
                  onClick={() => setViewMode("cards")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "table" ? "default" : "outline"} 
                  size="icon"
                  className={cn(
                    viewMode === "table"
                      ? "bg-otc-primary hover:bg-otc-primary/90"
                      : theme === "light" 
                        ? "border-border hover:bg-accent" 
                        : "border-otc-active hover:bg-otc-active",
                    theme === "light" && viewMode !== "table" ? "text-foreground" : "text-black",
                  )}
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Объем: {formatVolumeLabel(volumeRange[0])} - {formatVolumeLabel(volumeRange[1])} RUB</span>
                </div>
                <Slider
                  defaultValue={[0, 100]}
                  value={volumeRange}
                  onValueChange={setVolumeRange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="w-40 md:w-56">
                <Select value={sortBy} onValueChange={value => setSortBy(value)}>
                  <SelectTrigger className={cn(
                    theme === "light" 
                      ? "bg-accent/50 border-accent" 
                      : "bg-otc-active border-otc-active text-white"
                  )}>
                    <ArrowDownUp className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent className={cn(
                    theme === "light" 
                      ? "bg-card border-border" 
                      : "bg-otc-card border-otc-active"
                  )}>
                    <SelectItem value="newest">Новые заявки</SelectItem>
                    <SelectItem value="oldest">Старые заявки</SelectItem>
                    <SelectItem value="highest_rate">Лучший курс (макс)</SelectItem>
                    <SelectItem value="lowest_rate">Лучший курс (мин)</SelectItem>
                    <SelectItem value="highest_volume">Объем (макс)</SelectItem>
                    <SelectItem value="lowest_volume">Объем (мин)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Orders table with stats */}
        <div className={cn(
          "border rounded-lg overflow-hidden",
          theme === "light" 
            ? "bg-card border-border" 
            : "bg-otc-card border-otc-active"
        )}>
          <div className={cn(
            "p-4 border-b flex flex-wrap gap-4 justify-between",
            theme === "light" ? "border-border" : "border-otc-active"
          )}>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Всего заявок</p>
                <p className={cn(
                  "text-xl font-bold",
                  theme === "light" ? "text-foreground" : "text-white"
                )}>{filteredOrders.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Покупка</p>
                <p className="text-xl font-bold text-green-500">
                  {filteredOrders.filter(o => o.type === "BUY").length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Продажа</p>
                <p className="text-xl font-bold text-red-500">
                  {filteredOrders.filter(o => o.type === "SELL").length}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Общий объем</p>
              <p className={cn(
                "text-xl font-bold",
                theme === "light" ? "text-foreground" : "text-white"
              )}>
                {new Intl.NumberFormat("ru-RU", {
                  style: "decimal",
                  maximumFractionDigits: 0,
                }).format(filteredOrders.reduce((sum, order) => sum + Number(order.amount), 0))} RUB
              </p>
            </div>
          </div>
          
          <OrdersTable orders={filteredOrders} showDetailedView={viewMode === "table"} />
        </div>
      </div>
  );
}
