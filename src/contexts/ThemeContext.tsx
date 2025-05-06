
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  defaultTheme?: Theme;
  children: ReactNode;
}

export function ThemeProvider({
  defaultTheme = "light",
  children,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Проверяем, сохранена ли тема в localStorage
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    // Если есть сохраненная тема, используем её, иначе defaultTheme
    return savedTheme || defaultTheme;
  });

  useEffect(() => {
    // Сохраняем тему в localStorage при её изменении
    localStorage.setItem("theme", theme);
    
    // Обновляем класс документа для переключения темы
    const root = window.document.documentElement;
    
    // Удаляем все классы темы
    root.classList.remove("light", "dark");
    
    // Добавляем класс текущей темы
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}
