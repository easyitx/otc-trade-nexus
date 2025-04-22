
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { AlertCircleIcon } from "lucide-react";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validate form
    if (!email || !password) {
      setError("Email and password are required");
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-otc-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-otc-card border-otc-active">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">Login</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your credentials to access your OTC Desk account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-900 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircleIcon className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-otc-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-otc-primary text-black hover:bg-otc-primary/90" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>

            {/* Demo account for testing */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Demo credentials: a.ivanov@example.com / any password
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-muted-foreground text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-otc-primary hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
