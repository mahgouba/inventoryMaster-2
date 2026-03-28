import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SystemGlassWrapper from "@/components/system-glass-wrapper";
import MainDashboard from "@/components/main-dashboard";
import CardViewPage from "@/pages/card-view";
import VehicleDetailPage from "@/pages/vehicle-detail";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";
import QuotationEditPage from "@/pages/quotation-edit";
import PersonalBanks from "@/pages/banks-personal";
import CompanyBanks from "@/pages/banks-company";
import ShowroomPage from "@/pages/showroom";

interface User {
  username: string;
  role: string;
  id: number;
}

function Router({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <div className="min-h-screen">
      <SystemGlassWrapper>
        <Switch>
          <Route path="/" component={() => {
            if (user.role === "accountant" || user.role === "bank_accountant") {
              return <MainDashboard user={user} onLogout={onLogout} />;
            }
            return <CardViewPage userRole={user.role} username={user.username} onLogout={onLogout} />;
          }} />

          <Route path="/inventory" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/quotation-creation" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/quotation-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/invoice-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/reservations" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/sold-vehicles" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/financing-calculator" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/financing-rates" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/leave-requests" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/attendance-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/database-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/basic-dropdown-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/voip" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/whatsapp-api" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/email-bulk" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/locations" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
          <Route path="/price-cards" component={() => <MainDashboard user={user} onLogout={onLogout} />} />

          {(user.role === "admin" || user.role === "inventory_manager" || user.role === "sales_director") && (
            <>
              <Route path="/pdf-appearance" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
              <Route path="/user-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
              <Route path="/bank-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
              <Route path="/bank-management-full" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
              <Route path="/specifications-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
              <Route path="/dropdown-options-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
              <Route path="/website-management" component={() => <MainDashboard user={user} onLogout={onLogout} />} />
            </>
          )}

          <Route path="/cards" component={() => <CardViewPage userRole={user.role} username={user.username} onLogout={onLogout} />} />
          <Route path="/card-view" component={() => <CardViewPage userRole={user.role} username={user.username} onLogout={onLogout} />} />
          <Route path="/banks-personal" component={PersonalBanks} />
          <Route path="/banks-company" component={CompanyBanks} />
          <Route path="/quotation-edit/:id" component={QuotationEditPage} />
          <Route path="/vehicles/:id" component={() => <VehicleDetailPage userRole={user.role} username={user.username} onLogout={onLogout} />} />

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
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setUser(authData);
      } catch {
        localStorage.removeItem("auth");
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div dir="rtl" className="font-arabic">
          <Toaster />
          <PublicRouter onLogin={setUser} user={user} onLogout={() => { localStorage.removeItem("auth"); setUser(null); }} />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function PublicRouter({ onLogin, user, onLogout }: { onLogin: (user: User) => void; user: User | null; onLogout: () => void }) {
  const [location] = useLocation();

  const publicRoutes = ['/banks-personal', '/banks-company'];
  const isPublicShowroom = location === '/showroom' || location.startsWith('/showroom/');

  if (publicRoutes.includes(location) || isPublicShowroom) {
    return (
      <div className="min-h-screen">
        <SystemGlassWrapper>
          <Switch>
            <Route path="/banks-personal" component={PersonalBanks} />
            <Route path="/banks-company" component={CompanyBanks} />
            <Route path="/showroom" component={ShowroomPage} />
            <Route path="/showroom/:id" component={ShowroomPage} />
            <Route component={NotFound} />
          </Switch>
        </SystemGlassWrapper>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={onLogin} />;
  }

  return <Router user={user} onLogout={onLogout} />;
}

export default App;
