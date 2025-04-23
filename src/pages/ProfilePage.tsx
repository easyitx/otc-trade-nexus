
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { Label } from "../components/ui/label";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { currentUser, profile } = useAuth();

  if (!currentUser) return null;

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        
        <Card className="bg-otc-card border-otc-active">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Full Name</Label>
              <p className="text-white">{profile?.full_name || 'Not set'}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Company</Label>
              <p className="text-white">{profile?.company || 'Not set'}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-white">{currentUser.email}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Member Since</Label>
              <p className="text-white">
                {profile?.created_at ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true }) : 'Not available'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Telegram ID</Label>
              <p className="text-white">{profile?.telegram_id || 'Not connected'}</p>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/settings">Edit Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
