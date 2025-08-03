import { useState } from "react";
import { useLocation } from "wouter";
import HorizontalNavigation from "@/components/horizontal-navigation";
import InventoryPage from "@/pages/inventory";
import QuotationCreationPage from "@/pages/quotation-creation";
import QuotationManagementPage from "@/pages/quotation-management";
import InvoiceManagementPage from "@/pages/invoice-management";
import ReservationsPage from "@/pages/reservations";
import SoldVehiclesPage from "@/pages/sold-vehicles";
import FinancingCalculatorPage from "@/pages/financing-calculator";
import LeaveRequestsPage from "@/pages/leave-requests";

import ManufacturerLogosPage from "@/pages/manufacturer-logos";
import UserManagementPage from "@/pages/user-management";
import BankManagement from "@/pages/bank-management";
// Removed bank-management-full as it was consolidated into bank-management

import FinancingRatesPage from "@/pages/financing-rates";
import ThemeManagementPage from "@/pages/theme-management";
import DatabaseManagement from "@/pages/database-management";
import CarsMigrationPage from "@/pages/cars-migration";
import DropdownOptionsManagement from "@/pages/DropdownOptionsManagement";
import HierarchicalView from "@/pages/HierarchicalView";

import PriceCardsManagementPage from "@/pages/price-cards-management";
import SystemGlassWrapper from "@/components/system-glass-wrapper";


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

  // Render the appropriate page based on current location
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
      case "/leave-requests":
        return <LeaveRequestsPage userRole={user.role} username={user.username} userId={user.id} />;

      case "/manufacturer-logos":
        return user.role === "admin" ? <ManufacturerLogosPage userRole={user.role} onLogout={onLogout} /> : null;

      case "/user-management":
        return user.role === "admin" ? <UserManagementPage /> : null;
      case "/bank-management":
        return user.role === "admin" ? <BankManagement /> : null;
      case "/bank-management-full":
        return user.role === "admin" ? <BankManagement /> : null;
      case "/financing-rates":
        return user.role === "admin" ? <FinancingRatesPage /> : null;
      case "/theme-management":
        return user.role === "admin" ? <ThemeManagementPage /> : null;
      case "/database-management":
        return user.role === "admin" ? <DatabaseManagement /> : null;
      case "/cars-migration":
        return user.role === "admin" ? <CarsMigrationPage /> : null;
      case "/dropdown-options":
        return user.role === "admin" ? <DropdownOptionsManagement /> : null;
      case "/hierarchy":
        return user.role === "admin" ? <HierarchicalView /> : null;

      case "/price-cards":
        return <PriceCardsManagementPage userRole={user.role} username={user.username} onLogout={onLogout} />;
      default:
        return <InventoryPage userRole={user.role} username={user.username} onLogout={onLogout} />;
    }
  };

  return (
    <SystemGlassWrapper>
      <div className="min-h-screen">
        {/* Header with Navigation and User Controls */}
        <div className="relative">
          {/* Company Logo Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <img 
              src="/copmany logo.svg" 
              alt="شعار البريمي للسيارات" 
              className="w-96 h-96 object-contain"
            />
          </div>
          
          {/* Background Animation Removed */}

          <div className="relative z-10" dir="rtl">
            {/* Fixed Navigation */}
            <HorizontalNavigation userRole={user.role} onLogout={onLogout} />

            {/* Page Content with padding for navigation bar */}
            <div className="relative z-10 sm:pt-16 pt-[5px] pb-[5px] pr-16">
              {renderPage()}
            </div>
          </div>
        </div>
      </div>
    </SystemGlassWrapper>
  );
}