
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export default function ConnectTelegramPage() {
  const { connectTelegram } = useAuth();
  const { toast } = useToast();
  const [telegramId, setTelegramId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramId.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Telegram ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await connectTelegram(telegramId);
      if (success) {
        toast({
          title: "Success",
          description: "Telegram account connected successfully",
        });
      } else {
        throw new Error("Failed to connect Telegram");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect Telegram account. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Connect Telegram</h1>
        
        <Card className="bg-otc-card border-otc-active">
          <CardHeader>
            <CardTitle>Connect your Telegram Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter your Telegram ID"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  className="bg-otc-active border-otc-active text-white"
                />
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Connecting..." : "Connect Telegram"}
              </Button>
              
              <p className="text-sm text-muted-foreground">
                * To get your Telegram ID, message @userinfobot on Telegram
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
