
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
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isCollapsed: boolean;
}

const NavItem = ({ icon: Icon, label, href, isCollapsed }: NavItemProps) => {
  const { pathname } = useLocation();
  const isActive = pathname === href;
  const { theme } = useTheme();

  return (
      <Link
          to={href}
          className={cn(
              "flex items-center rounded-lg mb-1 group transition-colors duration-150 overflow-hidden",
              isActive
                  ? theme === "light"
                      ? "bg-accent text-primary"
                      : "bg-otc-active text-white"
                  : theme === "light"
                      ? "text-primary-foreground hover:bg-accent/40"
                      : "text-muted-foreground hover:bg-otc-active/50",
              isCollapsed ? "p-3" : "py-2 px-3"
          )}
      >
        <Icon
            className={cn(
                "shrink-0 transition-colors duration-150",
                isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-2",
                isActive
                    ? theme === "light"
                        ? "text-primary"
                        : "text-white"
                    : theme === "light"
                        ? "text-primary-foreground group-hover:text-primary"
                        : "text-muted-foreground group-hover:text-white"
            )}
        />
        <span
            className={cn(
                "text-sm font-medium whitespace-nowrap transition-all duration-150",
                isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto ml-2",
                isActive
                    ? ""
                    : theme === "light"
                        ? "group-hover:text-primary"
                        : "group-hover:text-white"
            )}
        >
        {label}
      </span>
      </Link>
  );
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { userRoles, isLoadingRoles } = usePlatformSettings();
  const isManager = userRoles?.isManager || userRoles?.isAdmin;
  const { t } = useLanguage();
  const { theme } = useTheme();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div 
      className={cn(
        "border-r flex flex-col transition-all duration-300",
        theme === "light" 
          ? "bg-primary text-primary-foreground border-border/30"
          : "bg-otc-card border-otc-active",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar header */}
      <div className={cn(
          "flex justify-between items-center",
          isCollapsed ? "p-3" : "p-4"
      )}>
        {!isCollapsed && (
            <div className="flex-1">
              <Link to="/" className="hidden md:flex items-center">
                <img
                    className="w-40"
                    src={theme === "light" ? "/logo-light.svg" : "/logo.svg"}
                    alt={theme === "light" ? "Light Logo" : "Dark Logo"}
                />
              </Link>
            </div>
        )}
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
                theme === "light"
                    ? "text-white/70 hover:text-white hover:bg-primary-foreground/10"
                    : "text-muted-foreground hover:text-white"
            )}
        >
          {isCollapsed ? <ChevronRightIcon className="w-5 h-5"/> : <ChevronLeftIcon className="w-5 h-5"/>}
        </Button>
      </div>

      <Separator className={theme === "light" ? "bg-white/20" : "bg-otc-active"}/>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          <NavItem icon={HomeIcon} label={t('dashboard')} href="/" isCollapsed={isCollapsed} />
          <NavItem icon={ListIcon} label={t('orders')} href="/orders" isCollapsed={isCollapsed} />
          <NavItem icon={MessageCircleIcon} label={t('deals')} href="/deals" isCollapsed={isCollapsed} />
          <NavItem icon={PlusCircleIcon} label={t('createNewOrder')} href="/create-order" isCollapsed={isCollapsed} />
          <NavItem icon={UserIcon} label={t('profile')} href="/profile" isCollapsed={isCollapsed} />
          <NavItem icon={Settings2Icon} label={t('settings')} href="/settings" isCollapsed={isCollapsed} />

          {isManager && !isLoadingRoles && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="px-3 py-2">
                {!isCollapsed && <p className="text-xs text-primary-foreground/70 uppercase font-semibold">Админ</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
