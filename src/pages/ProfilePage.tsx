
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { Label } from "../components/ui/label";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { currentUser } = useAuth();

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
              <p className="text-white">{currentUser.fullName}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Company</Label>
              <p className="text-white">{currentUser.company}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-white">{currentUser.email}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Member Since</Label>
              <p className="text-white">
                {formatDistanceToNow(new Date(currentUser.registrationDate), { addSuffix: true })}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Verification Status</Label>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${currentUser.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-white">{currentUser.isVerified ? 'Verified' : 'Pending Verification'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
