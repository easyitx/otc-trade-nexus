
import OrderForm from "../features/order-creation/OrderForm";
import { MainLayout } from "../components/layout/MainLayout";

export default function CreateOrderPage() {
  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Создание новой заявки</h1>
        <OrderForm />
      </div>
    </MainLayout>
  );
}
