import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { QrDisplay } from "@/components/qr/qr-display";
import { QrScanner } from "@/components/qr/qr-scanner";
import { QrTransactions } from "@/components/qr/qr-transactions";
import { Loader2 } from "lucide-react";

export default function QR() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("qr");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // If user is not authenticated and finished loading, redirect to login
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMobileMenuToggle={toggleMobileMenu} />
      
      <MobileMenu 
        isOpen={mobileMenuOpen}
        onClose={toggleMobileMenu}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">QR Payments</h1>
              <p className="text-gray-600 mt-1">Make contactless payments using QR codes</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Your QR Code */}
              <QrDisplay />
              
              {/* Scan QR Code */}
              <QrScanner />
            </div>
            
            {/* Recent QR Transactions */}
            <QrTransactions />
          </div>
        </main>
      </div>
    </div>
  );
}
