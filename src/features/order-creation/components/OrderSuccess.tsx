
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface OrderSuccessProps {
  setIsSuccess: (value: boolean) => void;
  theme: string;
  t: (key: string) => string;
}

export default function OrderSuccess({ setIsSuccess, theme, t }: OrderSuccessProps) {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className={cn(
        "w-full max-w-2xl shadow-lg transform transition-all duration-300 animate-fade-in",
        theme === "light" 
          ? "bg-white border-gray-200" 
          : "bg-otc-card border-otc-active"
      )}>
        <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center text-center">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-6",
            theme === "light" 
              ? "bg-green-50 text-green-500" 
              : "bg-green-900/20 text-green-400"
          )}>
            <CheckCircle className="h-10 w-10" />
          </div>
          <h2 className={cn(
            "text-3xl font-bold mb-4",
            theme === "light" ? "text-gray-900" : "text-white"
          )}>
            {t('orderCreatedSuccess')}
          </h2>
          <p className={cn(
            "text-lg mb-8 max-w-md",
            theme === "light" ? "text-gray-600" : "text-muted-foreground"
          )}>
            {t('orderSubmitted')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button
              variant={theme === "light" ? "outline" : "secondary"}
              className={cn(
                "flex-1 py-6",
                theme === "light"
                  ? "border-gray-300 hover:bg-gray-100 text-gray-700"
                  : "border-otc-active hover:bg-otc-active/30 text-white"
              )}
              onClick={() => setIsSuccess(false)}
            >
              {t('createAnotherOrder')}
            </Button>
            <Button
              variant={theme === "light" ? "default" : "default"}
              className={cn(
                "flex-1 py-6",
                theme === "light"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-otc-primary text-black hover:bg-otc-primary/90"
              )}
              asChild
            >
              <a href="/orders">{t('viewAllOrders')}</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
