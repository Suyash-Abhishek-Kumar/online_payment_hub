import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, SendIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface BalanceCardProps {
  balance: string;
  monthlyGrowth?: string;
}

export function BalanceCard({ balance, monthlyGrowth = "12%" }: BalanceCardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleAddMoney = () => {
    setLoading("add");
    // Simulate API call
    setTimeout(() => {
      setLoading(null);
      toast({
        title: "Coming Soon",
        description: "Add money functionality will be available soon",
      });
    }, 1000);
  };
  
  const handleSendMoney = () => {
    setLoading("send");
    // Simulate API call
    setTimeout(() => {
      setLoading(null);
      toast({
        title: "Coming Soon",
        description: "Send money functionality will be available soon",
      });
    }, 1000);
  };
  
  return (
    <Card className="col-span-2">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Available Balance</h2>
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Updated Now
          </Badge>
        </div>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900">${balance}</span>
          <span className="ml-2 text-sm text-green-600 flex items-center">
            <i className="fas fa-arrow-up mr-1"></i> {monthlyGrowth} this month
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button
            onClick={handleAddMoney}
            disabled={loading === "add"}
            className="flex items-center justify-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            {loading === "add" ? "Processing..." : "Add Money"}
          </Button>
          <Button
            variant="outline"
            onClick={handleSendMoney}
            disabled={loading === "send"}
            className="flex items-center justify-center border-primary text-primary hover:bg-blue-50"
          >
            <SendIcon className="mr-2 h-4 w-4" />
            {loading === "send" ? "Processing..." : "Send Money"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
