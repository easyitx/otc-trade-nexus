
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useTheme } from "@/contexts/ThemeContext"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}

export function DatePicker({ date, setDate, className }: DatePickerProps) {
  const { theme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            theme === "light" ? "bg-white border-gray-200" : "",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(
        "w-auto p-0 border", 
        theme === "light" 
          ? "bg-white border-gray-200 shadow-sm" 
          : "bg-otc-card border-border shadow-light"
      )}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          className={theme === "light" 
            ? "bg-white text-gray-900" 
            : "bg-otc-card text-foreground"
          }
        />
      </PopoverContent>
    </Popover>
  )
}
