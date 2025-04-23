import { useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { DatePicker } from "../components/ui/date-picker";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { tradePairs } from "../data/mockData";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { CheckCircle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const { currentUser } = useAuth();
  const [orderType, setOrderType] = useState<string>("BUY");
  const [selectedPair, setSelectedPair] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [purpose, setPurpose] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  // Group trade pairs by category
  const groupedPairs: Record<string, typeof tradePairs> = tradePairs.reduce((groups, pair) => {
    const group = pair.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(pair);
    return groups;
  }, {} as Record<string, typeof tradePairs>);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Validate minimum amount (500,000 USD)
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount < 500000) {
      alert("Minimum order amount is 500,000 USD");
      setIsSubmitting(false);
      return;
    }

    const { error } = await createOrder({
      type: orderType as "BUY" | "SELL",
      amount: parsedAmount,
      rate,
      expires_at: expiryDate?.toISOString() || new Date().toISOString(),
      purpose: purpose || null,
      notes: notes || null,
      status: "ACTIVE"
    });

    if (!error) {
      navigate('/orders');
    }
    
    setIsSubmitting(false);
  };
  
  if (isSuccess) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-2xl bg-otc-card border-otc-active">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Order Created Successfully</h2>
              <p className="text-muted-foreground mb-6">
                Your order has been submitted to the OTC Desk and is now visible to potential counterparties.
              </p>
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  className="border-otc-active hover:bg-otc-active text-white"
                  onClick={() => setIsSuccess(false)}
                >
                  Create Another Order
                </Button>
                <Button 
                  className="bg-otc-primary text-black hover:bg-otc-primary/90"
                  asChild
                >
                  <a href="/orders">View All Orders</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Create New Order</h1>
        </div>
        
        <Alert className="bg-otc-secondary/20 border-otc-icon text-white">
          <Info className="h-4 w-4 text-otc-icon" />
          <AlertTitle>Minimum order size</AlertTitle>
          <AlertDescription>
            OTC Desk requires a minimum order size of $500,000 USD equivalent.
          </AlertDescription>
        </Alert>
        
        <form onSubmit={handleSubmit}>
          <Card className="bg-otc-card border-otc-active">
            <CardHeader>
              <CardTitle className="text-white">Order Details</CardTitle>
              <CardDescription>
                Enter the details of your OTC order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Type */}
              <div className="space-y-2">
                <Label>Order Type</Label>
                <RadioGroup 
                  defaultValue="BUY" 
                  value={orderType}
                  onValueChange={setOrderType}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BUY" id="buy" className="border-otc-active text-otc-primary" />
                    <Label htmlFor="buy" className="cursor-pointer">Buy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SELL" id="sell" className="border-otc-active text-otc-primary" />
                    <Label htmlFor="sell" className="cursor-pointer">Sell</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Trading Pair */}
              <div className="space-y-2">
                <Label htmlFor="tradingPair">Trading Pair</Label>
                <Select value={selectedPair} onValueChange={setSelectedPair}>
                  <SelectTrigger id="tradingPair" className="bg-otc-active border-otc-active text-white">
                    <SelectValue placeholder="Select Trading Pair" />
                  </SelectTrigger>
                  <SelectContent className="bg-otc-card border-otc-active max-h-[300px]">
                    {Object.entries(groupedPairs).map(([group, pairs]) => (
                      <div key={group}>
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase">
                          {group === "RUB_NR" ? "RUB (Non-Resident)" : 
                           group === "RUB_CASH" ? "Cash" : "Tokenized"}
                        </div>
                        {pairs.map((pair) => (
                          <SelectItem key={pair.id} value={pair.id}>
                            {pair.displayName}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD equivalent)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500,000 minimum"
                    className="pl-8 bg-otc-active border-otc-active text-white"
                  />
                </div>
              </div>
              
              {/* Rate */}
              <div className="space-y-2">
                <Label htmlFor="rate">Rate</Label>
                <Input
                  id="rate"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="e.g., CB+1.5%, Market Price, etc."
                  className="bg-otc-active border-otc-active text-white"
                />
              </div>
              
              {/* Expiry Date */}
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <div className="bg-otc-active border border-otc-active rounded-md p-3">
                  <DatePicker 
                    date={expiryDate} 
                    setDate={setExpiryDate} 
                    className="text-white" 
                  />
                </div>
              </div>
              
              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose">Payment Purpose</Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g., Import payment, Export revenue, etc."
                  className="bg-otc-active border-otc-active text-white"
                />
              </div>
              
              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional details or requirements for this order"
                  className="bg-otc-active border-otc-active text-white min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                className="border-otc-active hover:bg-otc-active text-white"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-otc-primary text-black hover:bg-otc-primary/90"
                disabled={isSubmitting || !selectedPair || !amount || !rate}
              >
                {isSubmitting ? "Creating..." : "Create Order"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
