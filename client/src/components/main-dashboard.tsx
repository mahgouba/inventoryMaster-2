import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
import HorizontalNavigation from "@/components/horizontal-navigation";
import SystemGlassWrapper from "@/components/system-glass-wrapper";

const InventoryPage = lazy(() => import("@/pages/inventory"));
const QuotationCreationPage = lazy(() => import("@/pages/quotation-creation"));
const QuotationManagementPage = lazy(() => import("@/pages/quotation-management"));
const InvoiceManagementPage = lazy(() => import("@/pages/invoice-management"));
const ReservationsPage = lazy(() => import("@/pages/reservations"));
const SoldVehiclesPage = lazy(() => import("@/pages/sold-vehicles"));
const FinancingCalculatorPage = lazy(() => import("@/pages/financing-calculator"));
const FinancingRatesPage = lazy(() => import("@/pages/financing-rates"));
const LeaveRequestsPage = lazy(() => import("@/pages/leave-requests"));
const AttendanceManagementPage = lazy(() => import("@/pages/attendance-management"));
const UserManagementPage = lazy(() => import("@/pages/user-management"));
const BankManagement = lazy(() => import("@/pages/bank-management"));
const DatabaseManagement = lazy(() => import("@/pages/database-management"));
const PriceCardsPage = lazy(() => import("@/pages/price-cards"));
const SpecificationsManagement = lazy(() => import("@/pages/specifications-management"));
const DropdownOptionsManagement = lazy(() => import("@/pages/dropdown-options-management"));
const BasicDropdownManagement = lazy(() => import("@/pages/basic-dropdown-management"));
const WebsiteManagementPage = lazy(() => import("@/pages/website-management"));

interface MainDashboardProps {
  user: {
    username: string;
    role: string;
    id: number;
  };
  onLogout: () => void;
}

export default function MainDashboard({ user, onLogout }: MainDashboardProps) {
  const [location] = useLocation();

  const renderPage = () => {
    switch (location) {
      case "/":
      case "/inventory":
        return <InventoryPage userRole={user.role} username={user.username} onLogout={onLogout} />;
      case "/quotation-creation":
        return <QuotationCreationPage />;
      case "/quotation-management":
        return <QuotationManagementPage />;
      case "/invoice-management":
        return <InvoiceManagementPage />;
      case "/reservations":
        return <ReservationsPage />;
      case "/sold-vehicles":
        return <SoldVehiclesPage />;
      case "/financing-calculator":
        return <FinancingCalculatorPage />;
      case "/financing-rates":
        return (user.role === "admin" || user.role === "accountant" || user.role === "bank_accountant")
          ? <FinancingRatesPage /> : null;
      case "/leave-requests":
        return <LeaveRequestsPage userRole={user.role} username={user.username} userId={user.id} />;
      case "/attendance-management":
        return <AttendanceManagementPage userRole={user.role} username={user.username} userId={user.id} />;
      case "/user-management":
        return user.role === "admin" ? <UserManagementPage /> : null;
      case "/bank-management":
      case "/bank-management-full":
        return (user.role === "admin" || user.role === "accountant" || user.role === "bank_accountant")
          ? <BankManagement /> : null;
      case "/database-management":
        return user.role === "admin" ? <DatabaseManagement /> : null;
      case "/specifications-management":
        return user.role === "admin" ? <SpecificationsManagement /> : null;
      case "/dropdown-options-management":
        return user.role === "admin" ? <DropdownOptionsManagement /> : null;
      case "/basic-dropdown-management":
        return user.role === "admin" ? <BasicDropdownManagement /> : null;
      case "/website-management":
        return user.role === "admin" ? <WebsiteManagementPage /> : null;

      case "/price-cards":
        return <PriceCardsPage />;
      default:
        return <InventoryPage userRole={user.role} username={user.username} onLogout={onLogout} />;
    }
  };

  return (
    <SystemGlassWrapper>
      <div className="min-h-screen" dir="rtl">
        <HorizontalNavigation userRole={user.role} onLogout={onLogout} />
        <div className="relative z-10 sm:pt-16 pt-[5px] pb-[5px] pr-16">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#111111", borderTopColor: "transparent" }} />
            </div>
          }>
            {renderPage()}
          </Suspense>
        </div>
      </div>
    </SystemGlassWrapper>
  );
}
