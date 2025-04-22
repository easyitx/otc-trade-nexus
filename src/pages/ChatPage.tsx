
import { useState, useEffect, useRef } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { deals, messages as initialMessages, users } from "../data/mockData";
import { Message, User, Deal } from "../types";
import { ArrowRight, PaperclipIcon, SendIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  sender: User | undefined;
}

const ChatMessage = ({ message, isCurrentUser, sender }: ChatMessageProps) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isCurrentUser ? 'bg-otc-secondary text-white' : 'bg-otc-active text-white'} rounded-lg px-4 py-2`}>
        <div className="flex items-center mb-1">
          <span className="font-medium text-sm">{sender?.fullName || "Unknown User"}</span>
          <span className="ml-2 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { currentUser } = useAuth();
  const [activeDeals, setActiveDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // In a real app, we would fetch this data from an API
    setActiveDeals(deals);
    
    if (deals.length > 0) {
      setSelectedDealId(deals[0].id);
    }
  }, []);
  
  useEffect(() => {
    if (selectedDealId) {
      // Filter messages for the selected deal
      const dealMessages = initialMessages.filter(msg => msg.dealId === selectedDealId);
      setMessages(dealMessages);
      
      // Scroll to bottom when messages change
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedDealId]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedDealId || !currentUser) return;
    
    const newMsg: Message = {
      id: `msg${messages.length + 1}`,
      senderId: currentUser.id,
      content: newMessage.trim(),
      timestamp: new Date(),
      dealId: selectedDealId,
      isRead: false
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage("");
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const getCounterparty = (deal: Deal) => {
    const counterpartyId = currentUser?.id === deal.buyerId ? deal.sellerId : deal.buyerId;
    return users.find(u => u.id === counterpartyId);
  };
  
  return (
    <MainLayout>
      <div className="h-[calc(100vh-10rem)] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Active Deals</h1>
          <Button className="bg-otc-primary text-black hover:bg-otc-primary/90">
            Open New Chat
          </Button>
        </div>
        
        <div className="flex h-full gap-6">
          {/* Deals sidebar */}
          <div className="w-72 flex-shrink-0">
            <Card className="bg-otc-card border-otc-active h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-white">Deals</CardTitle>
              </CardHeader>
              <CardContent className="p-3 overflow-y-auto max-h-[calc(100vh-15rem)]">
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="bg-otc-active w-full mb-4">
                    <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
                    <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="active" className="space-y-2">
                    {activeDeals.map(deal => {
                      const counterparty = getCounterparty(deal);
                      
                      return (
                        <Button
                          key={deal.id}
                          variant="ghost"
                          className={`w-full justify-start p-3 rounded-lg hover:bg-otc-active ${
                            selectedDealId === deal.id ? 'bg-otc-active' : ''
                          }`}
                          onClick={() => setSelectedDealId(deal.id)}
                        >
                          <div className="text-left">
                            <div className="flex items-center">
                              <div className="w-8 h-8 mr-2 rounded-full bg-otc-icon-bg flex items-center justify-center text-otc-icon">
                                {counterparty?.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-white">
                                  {counterparty?.fullName || "Unknown User"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(deal.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                    
                    {activeDeals.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No active deals found.
                      </p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="completed">
                    <p className="text-muted-foreground text-center py-4">
                      No completed deals yet.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Chat area */}
          <div className="flex-1">
            <Card className="bg-otc-card border-otc-active h-full flex flex-col">
              {selectedDealId ? (
                <>
                  <CardHeader className="border-b border-otc-active py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-2 rounded-full bg-otc-icon-bg flex items-center justify-center text-otc-icon">
                        {getCounterparty(activeDeals.find(d => d.id === selectedDealId)!)?.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {getCounterparty(activeDeals.find(d => d.id === selectedDealId)!)?.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getCounterparty(activeDeals.find(d => d.id === selectedDealId)!)?.company}
                        </p>
                      </div>
                      
                      <div className="ml-auto">
                        <Button variant="outline" size="sm" className="border-otc-active hover:bg-otc-active text-white">
                          View Order Details <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {messages.map(message => {
                      const sender = users.find(u => u.id === message.senderId);
                      const isCurrentUser = message.senderId === currentUser?.id;
                      
                      return (
                        <ChatMessage 
                          key={message.id} 
                          message={message} 
                          isCurrentUser={isCurrentUser} 
                          sender={sender}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="border-t border-otc-active p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-white"
                      >
                        <PaperclipIcon className="h-5 w-5" />
                      </Button>
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-otc-active border-otc-active text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="bg-otc-primary text-black hover:bg-otc-primary/90"
                      >
                        <SendIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      Select a deal to start chatting or
                    </p>
                    <Button className="mt-2 bg-otc-primary text-black hover:bg-otc-primary/90">
                      Open New Chat
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
