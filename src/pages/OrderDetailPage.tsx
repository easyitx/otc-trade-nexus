import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";
import { Textarea } from "../components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, MessageSquare, Share, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDeals } from "@/hooks/useDeals";
import { tradePairs } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {useTheme} from "@/contexts/ThemeContext.tsx";
import {cn} from "@/lib/utils.ts";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reserveAmount, setReserveAmount] = useState("");
  const [dealType, setDealType] = useState<string>("OTC");
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { createDealWithManager, getDealByOrderId } = useDeals();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Fetch order details
  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

      if (error) {
        console.error("Error fetching order:", error);
        return null;
      }
      return data;
    },
    enabled: !!id
  });

  // Fetch user profile separately if order exists
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', order?.user_id],
    queryFn: async () => {
      if (!order?.user_id) return null;
      const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', order.user_id)
          .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!order?.user_id
  });

  // Fetch deal if exists
  const { data: deal } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => getDealByOrderId(id!),
    enabled: !!id
  });

  const handleContactSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите сообщение",
        variant: "destructive"
      });
      return;
    }

    if (!order) return;

    try {
      // Create a new deal with manager
      const { data: newDeal, error } = await createDealWithManager(order.id, message, reserveAmount ? Number(reserveAmount) : undefined, dealType);
      if (error) throw new Error(error);

      if (!newDeal || !newDeal.id) {
        throw new Error("Не удалось создать сделку");
      }

      setMessage("");
      setReserveAmount("");
      setIsContactSheetOpen(false);

      toast({
        title: "Заявка создана",
        description: "Вы были перенаправлены в чат с менеджером",
      });

      // Redirect to the chat page
      navigate(`/deals?deal=${newDeal.id}`);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoadingOrder || isLoadingProfile) {
    return (
          <div className={cn(
              "text-2xl font-bold",
              theme === "light" ? "text-foreground" : "text-white"
          )}>Загрузка деталей заявки...</div>
    );
  }

  if (!order) {
    return (
          <div className={cn(
              "flex flex-col items-center justify-center h-[60vh]",
              theme === "light" ? "text-foreground" : "text-white"
          )}>
            <h2 className="text-xl font-semibold mb-2">Заявка не найдена</h2>
            <p className="text-muted-foreground mb-4">Заявка, которую вы ищете, не существует или она была удалена.</p>
            <Button asChild>
              <Link to="/orders">Вернуться к заявкам</Link>
            </Button>
          </div>
    );
  }

  // Find the trade pair for this order (falling back to a generic one if not found)
  // Since tradePairId doesn't exist in the DB, we'll use a default pair
  const pair = tradePairs[0] || { displayName: "Криптовалютная пара" };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `OTC Desk - ${pair?.displayName} Заявка`,
        text: `Проверьте этот ${order?.type === "BUY" ? "запрос на покупку" : "запрос на продажу"} для ${pair?.displayName}`,
        url: window.location.href,
      }).catch(err => {
        toast({
          title: "Скопировано в буфер обмена",
          description: "Ссылка на заявку скопирована в буфер обмена",
        });
        navigator.clipboard.writeText(window.location.href);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Скопировано в буфер обмена",
        description: "Ссылка на заявку скопирована в буфер обмена",
      });
    }
  };

  return (
      <>
        <div className="space-y-6">
          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link to="/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться к заявкам
              </Link>
            </Button>
          </div>

          {/* Order Header */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className={cn(
                  "text-2xl font-bold flex items-center",
                  theme === "light" ? "text-foreground" : "text-white"
              )}>
                {pair.displayName}
                <Badge className={`ml-3 ${order.type === "BUY" ? "bg-green-900/70 text-green-400" : "bg-red-900/70 text-red-400"}`}>
                  {order.type === "BUY" ? "ПОКУПКА" : "ПРОДАЖА"}
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Создан {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })} пользователем {userProfile?.company || "Неизвестно"}
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                  variant="outline"
                  className={cn(
                      "border-otc-active hover:bg-otc-active",
                      theme === "light" ? "text-foreground" : "text-white"
                  )}
                  onClick={handleShare}
              >
                <Share className="mr-2 h-4 w-4" />
                Поделиться
              </Button>

              <Button
                  className="bg-otc-primary text-black hover:bg-otc-primary/90"
                  onClick={() => setIsContactSheetOpen(true)}
                  disabled={!!deal || currentUser?.id === order.user_id}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Связаться с менеджером
              </Button>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Order Info */}
            <Card className={cn(
                "col-span-1 md:col-span-2 bg-otc-card border-otc-active",
                theme === "light" ? "bg-background" : ""
            )}>
              <CardHeader>
                <CardTitle className={theme === "light" ? "text-foreground" : "text-white"}>Детали заявки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Сумма</p>
                    <p className={cn(
                        "text-xl font-semibold",
                        theme === "light" ? "text-foreground" : "text-white"
                    )}>${Number(order.amount).toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Курс</p>
                    <p className={cn(
                        "text-xl font-semibold",
                        theme === "light" ? "text-foreground" : "text-white"
                    )}>{order.rate}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Дата создания</p>
                    <p className={theme === "light" ? "text-foreground" : "text-white"}>{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Последнее обновление</p>
                    <p className={theme === "light" ? "text-foreground" : "text-white"}>{new Date(order.updated_at).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Срок действия</p>
                    <div className="flex items-center">
                      <p className={theme === "light" ? "text-foreground" : "text-white"}>{new Date(order.expires_at).toLocaleDateString()}</p>
                      {new Date(order.expires_at) < new Date(Date.now() + 24 * 60 * 60 * 1000) && (
                          <Badge className="ml-2 bg-yellow-900/70 text-yellow-400">
                            <Clock className="mr-1 h-3 w-3" />
                            Скоро истечёт
                          </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="bg-otc-active" />

                {order.purpose && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Цель платежа</p>
                      <p className={theme === "light" ? "text-foreground" : "text-white"}>{order.purpose}</p>
                    </div>
                )}

                {order.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Дополнительные заметки</p>
                      <p className={theme === "light" ? "text-foreground" : "text-white"}>{order.notes}</p>
                    </div>
                )}

                <div className={cn(
                    "rounded-md p-4 flex items-start space-x-3",
                    theme === "light" ? "bg-yellow-100 text-yellow-900" : "bg-otc-active/50"
                )}>
                  <AlertTriangle className="text-yellow-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className={cn(
                        "font-medium",
                        theme === "light" ? "text-yellow-900" : "text-white"
                    )}>Важное уведомление</p>
                    <p className={cn(
                        "text-sm",
                        theme === "light" ? "text-yellow-800" : "text-muted-foreground"
                    )}>
                      Все транзакции подлежат проверке соответствия. Убедитесь, что все
                      детали верны, прежде чем приступать к какой-либо транзакции.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Info */}
            <Card className={cn(
                "bg-otc-card border-otc-active",
                theme === "light" ? "bg-background" : ""
            )}>
              <CardHeader>
                <CardTitle className={theme === "light" ? "text-foreground" : "text-white"}>Контрагент</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userProfile ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Компания</p>
                        <p className={cn(
                            "font-medium",
                            theme === "light" ? "text-foreground" : "text-white"
                        )}>{userProfile.company || "Не указано"}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Участник с</p>
                        <p className={theme === "light" ? "text-foreground" : "text-white"}>{new Date(userProfile.created_at).toLocaleDateString()}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Верификация</p>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full bg-green-500`} />
                          <span className={theme === "light" ? "text-foreground" : "text-white"}>Верифицирован</span>
                        </div>
                      </div>

                      {currentUser?.id !== order.user_id && !deal && (
                          <div className="pt-4">
                            <Button
                                className="w-full bg-otc-primary text-black hover:bg-otc-primary/90"
                                onClick={() => setIsContactSheetOpen(true)}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Связаться с менеджером
                            </Button>
                          </div>
                      )}
                    </>
                ) : (
                    <p className="text-muted-foreground">Информация о пользователе недоступна</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Sheet */}
        <Sheet open={isContactSheetOpen} onOpenChange={setIsContactSheetOpen}>
          <SheetContent className={cn(
              "bg-otc-card border-l border-otc-active w-full sm:max-w-md",
              theme === "light" ? "bg-background" : ""
          )}>
            <SheetHeader>
              <SheetTitle className={theme === "light" ? "text-foreground" : "text-white"}>Связаться с менеджером</SheetTitle>
              <SheetDescription>
                Отправить сообщение менеджеру для обсуждения этой заявки.
              </SheetDescription>
            </SheetHeader>

            <div className="py-6">
              <div className={cn(
                  "rounded-md p-4 mb-6",
                  theme === "light" ? "bg-blue-100 text-blue-900" : "bg-otc-active/50"
              )}>
                <p className={cn(
                    "font-medium",
                    theme === "light" ? "text-blue-900" : "text-white"
                )}>Детали заявки</p>
                <div className={cn(
                    "text-sm",
                    theme === "light" ? "text-blue-800" : "text-muted-foreground"
                )}>
                  <p>{pair.displayName} • {order.type === "BUY" ? "ПОКУПКА" : "ПРОДАЖА"}</p>
                  <p>Сумма: ${Number(order.amount).toLocaleString()}</p>
                  <p>Курс: {order.rate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="message" className={cn(
                      "block text-sm font-medium mb-1",
                      theme === "light" ? "text-foreground" : "text-white"
                  )}>
                    Ваше сообщение
                  </Label>
                  <Textarea
                      id="message"
                      placeholder="Представьтесь и объясните свой интерес к этой заявке..."
                      className={cn(
                          "min-h-[120px]",
                          theme === "light" ? "bg-background border-input" : "bg-otc-active border-otc-active text-white"
                      )}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reserveAmount" className={cn(
                      "block text-sm font-medium mb-1",
                      theme === "light" ? "text-foreground" : "text-white"
                  )}>
                    Сумма для резервирования (опционально)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                        id="reserveAmount"
                        placeholder="Введите сумму для резервирования"
                        className={cn(
                            "pl-8",
                            theme === "light" ? "bg-background border-input" : "bg-otc-active border-otc-active text-white"
                        )}
                        value={reserveAmount}
                        onChange={(e) => setReserveAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        type="text"
                        inputMode="numeric"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Оставьте пустым, если хотите обсудить полную сумму заявки: ${Number(order.amount).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dealType" className={cn(
                      "block text-sm font-medium mb-1",
                      theme === "light" ? "text-foreground" : "text-white"
                  )}>
                    Тип сделки
                  </Label>
                  <Select value={dealType} onValueChange={setDealType}>
                    <SelectTrigger id="dealType" className={cn(
                        theme === "light" ? "bg-background border-input" : "bg-otc-active border-otc-active text-white"
                    )}>
                      <SelectValue placeholder="Выберите тип сделки" />
                    </SelectTrigger>
                    <SelectContent className={cn(
                        theme === "light" ? "bg-background" : "bg-otc-card border-otc-active"
                    )}>
                      <SelectItem value="OTC">OTC</SelectItem>
                      <SelectItem value="CROSS-BOARD">CROSS-BOARD</SelectItem>
                      <SelectItem value="INVOICE">INVOICE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                      variant="outline"
                      onClick={() => setIsContactSheetOpen(false)}
                      className={cn(
                          "border-otc-active",
                          theme === "light" ? "text-foreground" : "text-white"
                      )}
                  >
                    Отмена
                  </Button>
                  <Button onClick={handleContactSubmit} className="bg-otc-primary text-black hover:bg-otc-primary/90">
                    Отправить запрос
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </>
  );
}
