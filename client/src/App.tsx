import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/useTheme";
import { ThemeStyles } from "@/components/theme-styles";
import SystemGlassWrapper from "@/components/system-glass-wrapper";
import UniversalGlass from "@/components/universal-glass";
// import SidebarNavigation from "@/components/sidebar-navigation";
import MainDashboard from "@/components/main-dashboard";
import CardViewPage from "@/pages/card-view";
import PriceCardsManagementPage from "@/pages/price-cards-management";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";
import QuotationEditPage from "@/pages/quotation-edit";
import PersonalBanks from "@/pages/banks-personal";
import CompanyBanks from "@/pages/banks-company";
import IOSPickerDemo from "@/pages/ios-picker-demo";
import VerticalPickerShowcase from "@/pages/vertical-picker-showcase";

interface User {
  username: string;
  role: string;
  id: number;
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  // This component loads and applies theme settings
  useTheme();
  return (
    <>
      <ThemeStyles themeStyle="glass" darkMode={false} />
      {children}
    </>
  );
}

function Router({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [location] = useLocation();
  
  // Pages that should not show sidebar (bank pages and card view)
  const pagesWithoutSidebar = [
    '/banks-personal', 
    '/banks-company', 
    '/card-view', 
    '/cards'
  ];
  
  const shouldShowSidebar = !pagesWithoutSidebar.includes(location);

  return (
    <div className="min-h-screen">
      <SystemGlassWrapper>
        <Switch>
          {/* Main Dashboard Route - handles all internal pages */}
          <Route path="/" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/inventory" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/quotation-creation" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/quotation-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/invoice-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/reservations" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/sold-vehicles" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/financing-calculator" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/financing-rates" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/leave-requests" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/theme-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/database-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/cars-migration" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/car-data-import" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/locations" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          
          {/* Admin Routes through Main Dashboard */}
          {user.role === "admin" && (
            <>
              <Route path="/pdf-appearance" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
              <Route path="/list-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
              <Route path="/options-list-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
              <Route path="/manufacturer-logos" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
              <Route path="/user-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
              <Route path="/bank-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
              <Route path="/database-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
              <Route path="/bank-management-full" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
            </>
          )}

          {/* External Pages - separate routes */}
          <Route path="/cards" component={() => <CardViewPage userRole={user.role} username={user.username} onLogout={onLogout} />} />
          <Route path="/card-view" component={() => <CardViewPage userRole={user.role} username={user.username} onLogout={onLogout} />} />
          <Route path="/price-cards" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/banks-personal" component={PersonalBanks} />
          <Route path="/banks-company" component={CompanyBanks} />
          
          {/* Demo Pages */}
          <Route path="/ios-picker-demo" component={IOSPickerDemo} />
          <Route path="/vertical-picker-showcase" component={VerticalPickerShowcase} />
          
          {/* Special Routes */}
          <Route path="/quotation-edit/:id" component={QuotationEditPage} />
          
          <Route component={NotFound} />
        </Switch>
      </SystemGlassWrapper>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setUser(authData);
      } catch (error) {
        localStorage.removeItem("auth");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UniversalGlass />
        <TooltipProvider>
          <div dir="rtl" className="font-arabic">
            <Toaster />
            {!user ? (
              <LoginPage onLogin={handleLogin} />
            ) : (
              <Router user={user} onLogout={handleLogout} />
            )}
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
