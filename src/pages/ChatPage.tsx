import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { DealChat } from "@/components/chat/DealChat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from 'date-fns'; // Add this import

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const activeDealId = searchParams.get("deal");
  const { currentUser } = useAuth();

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

  if (isLoading) {
    return (
      <MainLayout>
        <div>Loading your chats...</div>
      </MainLayout>
    );
  }

  if (!deals?.length) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <h2 className="text-xl font-semibold text-white mb-2">No active deals</h2>
          <p className="text-muted-foreground">
            When you start a deal with someone, your chat will appear here.
          </p>
        </div>
      </MainLayout>
    );
  }

  const activeDeal = activeDealId 
    ? deals.find(deal => deal.id === activeDealId) 
    : deals[0];

  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-10rem)]">
        {/* Deals List */}
        <div className="md:col-span-1 bg-otc-card border border-otc-active rounded-lg p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-white mb-4">Active Deals</h2>
          <div className="space-y-2">
            {deals.map((deal) => (
              <a
                key={deal.id}
                href={`/deals?deal=${deal.id}`}
                className={`block p-3 rounded-lg transition-colors ${
                  deal.id === activeDeal?.id
                    ? "bg-otc-active text-white"
                    : "hover:bg-otc-active/50 text-muted-foreground"
                }`}
              >
                <div className="font-medium">Order #{deal.orders?.id.slice(-6)}</div>
                <div className="text-sm opacity-70">
                  {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Active Chat */}
        <div className="md:col-span-3 bg-otc-card border border-otc-active rounded-lg p-4">
          {activeDeal ? (
            <DealChat dealId={activeDeal.id} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a deal to view the chat
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
