
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, LayoutGrid, List, Archive } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TradingPairOption {
  id: string;
  display: string;
}

interface OrderFiltersProps {
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedPair: string;
  setSelectedPair: (pair: string) => void;
  selectedPairGroup: string;
  setSelectedPairGroup: (pairGroup: string) => void;
  volumeRange: number[];
  setVolumeRange: (range: number[]) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  handleSortChange: (value: string) => void;
  viewMode: 'cards' | 'table';
  setViewMode: (mode: 'cards' | 'table') => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  minVolume: number;
  maxVolume: number;
  tradingPairOptions: TradingPairOption[];
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  selectedType,
  setSelectedType,
  selectedPair,
  setSelectedPair,
  selectedPairGroup,
  setSelectedPairGroup,
  volumeRange,
  setVolumeRange,
  sortBy,
  sortOrder,
  handleSortChange,
  viewMode,
  setViewMode,
  showArchived,
  setShowArchived,
  minVolume,
  maxVolume,
  tradingPairOptions
}) => {
  const { theme } = useTheme();

  const formatVolumeLabel = (value: number) => {
    const actualValue = minVolume + (maxVolume - minVolume) * value / 100;
    return new Intl.NumberFormat("ru-RU", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(actualValue);
  };

  return (
    <div className={cn(
      "p-3",
      theme === "light" 
        ? "bg-card border-border" 
        : "bg-otc-card border-otc-active"
    )}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters" className="border-none">
          <div className="flex flex-col space-y-3">
            {/* Basic filters and controls */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              {/* Order type filter */}
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <div className="w-full md:w-auto">
                  <ToggleGroup 
                    type="single" 
                    value={selectedType} 
                    onValueChange={(value) => value && setSelectedType(value)}
                    className="border rounded-md w-full md:w-auto"
                  >
                    <ToggleGroupItem value="all" aria-label="Toggle all types" className="flex-1 md:flex-auto">
                      Все типы
                    </ToggleGroupItem>
                    <ToggleGroupItem value="BUY" aria-label="Toggle buy" className="text-green-500 flex-1 md:flex-auto">
                      Покупка
                    </ToggleGroupItem>
                    <ToggleGroupItem value="SELL" aria-label="Toggle sell" className="text-red-500 flex-1 md:flex-auto">
                      Продажа
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                {/* Archive toggle */}
                <div className="flex items-center gap-2 ml-auto md:ml-0">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="archived-mode"
                      checked={showArchived}
                      onCheckedChange={setShowArchived}
                    />
                    <label
                      htmlFor="archived-mode"
                      className="text-sm flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <Archive className="h-4 w-4" />
                      {showArchived ? "Архивные" : "Только активные"}
                    </label>
                  </div>
                </div>
              </div>
              
              {/* View mode and sort controls */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                {/* View mode toggle */}
                <div className="flex gap-1">
                  <Button 
                    variant={viewMode === "cards" ? "default" : "outline"} 
                    size="icon"
                    className={cn(
                      viewMode === "cards"
                        ? "bg-purple-500 hover:bg-purple-600" // Consistent purple for active state
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
                        ? "bg-purple-500 hover:bg-purple-600" // Consistent purple for active state
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
                <Select 
                  value={sortBy === 'amount' && sortOrder === 'desc' ? 'highest_volume' : 
                         sortBy === 'amount' && sortOrder === 'asc' ? 'lowest_volume' :
                         sortBy === 'created_at' && sortOrder === 'desc' ? 'newest' :
                         sortBy === 'created_at' && sortOrder === 'asc' ? 'oldest' :
                         sortBy === 'rate' && sortOrder === 'desc' ? 'highest_rate' :
                         sortBy === 'rate' && sortOrder === 'asc' ? 'lowest_rate' : 'highest_volume'} 
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className={cn(
                    "w-[180px]",
                    theme === "light" 
                      ? "bg-accent/50 border-accent" 
                      : "bg-otc-active border-otc-active text-white"
                  )}>
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent className={cn(
                    theme === "light" 
                      ? "bg-card border-border" 
                      : "bg-otc-card border-otc-active"
                  )}>
                    <SelectItem value="highest_volume">Объем (макс)</SelectItem>
                    <SelectItem value="lowest_volume">Объем (мин)</SelectItem>
                    <SelectItem value="highest_rate">Курс (макс)</SelectItem>
                    <SelectItem value="lowest_rate">Курс (мин)</SelectItem>
                    <SelectItem value="newest">Новые заявки</SelectItem>
                    <SelectItem value="oldest">Старые заявки</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Advanced filters accordion */}
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Торговые пары и фильтры</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {/* Trading pair buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2">
                <ToggleGroupItem 
                  value="all" 
                  className={cn(
                    "text-sm px-3 py-1 rounded-full text-center",
                    selectedPair === "all" ? "bg-purple-500 text-white" : 
                    theme === "light" ? "bg-accent/50" : "bg-otc-active text-white"
                  )}
                  onClick={() => setSelectedPair("all")}
                >
                  Все пары
                </ToggleGroupItem>
                {tradingPairOptions.map(pair => (
                  <ToggleGroupItem 
                    key={pair.id} 
                    value={pair.id}
                    className={cn(
                      "text-sm px-3 py-1 rounded-full text-center",
                      selectedPair === pair.id ? "bg-purple-500 text-white" : 
                      theme === "light" ? "bg-accent/50" : "bg-otc-active text-white"
                    )}
                    onClick={() => setSelectedPair(pair.id)}
                  >
                    {pair.display}
                  </ToggleGroupItem>
                ))}
              </div>
              
              {/* Volume slider and pair group selection */}
              <div className="mt-4 space-y-4">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex-1 w-full">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        Объем: {formatVolumeLabel(volumeRange[0])} - {formatVolumeLabel(volumeRange[1])}
                      </span>
                    </div>
                    <Slider
                      value={volumeRange}
                      onValueChange={setVolumeRange}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="w-full md:w-56">
                    <Select 
                      value={selectedPairGroup} 
                      onValueChange={setSelectedPairGroup}
                    >
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
            </AccordionContent>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
