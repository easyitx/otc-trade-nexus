
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { AlertCircleIcon } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: ""
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validate form
    if (!formData.fullName || !formData.company || !formData.email || !formData.password) {
      setError("Все поля обязательны, кроме кода приглашения");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают");
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        company: formData.company,
        referralCode: formData.referralCode || undefined
      });

      if (success) {
        // Successfully registered and logged in, navigate to dashboard
        navigate('/');
      } else {
        setError("Регистрация не удалась. Пожалуйста, попробуйте еще раз.");
      }
    } catch (err) {
      setError("Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-otc-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-otc-card border-otc-active">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">Создать аккаунт</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Введите информацию для создания аккаунта OTC Desk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-900 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircleIcon className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="fullName">ФИО</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Введите ваше полное имя"
                value={formData.fullName}
                onChange={handleChange}
                className="bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Название компании</Label>
              <Input
                id="company"
                name="company"
                placeholder="Введите название вашей компании"
                value={formData.company}
                onChange={handleChange}
                className="bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Введите ваш email"
                value={formData.email}
                onChange={handleChange}
                className="bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Создайте пароль"
                value={formData.password}
                onChange={handleChange}
                className="bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Подтвердите ваш пароль"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="referralCode">Код приглашения (опционально)</Label>
              <Input
                id="referralCode"
                name="referralCode"
                placeholder="Введите код приглашения, если он у вас есть"
                value={formData.referralCode}
                onChange={handleChange}
                className="bg-otc-active border-otc-active text-white"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-otc-primary text-black hover:bg-otc-primary/90" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Регистрация..." : t('register')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-muted-foreground text-sm">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-otc-primary hover:underline">
              {t('login')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
