
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Label } from "../components/ui/label";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Skeleton } from "../components/ui/skeleton";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { currentUser, profile, isLoading } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  if (!currentUser) return null;

  return (
      <>
        <div className="space-y-6">
          <h1 className={cn(
              "text-2xl font-bold",
              theme === "light" ? "text-gray-900" : "text-white"
          )}>
            {t('profile')}
          </h1>

          <Card className={cn(
              "border",
              theme === "light" ? "bg-white border-gray-200" : "bg-otc-card border-otc-active"
          )}>
            <CardHeader>
              <CardTitle className={theme === "light" ? "text-gray-900" : "text-white"}>
                {t('personalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className={theme === "light" ? "text-gray-600" : "text-muted-foreground"}>
                  {t('fullName')}
                </Label>
                {isLoading ? (
                    <Skeleton className="h-6 w-48" />
                ) : (
                    <p className={theme === "light" ? "text-gray-900" : "text-white"}>
                      {profile?.full_name || t('notSet')}
                    </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className={theme === "light" ? "text-gray-600" : "text-muted-foreground"}>
                  {t('company')}
                </Label>
                {isLoading ? (
                    <Skeleton className="h-6 w-40" />
                ) : (
                    <p className={theme === "light" ? "text-gray-900" : "text-white"}>
                      {profile?.company || t('notSet')}
                    </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className={theme === "light" ? "text-gray-600" : "text-muted-foreground"}>
                  {t('email')}
                </Label>
                <p className={theme === "light" ? "text-gray-900" : "text-white"}>
                  {currentUser.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label className={theme === "light" ? "text-gray-600" : "text-muted-foreground"}>
                  {t('memberSince')}
                </Label>
                {isLoading ? (
                    <Skeleton className="h-6 w-36" />
                ) : (
                    <p className={theme === "light" ? "text-gray-900" : "text-white"}>
                      {profile?.created_at ? formatDistanceToNow(new Date(profile.created_at), {
                        addSuffix: true,
                        locale: language === 'ru' ? ru : undefined
                      }) : t('notAvailable')}
                    </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className={theme === "light" ? "text-gray-600" : "text-muted-foreground"}>
                  Telegram ID
                </Label>
                {isLoading ? (
                    <Skeleton className="h-6 w-32" />
                ) : (
                    <p className={theme === "light" ? "text-gray-900" : "text-white"}>
                      {profile?.telegram_id || t('notConnected')}
                    </p>
                )}
              </div>

              <div className="pt-4">
                <Button
                    variant="outline"
                    className={cn(
                        "w-full",
                        theme === "light"
                            ? "border-gray-300 hover:bg-gray-100 text-gray-700"
                            : "border-otc-active hover:bg-otc-active/30 text-white"
                    )}
                    asChild
                >
                  <Link to="/settings">{t('editProfile')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
  );
}