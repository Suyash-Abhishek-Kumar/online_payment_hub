import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { CreditCard } from "@/components/cards/credit-card";
import { AddCardModal } from "@/components/cards/add-card-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card as CardType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export default function Cards() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("cards");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CardType | null>(null);
  const [settings, setSettings] = useState({
    onlinePayments: true,
    internationalTransactions: false,
    transactionNotifications: true,
    contactlessPayments: true,
  });

  const { data: cards, isLoading: cardsLoading } = useQuery<CardType[]>({
    queryKey: ["/api/cards"],
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      await apiRequest("DELETE", `/api/cards/${cardId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      toast({
        title: "Card Deleted",
        description: "Your card has been removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete card",
        variant: "destructive",
      });
    },
  });

  const setDefaultCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      await apiRequest("POST", `/api/cards/${cardId}/default`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      toast({
        title: "Default Card Updated",
        description: "Your default card has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update default card",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // If user is not authenticated and finished loading, redirect to login
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleOpenAddCard = () => {
    setShowAddCardModal(true);
  };

  const handleCloseAddCard = () => {
    setShowAddCardModal(false);
  };

  const handleEditCard = (card: CardType) => {
    // For simplicity, when editing a card, we'll just set it as default
    setDefaultCardMutation.mutate(card.id);
  };

  const handleDeleteCard = (card: CardType) => {
    setCardToDelete(card);
  };

  const confirmDeleteCard = () => {
    if (cardToDelete) {
      deleteCardMutation.mutate(cardToDelete.id);
      setCardToDelete(null);
    }
  };

  const cancelDeleteCard = () => {
    setCardToDelete(null);
  };

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    toast({
      title: "Setting Updated",
      description: `${key} has been ${settings[key] ? "disabled" : "enabled"}`,
    });
  };

  const isLoading = authLoading || cardsLoading;

  if (authLoading) {
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
              <h1 className="text-2xl font-bold text-gray-900">Payment Cards</h1>
              <p className="text-gray-600 mt-1">Manage your credit and debit cards</p>
            </header>
            
            {/* Cards List */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeleton
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="h-48 rounded-xl bg-gray-200 animate-pulse"></div>
                ))
              ) : cards && cards.length > 0 ? (
                cards.map(card => (
                  <CreditCard 
                    key={card.id}
                    card={card} 
                    onEdit={handleEditCard} 
                    onDelete={handleDeleteCard} 
                  />
                ))
              ) : null}
              
              <div 
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl h-48 cursor-pointer hover:bg-gray-50 transition duration-200"
                onClick={handleOpenAddCard}
              >
                <div className="text-center">
                  <div className="h-12 w-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-primary mb-3">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="font-medium text-gray-900">Add New Card</p>
                  <p className="text-sm text-gray-500 mt-1">Debit or Credit</p>
                </div>
              </div>
            </div>
            
            {/* Card Settings */}
            <Card>
              <CardContent className="p-0">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Card Settings</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  <div className="px-6 py-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Allow online payments</h3>
                      <p className="text-sm text-gray-500">Enable or disable online payments for all cards</p>
                    </div>
                    <Switch 
                      checked={settings.onlinePayments} 
                      onCheckedChange={() => handleSettingChange('onlinePayments')}
                    />
                  </div>
                  
                  <div className="px-6 py-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Allow international transactions</h3>
                      <p className="text-sm text-gray-500">Enable or disable international payments</p>
                    </div>
                    <Switch 
                      checked={settings.internationalTransactions} 
                      onCheckedChange={() => handleSettingChange('internationalTransactions')}
                    />
                  </div>
                  
                  <div className="px-6 py-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Transaction notifications</h3>
                      <p className="text-sm text-gray-500">Get notified about all card transactions</p>
                    </div>
                    <Switch 
                      checked={settings.transactionNotifications} 
                      onCheckedChange={() => handleSettingChange('transactionNotifications')}
                    />
                  </div>
                  
                  <div className="px-6 py-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Contactless payments</h3>
                      <p className="text-sm text-gray-500">Enable or disable contactless card payments</p>
                    </div>
                    <Switch 
                      checked={settings.contactlessPayments} 
                      onCheckedChange={() => handleSettingChange('contactlessPayments')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <AddCardModal 
        isOpen={showAddCardModal} 
        onClose={handleCloseAddCard} 
      />
      
      <AlertDialog open={cardToDelete !== null} onOpenChange={cancelDeleteCard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the card from your account. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCard}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteCardMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Card"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
