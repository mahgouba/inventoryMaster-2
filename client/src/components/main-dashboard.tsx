import { useState } from "react";
import { useLocation } from "wouter";
import HorizontalNavigation from "@/components/horizontal-navigation";
import InventoryPage from "@/pages/inventory";
import QuotationCreationPage from "@/pages/quotation-creation";
import InvoiceManagementPage from "@/pages/invoice-management";
import ReservationsPage from "@/pages/reservations";
import SoldVehiclesPage from "@/pages/sold-vehicles";
import FinancingCalculatorPage from "@/pages/financing-calculator";
import LeaveRequestsPage from "@/pages/leave-requests";
import LocationPage from "@/pages/locations";
import PdfAppearanceManagement from "@/pages/pdf-appearance-management";
import ManufacturerLogosPage from "@/pages/manufacturer-logos";
import UserManagementPage from "@/pages/user-management-simple";
import BankManagement from "@/pages/bank-management";
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
      case "/locations":
        return <LocationPage userRole={user.role} onLogout={onLogout} />;
      case "/pdf-appearance":
        return user.role === "admin" ? <PdfAppearanceManagement userRole={user.role} onLogout={onLogout} /> : null;
      case "/manufacturer-logos":
        return user.role === "admin" ? <ManufacturerLogosPage userRole={user.role} onLogout={onLogout} /> : null;
      case "/user-management":
        return user.role === "admin" ? <UserManagementPage /> : null;
      case "/bank-management":
        return user.role === "admin" ? <BankManagement /> : null;
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
          
          {/* Animated Mesh Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-teal-500 to-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            <div className="absolute bottom-10 right-20 w-72 h-72 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
          </div>

          <div className="relative z-10" dir="rtl">
            {/* Fixed Navigation */}
            <HorizontalNavigation userRole={user.role} />

            {/* Page Content with top padding for fixed navbar */}
            <div className="relative z-10 sm:pt-16 pt-[5px] pb-[5px]">
              {renderPage()}
            </div>
          </div>
        </div>
      </div>
    </SystemGlassWrapper>
  );
}