
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ChatMessages } from "./ChatMessages";
import { DealStatus } from "./DealStatus";
import { useMessages } from "@/hooks/useMessages";
import { MessageSquare, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DealChatProps {
  dealId: string;
}

export function DealChat({ dealId }: DealChatProps) {
  const [message, setMessage] = useState("");
  const { messages, sendMessage, isLoadingMessages } = useMessages(dealId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  // Fetch full deal information
  const { data: dealData } = useQuery({
    queryKey: ["deal-detail", dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*, orders(*)")
        .eq("id", dealId)
        .single();
        
      if (error) {
        console.error("Error fetching deal details:", error);
        return null;
      }
      
      // Parse deal metadata if it exists
      if (data && data.deal_metadata) {
        try {
          data.dealMetadata = JSON.parse(data.deal_metadata);
        } catch (err) {
          console.error("Error parsing deal metadata:", err);
        }
      }
      
      return data;
    },
    enabled: !!dealId,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    await sendMessage(message);
    setMessage("");
    setIsSending(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-4">
        <MessageSquare className="w-5 h-5 text-otc-primary" />
        <h3 className="text-lg font-semibold text-white">Чат</h3>
      </div>

      {dealData && <DealStatus deal={dealData} />}

      <div className="flex-1 overflow-y-auto mb-4 pr-2">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-otc-primary animate-spin" />
          </div>
        ) : (
          <>
            <ChatMessages messages={messages || []} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="flex space-x-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Введите сообщение..."
          className="bg-otc-active border-otc-active text-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          onClick={handleSend}
          className="bg-otc-primary text-black hover:bg-otc-primary/90"
          disabled={!message.trim() || isSending}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Отправить"
          )}
        </Button>
      </div>
    </div>
  );
}
