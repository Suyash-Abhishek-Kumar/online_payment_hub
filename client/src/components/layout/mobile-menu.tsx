import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  CreditCard, 
  Home, 
  LogOut, 
  QrCode, 
  User, 
  Wallet, 
  X
} from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileMenu({ isOpen, onClose, activeTab, onTabChange }: MobileMenuProps) {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  
  const handleTabClick = (tab: string) => {
    onTabChange(tab);
    onClose();
  };
  
  return (
    <div className={cn(
      "md:hidden bg-white shadow-lg fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="flex justify-between items-center p-4 border-b">
        <Logo />
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6 text-gray-500" />
        </Button>
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" />
            <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          <Button 
            variant={activeTab === "dashboard" ? "default" : "ghost"} 
            className={cn(
              "w-full justify-start",
              activeTab === "dashboard" ? "bg-primary text-white" : "text-gray-800"
            )}
            onClick={() => handleTabClick("dashboard")}
          >
            <Home className="mr-3 h-5 w-5" />
            <span>Dashboard</span>
          </Button>
          
          <Button 
            variant={activeTab === "payments" ? "default" : "ghost"} 
            className={cn(
              "w-full justify-start",
              activeTab === "payments" ? "bg-primary text-white" : "text-gray-800"
            )}
            onClick={() => handleTabClick("payments")}
          >
            <CreditCard className="mr-3 h-5 w-5" />
            <span>Payments</span>
          </Button>
          
          <Button 
            variant={activeTab === "cards" ? "default" : "ghost"} 
            className={cn(
              "w-full justify-start",
              activeTab === "cards" ? "bg-primary text-white" : "text-gray-800"
            )}
            onClick={() => handleTabClick("cards")}
          >
            <Wallet className="mr-3 h-5 w-5" />
            <span>Cards</span>
          </Button>
          
          <Button 
            variant={activeTab === "qr" ? "default" : "ghost"} 
            className={cn(
              "w-full justify-start",
              activeTab === "qr" ? "bg-primary text-white" : "text-gray-800"
            )}
            onClick={() => handleTabClick("qr")}
          >
            <QrCode className="mr-3 h-5 w-5" />
            <span>QR Payments</span>
          </Button>
          
          <Button 
            variant={activeTab === "profile" ? "default" : "ghost"} 
            className={cn(
              "w-full justify-start",
              activeTab === "profile" ? "bg-primary text-white" : "text-gray-800"
            )}
            onClick={() => handleTabClick("profile")}
          >
            <User className="mr-3 h-5 w-5" />
            <span>Profile</span>
          </Button>
        </nav>
        
        <div className="border-t border-gray-200 mt-6 pt-6">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span>Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
