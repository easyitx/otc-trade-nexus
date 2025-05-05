
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/lib/supabase-types';

export function useProfile() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) throw error;
      
      // Ensure all required fields from Profile type are present
      const profileData: Profile = {
        id: data.id,
        full_name: data.full_name,
        company: data.company,
        telegram_id: data.telegram_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        avatar_url: data.avatar_url || null,
        two_factor_enabled: data.two_factor_enabled,
        two_factor_secret: data.two_factor_secret
      };
      
      return profileData;
    },
    enabled: !!currentUser?.id,
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 minutes
  });

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!currentUser?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) throw error;
      
      // Ensure the returned data has all fields required by Profile type
      const profileData: Profile = {
        id: data.id,
        full_name: data.full_name,
        company: data.company,
        telegram_id: data.telegram_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        avatar_url: data.avatar_url || null,
        two_factor_enabled: data.two_factor_enabled,
        two_factor_secret: data.two_factor_secret
      };
      
      // Update the cached data
      queryClient.setQueryData(['profile', currentUser.id], profileData);
      
      return { data: profileData, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  };

  return { 
    profile, 
    loading, 
    error: error ? (error as Error).message : null,
    updateProfile 
  };
}
