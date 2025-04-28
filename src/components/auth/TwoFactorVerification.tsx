
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircleIcon } from "lucide-react";

interface TwoFactorVerificationProps {
  userId: string;
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorVerification({ userId, email, onSuccess, onCancel }: TwoFactorVerificationProps) {
  const { verifyLoginTwoFactor } = useAuth();
  const [token, setToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (token.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    setError(null);
    
    const response = await verifyLoginTwoFactor(userId, token);
    
    setIsVerifying(false);
    
    if (response.error) {
      setError(response.error);
      return;
    }
    
    onSuccess();
  };

  return (
    <Card className="bg-otc-card border-otc-active">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app for {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-900/20 border border-red-900 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircleIcon className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <InputOTP maxLength={6} value={token} onChange={setToken}>
            <InputOTPGroup>
              <InputOTPSlot index={0} className="bg-otc-active border-otc-active text-white" />
              <InputOTPSlot index={1} className="bg-otc-active border-otc-active text-white" />
              <InputOTPSlot index={2} className="bg-otc-active border-otc-active text-white" />
              <InputOTPSlot index={3} className="bg-otc-active border-otc-active text-white" />
              <InputOTPSlot index={4} className="bg-otc-active border-otc-active text-white" />
              <InputOTPSlot index={5} className="bg-otc-active border-otc-active text-white" />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-3">
        <Button variant="outline" className="flex-1 border-otc-active hover:bg-otc-active text-white" onClick={onCancel}>
          Back
        </Button>
        <Button 
          className="flex-1 bg-otc-primary text-black hover:bg-otc-primary/90" 
          onClick={handleVerify} 
          disabled={token.length !== 6 || isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>
      </CardFooter>
    </Card>
  );
}
