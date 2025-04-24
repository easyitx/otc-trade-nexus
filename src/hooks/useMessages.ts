import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types';
import { useToast } from './use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

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

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!dealId) return;

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${dealId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `deal_id=eq.${dealId}`
      }, (payload) => {
        const newMessage = adaptMessageFromSupabase(payload.new);
        queryClient.setQueryData(['messages', dealId], (oldMessages: Message[] = []) => {
          return [...oldMessages, newMessage];
        });
      })
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId, queryClient]);

  // Mark messages as read when the other user's messages are viewed
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!messages || !currentUser?.id || !dealId) return;
      
      // Find unread messages from other users
      const unreadMessages = messages.filter(
        message => !message.isRead && message.senderId !== currentUser.id
      );
      
      if (unreadMessages.length === 0) return;
      
      // Update messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadMessages.map(msg => msg.id));
        
      // Update local data
      queryClient.invalidateQueries({ queryKey: ['messages', dealId] });
    };
    
    markMessagesAsRead();
  }, [messages, currentUser, dealId, queryClient]);

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

      // No need to invalidate query as the subscription should catch the new message
      // But we keep this as a fallback
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
