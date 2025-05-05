
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
      return data as Profile;
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
      
      // Update the cached data
      queryClient.setQueryData(['profile', currentUser.id], data);
      
      return { data, error: null };
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
