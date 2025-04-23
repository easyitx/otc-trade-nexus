
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { AlertCircleIcon } from "lucide-react";

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: ""
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validate form
    if (!formData.fullName || !formData.company || !formData.email || !formData.password) {
      setError("All fields are required except Referral Code");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        company: formData.company,
        referralCode: formData.referralCode || undefined
      });

      if (success) {
        // Successfully registered and logged in, navigate to dashboard
        navigate('/');
      } else {
        setError("Registration failed. Please try again.");
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
          <CardTitle className="text-2xl font-bold text-center text-white">Create an account</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your information to create an OTC Desk account
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
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                className="bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                name="company"
                placeholder="Enter your company name"
                value={formData.company}
                onChange={handleChange}
                className="bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code (Optional)</Label>
              <Input
                id="referralCode"
                name="referralCode"
                placeholder="Enter referral code if you have one"
                value={formData.referralCode}
                onChange={handleChange}
                className="bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-otc-primary text-black hover:bg-otc-primary/90" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-otc-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
