
import React from "react";
import OrderForm from "../features/order-creation/OrderForm";
import { useLanguage } from "../contexts/LanguageContext";

export default function CreateOrderPage() {
  const { t } = useLanguage();

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('createNewOrder')}</h1>
      <OrderForm />
    </div>
  );
}
