
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

export function DisableTwoFactor() {
  const { disableTwoFactor, isTwoFactorEnabled } = useAuth();
  const [isDisabling, setIsDisabling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isTwoFactorEnabled) {
    return null;
  }

  const handleStartDisable = () => {
    setShowConfirm(true);
    setError(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setToken("");
    setError(null);
  };

  const handleDisable = async () => {
    if (token.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    setIsDisabling(true);
    setError(null);
    
    const response = await disableTwoFactor(token);
    
    setIsDisabling(false);
    
    if (response.error) {
      setError(response.error);
      return;
    }
    
    // Success - reset the confirm mode
    setShowConfirm(false);
    setToken("");
  };

  if (showConfirm) {
    return (
      <Card className="bg-otc-card border-otc-active">
        <CardHeader>
          <CardTitle>Disable Two-Factor Authentication</CardTitle>
          <CardDescription>Enter your verification code to confirm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/20 p-4 rounded-lg">
            <p className="text-white text-sm">
              Warning: Disabling two-factor authentication will make your account less secure.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-white">Enter the 6-digit verification code from your app:</p>
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
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-3">
          <Button variant="outline" className="flex-1 border-otc-active hover:bg-otc-active text-white" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleDisable} disabled={token.length !== 6 || isDisabling}>
            {isDisabling ? "Disabling..." : "Disable 2FA"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="bg-otc-card border-otc-active">
      <CardHeader>
        <CardTitle>Disable Two-Factor Authentication</CardTitle>
        <CardDescription>Remove the extra security layer from your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-otc-active/50 rounded-lg flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 8 4 4-4 4M8 12h8" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-white">Two-factor authentication is enabled</p>
            <p className="text-muted-foreground text-sm">
              Disabling this will make your account less secure
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" className="w-full" onClick={handleStartDisable}>
          Disable Two-Factor Authentication
        </Button>
      </CardFooter>
    </Card>
  );
}
