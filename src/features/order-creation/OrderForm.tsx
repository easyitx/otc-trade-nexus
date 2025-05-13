
import React from "react";
import { useOrderForm } from "./hooks/useOrderForm";
import OrderFormSteps from "./components/OrderFormSteps";
import OrderSuccess from "./components/OrderSuccess";

/**
 * OrderForm component for creating new OTC orders
 */
export default function OrderForm() {
  const orderForm = useOrderForm();
  const { 
    theme, 
    t, 
    isSuccess, 
    setIsSuccess, 
    loading, 
    error 
  } = orderForm;

  // Show success screen after order creation
  if (isSuccess) {
    return <OrderSuccess setIsSuccess={setIsSuccess} theme={theme} t={t} />;
  }

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className={`p-4 rounded-md text-center ${theme === "light" ? "bg-red-50 text-red-700" : "bg-red-900/20 text-red-400"}`}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <OrderFormSteps formProps={orderForm} />
      )}
    </div>
  );
}
