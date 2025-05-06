
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface DealStatusProps {
  deal: any; // This should be typed properly in a future refactoring
}

interface DealMetadata {
  dealType: "OTC" | "CROSS-BOARD" | "INVOICE";
  reserveAmount?: number;
  isWithManager?: boolean;
}

export function DealStatus({ deal }: DealStatusProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const { theme } = useTheme();
  
  const isManager = async () => {
    if (!currentUser) return false;
    
    const { data } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', currentUser.id)
      .in('role', ['manager', 'admin'])
      .maybeSingle();
      
    return !!data;
  };
  
  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('deals')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', deal.id);
        
      if (error) throw error;
      
      // Send system message about status change
      let statusMessage = "";
      
      switch (newStatus) {
        case "COMPLETED":
          statusMessage = "✅ Сделка успешно завершена";
          break;
        case "CANCELLED":
          statusMessage = "❌ Сделка отменена";
          break;
        case "AGREED":
          statusMessage = "🤝 Условия сделки согласованы";
          break;
        default:
          statusMessage = `Статус сделки изменен на: ${newStatus}`;
      }
      
      // Add system message
      await supabase
        .from('messages')
        .insert({
          deal_id: deal.id,
          content: statusMessage,
          sender_id: currentUser?.id,
        });
      
      toast({
        title: "Статус обновлен",
        description: `Статус сделки изменен на: ${newStatus}`
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['messages', deal.id] });
      
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const createTelegramChat = async () => {
    setIsUpdating(true);
    
    try {
      // In a real application, this would call an edge function to create a Telegram group
      // and return the chat ID. For now, we'll simulate that with a fake ID.
      const telegramChatId = `telegram_${Math.floor(Math.random() * 1000000)}`;
      
      const { error } = await supabase
        .from('deals')
        .update({
          telegram_chat_id: telegramChatId,
        })
        .eq('id', deal.id);
        
      if (error) throw error;
      
      // Add system message about Telegram chat creation
      await supabase
        .from('messages')
        .insert({
          deal_id: deal.id,
          content: `🔗 Создан Telegram чат для работы по данной сделке`,
          sender_id: currentUser?.id,
        });
      
      toast({
        title: "Telegram чат создан",
        description: "Ссылка на чат будет отправлена участникам сделки"
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['messages', deal.id] });
      
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Parse deal metadata if it exists
  let dealMetadata: DealMetadata | null = null;
  try {
    if (deal.deal_metadata) {
      if (typeof deal.deal_metadata === 'string') {
        dealMetadata = JSON.parse(deal.deal_metadata);
      } else {
        dealMetadata = deal.deal_metadata as DealMetadata;
      }
    } else if (deal.parsedDealMetadata) {
      dealMetadata = deal.parsedDealMetadata;
    }
  } catch (e) {
    console.error("Ошибка при разборе метаданных сделки", e);
  }
  
  const getDealTypeBadge = () => {
    const type = dealMetadata?.dealType || 'OTC';
    
    switch (type) {
      case 'CROSS-BOARD':
        return <Badge className="bg-purple-700">CROSS-BOARD</Badge>;
      case 'INVOICE':
        return <Badge className="bg-blue-700">INVOICE</Badge>;
      default:
        return <Badge className="bg-amber-700">OTC</Badge>;
    }
  };
  
  const getStatusBadge = () => {
    switch (deal.status) {
      case 'COMPLETED':
        return <Badge className="bg-green-700 flex items-center"><CheckCircle className="mr-1 h-3 w-3" /> Завершена</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-700 flex items-center"><XCircle className="mr-1 h-3 w-3" /> Отменена</Badge>;
      case 'AGREED':
        return <Badge className="bg-blue-700 flex items-center">Согласована</Badge>;
      default:
        return <Badge className="bg-amber-700 flex items-center"><Clock className="mr-1 h-3 w-3" /> В процессе</Badge>;
    }
  };
  
  return (
    <Card className={cn(
      "mb-4 border",
      theme === "light" ? "bg-accent/30 border-accent" : "bg-otc-active/30 border-otc-active"
    )}>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Заявка #{deal.id.slice(-6)}</h3>
            <div className="flex space-x-2">
              {getDealTypeBadge()}
              {getStatusBadge()}
            </div>
          </div>
          
          {dealMetadata?.reserveAmount && (
            <div className="text-sm text-muted-foreground">
              <span>Сумма: ${Number(dealMetadata.reserveAmount).toLocaleString()}</span>
            </div>
          )}
          
          {isManager() && deal.status === 'NEGOTIATING' && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Button 
                size="sm"
                variant="outline" 
                className={theme === "light" ? "border-green-700 text-green-700 hover:bg-green-50" : "border-green-700 text-green-400 hover:bg-green-900/30"}
                onClick={() => handleStatusUpdate('AGREED')}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Согласовать'}
              </Button>
              
              <Button 
                size="sm"
                variant="outline"
                className={theme === "light" ? "border-amber-700 text-amber-700 hover:bg-amber-50" : "border-amber-700 text-amber-400 hover:bg-amber-900/30"}
                onClick={createTelegramChat}
                disabled={isUpdating || !!deal.telegram_chat_id}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Создать Telegram чат'}
              </Button>
              
              <Button 
                size="sm"
                variant="outline"
                className={theme === "light" ? "border-red-700 text-red-700 hover:bg-red-50" : "border-red-700 text-red-400 hover:bg-red-900/30"}
                onClick={() => handleStatusUpdate('CANCELLED')}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Отменить'}
              </Button>
            </div>
          )}
          
          {isManager() && deal.status === 'AGREED' && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Button 
                size="sm"
                variant="outline" 
                className={theme === "light" ? "border-green-700 text-green-700 hover:bg-green-50" : "border-green-700 text-green-400 hover:bg-green-900/30"}
                onClick={() => handleStatusUpdate('COMPLETED')}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Завершить сделку'}
              </Button>
              
              <Button 
                size="sm"
                variant="outline"
                className={theme === "light" ? "border-red-700 text-red-700 hover:bg-red-50" : "border-red-700 text-red-400 hover:bg-red-900/30"}
                onClick={() => handleStatusUpdate('CANCELLED')}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Отменить'}
              </Button>
            </div>
          )}
          
          {deal.telegram_chat_id && (
            <div className="flex items-center text-sm text-otc-primary">
              <span>🔗 Telegram чат создан</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
