
import { useState, useEffect, useMemo } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { OrdersTable } from "../components/orders/OrdersTable";
import { OrderFilters } from "../components/orders/OrderFilters";
import { OrderStatistics } from "../components/orders/OrderStatistics";
import { OrderPagination } from "../components/orders/OrderPagination";
import { useOrders, OrdersQueryParams } from "@/hooks/useOrders";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { tradePairs } from "@/data/mockData";

export default function OrdersPage() {
  const { theme } = useTheme();
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
  const [selectedPair, setSelectedPair] = useState<string>("all");
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Get trading pairs from the mockData for consistency between pages
  const tradingPairOptions = tradePairs.map(pair => ({
    id: pair.name,
    display: pair.displayName.replace(" – ", "/")
  }));

  // Calculate actual min/max amounts for filtering
  const actualMinVolume = minVolume + (maxVolume - minVolume) * volumeRange[0] / 100;
  const actualMaxVolume = minVolume + (maxVolume - minVolume) * volumeRange[1] / 100;

  // Prepare query parameters with useMemo to prevent unnecessary re-renders
  const queryParams: OrdersQueryParams = useMemo(() => ({
    page: currentPage,
    pageSize: pageSize,
    sortBy: sortBy,
    sortOrder: sortOrder,
    filter: {
      type: selectedType === 'all' ? undefined : selectedType as 'BUY' | 'SELL' | undefined,
      minAmount: actualMinVolume,
      maxAmount: actualMaxVolume,
      tradePair: selectedPair === 'all' ? undefined : selectedPair,
      showArchived: showArchived // Fixed showing archived orders
    }
  }), [currentPage, pageSize, sortBy, sortOrder, selectedType, actualMinVolume, actualMaxVolume, selectedPair, showArchived]);

  // Get orders with query parameters
  const { useOrdersQuery, convertToUSD } = useOrders();
  const { 
    data: ordersData,
    isLoading: queryLoading,
    isError,
    refetch
  } = useOrdersQuery(queryParams);

  // Track loading state for skeleton display
  useEffect(() => {
    setIsOrdersLoading(queryLoading);
  }, [queryLoading]);

  // Refetch when sort parameters change
  useEffect(() => {
    refetch();
  }, [sortBy, sortOrder, refetch]);

  // Update min and max volume for range slider based on data
  useEffect(() => {
    if (ordersData?.orders && ordersData.orders.length > 0) {
      const volumes = ordersData.orders.map(order => Number(order.amount));
      
      // Only update if significant change to avoid slider jumping
      const calculatedMin = Math.min(...volumes);
      const calculatedMax = Math.max(...volumes);
      
      if (Math.abs(calculatedMin - minVolume) > minVolume * 0.1) {
        setMinVolume(calculatedMin);
      }
      
      if (Math.abs(calculatedMax - maxVolume) > maxVolume * 0.1) {
        setMaxVolume(calculatedMax);
      }
    }
  }, [ordersData?.orders, minVolume, maxVolume]);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedPairGroup, volumeRange, selectedPair, showArchived]);
  
  // Handle page changes and scroll to top
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Handle sort changes
  const handleSortChange = (value: string) => {
    // Map UI-friendly sort options to actual sort parameters
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

  // Calculate volumes in USD for buy and sell orders
  const buyOrdersVolume = ordersData?.orders.filter(o => o.type === "BUY").reduce((sum, order) => {
    return sum + convertToUSD(Number(order.amount), order.amountCurrency || 'USD', order.rate);
  }, 0) || 0;
  
  const sellOrdersVolume = ordersData?.orders.filter(o => o.type === "SELL").reduce((sum, order) => {
    return sum + convertToUSD(Number(order.amount), order.amountCurrency || 'USD', order.rate);
  }, 0) || 0;
  
  const totalVolumeUSD = buyOrdersVolume + sellOrdersVolume;

  // Calculate order counts
  const buyOrdersCount = ordersData?.orders.filter(o => o.type === "BUY").length || 0;
  const sellOrdersCount = ordersData?.orders.filter(o => o.type === "SELL").length || 0;
  const archivedOrdersCount = ordersData?.orders.filter(o => o.status === "ARCHIVED").length || 0;

  // Skeleton for loading state
  const OrdersSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 p-0">
      <div className="space-y-2 p-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="border rounded-md p-4 relative">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-8 w-36 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
      <div className="space-y-2 p-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="border rounded-md p-4 relative">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-8 w-36 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    </div>
  );

  // Error display
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

  return (
    <div className="space-y-4">
      {/* Header with page title and create order button */}
      <div className="flex items-center justify-between">
        <h1 className={cn(
          "text-2xl font-bold", 
          theme === "light" ? "text-foreground" : "text-white"
        )}>ОТС Заявки</h1>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white" asChild>
          <Link to="/create-order">
            <span className="mr-2">+</span>
            Новая заявка
          </Link>
        </Button>
      </div>
      
      {/* Filters component */}
      <Card>
        <OrderFilters
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedPair={selectedPair}
          setSelectedPair={setSelectedPair}
          selectedPairGroup={selectedPairGroup}
          setSelectedPairGroup={setSelectedPairGroup}
          volumeRange={volumeRange}
          setVolumeRange={setVolumeRange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSortChange={handleSortChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showArchived={showArchived}
          setShowArchived={setShowArchived}
          minVolume={minVolume}
          maxVolume={maxVolume}
          tradingPairOptions={tradingPairOptions}
        />
      </Card>
      
      {/* Orders table with stats */}
      <div className={cn(
        "border rounded-lg overflow-hidden",
        theme === "light" 
          ? "bg-card border-border" 
          : "bg-otc-card border-otc-active"
      )}>
        {/* Statistics component */}
        <OrderStatistics
          totalCount={ordersData?.totalCount || 0}
          buyOrdersCount={buyOrdersCount}
          sellOrdersCount={sellOrdersCount}
          archivedOrdersCount={archivedOrdersCount}
          showArchived={showArchived}
          totalVolumeUSD={totalVolumeUSD}
          buyOrdersVolume={buyOrdersVolume}
          sellOrdersVolume={sellOrdersVolume}
        />
        
        {/* Display orders or loading skeleton */}
        {isOrdersLoading ? (
          <OrdersSkeleton />
        ) : (
          <OrdersTable 
            orders={ordersData?.orders || []} 
            showDetailedView={viewMode === "table"} 
          />
        )}
        
        {/* Pagination component */}
        {ordersData && ordersData.totalPages > 1 && (
          <OrderPagination
            currentPage={currentPage}
            totalPages={ordersData.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
