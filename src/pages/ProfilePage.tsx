
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Label } from "../components/ui/label";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { currentUser, profile } = useAuth();
  const { t } = useLanguage();

  if (!currentUser) return null;

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">{t('profile')}</h1>
        
        <Card className="bg-otc-card border-otc-active">
          <CardHeader>
            <CardTitle>{t('personalInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t('fullName')}</Label>
              <p className="text-white">{profile?.full_name || t('notSet')}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t('company')}</Label>
              <p className="text-white">{profile?.company || t('notSet')}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t('email')}</Label>
              <p className="text-white">{currentUser.email}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t('memberSince')}</Label>
              <p className="text-white">
                {profile?.created_at ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true }) : t('notAvailable')}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Telegram ID</Label>
              <p className="text-white">{profile?.telegram_id || t('notConnected')}</p>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/settings">{t('editProfile')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
