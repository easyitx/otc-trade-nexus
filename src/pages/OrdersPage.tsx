
import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Filter, Plus, Search, ArrowDownUp, List, LayoutGrid } from "lucide-react";
import { tradePairs } from "../data/mockData";
import { Link } from "react-router-dom";
import { OrdersTable } from "../components/orders/OrdersTable";
import { useOrders, OrdersQueryParams } from "@/hooks/useOrders";
import { Order } from "@/types";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function OrdersPage() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPairGroup, setSelectedPairGroup] = useState<string>("all");
  const [minVolume, setMinVolume] = useState(0);
  const [maxVolume, setMaxVolume] = useState(100000000);
  const [volumeRange, setVolumeRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState<string>("highest_volume"); // Default sort by volume
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Prepare query parameters for fetching orders
  const queryParams: OrdersQueryParams = {
    page: currentPage,
    pageSize: pageSize,
    sortBy: 'amount', // Default to amount/volume
    sortOrder: 'desc', // Default to descending (highest to lowest)
    filter: {
      type: selectedType === 'all' ? undefined : selectedType as 'BUY' | 'SELL' | undefined,
      search: searchTerm || undefined,
      // We'll calculate these based on the volume range slider
      minAmount: undefined,
      maxAmount: undefined
    }
  };

  // Map the sortBy dropdown value to query parameters
  useEffect(() => {
    let sort = 'amount';
    let order: 'asc' | 'desc' = 'desc';
    
    switch(sortBy) {
      case 'newest':
        sort = 'created_at';
        order = 'desc';
        break;
      case 'oldest':
        sort = 'created_at';
        order = 'asc';
        break;
      case 'highest_rate':
        sort = 'rate';
        order = 'desc';
        break;
      case 'lowest_rate':
        sort = 'rate';
        order = 'asc';
        break;
      case 'highest_volume':
        sort = 'amount';
        order = 'desc';
        break;
      case 'lowest_volume':
        sort = 'amount';
        order = 'asc';
        break;
      default:
        sort = 'amount';
        order = 'desc';
    }
    
    queryParams.sortBy = sort;
    queryParams.sortOrder = order;
  }, [sortBy]);

  // Get orders with the query parameters
  const { useOrdersQuery } = useOrders();
  const { 
    data: ordersData,
    isLoading: isLoadingOrders,
    isError
  } = useOrdersQuery(queryParams);

  // Calculate min and max volume for the volume range slider
  useEffect(() => {
    if (ordersData?.orders && ordersData.orders.length > 0) {
      const volumes = ordersData.orders.map(order => Number(order.amount));
      
      // Only update if we have a significant change to avoid the slider jumping around
      const calculatedMin = Math.min(...volumes);
      const calculatedMax = Math.max(...volumes);
      
      if (Math.abs(calculatedMin - minVolume) > minVolume * 0.1) {
        setMinVolume(calculatedMin);
      }
      
      if (Math.abs(calculatedMax - maxVolume) > maxVolume * 0.1) {
        setMaxVolume(calculatedMax);
      }
    }
  }, [ordersData?.orders]);

  // Update filter values when volume range changes
  useEffect(() => {
    const actualMinVolume = minVolume + (maxVolume - minVolume) * volumeRange[0] / 100;
    const actualMaxVolume = minVolume + (maxVolume - minVolume) * volumeRange[1] / 100;
    
    queryParams.filter = {
      ...queryParams.filter,
      minAmount: actualMinVolume,
      maxAmount: actualMaxVolume
    };
  }, [volumeRange, minVolume, maxVolume]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatVolumeLabel = (value: number) => {
    const actualValue = minVolume + (maxVolume - minVolume) * value / 100;
    return new Intl.NumberFormat("ru-RU", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(actualValue);
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    if (!ordersData?.totalPages) return null;
    
    const items = [];
    const totalPages = ordersData.totalPages;
    
    // Always show first page, current page, and last page
    // Plus one page before and after current if they exist
    const pagesToShow = new Set([
      1,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      totalPages
    ].filter(p => p >= 1 && p <= totalPages));
    
    const pagesArray = Array.from(pagesToShow).sort((a, b) => a - b);
    
    // Add pagination items with ellipsis where needed
    let prevPage = 0;
    for (const page of pagesArray) {
      if (page - prevPage > 1) {
        // Add ellipsis
        items.push(
          <PaginationItem key={`ellipsis-${prevPage}`}>
            <span className="flex h-9 w-9 items-center justify-center">...</span>
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            isActive={page === currentPage}
            onClick={() => handlePageChange(page)}
            className={cn(
              "cursor-pointer",
              page === currentPage && "bg-otc-primary text-black hover:bg-otc-primary/90"
            )}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
      
      prevPage = page;
    }
    
    return items;
  };

  if (isLoadingOrders) {
    return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-otc-primary"></div>
        </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-6 max-w-md">
          <h3 className="text-lg font-medium mb-2">Error loading orders</h3>
          <p className="text-muted-foreground">There was an error loading the orders. Please try again later.</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

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
                  <Select value={selectedType} onValueChange={value => {
                    setSelectedType(value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}>
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
                  <Select value={selectedPairGroup} onValueChange={value => {
                    setSelectedPairGroup(value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}>
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
                  onValueChange={(value) => {
                    setVolumeRange(value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="w-40 md:w-56">
                <Select value={sortBy} onValueChange={value => {
                  setSortBy(value);
                  setCurrentPage(1); // Reset to first page on sort change
                }}>
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
                )}>{ordersData?.totalCount || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Покупка</p>
                <p className="text-xl font-bold text-green-500">
                  {ordersData?.orders.filter(o => o.type === "BUY").length || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Продажа</p>
                <p className="text-xl font-bold text-red-500">
                  {ordersData?.orders.filter(o => o.type === "SELL").length || 0}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Общий объем на странице</p>
              <p className={cn(
                "text-xl font-bold",
                theme === "light" ? "text-foreground" : "text-white"
              )}>
                {new Intl.NumberFormat("ru-RU", {
                  style: "decimal",
                  maximumFractionDigits: 0,
                }).format((ordersData?.orders || []).reduce((sum, order) => sum + Number(order.amount), 0))} RUB
              </p>
            </div>
          </div>
          
          <OrdersTable orders={ordersData?.orders || []} showDetailedView={viewMode === "table"} />
          
          {/* Pagination */}
          {ordersData && ordersData.totalPages > 1 && (
            <div className={cn(
              "p-4 border-t",
              theme === "light" ? "border-border" : "border-otc-active"
            )}>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={cn(
                        "cursor-pointer",
                        currentPage === 1 && "opacity-50 cursor-not-allowed"
                      )} 
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < (ordersData?.totalPages || 1) && handlePageChange(currentPage + 1)}
                      className={cn(
                        "cursor-pointer",
                        currentPage === (ordersData?.totalPages || 1) && "opacity-50 cursor-not-allowed"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
  );
}
