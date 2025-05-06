
import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "@/contexts/ThemeContext";

interface EnhancedDatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
}

export function EnhancedDatePicker({ 
  date, 
  setDate, 
  className,
  placeholder = "Select date" 
}: EnhancedDatePickerProps) {
  const { theme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            theme === "light" 
              ? "bg-white border-gray-200" 
              : "bg-otc-active border-otc-active text-white",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-auto p-0 border",
          theme === "light" 
            ? "bg-white border-gray-200 shadow-sm" 
            : "bg-otc-card border-otc-active"
        )}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          className={cn(
            theme === "light" 
              ? "bg-white text-gray-900" 
              : "bg-otc-card text-white"
          )}
        />
      </PopoverContent>
    </Popover>
  );
}
