
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
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { Progress } from "@/components/ui/progress";

export default function OrdersPage() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPairGroup, setSelectedPairGroup] = useState<string>("all");
  const [volumeRange, setVolumeRange] = useState([0, 100]);
  const [minVolume, setMinVolume] = useState(0);
  const [maxVolume, setMaxVolume] = useState(100000000);
  const [sortBy, setSortBy] = useState<string>("amount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<string>("all");

  // Trading pairs for quick filtering
  const tradingPairs = [
    { id: "USDT_RUB", display: "USDT/RUB" },
    { id: "USD_RUB", display: "USD/RUB" },
    { id: "EUR_RUB", display: "EUR/RUB" },
    { id: "USDT_CNY", display: "USDT/CNY" },
    { id: "RUB_AED", display: "RUB/AED" },
  ];

  // Calculate actual min/max amounts for filtering
  const actualMinVolume = minVolume + (maxVolume - minVolume) * volumeRange[0] / 100;
  const actualMaxVolume = minVolume + (maxVolume - minVolume) * volumeRange[1] / 100;

  // Prepare query parameters for fetching orders
  const queryParams: OrdersQueryParams = {
    page: currentPage,
    pageSize: pageSize,
    sortBy: sortBy,
    sortOrder: sortOrder,
    filter: {
      type: selectedType === 'all' ? undefined : selectedType as 'BUY' | 'SELL' | undefined,
      search: debouncedSearchTerm || undefined,
      minAmount: actualMinVolume,
      maxAmount: actualMaxVolume,
      tradePair: selectedPair === 'all' ? undefined : selectedPair
    }
  };

  // Get orders with the query parameters
  const { useOrdersQuery } = useOrders();
  const { 
    data: ordersData,
    isLoading: isLoadingOrders,
    isError,
    refetch
  } = useOrdersQuery(queryParams);

  // Refetch when sort parameters change
  useEffect(() => {
    refetch();
  }, [sortBy, sortOrder, refetch]);

  // Update min and max volume for the volume range slider based on data
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

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedPairGroup, debouncedSearchTerm, volumeRange, selectedPair]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (value: string) => {
    // Map the UI-friendly sort options to actual sort parameters
    switch(value) {
      case 'newest':
        setSortBy('created_at');
        setSortOrder('desc');
        break;
      case 'oldest':
        setSortBy('created_at');
        setSortOrder('asc');
        break;
      case 'highest_rate':
        setSortBy('rate');
        setSortOrder('desc');
        break;
      case 'lowest_rate':
        setSortBy('rate');
        setSortOrder('asc');
        break;
      case 'highest_volume':
        setSortBy('amount');
        setSortOrder('desc');
        break;
      case 'lowest_volume':
        setSortBy('amount');
        setSortOrder('asc');
        break;
      default:
        setSortBy('amount');
        setSortOrder('desc');
    }
  };

  const formatVolumeLabel = (value: number) => {
    const actualValue = minVolume + (maxVolume - minVolume) * value / 100;
    return new Intl.NumberFormat("ru-RU", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(actualValue);
  };

  // Calculate total volume in USD for display
  const calculateTotalVolumeUSD = (orders: Order[]) => {
    return orders.reduce((sum, order) => {
      // Convert to USD equivalent 
      const orderVolumeUSD = order.amountCurrency === "USD" || order.amountCurrency === "USDT" 
        ? Number(order.amount) 
        : Number(order.amount) / Number(order.rate);
      return sum + orderVolumeUSD;
    }, 0);
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
          <h3 className="text-lg font-medium mb-2">Ошибка загрузки заявок</h3>
          <p className="text-muted-foreground">Возникла ошибка при загрузке заявок. Пожалуйста, попробуйте позже.</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Повторить
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate the number of buy and sell orders
  const buyOrdersCount = ordersData?.orders.filter(o => o.type === "BUY").length || 0;
  const sellOrdersCount = ordersData?.orders.filter(o => o.type === "SELL").length || 0;
  
  // Calculate total volume in USD for both buy and sell orders
  const buyOrdersVolume = calculateTotalVolumeUSD(ordersData?.orders.filter(o => o.type === "BUY") || []);
  const sellOrdersVolume = calculateTotalVolumeUSD(ordersData?.orders.filter(o => o.type === "SELL") || []);
  const totalVolumeUSD = buyOrdersVolume + sellOrdersVolume;

  return (
      <div className="space-y-4">
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
        
        {/* Compact Filters */}
        <Card className={cn(
          "p-3",
          theme === "light" 
            ? "bg-card border-border" 
            : "bg-otc-card border-otc-active"
        )}>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск заявок..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className={cn(
                    "pl-10 h-10",
                    theme === "light" 
                      ? "bg-accent/50 border-accent" 
                      : "bg-otc-active border-otc-active text-white"
                  )}
                />
              </div>
              
              {/* Type filter */}
              <ToggleGroup 
                type="single" 
                value={selectedType} 
                onValueChange={(value) => value && setSelectedType(value)}
                className="border rounded-md"
              >
                <ToggleGroupItem value="all" aria-label="Toggle all types">
                  Все типы
                </ToggleGroupItem>
                <ToggleGroupItem value="BUY" aria-label="Toggle buy" className="text-green-500">
                  Покупка
                </ToggleGroupItem>
                <ToggleGroupItem value="SELL" aria-label="Toggle sell" className="text-red-500">
                  Продажа
                </ToggleGroupItem>
              </ToggleGroup>
              
              {/* View mode toggle */}
              <div className="flex gap-1 ml-auto">
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
              
              {/* Sort dropdown */}
              <div className="w-44">
                <Select value={sortBy === 'amount' && sortOrder === 'desc' ? 'highest_volume' : 
                         sortBy === 'amount' && sortOrder === 'asc' ? 'lowest_volume' :
                         sortBy === 'created_at' && sortOrder === 'desc' ? 'newest' :
                         sortBy === 'created_at' && sortOrder === 'asc' ? 'oldest' :
                         sortBy === 'rate' && sortOrder === 'desc' ? 'highest_rate' :
                         sortBy === 'rate' && sortOrder === 'asc' ? 'lowest_rate' : 'highest_volume'} 
                      onValueChange={handleSortChange}>
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
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
                className={cn(
                  "flex items-center gap-1",
                  theme === "light" 
                    ? "border-border" 
                    : "border-otc-active text-white"
                )}
              >
                <Filter className="h-4 w-4" />
                Фильтры
              </Button>
            </div>
            
            {/* Trading pairs filter buttons */}
            <div className="flex flex-wrap gap-2">
              <ToggleGroup 
                type="single" 
                value={selectedPair}
                onValueChange={(value) => value && setSelectedPair(value)}
                className="flex flex-wrap gap-1"
              >
                <ToggleGroupItem 
                  value="all" 
                  className={cn(
                    "text-sm px-3 py-1 rounded-full",
                    selectedPair === "all" ? "bg-otc-primary text-black" : 
                    theme === "light" ? "bg-accent/50" : "bg-otc-active text-white"
                  )}
                >
                  Все пары
                </ToggleGroupItem>
                {tradingPairs.map(pair => (
                  <ToggleGroupItem 
                    key={pair.id} 
                    value={pair.id}
                    className={cn(
                      "text-sm px-3 py-1 rounded-full",
                      selectedPair === pair.id ? "bg-otc-primary text-black" : 
                      theme === "light" ? "bg-accent/50" : "bg-otc-active text-white"
                    )}
                  >
                    {pair.display}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            
            {/* Advanced filters (collapsible) */}
            {isAdvancedFiltersOpen && (
              <div className="pt-3 border-t border-border">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 w-full">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Объем: {formatVolumeLabel(volumeRange[0])} - {formatVolumeLabel(volumeRange[1])} RUB</span>
                    </div>
                    <Slider
                      defaultValue={[0, 100]}
                      value={volumeRange}
                      onValueChange={(value) => {
                        setVolumeRange(value);
                      }}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="w-full md:w-56">
                    <Select value={selectedPairGroup} onValueChange={value => {
                      setSelectedPairGroup(value);
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
                        <SelectItem value="RUB_NR">RUB (НР)</SelectItem>
                        <SelectItem value="RUB_CASH">RUB (Нал)</SelectItem>
                        <SelectItem value="TOKENIZED">Токенизированные</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
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
            "p-3 border-b flex flex-wrap gap-4 justify-between",
            theme === "light" ? "border-border" : "border-otc-active"
          )}>
            <div className="flex flex-wrap gap-6">
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
                  {buyOrdersCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Продажа</p>
                <p className="text-xl font-bold text-red-500">
                  {sellOrdersCount}
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
                }).format(totalVolumeUSD)} USD
              </p>
            </div>
          </div>
          
          {/* Volume comparison chart */}
          <div className="px-3 py-2 border-b flex items-center space-x-2">
            <div className="h-4 bg-green-500 rounded-sm" style={{ width: `${(buyOrdersVolume / totalVolumeUSD) * 100}%` }}></div>
            <div className="h-4 bg-red-500 rounded-sm" style={{ width: `${(sellOrdersVolume / totalVolumeUSD) * 100}%` }}></div>
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
