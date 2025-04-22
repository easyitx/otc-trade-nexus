
import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function MainLayout({ children, requireAuth = true }: MainLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Handle authentication check
  if (requireAuth && !isLoading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-otc-background text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-otc-primary"></div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
