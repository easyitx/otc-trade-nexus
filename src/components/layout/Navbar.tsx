
import { BellIcon, MessageCircleIcon, UserIcon, SearchIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Command dialog handler
  const handleCommandSelect = (value: string) => {
    setOpen(false);
    navigate(value);
  };

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
            Search orders...
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Orders">
                <CommandItem value="/orders">All Orders</CommandItem>
                <CommandItem value="/create-order">Create New Order</CommandItem>
              </CommandGroup>
              <CommandGroup heading="Trading Pairs">
                <CommandItem value="/orders?pair=RUB_NR_USD">RUB (NR) - USD</CommandItem>
                <CommandItem value="/orders?pair=RUB_NR_USDT">RUB (NR) - USDT</CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </div>

        {/* Right section - User actions */}
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              {/* Notification */}
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <BellIcon className="w-5 h-5" />
              </Button>

              {/* Messages */}
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <MessageCircleIcon className="w-5 h-5" />
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
                    <button 
                      onClick={logout}
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
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
