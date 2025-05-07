import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { AlertCircleIcon } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validate form
    if (!email || !password) {
      setError("Email и пароль обязательны");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password);

      if (result.error) {
        setError(result.error);
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
              {t('login')}
            </CardTitle>
            <CardDescription className={`text-center ${
                theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'
            }`}>
              Введите свои данные для доступа к аккаунту OTC Desk
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
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="Введите ваш email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${
                        theme === 'dark'
                            ? 'bg-otc-active border-otc-active text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                    }`}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Пароль</Label>
                  <Link
                      to="/forgot-password"
                      className={`text-xs ${
                          theme === 'dark' ? 'text-otc-primary' : 'text-blue-600'
                      } hover:underline`}
                  >
                    Забыли пароль?
                  </Link>
                </div>
                <Input
                    id="password"
                    type="password"
                    placeholder="Введите ваш пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {isSubmitting ? "Вход..." : t('login')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className={`text-sm ${
                theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
            }`}>
              Нет аккаунта?{" "}
              <Link
                  to="/register"
                  className={`${
                      theme === 'dark' ? 'text-otc-primary' : 'text-blue-600'
                  } hover:underline`}
              >
                {t('register')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
  );
}