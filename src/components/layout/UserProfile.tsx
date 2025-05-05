
import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { useLanguage } from '@/contexts/LanguageContext';

export function UserProfile() {
  const { currentUser, logout, profile: authProfile } = useAuth();
  const { profile: queryProfile, loading } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Use profile from auth context if available (fast path), otherwise use profile from query (with loading state)
  const profile = authProfile || queryProfile;
  const isLoading = !profile && loading;

  const handleLogout = () => {
    logout();
    toast({
      title: t('loggedOut'),
      description: t('loggedOutSuccess'),
    });
    navigate('/login');
  };

  // Получаем инициалы пользователя
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!currentUser) {
    return (
      <div className="flex space-x-2">
        <Button variant="ghost" asChild>
          <Link to="/login">{t('login')}</Link>
        </Button>
        <Button className="bg-otc-primary text-black" asChild>
          <Link to="/register">{t('register')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 hover:bg-otc-active">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-16 hidden sm:inline-block" />
            </>
          ) : (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                <AvatarFallback className="bg-otc-icon-bg text-otc-icon">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline-block">
                {profile?.full_name ? profile.full_name.split(' ')[0] : t('user')}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 bg-otc-card border-otc-active">
        <div className="p-2">
          <div className="px-4 py-3 border-b border-otc-active mb-1">
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <p className="text-sm font-medium">{profile?.full_name || t('user')}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </>
            )}
          </div>
          <Link to="/profile" className="block px-4 py-2 text-sm rounded-md hover:bg-otc-active">
            {t('profile')}
          </Link>
          <Link to="/settings" className="block px-4 py-2 text-sm rounded-md hover:bg-otc-active">
            {t('settings')}
          </Link>
          <Link to="/telegram" className="block px-4 py-2 text-sm rounded-md hover:bg-otc-active">
            {t('connectTelegram')}
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm rounded-md hover:bg-otc-active text-red-400"
          >
            {t('logout')}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
