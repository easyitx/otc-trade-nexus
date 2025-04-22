
import { BellIcon, MessageCircleIcon, UserIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-otc-card border-b border-otc-active p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Desktop Logo */}
          <Link to="/" className="hidden md:flex items-center space-x-2">
            <span className="text-otc-primary font-bold text-xl">OTC DESK</span>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="flex-grow mx-4 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full bg-otc-active rounded-lg py-2 px-4 text-sm text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-otc-primary"
            />
          </div>
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
