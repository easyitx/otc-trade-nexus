import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { AlertCircleIcon } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
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
      <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${
          theme === 'dark' ? 'bg-otc-background' : 'bg-gray-50'
      }`}>
        <Card className={`w-full max-w-md ${
            theme === 'dark'
                ? 'bg-otc-card border-otc-active text-white'
                : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Создать аккаунт
            </CardTitle>
            <CardDescription className={`text-center ${
                theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'
            }`}>
              Введите информацию для создания аккаунта OTC Desk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                  <div className={`${
                      theme === 'dark'
                          ? 'bg-red-900/20 border-red-900 text-red-400'
                          : 'bg-red-50 border-red-200 text-red-600'
                  } border px-4 py-2 rounded-lg flex items-center gap-2 text-sm`}>
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
                    className={`${
                        theme === 'dark'
                            ? 'bg-otc-active border-otc-active text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                    }`}
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
                    className={`${
                        theme === 'dark'
                            ? 'bg-otc-active border-otc-active text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                    }`}
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
                    className={`${
                        theme === 'dark'
                            ? 'bg-otc-active border-otc-active text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                    }`}
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
                    className={`${
                        theme === 'dark'
                            ? 'bg-otc-active border-otc-active text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                    }`}
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
                    className={`${
                        theme === 'dark'
                            ? 'bg-otc-active border-otc-active text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                    }`}
                />
              </div>

              <Button
                  type="submit"
                  className={`w-full ${
                      theme === 'dark'
                          ? 'bg-otc-primary text-black hover:bg-otc-primary/90'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={isSubmitting}
              >
                {isSubmitting ? "Регистрация..." : t('register')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className={`text-sm ${
                theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
            }`}>
              Уже есть аккаунт?{" "}
              <Link
                  to="/login"
                  className={`${
                      theme === 'dark' ? 'text-otc-primary' : 'text-blue-600'
                  } hover:underline`}
              >
                {t('login')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
  );
}