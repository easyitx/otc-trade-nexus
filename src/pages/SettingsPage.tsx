
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { EnhancedTabsList, EnhancedTabsTrigger } from "../components/ui/enhanced-tabs";
import { Separator } from "../components/ui/separator";
import { Lock, Settings, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { PasswordChange } from "../components/auth/PasswordChange";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { isAuthenticated, profile } = useAuth();
  const { userRoles, isLoadingRoles } = usePlatformSettings();
  const { theme } = useTheme();

  const isManager = userRoles?.isManager || userRoles?.isAdmin;

  if (!isAuthenticated) {
    return (
        <>
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
        </>
    );
  }

  return (
      <>
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
              <EnhancedTabsTrigger value="security" icon={<Lock className="h-4 w-4" />}>
                Security
              </EnhancedTabsTrigger>
            </EnhancedTabsList>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <PasswordChange />

              {/* Telegram Settings Card */}
              <Card className={cn(
                  theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
              )}>
                <CardHeader>
                  <CardTitle className={theme === "light" ? "text-gray-900" : "text-white"}>Telegram Settings</CardTitle>
                  <CardDescription>Configure your Telegram notification settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={cn(
                      "p-4 rounded-lg flex items-start space-x-3",
                      theme === "light" ? "bg-gray-50" : "bg-otc-active/50"
                  )}>
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
                      )}>Telegram Account Connected</p>
                      <p className={cn(
                          "text-sm",
                          theme === "light" ? "text-gray-600" : "text-muted-foreground"
                      )}>{profile?.telegram_id ? `@${profile.telegram_id}` : "Not connected"}</p>
                      <div className="mt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-8",
                                theme === "light"
                                    ? "border-gray-300 hover:bg-gray-100 text-gray-700"
                                    : "border-otc-active hover:bg-otc-active/30 text-white"
                            )}
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
          </Tabs>
        </div>
      </>
  );
}