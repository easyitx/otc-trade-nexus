
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
import { orders, tradePairs, users } from "../data/mockData";
import { ArrowLeft, MessageSquare, Share, AlertTriangle, Clock, ArrowUpRight } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { Order, TradePair } from "../types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [pair, setPair] = useState<TradePair | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  
  useEffect(() => {
    if (id) {
      // In a real app, this would be an API call
      const foundOrder = orders.find(o => o.id === id);
      if (foundOrder) {
        setOrder(foundOrder);
        
        // Find related data
        const relatedPair = tradePairs.find(p => p.id === foundOrder.tradePairId);
        const relatedUser = users.find(u => u.id === foundOrder.userId);
        
        setPair(relatedPair || null);
        setUser(relatedUser || null);
      }
    }
  }, [id]);
  
  const handleContactSubmit = () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would send the message
    toast({
      title: "Message sent",
      description: "Your message has been sent to the counterparty",
    });
    
    setMessage("");
    setIsContactSheetOpen(false);
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
  
  if (!order || !pair) {
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
              Created {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })} by {user?.company || "Unknown"}
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
                  <p className="text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <div className="flex items-center">
                    <p className="text-white">{new Date(order.expiresAt).toLocaleDateString()}</p>
                    {new Date(order.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) && (
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
        
        {/* Similar Orders */}
        <Card className="bg-otc-card border-otc-active">
          <CardHeader>
            <CardTitle>Similar Orders</CardTitle>
            <CardDescription>Other orders with the same trading pair</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-otc-active/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Expires</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-otc-active">
                  {orders
                    .filter(o => o.id !== order.id && o.tradePairId === order.tradePairId)
                    .slice(0, 3)
                    .map(similarOrder => (
                      <tr key={similarOrder.id} className="hover:bg-otc-active/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-sm font-semibold rounded-full px-2 py-0.5 ${
                            similarOrder.type === "BUY" ? "bg-green-900/30 text-green-500" : "bg-red-900/30 text-red-500"
                          }`}>
                            {similarOrder.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                          ${similarOrder.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                          {similarOrder.rate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(similarOrder.expiresAt), { addSuffix: true })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <Button variant="ghost" size="sm" className="hover:bg-otc-active hover:text-white" asChild>
                            <Link to={`/orders/${similarOrder.id}`}>
                              View <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  
                  {orders.filter(o => o.id !== order.id && o.tradePairId === order.tradePairId).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                        No similar orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
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
