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
import SidebarNavigation from "@/components/sidebar-navigation";
import InventoryPage from "@/pages/inventory";
import CardViewPage from "@/pages/card-view-new";
import FinancingCalculatorPage from "@/pages/financing-calculator";

import PdfAppearanceManagement from "@/pages/pdf-appearance-management";
import ManufacturerLogosPage from "@/pages/manufacturer-logos";
import LocationPage from "@/pages/locations";
import LoginPage from "@/pages/login";
import UserManagementPage from "@/pages/user-management-simple";
import NotFound from "@/pages/not-found";
import QuotationCreationPage from "@/pages/quotation-creation";

import QuotationEditPage from "@/pages/quotation-edit";
import QuotationManagementPage from "@/pages/quotation-management";
import InvoiceManagementPage from "@/pages/invoice-management";
import DynamicCompanyControl from "@/pages/dynamic-company-control";
import IntegrationManagementPage from "@/pages/integration-management";
import ComprehensiveListsPage from "@/pages/comprehensive-lists";
import ReservationsPage from "@/pages/reservations";
import SoldVehiclesPage from "@/pages/sold-vehicles";
import BankManagement from "@/pages/bank-management";
import PersonalBanks from "@/pages/personal-banks";
import CompanyBanks from "@/pages/company-banks";
import LeaveRequestsPage from "@/pages/leave-requests";

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
    '/card-view-new', 
    '/cards'
  ];
  
  const shouldShowSidebar = !pagesWithoutSidebar.includes(location);

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-x-hidden">
      {shouldShowSidebar && (
        <SidebarNavigation user={user} onLogout={onLogout} />
      )}
      
      <div className={cn(
        "min-h-screen transition-all duration-300",
        shouldShowSidebar ? "mr-64" : ""
      )}>
        <SystemGlassWrapper>
          <Switch>
            <Route path="/" component={() => <InventoryPage userRole={user.role} username={user.username} onLogout={onLogout} />} />
            <Route path="/inventory" component={() => <InventoryPage userRole={user.role} username={user.username} onLogout={onLogout} />} />
            <Route path="/cards" component={() => <CardViewPage userRole={user.role} username={user.username} onLogout={onLogout} />} />
            <Route path="/card-view" component={() => <CardViewPage userRole={user.role} username={user.username} onLogout={onLogout} />} />
            <Route path="/card-view-new" component={() => <CardViewPage userRole={user.role} username={user.username} onLogout={onLogout} />} />
            <Route path="/quotation-creation" component={() => <QuotationCreationPage />} />

            <Route path="/quotation-edit/:id" component={QuotationEditPage} />
            <Route path="/quotation-management" component={QuotationManagementPage} />
            <Route path="/invoice-management" component={InvoiceManagementPage} />
            <Route path="/locations" component={() => <LocationPage userRole={user.role} onLogout={onLogout} />} />
            <Route path="/reservations" component={() => <ReservationsPage />} />
            <Route path="/sold-vehicles" component={() => <SoldVehiclesPage />} />
            <Route path="/financing-calculator" component={FinancingCalculatorPage} />
            <Route path="/leave-requests" component={() => <LeaveRequestsPage userRole={user.role} username={user.username} userId={user.id} />} />
            
            {/* صفحات البنوك العامة */}
            <Route path="/banks-personal" component={PersonalBanks} />
            <Route path="/banks-company" component={CompanyBanks} />
            
            {/* صفحات الأدمن فقط */}
            {user.role === "admin" && (
              <>
                <Route path="/pdf-appearance" component={() => <PdfAppearanceManagement userRole={user.role} onLogout={onLogout} />} />
                <Route path="/manufacturer-logos" component={() => <ManufacturerLogosPage userRole={user.role} onLogout={onLogout} />} />
                <Route path="/user-management" component={() => <UserManagementPage />} />
                <Route path="/bank-management" component={BankManagement} />
                <Route path="/dynamic-company-control" component={() => <DynamicCompanyControl />} />
                <Route path="/integration-management" component={() => <IntegrationManagementPage />} />
                <Route path="/comprehensive-lists" component={ComprehensiveListsPage} />
              </>
            )}
            <Route component={NotFound} />
          </Switch>
        </SystemGlassWrapper>
      </div>
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
