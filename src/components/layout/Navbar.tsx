
import { BellIcon, MessageCircleIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { Badge } from "../ui/badge";
import { useToast } from "../../hooks/use-toast";
import { Globe } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
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

  return (
    <header className="bg-otc-card border-b border-otc-active p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Desktop Logo */}
          <Link to="/" className="hidden md:flex items-center space-x-2">
            <span className="text-otc-primary font-bold text-xl">OTC DESK</span>
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
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-white"
              >
                <Globe className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-otc-card border-otc-active">
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
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white relative">
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-otc-primary rounded-full"></span>
              </Button>

              {/* Messages */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-white"
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
