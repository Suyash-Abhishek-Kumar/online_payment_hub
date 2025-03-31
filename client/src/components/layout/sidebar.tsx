import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  CreditCard, 
  Home, 
  LogOut, 
  QrCode, 
  User, 
  Wallet
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { logout } = useAuth();
  const [, navigate] = useLocation();
  
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  
  return (
    <aside className="hidden md:block w-64 bg-white shadow h-screen sticky top-0 overflow-y-auto">
      <nav className="mt-8 px-4 space-y-1">
        <Button 
          variant={activeTab === "dashboard" ? "default" : "ghost"} 
          className={cn(
            "w-full justify-start",
            activeTab === "dashboard" ? "bg-primary text-white" : "text-gray-700"
          )}
          onClick={() => onTabChange("dashboard")}
        >
          <Home className="mr-3 h-5 w-5" />
          <span>Dashboard</span>
        </Button>
        
        <Button 
          variant={activeTab === "payments" ? "default" : "ghost"} 
          className={cn(
            "w-full justify-start",
            activeTab === "payments" ? "bg-primary text-white" : "text-gray-700"
          )}
          onClick={() => onTabChange("payments")}
        >
          <CreditCard className="mr-3 h-5 w-5" />
          <span>Payments</span>
        </Button>
        
        <Button 
          variant={activeTab === "cards" ? "default" : "ghost"} 
          className={cn(
            "w-full justify-start",
            activeTab === "cards" ? "bg-primary text-white" : "text-gray-700"
          )}
          onClick={() => onTabChange("cards")}
        >
          <Wallet className="mr-3 h-5 w-5" />
          <span>Cards</span>
        </Button>
        
        <Button 
          variant={activeTab === "qr" ? "default" : "ghost"} 
          className={cn(
            "w-full justify-start",
            activeTab === "qr" ? "bg-primary text-white" : "text-gray-700"
          )}
          onClick={() => onTabChange("qr")}
        >
          <QrCode className="mr-3 h-5 w-5" />
          <span>QR Payments</span>
        </Button>
        
        <Button 
          variant={activeTab === "profile" ? "default" : "ghost"} 
          className={cn(
            "w-full justify-start",
            activeTab === "profile" ? "bg-primary text-white" : "text-gray-700"
          )}
          onClick={() => onTabChange("profile")}
        >
          <User className="mr-3 h-5 w-5" />
          <span>Profile</span>
        </Button>
      </nav>
      
      <div className="px-4 mt-auto border-t border-gray-200 pt-4 pb-4 absolute bottom-0 w-full bg-white">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>Sign out</span>
        </Button>
      </div>
    </aside>
  );
}
