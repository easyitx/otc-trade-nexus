
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { useState } from "react";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(true);

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        
        <Card className="bg-otc-card border-otc-active">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
