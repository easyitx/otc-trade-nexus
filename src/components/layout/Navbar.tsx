
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
    <header className="bg-card border-b border-border p-2 shadow-light">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Currency Rates in compact view */}
          <div className="hidden md:block ml-2">
            <CurrencyRates />
          </div>
        </div>

        {/* Search Bar - now more compact */}
        <div className="mx-2 flex-grow max-w-md">
          <SearchBar />
        </div>

        {/* Right section - User actions */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-accent btn-hover-effect"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>

          {/*/!* Language Selector *!/*/}
          {/*<DropdownMenu>*/}
          {/*  <DropdownMenuTrigger asChild>*/}
          {/*    <Button */}
          {/*      variant="outline" */}
          {/*      size="icon" */}
          {/*      className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-accent btn-hover-effect"*/}
          {/*    >*/}
          {/*      <Globe className="w-4 h-4" />*/}
          {/*    </Button>*/}
          {/*  </DropdownMenuTrigger>*/}
          {/*  <DropdownMenuContent align="end" className="bg-card shadow-light border-border">*/}
          {/*    <DropdownMenuItem onClick={() => setLanguage('en')} className="hover:bg-accent">*/}
          {/*      <span className={language === 'en' ? 'font-bold' : ''}>English</span>*/}
          {/*    </DropdownMenuItem>*/}
          {/*    <DropdownMenuItem onClick={() => setLanguage('ru')} className="hover:bg-accent">*/}
          {/*      <span className={language === 'ru' ? 'font-bold' : ''}>Русский</span>*/}
          {/*    </DropdownMenuItem>*/}
          {/*  </DropdownMenuContent>*/}
          {/*</DropdownMenu>*/}

          {currentUser ? (
            <>
              {/* Notification */}
              <Button 
                variant="outline" 
                size="icon" 
                className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-accent btn-hover-effect relative"
              >
                <BellIcon className="w-4 h-4" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
              </Button>

              {/* Messages */}
              <Button 
                variant="outline" 
                size="icon" 
                className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-accent btn-hover-effect"
                asChild
              >
                <Link to="/deals">
                  <MessageCircleIcon className="w-4 h-4" />
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
