
import { useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { Send, ExternalLink, CheckCircle, ArrowRight } from "lucide-react";

export default function ConnectTelegramPage() {
  const [username, setUsername] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const handleVerify = () => {
    if (!username) {
      toast({
        title: "Error",
        description: "Please enter your Telegram username",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setStep(2);
      toast({
        title: "Verification code sent",
        description: "Please check your Telegram for the verification code",
      });
    }, 1500);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      setStep(3);
      toast({
        title: "Success",
        description: "Your Telegram account has been successfully connected",
      });
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Connect Telegram</h1>
          <p className="text-muted-foreground mt-1">
            Connect your Telegram account to receive real-time notifications about your orders and deals.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-otc-primary" : "bg-otc-active"}`}>
              <span className="text-black font-medium">1</span>
            </div>
            <div className={`h-0.5 flex-grow ${step >= 2 ? "bg-otc-primary" : "bg-otc-active"}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-otc-primary" : "bg-otc-active"}`}>
              <span className={step >= 2 ? "text-black font-medium" : "text-white font-medium"}>2</span>
            </div>
            <div className={`h-0.5 flex-grow ${step >= 3 ? "bg-otc-primary" : "bg-otc-active"}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-otc-primary" : "bg-otc-active"}`}>
              <span className={step >= 3 ? "text-black font-medium" : "text-white font-medium"}>3</span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <Card className="bg-otc-card border-otc-active">
            <CardHeader>
              <CardTitle>Enter your Telegram username</CardTitle>
              <CardDescription>
                We'll send you a verification code to confirm your identity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Telegram Username</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm bg-otc-active border border-r-0 border-otc-active rounded-l-md text-white">
                    @
                  </span>
                  <Input
                    id="username"
                    placeholder="your_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-otc-active border-otc-active text-white rounded-l-none"
                  />
                </div>
              </div>

              <div>
                <a
                  href="https://web.telegram.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-otc-primary hover:underline text-sm"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Don't have Telegram? Download it here
                </a>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleVerify}
                disabled={isVerifying}
                className="bg-otc-primary text-black hover:bg-otc-primary/90"
              >
                {isVerifying ? "Sending..." : "Send Verification Code"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-otc-card border-otc-active">
            <CardHeader>
              <CardTitle>Enter verification code</CardTitle>
              <CardDescription>
                We've sent a 5-digit code to your Telegram account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Input
                        key={i}
                        maxLength={1}
                        className="w-12 h-12 text-center text-lg bg-otc-active border-otc-active text-white"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Button
                    type="button" 
                    variant="link" 
                    className="text-otc-primary p-0 h-auto"
                  >
                    Didn't receive code? Resend
                  </Button>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-otc-primary text-black hover:bg-otc-primary/90"
                    disabled={isVerifying}
                  >
                    {isVerifying ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="bg-otc-card border-otc-active">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Telegram Connected</h2>
              <p className="text-muted-foreground mb-6">
                Your Telegram account has been successfully connected to OTC Desk.
                You will now receive notifications about your orders and deals.
              </p>
              <div className="space-y-3 w-full">
                <Button 
                  className="w-full bg-otc-primary text-black hover:bg-otc-primary/90"
                  asChild
                >
                  <a href="https://t.me/otcdesk_ru" target="_blank" rel="noopener noreferrer">
                    Join OTC Desk Channel
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-otc-active hover:bg-otc-active text-white"
                  asChild
                >
                  <a href="/settings">
                    Configure Notification Settings
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-otc-card border-otc-active">
          <CardHeader>
            <CardTitle>Benefits of connecting Telegram</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-otc-active flex items-center justify-center mt-0.5">
                  <span className="text-sm font-medium text-otc-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-white">Real-time notifications</p>
                  <p className="text-muted-foreground text-sm">Get instant alerts when your orders match or receive updates.</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-otc-active flex items-center justify-center mt-0.5">
                  <span className="text-sm font-medium text-otc-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-white">Secure chat rooms</p>
                  <p className="text-muted-foreground text-sm">Automatically create secure chat rooms for each deal.</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-otc-active flex items-center justify-center mt-0.5">
                  <span className="text-sm font-medium text-otc-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-white">Mobile access</p>
                  <p className="text-muted-foreground text-sm">Manage your orders on the go without needing to log into the web app.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
