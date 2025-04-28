
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Separator } from "../ui/separator";

export function TwoFactorSetup() {
  const { enableTwoFactor, verifyTwoFactor, isTwoFactorEnabled } = useAuth();
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSetup = async () => {
    setError(null);
    const response = await enableTwoFactor();
    if (response.error) {
      setError(response.error);
      return;
    }
    
    setQrCode(response.qrCode);
    setSecret(response.secret);
    setIsSetupMode(true);
  };

  const handleVerify = async () => {
    if (token.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    setError(null);
    
    const response = await verifyTwoFactor(token);
    
    setIsVerifying(false);
    
    if (response.error) {
      setError(response.error);
      return;
    }
    
    // Success - reset the setup mode
    setIsSetupMode(false);
    setQrCode(null);
    setSecret(null);
    setToken("");
  };

  const handleCancel = () => {
    setIsSetupMode(false);
    setQrCode(null);
    setSecret(null);
    setToken("");
    setError(null);
  };

  if (isTwoFactorEnabled && !isSetupMode) {
    return (
      <Card className="bg-otc-card border-otc-active">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Two-factor authentication is enabled for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-otc-active/50 rounded-lg flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-otc-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-white">Your account is secure</p>
              <p className="text-muted-foreground text-sm">Use your authenticator app to generate verification codes when logging in</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full border-otc-active hover:bg-otc-active text-white">
            Disable Two-Factor Authentication
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isSetupMode && qrCode) {
    return (
      <Card className="bg-otc-card border-otc-active">
        <CardHeader>
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
          <CardDescription>Scan the QR code with your authenticator app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
          </div>
          
          <div className="bg-otc-active/50 p-2 rounded text-center">
            <p className="text-sm text-white">If you can't scan the QR code, enter this code manually:</p>
            <p className="font-mono text-lg text-otc-primary mt-1">{secret}</p>
          </div>
          
          <Separator className="bg-otc-active" />
          
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
          <Button className="flex-1 bg-otc-primary text-black hover:bg-otc-primary/90" onClick={handleVerify} disabled={token.length !== 6 || isVerifying}>
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="bg-otc-card border-otc-active">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>Add an extra layer of security to your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-otc-active/50 rounded-lg flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-otc-icon-bg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-otc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
              <path d="M12 12v4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-white">Protect your account</p>
            <p className="text-muted-foreground text-sm">Use Google Authenticator or another TOTP app to secure your account</p>
          </div>
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-otc-primary text-black hover:bg-otc-primary/90" 
          onClick={handleStartSetup}
        >
          Set Up Two-Factor Authentication
        </Button>
      </CardFooter>
    </Card>
  );
}
