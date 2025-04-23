
import { Message } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const { currentUser } = useAuth();

  if (!messages?.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwn = message.senderId === currentUser?.id;
        
        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                isOwn
                  ? 'bg-otc-primary text-black ml-auto'
                  : 'bg-otc-active text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {format(new Date(message.timestamp), 'HH:mm')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
