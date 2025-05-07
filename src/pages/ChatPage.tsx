import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DealChat } from "@/components/chat/DealChat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {useTheme} from "@/contexts/ThemeContext.tsx";

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeDealId = searchParams.get("deal");
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const { data: deals, isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      const { data, error } = await supabase
          .from("deals")
          .select("*, orders(*)")
          .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
          .order("updated_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!currentUser?.id,
  });

  // Get latest messages for each deal to show in sidebar
  const { data: latestMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["latestMessages"],
    queryFn: async () => {
      if (!deals?.length) return {};

      const messages: Record<string, any> = {};

      for (const deal of deals) {
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("deal_id", deal.id)
            .order("created_at", { ascending: false })
            .limit(1);

        if (!error && data.length > 0) {
          messages[deal.id] = data[0];
        }
      }

      return messages;
    },
    enabled: !!deals?.length,
  });

  if (isLoading) {
    return (
        <>
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-10 w-10 text-otc-primary animate-spin" />
          </div>
        </>
    );
  }

  if (!deals?.length) {
    return (
        <>
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h2 className={cn(
                "text-xl font-semibold mb-2",
                theme === "light" ? "text-gray-900" : "text-white"
            )}>
              No active deals
            </h2>
            <p className={cn(
                "text-muted-foreground",
                theme === "light" ? "text-gray-600" : "text-gray-400"
            )}>
              When you start a deal with someone, your chat will appear here.
            </p>
          </div>
        </>
    );
  }

  const activeDeal = activeDealId
      ? deals.find(deal => deal.id === activeDealId)
      : deals[0];

  // If deal ID in URL doesn't exist, redirect to first deal
  if (activeDealId && !activeDeal) {
    navigate(`/deals?deal=${deals[0].id}`);
  }

  return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-10rem)]">
          {/* Deals List */}
          <div className={cn(
              "md:col-span-1 border rounded-lg p-4 overflow-y-auto",
              theme === "light"
                  ? "bg-white border-gray-200"
                  : "bg-otc-card border-otc-active"
          )}>
            <h2 className={cn(
                "text-lg font-semibold mb-4",
                theme === "light" ? "text-gray-900" : "text-white"
            )}>
              Active Deals
            </h2>
            <div className="space-y-2">
              {deals.map((deal) => {
                const hasUnreadMessages = false;
                const latestMessage = latestMessages?.[deal.id];

                return (
                    <a
                        key={deal.id}
                        href={`/deals?deal=${deal.id}`}
                        className={cn(
                            "block p-3 rounded-lg transition-colors",
                            deal.id === activeDeal?.id
                                ? theme === "light"
                                    ? "bg-blue-100 text-gray-900 border border-blue-300"
                                    : "bg-otc-active text-white"
                                : theme === "light"
                                    ? "hover:bg-gray-100 text-gray-700 border border-transparent"
                                    : "hover:bg-otc-active/50 text-muted-foreground"
                        )}
                    >
                      <div className="font-medium flex justify-between items-center">
                        <span>Order #{deal.orders?.id.slice(-6)}</span>
                        {hasUnreadMessages && (
                            <span className={cn(
                                "rounded-full w-2 h-2",
                                theme === "light" ? "bg-blue-500" : "bg-otc-primary"
                            )}></span>
                        )}
                      </div>
                      {latestMessage && (
                          <div className={cn(
                              "text-sm truncate mt-1",
                              theme === "light"
                                  ? deal.id === activeDeal?.id
                                      ? "text-gray-700"
                                      : "text-gray-500"
                                  : "opacity-70"
                          )}>
                            {latestMessage.content}
                          </div>
                      )}
                      <div className={cn(
                          "text-sm mt-1",
                          theme === "light"
                              ? deal.id === activeDeal?.id
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              : "opacity-70"
                      )}>
                        {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
                      </div>
                    </a>
                )
              })}
            </div>
          </div>

          {/* Active Chat */}
          <div className={cn(
              "md:col-span-3 border rounded-lg p-4",
              theme === "light"
                  ? "bg-white border-gray-200"
                  : "bg-otc-card border-otc-active"
          )}>
            {activeDeal ? (
                <DealChat dealId={activeDeal.id} />
            ) : (
                <div className={cn(
                    "flex items-center justify-center h-full",
                    theme === "light" ? "text-gray-500" : "text-muted-foreground"
                )}>
                  Select a deal to view the chat
                </div>
            )}
          </div>
        </div>
      </>
  );
}