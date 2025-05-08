
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrderForm from "../features/order-creation/OrderForm";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!isLoading && !currentUser) {
      toast({
        title: "Authentication required",
        description: "Please login to create orders",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [currentUser, isLoading, navigate, toast]);
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-4 px-4 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-otc-primary"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return null; // Will redirect in the useEffect
  }

  return (
    <>
      <div className="container max-w-4xl mx-auto py-4 px-4">
        <OrderForm/>
      </div>
    </>
  );
}
