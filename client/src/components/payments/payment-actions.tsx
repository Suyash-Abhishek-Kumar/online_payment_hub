import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  SendIcon, 
  CreditCard, 
  Receipt 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function PaymentActions() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  
  const handleSendMoney = () => {
    setLoading("send");
    setTimeout(() => {
      setLoading(null);
      toast({
        title: "Coming Soon",
        description: "Send money functionality will be available soon",
      });
    }, 1000);
  };
  
  const handleRequestMoney = () => {
    setLoading("request");
    setTimeout(() => {
      setLoading(null);
      toast({
        title: "Coming Soon",
        description: "Request money functionality will be available soon",
      });
    }, 1000);
  };
  
  const handlePayBills = () => {
    setLoading("bills");
    setTimeout(() => {
      setLoading(null);
      toast({
        title: "Coming Soon",
        description: "Pay bills functionality will be available soon",
      });
    }, 1000);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-primary mb-4">
            <SendIcon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Send Money</h3>
          <p className="text-gray-600 text-sm mb-4">Transfer funds to friends, family or businesses</p>
          <Button 
            className="w-full" 
            onClick={handleSendMoney}
            disabled={loading === "send"}
          >
            {loading === "send" ? "Processing..." : "Send Now"}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
            <CreditCard className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Request Money</h3>
          <p className="text-gray-600 text-sm mb-4">Get paid by sending payment requests</p>
          <Button 
            className="w-full" 
            onClick={handleRequestMoney}
            disabled={loading === "request"}
          >
            {loading === "request" ? "Processing..." : "Request Now"}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
            <Receipt className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pay Bills</h3>
          <p className="text-gray-600 text-sm mb-4">Pay utilities, subscriptions and more</p>
          <Button 
            className="w-full" 
            onClick={handlePayBills}
            disabled={loading === "bills"}
          >
            {loading === "bills" ? "Processing..." : "Pay Bills"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
