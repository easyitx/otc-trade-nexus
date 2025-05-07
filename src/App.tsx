import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {AuthProvider} from "./contexts/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ConnectTelegramPage from "./pages/ConnectTelegramPage";
import RateManagementPage from "./pages/admin/RateManagementPage";
import NotFound from "./pages/NotFound";
import {LanguageProvider} from "./contexts/LanguageContext";
import {ThemeProvider} from "./contexts/ThemeContext";
import {MainLayout} from "@/components/layout/MainLayout.tsx";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster/>
              <Sonner/>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage/>}/>
                  <Route path="/register" element={<RegisterPage/>}/>

                  <Route path="*" element={<MainLayout />}>
                    <Route path="" element={<DashboardPage/>}/>
                    <Route path="orders" element={<OrdersPage/>}/>
                    <Route path="orders/:id" element={<OrderDetailPage/>}/>
                    <Route path="create-order" element={<CreateOrderPage/>}/>
                    <Route path="deals" element={<ChatPage/>}/>
                    <Route path="profile" element={<ProfilePage/>}/>
                    <Route path="settings" element={<SettingsPage/>}/>
                    {/*<Route path="telegram" element={<ConnectTelegramPage />} />*/}
                    <Route path="admin/rate-management" element={<RateManagementPage/>}/>
                    <Route path="*" element={<NotFound/>}/>
                  </Route>
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
);

export default App;