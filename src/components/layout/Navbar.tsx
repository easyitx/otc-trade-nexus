
import { BellIcon, MessageCircleIcon, UserIcon, SearchIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { orders, tradePairs } from "../../data/mockData";
import { Badge } from "../ui/badge";
import { useToast } from "../../hooks/use-toast";

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Command dialog handlers
  const handleCommandSelect = (value: string) => {
    setOpen(false);
    navigate(value);
  };
  
  // Search functionality
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    
    // Search orders
    const searchTermLower = searchTerm.toLowerCase();
    const matchingOrders = orders
      .filter(order => {
        const pair = tradePairs.find(p => p.id === order.tradePairId);
        const pairName = pair?.displayName || "";
        
        return (
          pairName.toLowerCase().includes(searchTermLower) ||
          order.purpose?.toLowerCase().includes(searchTermLower) ||
          order.notes?.toLowerCase().includes(searchTermLower) ||
          order.rate.toLowerCase().includes(searchTermLower) ||
          order.amount.toString().includes(searchTermLower)
        );
      })
      .slice(0, 5);
    
    setSearchResults(matchingOrders);
  }, [searchTerm]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/login');
  };

  // Add keyboard shortcut for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <header className="bg-otc-card border-b border-otc-active p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Desktop Logo */}
          <Link to="/" className="hidden md:flex items-center space-x-2">
            <span className="text-otc-primary font-bold text-xl">OTC DESK</span>
          </Link>
        </div>

        {/* Search Command Menu */}
        <div className="flex-grow mx-4 max-w-2xl">
          <Button
            variant="outline"
            className="w-full justify-start text-sm text-muted-foreground bg-otc-active border-otc-active"
            onClick={() => setOpen(true)}
          >
            <SearchIcon className="mr-2 h-4 w-4" />
            Search orders, pairs, or commands...
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput 
              placeholder="Type to search..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              
              {searchResults.length > 0 && (
                <CommandGroup heading="Orders">
                  {searchResults.map((order) => {
                    const pair = tradePairs.find(p => p.id === order.tradePairId);
                    return (
                      <CommandItem 
                        key={order.id} 
                        value={`/orders/${order.id}`}
                        onSelect={handleCommandSelect}
                        className="flex justify-between"
                      >
                        <div className="flex items-center">
                          <span className={`mr-2 h-2 w-2 rounded-full ${order.type === "BUY" ? "bg-green-500" : "bg-red-500"}`}></span>
                          <span>{pair?.displayName || "Unknown"} - ${order.amount.toLocaleString()}</span>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {order.type}
                        </Badge>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
              
              <CommandSeparator />
              
              <CommandGroup heading="Quick Navigation">
                <CommandItem value="/" onSelect={handleCommandSelect}>
                  Dashboard
                </CommandItem>
                <CommandItem value="/orders" onSelect={handleCommandSelect}>
                  All Orders
                </CommandItem>
                <CommandItem value="/create-order" onSelect={handleCommandSelect}>
                  Create New Order
                </CommandItem>
                <CommandItem value="/deals" onSelect={handleCommandSelect}>
                  Deals & Messages
                </CommandItem>
                <CommandItem value="/telegram" onSelect={handleCommandSelect}>
                  Connect Telegram
                </CommandItem>
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup heading="Trading Pairs">
                <CommandItem value="/orders?pair=RUB_NR_USD" onSelect={handleCommandSelect}>
                  RUB (NR) - USD
                </CommandItem>
                <CommandItem value="/orders?pair=RUB_NR_USDT" onSelect={handleCommandSelect}>
                  RUB (NR) - USDT
                </CommandItem>
                <CommandItem value="/orders?pair=RUB_CASH_USDT" onSelect={handleCommandSelect}>
                  RUB Cash - USDT
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </div>

        {/* Right section - User actions */}
        <div className="flex items-center space-x-4">
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

              {/* User menu */}
              <div className="relative group">
                <Button variant="ghost" className="flex items-center space-x-2 group-hover:bg-otc-active">
                  <div className="w-8 h-8 rounded-full bg-otc-icon-bg flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-otc-icon" />
                  </div>
                  <span className="text-sm font-medium hidden sm:inline-block">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                </Button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-otc-card border border-otc-active rounded-md shadow-lg z-50 hidden group-hover:block">
                  <div className="p-2">
                    <Link to="/profile" className="block px-4 py-2 text-sm rounded-md hover:bg-otc-active">
                      Profile
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm rounded-md hover:bg-otc-active">
                      Settings
                    </Link>
                    <Link to="/telegram" className="block px-4 py-2 text-sm rounded-md hover:bg-otc-active">
                      Connect Telegram
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm rounded-md hover:bg-otc-active text-red-400"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button className="bg-otc-primary text-black" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
