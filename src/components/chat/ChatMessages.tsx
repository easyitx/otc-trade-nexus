
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

  // Group messages by date
  const messagesByDate: Record<string, Message[]> = {};
  
  messages.forEach((message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!messagesByDate[date]) {
      messagesByDate[date] = [];
    }
    messagesByDate[date].push(message);
  });

  return (
    <div className="space-y-6">
      {Object.entries(messagesByDate).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-center">
            <div className="text-xs text-muted-foreground bg-otc-active/20 px-2 py-1 rounded-full">
              {new Date(date).toLocaleDateString()}
            </div>
          </div>
          
          {dateMessages.map((message) => {
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
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {format(new Date(message.timestamp), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
