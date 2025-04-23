import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";
import { Textarea } from "../components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, MessageSquare, Share, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useOrders } from "../hooks/useOrders";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useDeals } from "@/hooks/useDeals";
import { useMessages } from "@/hooks/useMessages";
import { useQuery } from "@tanstack/react-query";
import { DealChat } from "@/components/chat/DealChat";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { createDeal, getDealByOrderId } = useDeals();
  
  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(*)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: deal } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => getDealByOrderId(id!),
    enabled: !!id
  });

  const { messages, sendMessage } = useMessages(deal?.id);

  const handleContactSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    if (!order) return;

    try {
      if (!deal) {
        const { error } = await createDeal(order.id, order.user_id);
        if (error) throw new Error(error);
      }

      await sendMessage(message);
      setMessage("");
      setIsContactSheetOpen(false);

      toast({
        title: "Message sent",
        description: "Your message has been sent to the counterparty",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoadingOrder) {
    return (
      <MainLayout>
        <div>Loading order details...</div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-xl font-semibold text-white mb-2">Order not found</h2>
          <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/orders">Back to Orders</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const pair = {
    displayName: "Mock Pair",
  };

  const user = {
    company: "Mock Company",
    registrationDate: new Date(),
    isVerified: true,
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `OTC Desk - ${pair?.displayName} Order`,
        text: `Check out this ${order?.type} order for ${pair?.displayName}`,
        url: window.location.href,
      }).catch(err => {
        toast({
          title: "Copied to clipboard",
          description: "Order link copied to clipboard",
        });
        navigator.clipboard.writeText(window.location.href);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Copied to clipboard",
        description: "Order link copied to clipboard",
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link to="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
        
        {/* Order Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              {pair.displayName}
              <Badge className={`ml-3 ${order.type === "BUY" ? "bg-green-900/70 text-green-400" : "bg-red-900/70 text-red-400"}`}>
                {order.type}
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Created {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })} by {user?.company || "Unknown"}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="border-otc-active hover:bg-otc-active text-white"
              onClick={handleShare}
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            
            <Button 
              className="bg-otc-primary text-black hover:bg-otc-primary/90"
              onClick={() => setIsContactSheetOpen(true)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Counterparty
            </Button>
          </div>
        </div>
        
        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Order Info */}
          <Card className="col-span-1 md:col-span-2 bg-otc-card border-otc-active">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-xl font-semibold text-white">${order.amount.toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Rate</p>
                  <p className="text-xl font-semibold text-white">{order.rate}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Created Date</p>
                  <p className="text-white">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <div className="flex items-center">
                    <p className="text-white">{new Date(order.expires_at).toLocaleDateString()}</p>
                    {new Date(order.expires_at) < new Date(Date.now() + 24 * 60 * 60 * 1000) && (
                      <Badge className="ml-2 bg-yellow-900/70 text-yellow-400">
                        <Clock className="mr-1 h-3 w-3" />
                        Expiring soon
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator className="bg-otc-active" />
              
              {order.purpose && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Purpose</p>
                  <p className="text-white">{order.purpose}</p>
                </div>
              )}
              
              {order.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Additional Notes</p>
                  <p className="text-white">{order.notes}</p>
                </div>
              )}
              
              <div className="bg-otc-active/50 rounded-md p-4 flex items-start space-x-3">
                <AlertTriangle className="text-yellow-500 h-5 w-5 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Important Notice</p>
                  <p className="text-muted-foreground text-sm">
                    All transactions are subject to compliance checks. Ensure all details are accurate 
                    before proceeding with any transaction.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* User Info */}
          <Card className="bg-otc-card border-otc-active">
            <CardHeader>
              <CardTitle>Counterparty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium text-white">{user.company}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Member since</p>
                    <p className="text-white">{new Date(user.registrationDate).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Verification</p>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-white">{user.isVerified ? 'Verified' : 'Pending Verification'}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      className="w-full bg-otc-primary text-black hover:bg-otc-primary/90"
                      onClick={() => setIsContactSheetOpen(true)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Counterparty
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">User information not available</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-otc-card border-otc-active">
          <DealChat dealId={deal?.id!} />
        </Card>
      </div>
      
      {/* Contact Sheet */}
      <Sheet open={isContactSheetOpen} onOpenChange={setIsContactSheetOpen}>
        <SheetContent className="bg-otc-card border-l border-otc-active w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-white">Contact Counterparty</SheetTitle>
            <SheetDescription>
              Send a message to the counterparty to discuss this order.
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6">
            <div className="bg-otc-active/50 rounded-md p-4 mb-6">
              <p className="text-white font-medium">Order Details</p>
              <div className="text-sm text-muted-foreground">
                <p>{pair.displayName} • {order.type}</p>
                <p>Amount: ${order.amount.toLocaleString()}</p>
                <p>Rate: {order.rate}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-1">
                  Your Message
                </label>
                <Textarea 
                  id="message"
                  placeholder="Introduce yourself and explain your interest in this order..."
                  className="min-h-[150px] bg-otc-active border-otc-active text-white"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsContactSheetOpen(false)} className="border-otc-active text-white">
                  Cancel
                </Button>
                <Button onClick={handleContactSubmit} className="bg-otc-primary text-black hover:bg-otc-primary/90">
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}
