
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types';
import { useToast } from './use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Adapter to convert Supabase message format to our frontend Message type
const adaptMessageFromSupabase = (message: any): Message => ({
  id: message.id,
  senderId: message.sender_id,
  content: message.content,
  timestamp: new Date(message.created_at),
  dealId: message.deal_id,
  isRead: message.is_read
});

export function useMessages(dealId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

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
      // Convert all messages to our frontend format
      return data.map(adaptMessageFromSupabase);
    },
    enabled: !!dealId
  });

  const sendMessage = async (content: string) => {
    if (!dealId || !currentUser) {
      toast({
        title: "Error",
        description: "Cannot send message without an active deal or user",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          deal_id: dealId,
          content,
          sender_id: currentUser.id
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
