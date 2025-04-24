
import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ChatMessages } from "./ChatMessages";
import { useMessages } from "@/hooks/useMessages";
import { MessageSquare } from "lucide-react";

interface DealChatProps {
  dealId: string;
}

export function DealChat({ dealId }: DealChatProps) {
  const [message, setMessage] = useState("");
  const { messages, sendMessage, isLoadingMessages } = useMessages(dealId);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    await sendMessage(message);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-4">
        <MessageSquare className="w-5 h-5 text-otc-primary" />
        <h3 className="text-lg font-semibold text-white">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        <ChatMessages messages={messages || []} />
      </div>

      <div className="flex space-x-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
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
          disabled={!message.trim()}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
