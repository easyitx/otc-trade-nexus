
import { BellIcon, MessageCircleIcon, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { Badge } from "../ui/badge";
import { useToast } from "../../hooks/use-toast";
import { Globe } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SearchBar } from "./SearchBar";
import { CurrencyRates } from "./CurrencyRates";
import { UserProfile } from "./UserProfile";

export function Navbar() {
  const { currentUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-card border-b border-border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Desktop Logo */}
          <Link to="/" className="hidden md:flex items-center space-x-2">
            <span className="text-primary font-bold text-xl">OTC DESK</span>
          </Link>

          {/* Currency Rates */}
          <div className="hidden md:block">
            <CurrencyRates />
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar />

        {/* Right section - User actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground"
              >
                <Globe className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                <span className={language === 'en' ? 'font-bold' : ''}>English</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ru')}>
                <span className={language === 'ru' ? 'font-bold' : ''}>Русский</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {currentUser ? (
            <>
              {/* Notification */}
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
              </Button>

              {/* Messages */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link to="/deals">
                  <MessageCircleIcon className="w-5 h-5" />
                </Link>
              </Button>

              {/* User Profile */}
              <UserProfile />
            </>
          ) : (
            <UserProfile />
          )}
        </div>
      </div>
    </header>
  );
}
