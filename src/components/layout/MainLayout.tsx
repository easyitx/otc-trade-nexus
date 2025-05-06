
import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function MainLayout({ children, requireAuth = true }: MainLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  // Handle authentication check
  if (requireAuth && !isLoading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className={cn(
      "flex h-screen",
      theme === "light" ? "bg-gray-50" : "bg-background"
    )}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className={cn(
                "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2",
                theme === "light" ? "border-primary" : "border-otc-primary"
              )}></div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
