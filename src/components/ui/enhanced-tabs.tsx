
import React from "react";
import { Tabs, TabsList as ShadcnTabsList, TabsTrigger } from "./tabs";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface EnhancedTabsListProps extends React.ComponentProps<typeof ShadcnTabsList> {
  children: React.ReactNode;
}

export function EnhancedTabsList({ children, className, ...props }: EnhancedTabsListProps) {
  const { theme } = useTheme();
  
  return (
    <ShadcnTabsList 
      className={cn(
        theme === "light" 
          ? "bg-gray-100 p-1" 
          : "bg-otc-active",
        className
      )}
      {...props}
    >
      {children}
    </ShadcnTabsList>
  );
}

interface EnhancedTabsTriggerProps extends React.ComponentProps<typeof TabsTrigger> {
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function EnhancedTabsTrigger({ icon, children, className, ...props }: EnhancedTabsTriggerProps) {
  const { theme } = useTheme();
  
  return (
    <TabsTrigger 
      className={cn(
        "flex items-center",
        theme === "light"
          ? "data-[state=active]:bg-white data-[state=active]:text-primary"
          : "data-[state=active]:bg-otc-primary data-[state=active]:text-black",
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </TabsTrigger>
  );
}

export { Tabs };
