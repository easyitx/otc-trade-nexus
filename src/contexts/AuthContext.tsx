import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

interface AuthContextType {
  currentUser: User | null;
  profile: any; // Will contain additional user data from profiles table
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null, needsTwoFactor?: boolean, userId?: string }>;
  register: (data: { email: string; password: string; fullName: string; company: string; referralCode?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  connectTelegram: (telegramId: string) => Promise<{ error: string | null }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
  enableTwoFactor: () => Promise<{ qrCode: string; secret: string; error: string | null }>;
  verifyTwoFactor: (token: string) => Promise<{ error: string | null }>;
  verifyLoginTwoFactor: (userId: string, token: string) => Promise<{ error: string | null, session?: Session | null }>;
  disableTwoFactor: (token: string) => Promise<{ error: string | null }>;
  isTwoFactorEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<any>(null);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(false);
  const { toast } = useToast();

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
        setIsTwoFactorEnabled(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        setProfile(data);
        setIsTwoFactorEnabled(!!data?.two_factor_enabled);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const login = async (email: string, password: string) => {
    try {
      // First attempt to sign in to get the user ID
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      const userId = data.user?.id;
      
      if (!userId) {
        throw new Error("Failed to get user ID");
      }
      
      // Now check if user has 2FA enabled
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, two_factor_enabled')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
      // If user has 2FA enabled, we need to verify the token before completing login
      // We'll sign out immediately and require 2FA verification
      if (profileData?.two_factor_enabled) {
        await supabase.auth.signOut();
        return { error: null, needsTwoFactor: true, userId };
      }

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

  const verifyLoginTwoFactor = async (userId: string, token: string) => {
    try {
      // Call Supabase Edge Function to verify TOTP token
      const { data, error } = await supabase.functions.invoke("verify-totp", {
        body: { userId, token }
      });

      if (error) {
        throw error;
      }

      if (!data.verified) {
        return { error: "Invalid verification code" };
      }

      // If verification was successful, get the user's email from auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

      if (userError) {
        throw userError;
      }

      // Complete the sign in process
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userData?.user?.email || '',
        password: "dummy-password-will-be-ignored-due-to-custom-claim"
      });

      if (signInError) {
        throw signInError;
      }

      return { error: null, session: sessionData.session };
    } catch (error: any) {
      toast({
        title: "Two-factor verification failed",
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

  const enableTwoFactor = async () => {
    try {
      if (!currentUser) {
        return { qrCode: "", secret: "", error: "You must be logged in to enable 2FA" };
      }

      // Call Supabase Edge Function to generate TOTP secret and QR code
      const { data, error } = await supabase.functions.invoke("generate-totp", {
        body: { userId: currentUser.id }
      });

      if (error) {
        throw error;
      }

      return {
        qrCode: data.qrCode,
        secret: data.secret,
        error: null
      };
    } catch (error: any) {
      toast({
        title: "Failed to enable 2FA",
        description: error.message,
        variant: "destructive"
      });
      return { qrCode: "", secret: "", error: error.message };
    }
  };

  const verifyTwoFactor = async (token: string) => {
    try {
      if (!currentUser) {
        return { error: "You must be logged in to verify 2FA" };
      }

      // Call Supabase Edge Function to verify TOTP token and enable 2FA
      const { data, error } = await supabase.functions.invoke("verify-totp", {
        body: { userId: currentUser.id, token }
      });

      if (error) {
        throw error;
      }

      if (!data.verified) {
        return { error: "Invalid verification code" };
      }

      // Update profile to mark 2FA as enabled
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ two_factor_enabled: true })
        .eq('id', currentUser.id);

      if (updateError) {
        throw updateError;
      }

      setIsTwoFactorEnabled(true);

      toast({
        title: "Two-factor authentication enabled",
        description: "Your account is now more secure"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to verify 2FA",
        description: error.message,
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  const disableTwoFactor = async (token: string) => {
    try {
      if (!currentUser) {
        return { error: "You must be logged in to disable 2FA" };
      }

      // Call Supabase Edge Function to verify TOTP token before disabling 2FA
      const { data, error } = await supabase.functions.invoke("verify-totp", {
        body: { userId: currentUser.id, token }
      });

      if (error) {
        throw error;
      }

      if (!data.verified) {
        return { error: "Invalid verification code" };
      }

      // Update profile to mark 2FA as disabled
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ two_factor_enabled: false, two_factor_secret: null })
        .eq('id', currentUser.id);

      if (updateError) {
        throw updateError;
      }

      setIsTwoFactorEnabled(false);

      toast({
        title: "Two-factor authentication disabled",
        description: "Your account is now less secure"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to disable 2FA",
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
        enableTwoFactor,
        verifyTwoFactor,
        verifyLoginTwoFactor,
        disableTwoFactor,
        isTwoFactorEnabled
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
