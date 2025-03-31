import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card as CardType } from "@shared/schema";
import { useState } from "react";
import { AddCardModal } from "@/components/cards/add-card-modal";
import { CreditCard } from "@/components/cards/credit-card";
import { useLocation } from "wouter";

export function PaymentMethods() {
  const [, navigate] = useLocation();
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  
  const { data: cards, isLoading } = useQuery<CardType[]>({
    queryKey: ["/api/cards"],
  });
  
  const handleOpenAddCard = () => {
    setShowAddCardModal(true);
  };
  
  const handleCloseAddCard = () => {
    setShowAddCardModal(false);
  };
  
  const handleEditCard = (card: CardType) => {
    navigate("/cards");
  };
  
  const handleDeleteCard = (card: CardType) => {
    navigate("/cards");
  };
  
  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Payment Methods</h2>
            <Button 
              variant="link" 
              className="text-primary hover:text-blue-700 text-sm font-medium p-0"
              onClick={() => navigate("/cards")}
            >
              Manage
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              // Loading skeleton
              <div className="h-48 rounded-xl bg-gray-200 animate-pulse"></div>
            ) : cards && cards.length > 0 ? (
              <>
                {/* Render one card for dashboard preview */}
                <CreditCard 
                  card={cards[0]} 
                  onEdit={handleEditCard} 
                  onDelete={handleDeleteCard} 
                />
              </>
            ) : null}
            
            <div 
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl h-48 cursor-pointer hover:bg-gray-50 transition duration-200"
              onClick={handleOpenAddCard}
            >
              <div className="text-center">
                <div className="h-12 w-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-primary mb-3">
                  <Plus />
                </div>
                <p className="font-medium text-gray-900">Add New Card</p>
                <p className="text-sm text-gray-500 mt-1">Debit or Credit</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AddCardModal 
        isOpen={showAddCardModal}
        onClose={handleCloseAddCard}
      />
    </>
  );
}
