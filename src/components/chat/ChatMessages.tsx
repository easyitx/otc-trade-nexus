
import { Message } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useTheme } from "@/contexts/ThemeContext";

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  if (!messages?.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Сообщений пока нет. Начните разговор!
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
            <div className="text-xs text-muted-foreground bg-accent/30 px-3 py-1 rounded-full">
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
                  className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                    isOwn
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-accent/70 text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <p className={`text-xs mt-1 text-right ${isOwn ? 'text-primary-foreground/70' : 'text-foreground/70'}`}>
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
