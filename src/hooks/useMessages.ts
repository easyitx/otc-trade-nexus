
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types';
import { useToast } from './use-toast';

export function useMessages(dealId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', dealId],
    queryFn: async () => {
      if (!dealId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!dealId
  });

  const sendMessage = async (content: string) => {
    if (!dealId) {
      toast({
        title: "Error",
        description: "Cannot send message without an active deal",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          deal_id: dealId,
          content
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['messages', dealId] });
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    messages,
    isLoadingMessages,
    sendMessage
  };
}
