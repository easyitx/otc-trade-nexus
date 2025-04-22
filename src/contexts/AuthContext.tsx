
import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "../types";
import { users } from "../data/mockData";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  connectTelegram: (telegramId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mock login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll just simulate with a timeout and check mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = users.find(u => u.email === email);
      
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('otcDeskUser', JSON.stringify(user));
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  };

  // Mock register function
  const register = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new user object
      const newUser: User = {
        id: `user${users.length + 1}`,
        fullName: userData.fullName || "Unknown User",
        company: userData.company || "Unknown Company",
        email: userData.email || `user${users.length + 1}@example.com`,
        registrationDate: new Date(),
        lastUpdated: new Date(),
        isVerified: false,
        ...userData
      };
      
      // In a real app, we would save this to a database
      users.push(newUser);
      
      // Log the user in
      setCurrentUser(newUser);
      localStorage.setItem('otcDeskUser', JSON.stringify(newUser));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('otcDeskUser');
  };

  const connectTelegram = async (telegramId: string): Promise<boolean> => {
    if (!currentUser) return false;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = {
        ...currentUser,
        telegramId,
        lastUpdated: new Date()
      };
      
      setCurrentUser(updatedUser);
      localStorage.setItem('otcDeskUser', JSON.stringify(updatedUser));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Telegram connection error:", error);
      setIsLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        logout,
        connectTelegram
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
