import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { EnhancedTabsList, EnhancedTabsTrigger } from "../components/ui/enhanced-tabs";
import { Separator } from "../components/ui/separator";
import { useState } from "react";
import { useToast } from "../hooks/use-toast";
import { Bell, Lock, Globe, User, Save, Settings, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { PasswordChange } from "../components/auth/PasswordChange";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { isAuthenticated, profile } = useAuth();
  const { userRoles, isLoadingRoles } = usePlatformSettings();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [newDeals, setNewDeals] = useState(true);
  const [marketAlerts, setMarketAlerts] = useState(false);
  const [language, setLanguage] = useState("en");
  const { toast } = useToast();
  const { theme } = useTheme();

  const handleSaveNotifications = () => {
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const isManager = userRoles?.isManager || userRoles?.isAdmin;

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Card className={cn(
            theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
          )}>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please log in to access settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className={cn(
                theme === "light" ? "bg-primary text-white hover:bg-primary/90" : "bg-otc-primary text-black hover:bg-otc-primary/90"
              )}>
                <a href="/login">Log In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className={cn("text-2xl font-bold", theme === "light" ? "text-gray-900" : "text-white")}>Settings</h1>

        {isManager && !isLoadingRoles && (
          <Card className={cn(
            theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
          )}>
            <CardHeader>
              <CardTitle className={theme === "light" ? "text-gray-900" : "text-white"}>Administration</CardTitle>
              <CardDescription>
                Manage platform settings and configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn(
                "p-4 rounded-lg flex items-center justify-between",
                theme === "light" ? "bg-gray-50" : "bg-otc-active/50"
              )}>
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    theme === "light" ? "bg-primary/10" : "bg-otc-icon-bg"
                  )}>
                    <Settings className={cn(
                      "h-5 w-5",
                      theme === "light" ? "text-primary" : "text-otc-icon"
                    )} />
                  </div>
                  <div>
                    <p className={cn(
                      "font-medium",
                      theme === "light" ? "text-gray-900" : "text-white"
                    )}>Rate Management</p>
                    <p className="text-muted-foreground text-sm">Configure platform rate adjustments</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className={cn(
                    theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-otc-active"
                  )}
                  asChild
                >
                  <Link to="/admin/rate-management">
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="security" className="space-y-4">
          <EnhancedTabsList>
            <EnhancedTabsTrigger value="notifications" icon={<Bell className="h-4 w-4" />}>
              Notifications
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger value="security" icon={<Lock className="h-4 w-4" />}>
              Security
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger value="preferences" icon={<User className="h-4 w-4" />}>
              Preferences
            </EnhancedTabsTrigger>
          </EnhancedTabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className={cn(
              theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
            )}>
              <CardHeader>
                <CardTitle className={theme === "light" ? "text-gray-900" : "text-white"}>Notification Channels</CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                    <span className={theme === "light" ? "text-gray-800" : ""}>Email Notifications</span>
                    <span className="text-sm text-muted-foreground">Receive updates about your orders via email</span>
                  </Label>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    className={theme === "light" ? "data-[state=checked]:bg-primary" : ""}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="telegram-notifications" className="flex flex-col space-y-1">
                    <span className={theme === "light" ? "text-gray-800" : ""}>Telegram Notifications</span>
                    <span className="text-sm text-muted-foreground">Receive updates about your orders via Telegram</span>
                  </Label>
                  <Switch
                    id="telegram-notifications"
                    checked={telegramNotifications}
                    onCheckedChange={setTelegramNotifications}
                    className={theme === "light" ? "data-[state=checked]:bg-primary" : ""}
                  />
                </div>

                <Separator className={theme === "light" ? "bg-gray-200" : "bg-otc-active"} />

                <div className="space-y-4">
                  <h3 className={cn(
                    "text-lg font-medium",
                    theme === "light" ? "text-gray-900" : "text-white"
                  )}>Notification Types</h3>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="order-updates" className="flex flex-col space-y-1">
                      <span>Order Updates</span>
                      <span className="text-sm text-muted-foreground">Notifications about your existing orders</span>
                    </Label>
                    <Switch
                      id="order-updates"
                      checked={orderUpdates}
                      onCheckedChange={setOrderUpdates}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="new-deals" className="flex flex-col space-y-1">
                      <span>New Deal Messages</span>
                      <span className="text-sm text-muted-foreground">Notifications when you receive new messages</span>
                    </Label>
                    <Switch
                      id="new-deals"
                      checked={newDeals}
                      onCheckedChange={setNewDeals}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="market-alerts" className="flex flex-col space-y-1">
                      <span>Market Alerts</span>
                      <span className="text-sm text-muted-foreground">Notifications about market changes and opportunities</span>
                    </Label>
                    <Switch
                      id="market-alerts"
                      checked={marketAlerts}
                      onCheckedChange={setMarketAlerts}
                    />
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end px-6 pb-6">
                <Button 
                  onClick={handleSaveNotifications}
                  className={cn(
                    theme === "light" ? "bg-primary text-white hover:bg-primary/90" : "bg-otc-primary text-black hover:bg-otc-primary/90"
                  )}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </Card>

            <Card className="bg-otc-card border-otc-active">
              <CardHeader>
                <CardTitle>Telegram Settings</CardTitle>
                <CardDescription>Configure your Telegram notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-otc-active/50 rounded-lg flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-otc-icon-bg flex items-center justify-center">
                    <Bell className="h-5 w-5 text-otc-icon" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Telegram Account Connected</p>
                    <p className="text-muted-foreground text-sm">{profile?.telegram_id ? `@${profile.telegram_id}` : "Not connected"}</p>
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 border-otc-active hover:bg-otc-active text-white"
                        asChild
                      >
                        <a href="/telegram">Manage Telegram Connection</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <PasswordChange />
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card className={cn(
              theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
            )}>
              <CardHeader>
                <CardTitle className={theme === "light" ? "text-gray-900" : "text-white"}>Language & Region</CardTitle>
                <CardDescription>Customize your language and regional preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language" className={theme === "light" ? "text-gray-800" : ""}>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className={cn(
                      theme === "light" ? "bg-white border-gray-200 text-gray-800" : "bg-otc-active border-otc-active text-white"
                    )}>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className={cn(
                      theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
                    )}>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ru">Russian</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone" className={theme === "light" ? "text-gray-800" : ""}>Timezone</Label>
                  <Select defaultValue="utc+3">
                    <SelectTrigger id="timezone" className={cn(
                      theme === "light" ? "bg-white border-gray-200 text-gray-800" : "bg-otc-active border-otc-active text-white"
                    )}>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className={cn(
                      theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
                    )}>
                      <SelectItem value="utc-8">UTC-8 (Pacific Time)</SelectItem>
                      <SelectItem value="utc-5">UTC-5 (Eastern Time)</SelectItem>
                      <SelectItem value="utc+0">UTC+0 (London)</SelectItem>
                      <SelectItem value="utc+1">UTC+1 (Central European Time)</SelectItem>
                      <SelectItem value="utc+3">UTC+3 (Moscow)</SelectItem>
                      <SelectItem value="utc+8">UTC+8 (Beijing, Hong Kong)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <div className="flex justify-end px-6 pb-6">
                <Button className={cn(
                  theme === "light" ? "bg-primary text-white hover:bg-primary/90" : "bg-otc-primary text-black hover:bg-otc-primary/90"
                )}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
