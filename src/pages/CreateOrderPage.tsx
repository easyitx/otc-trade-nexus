
import OrderForm from "../features/order-creation/OrderForm";
import { MainLayout } from "../components/layout/MainLayout";

export default function CreateOrderPage() {
  return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <OrderForm />
      </div>
  );
}
