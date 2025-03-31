import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendIcon, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Contact {
  id: number;
  name: string;
  email: string;
  lastPaid: string | null;
}

export function QuickPay() {
  const { toast } = useToast();
  
  const { data: contacts, isLoading } = useQuery({
    queryKey: ["/api/contacts"],
    staleTime: 60000, // 1 minute
  });

  const handleSendClick = (contact: Contact) => {
    toast({
      title: "Payment Initiated",
      description: `Sending payment to ${contact.name}`,
    });
  };

  const handleAddContact = () => {
    toast({
      title: "Coming Soon",
      description: "Add contact functionality will be available soon",
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex-grow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Pay</h2>
        
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 animate-pulse">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="ml-3">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-32 bg-gray-100 rounded mt-1"></div>
                </div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center justify-between p-2 animate-pulse">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="ml-3">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-32 bg-gray-100 rounded mt-1"></div>
                </div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : contacts && contacts.length > 0 ? (
          <div className="space-y-3">
            {contacts.map((contact: Contact) => (
              <div 
                key={contact.id} 
                className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md cursor-pointer"
              >
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random`} 
                      alt={contact.name} 
                    />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{contact.name}</p>
                    <p className="text-xs text-gray-500">
                      {contact.lastPaid 
                        ? `Last paid: ${formatDistanceToNow(new Date(contact.lastPaid), { addSuffix: true })}` 
                        : "No recent payments"}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary hover:text-blue-700"
                  onClick={() => handleSendClick(contact)}
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No contacts found</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-6 py-3">
        <Button 
          variant="ghost" 
          className="text-primary hover:text-blue-700 font-medium w-full flex items-center justify-center"
          onClick={handleAddContact}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Contact
        </Button>
      </CardFooter>
    </Card>
  );
}
