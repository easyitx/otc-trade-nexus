
import { useState } from "react";
import { MainLayout } from "../../components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Edit2, Save, AlertTriangle } from "lucide-react";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RateManagementPage() {
  const { settings, updateSetting, userRoles, isLoadingRoles, isLoading } = usePlatformSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [rateAdjustments, setRateAdjustments] = useState({
    cbr: 0,
    profinance: 0,
    investing: 0,
    xe: 0
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  // Update local state when settings are loaded
  useState(() => {
    if (settings?.rate_adjustments) {
      setRateAdjustments(settings.rate_adjustments);
    }
  });
  
  const handleSave = async () => {
    await updateSetting.mutateAsync({ 
      key: 'rate_adjustments', 
      value: rateAdjustments 
    });
    
    setIsEditing(false);
    
    toast({
      title: "Настройки сохранены",
      description: "Настройки корректировок курсов были успешно обновлены"
    });
  };
  
  // Check if user has permissions
  if (!isLoadingRoles && !userRoles?.isManager && !userRoles?.isAdmin) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md bg-otc-card border-otc-active">
            <CardHeader>
              <CardTitle className="text-white">Доступ запрещен</CardTitle>
              <CardDescription>
                У вас нет разрешения на просмотр этой страницы.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-red-900/20 border-red-500 text-white">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertTitle>Ограниченная зона</AlertTitle>
                <AlertDescription>
                  Только менеджеры и администраторы могут управлять курсами.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button 
                className="bg-otc-primary text-black hover:bg-otc-primary/90"
                onClick={() => navigate('/')}
              >
                Вернуться на главную
              </Button>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  if (isLoading || isLoadingRoles) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-white">Загрузка...</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Управление курсами</h1>
          
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-otc-primary text-black hover:bg-otc-primary/90 flex items-center"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Редактировать
            </Button>
          ) : (
            <Button 
              onClick={handleSave}
              className="bg-green-600 text-white hover:bg-green-700 flex items-center"
              disabled={updateSetting.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {updateSetting.isPending ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          )}
        </div>
        
        <Card className="bg-otc-card border-otc-active">
          <CardHeader>
            <CardTitle className="text-white">Настройки корректировок курсов</CardTitle>
            <CardDescription>
              Настройте процентные корректировки, применяемые к каждому источнику курсов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-otc-secondary/20 border-otc-icon text-white">
              <AlertTriangle className="h-4 w-4 text-otc-icon" />
              <AlertTitle>Важно</AlertTitle>
              <AlertDescription>
                Эти корректировки влияют на все ордера, созданные с использованием соответствующего источника курсов. Изменения будут применяться только к новым ордерам.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="cbr">Корректировка ЦБ (CBR) (%)</Label>
                <div className="relative">
                  <Input
                    id="cbr"
                    type="number"
                    step="0.1"
                    value={rateAdjustments.cbr.toString()}
                    onChange={(e) => setRateAdjustments({
                      ...rateAdjustments,
                      cbr: parseFloat(e.target.value) || 0
                    })}
                    disabled={!isEditing}
                    className="bg-otc-active border-otc-active text-white pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="profinance">Корректировка Profinance (PF) (%)</Label>
                <div className="relative">
                  <Input
                    id="profinance"
                    type="number"
                    step="0.1"
                    value={rateAdjustments.profinance.toString()}
                    onChange={(e) => setRateAdjustments({
                      ...rateAdjustments,
                      profinance: parseFloat(e.target.value) || 0
                    })}
                    disabled={!isEditing}
                    className="bg-otc-active border-otc-active text-white pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="investing">Корректировка Investing.com (IV) (%)</Label>
                <div className="relative">
                  <Input
                    id="investing"
                    type="number"
                    step="0.1"
                    value={rateAdjustments.investing.toString()}
                    onChange={(e) => setRateAdjustments({
                      ...rateAdjustments,
                      investing: parseFloat(e.target.value) || 0
                    })}
                    disabled={!isEditing}
                    className="bg-otc-active border-otc-active text-white pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="xe">Корректировка XE.com (%)</Label>
                <div className="relative">
                  <Input
                    id="xe"
                    type="number"
                    step="0.1"
                    value={rateAdjustments.xe.toString()}
                    onChange={(e) => setRateAdjustments({
                      ...rateAdjustments,
                      xe: parseFloat(e.target.value) || 0
                    })}
                    disabled={!isEditing}
                    className="bg-otc-active border-otc-active text-white pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
