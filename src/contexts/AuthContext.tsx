
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@/lib/supabase-types";

interface AuthContextType {
  currentUser: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (data: { email: string; password: string; fullName: string; company: string; referralCode?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  connectTelegram: (telegramId: string) => Promise<{ error: string | null }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
  assignRole: (userId: string, role: "user" | "manager" | "admin") => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile when user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) {
        setProfile(null);
        return;
      }

      try {
        // Check if we already have the profile data in the query cache
        const cachedProfile = queryClient.getQueryData<Profile>(['profile', currentUser.id]);
        
        if (cachedProfile) {
          setProfile(cachedProfile);
          return;
        }

        // If not in cache, fetch it and update the cache
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        if (data) {
          // Make sure all required fields in the Profile type are present
          const profileData: Profile = {
            id: data.id,
            full_name: data.full_name,
            company: data.company,
            telegram_id: data.telegram_id,
            created_at: data.created_at,
            updated_at: data.updated_at,
            avatar_url: data.avatar_url || null, // Ensure avatar_url is present
            two_factor_enabled: data.two_factor_enabled,
            two_factor_secret: data.two_factor_secret
          };
          
          setProfile(profileData);
          
          // Store in query cache for reuse
          queryClient.setQueryData(['profile', currentUser.id], profileData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [currentUser, queryClient]);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      // Regular login success
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  const register = async (data: { email: string; password: string; fullName: string; company: string; referralCode?: string }) => {
    try {
      // First, sign up the user
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            company: data.company
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      toast({
        title: "Registration successful",
        description: "You have been automatically logged in."
      });
      
      // Automatically log the user in right after registration
      if (process.env.NODE_ENV === 'development') {
        // In development, we might want to automatically sign in since email verification might be disabled
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        });
        
        if (signInError) {
          console.error("Auto login failed:", signInError);
          // Still return true as registration was successful
        }
      }
      
      return true;
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
  };

  const connectTelegram = async (telegramId: string) => {
    if (!currentUser) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ telegram_id: telegramId })
        .eq('id', currentUser.id);

      if (error) throw error;

      toast({
        title: "Telegram connected",
        description: "Your Telegram account has been successfully linked"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to connect Telegram",
        description: error.message,
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!currentUser) {
        return { error: "You must be logged in to change your password" };
      }

      // First verify current password by attempting to sign in
      const { error: verificationError } = await supabase.auth.signInWithPassword({
        email: currentUser.email as string,
        password: currentPassword
      });

      if (verificationError) {
        return { error: "Current password is incorrect" };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  // Function to assign a role to a user
  const assignRole = async (userId: string, role: "user" | "manager" | "admin") => {
    if (!currentUser) {
      return { error: "Not authenticated" };
    }
    
    try {
      // Check if user already has this role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', role)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      // If role doesn't exist yet, add it
      if (!existingRole) {
        const { error } = await supabase
          .from('user_roles')
          .insert({ 
            user_id: userId, 
            role: role 
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Role assigned",
        description: `User has been assigned the ${role} role`
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to assign role",
        description: error.message,
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        logout,
        connectTelegram,
        changePassword,
        assignRole
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
