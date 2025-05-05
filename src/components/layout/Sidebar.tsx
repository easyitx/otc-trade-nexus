import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { 
  HomeIcon, 
  ListIcon, 
  MessageCircleIcon, 
  PlusCircleIcon, 
  UserIcon, 
  Settings2Icon, 
  SendIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  SlidersIcon
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isCollapsed: boolean;
}

const NavItem = ({ icon: Icon, label, href, isCollapsed }: NavItemProps) => {
  const { pathname } = useLocation();
  const isActive = pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center py-2 px-3 rounded-lg mb-1 group transition-colors",
        isActive 
          ? "bg-otc-active text-white" 
          : "text-muted-foreground hover:bg-otc-active hover:text-white"
      )}
    >
      <Icon className="w-5 h-5 mr-2" />
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { userRoles, isLoadingRoles } = usePlatformSettings();
  const isManager = userRoles?.isManager || userRoles?.isAdmin;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div 
      className={cn(
        "bg-otc-card border-r border-otc-active flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar header */}
      <div className="p-4 flex justify-between items-center">
        {!isCollapsed && (
          <div className="flex-1">
            <span className="text-otc-primary font-bold text-xl">OTC DESK</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="text-muted-foreground hover:text-white"
        >
          {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </Button>
      </div>

      <Separator className="bg-otc-active" />

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          <NavItem icon={HomeIcon} label="Dashboard" href="/" isCollapsed={isCollapsed} />
          <NavItem icon={ListIcon} label="Orders" href="/orders" isCollapsed={isCollapsed} />
          <NavItem icon={MessageCircleIcon} label="Deals" href="/deals" isCollapsed={isCollapsed} />
          <NavItem icon={PlusCircleIcon} label="Create Order" href="/create-order" isCollapsed={isCollapsed} />
          <NavItem icon={UserIcon} label="Profile" href="/profile" isCollapsed={isCollapsed} />
          <NavItem icon={Settings2Icon} label="Settings" href="/settings" isCollapsed={isCollapsed} />
          <NavItem icon={SendIcon} label="Connect Telegram" href="/telegram" isCollapsed={isCollapsed} />
          
          {isManager && !isLoadingRoles && (
            <div className="mt-4 pt-4 border-t border-otc-active/50">
              <div className="px-3 py-2">
                {!isCollapsed && <p className="text-xs text-muted-foreground uppercase font-semibold">Admin</p>}
              </div>
              <NavItem 
                icon={SlidersIcon} 
                label="Rate Management" 
                href="/admin/rate-management" 
                isCollapsed={isCollapsed} 
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Create Order Button at bottom */}
      <div className="p-4">
        <Button
          className={cn(
            "w-full bg-otc-primary text-black hover:bg-otc-primary/90",
            isCollapsed ? "px-0" : ""
          )}
          asChild
        >
          <Link to="/create-order">
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            {!isCollapsed && <span>New Order</span>}
          </Link>
        </Button>
      </div>
    </div>
  );
}
