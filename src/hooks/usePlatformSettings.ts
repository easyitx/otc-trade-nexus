
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function usePlatformSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');
      
      if (error) throw error;
      
      // Convert array to key-value object for easier access
      return data.reduce((acc: Record<string, any>, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
    },
  });
  
  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: any }) => {
      const { data, error } = await supabase
        .from('platform_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast({
        title: "Setting updated",
        description: "The platform setting has been updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating setting",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Function to check if user has manager role
  const { data: userRoles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['user-roles', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return { isManager: false, isAdmin: false };
      
      const { data: managerRole, error: managerError } = await supabase
        .rpc('has_role', { 
          _user_id: currentUser.id, 
          _role: 'manager' 
        });
      
      const { data: adminRole, error: adminError } = await supabase
        .rpc('has_role', { 
          _user_id: currentUser.id, 
          _role: 'admin' 
        });
      
      if (managerError || adminError) {
        console.error("Error checking roles:", managerError || adminError);
      }
      
      return {
        isManager: !!managerRole,
        isAdmin: !!adminRole
      };
    },
    enabled: !!currentUser
  });
  
  // Get rate adjustments specifically
  const rateAdjustments = settings?.rate_adjustments || {
    cbr: 1.5,
    profinance: 1.0,
    investing: 0.5,
    xe: 0.8
  };
  
  return {
    settings,
    isLoading,
    updateSetting,
    rateAdjustments,
    userRoles,
    isLoadingRoles
  };
}
