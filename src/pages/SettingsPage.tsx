
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { useState } from "react";
import { useToast } from "../hooks/use-toast";
import { Bell, Lock, Globe, User, Webhook, Save } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { TwoFactorSetup } from "../components/auth/TwoFactorSetup";
import { DisableTwoFactor } from "../components/auth/DisableTwoFactor";
import { PasswordChange } from "../components/auth/PasswordChange";

export default function SettingsPage() {
  const { isAuthenticated, profile } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [newDeals, setNewDeals] = useState(true);
  const [marketAlerts, setMarketAlerts] = useState(false);
  const [language, setLanguage] = useState("en");
  const { toast } = useToast();

  const handleSaveNotifications = () => {
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated.",
    });
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="bg-otc-card border-otc-active">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please log in to access settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-otc-primary text-black hover:bg-otc-primary/90">
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
        <h1 className="text-2xl font-bold text-white">Settings</h1>

        <Tabs defaultValue="security" className="space-y-4">
          <TabsList className="bg-otc-active">
            <TabsTrigger value="notifications" className="data-[state=active]:bg-otc-primary data-[state=active]:text-black">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-otc-primary data-[state=active]:text-black">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-otc-primary data-[state=active]:text-black">
              <User className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-otc-primary data-[state=active]:text-black">
              <Webhook className="h-4 w-4 mr-2" />
              API
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-otc-card border-otc-active">
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                    <span>Email Notifications</span>
                    <span className="text-sm text-muted-foreground">Receive updates about your orders via email</span>
                  </Label>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="telegram-notifications" className="flex flex-col space-y-1">
                    <span>Telegram Notifications</span>
                    <span className="text-sm text-muted-foreground">Receive updates about your orders via Telegram</span>
                  </Label>
                  <Switch
                    id="telegram-notifications"
                    checked={telegramNotifications}
                    onCheckedChange={setTelegramNotifications}
                  />
                </div>

                <Separator className="bg-otc-active" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Notification Types</h3>
                  
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
                  className="bg-otc-primary text-black hover:bg-otc-primary/90"
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

            <TwoFactorSetup />

            <DisableTwoFactor />
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card className="bg-otc-card border-otc-active">
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>Customize your language and regional preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="bg-otc-active border-otc-active text-white">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-otc-card border-otc-active">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ru">Russian</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc+3">
                    <SelectTrigger id="timezone" className="bg-otc-active border-otc-active text-white">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="bg-otc-card border-otc-active">
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
                <Button className="bg-otc-primary text-black hover:bg-otc-primary/90">
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-4">
            <Card className="bg-otc-card border-otc-active">
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>Manage your API keys for automated trading</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-otc-active/50 rounded-lg">
                  <p className="text-white font-medium mb-2">Your API Keys</p>
                  <p className="text-muted-foreground text-sm mb-2">
                    API access allows you to create automated trading systems and connect external platforms to your OTC Desk account.
                  </p>
                  <Button className="bg-otc-primary text-black hover:bg-otc-primary/90">
                    Generate New API Key
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>All API requests must be authenticated and encrypted.</p>
                  <p>For security purposes, API keys have limited permissions by default.</p>
                  <p>
                    <a href="#" className="text-otc-primary hover:underline">
                      View API Documentation
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
