import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { Card as CardType } from "@shared/schema";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover } from "react-icons/fa";

interface CreditCardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (card: CardType) => void;
}

export function CreditCard({ card, onEdit, onDelete }: CreditCardProps) {
  // Determine card icon based on type
  const getCardIcon = () => {
    switch (card.cardType.toLowerCase()) {
      case 'visa':
        return <FaCcVisa className="text-2xl" />;
      case 'mastercard':
        return <FaCcMastercard className="text-2xl" />;
      case 'amex':
        return <FaCcAmex className="text-2xl" />;
      case 'discover':
        return <FaCcDiscover className="text-2xl" />;
      default:
        return <FaCcVisa className="text-2xl" />;
    }
  };
  
  // Determine gradient based on card type
  const getCardGradient = () => {
    switch (card.cardType.toLowerCase()) {
      case 'visa':
        return 'bg-gradient-to-r from-indigo-500 to-purple-600'; // card-gradient class equivalent
      case 'mastercard':
        return 'bg-gradient-to-r from-amber-500 to-orange-600';
      case 'amex':
        return 'bg-gradient-to-r from-blue-500 to-cyan-600';
      case 'discover':
        return 'bg-gradient-to-r from-pink-500 to-rose-600';
      default:
        return 'bg-gradient-to-r from-indigo-500 to-purple-600';
    }
  };
  
  return (
    <div className={cn(
      "relative p-5 rounded-xl overflow-hidden text-white h-48",
      getCardGradient()
    )}>
      <div className="absolute top-4 right-4">
        {getCardIcon()}
      </div>
      
      <div className="mt-6">
        <p className="text-white text-opacity-80 text-sm">Card Number</p>
        <p className="font-medium">{card.cardNumber}</p>
      </div>
      
      <div className="mt-6 flex justify-between">
        <div>
          <p className="text-white text-opacity-80 text-sm">Name</p>
          <p className="font-medium">{card.cardholderName}</p>
        </div>
        <div>
          <p className="text-white text-opacity-80 text-sm">Expires</p>
          <p className="font-medium">{card.expiryDate}</p>
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <Button 
          size="icon" 
          variant="ghost" 
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 h-auto w-auto"
          onClick={() => onEdit(card)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        
        <Button 
          size="icon" 
          variant="ghost" 
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 h-auto w-auto"
          onClick={() => onDelete(card)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
