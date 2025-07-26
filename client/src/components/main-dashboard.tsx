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
import { Button } from "@/components/ui/button";
import { LogOut, Sun, Moon, UserCircle } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

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
  const { darkMode, toggleDarkMode, isUpdatingDarkMode } = useTheme();

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
            {/* Enhanced Header */}
            <div className="glass-container border-b border-white/20 dark:border-slate-700/30">
              <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
                <div className="flex justify-between items-center h-16 sm:h-20">
                  
                  {/* Horizontal Navigation */}
                  <div className="flex-1">
                    <HorizontalNavigation userRole={user.role} />
                  </div>

                  {/* User Controls */}
                  <div className="flex items-center space-x-2 space-x-reverse mr-4">
                    {/* Dark Mode Toggle */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="glass-button glass-text-primary p-2" 
                      onClick={toggleDarkMode}
                      disabled={isUpdatingDarkMode}
                    >
                      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </Button>

                    {/* User Dropdown Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="glass-button glass-text-primary p-2">
                          <UserCircle size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-dropdown-content w-48">
                        <DropdownMenuItem className="text-sm text-slate-500 cursor-default">
                          <UserCircle className="mr-2 h-4 w-4" />
                          المستخدم: {user.role === "admin" ? "أدمن" : "مستخدم"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 hover:bg-red-50 cursor-pointer"
                          onClick={onLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          تسجيل الخروج
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Content with top padding for fixed navbar */}
            <div className="relative z-10 pt-16 sm:pt-20">
              {renderPage()}
            </div>
          </div>
        </div>
      </div>
    </SystemGlassWrapper>
  );
}