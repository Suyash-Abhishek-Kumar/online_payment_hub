import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowDown, 
  ArrowUp, 
  ArrowUpDown,
  Receipt
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { useLocation } from "wouter";
import { format } from "date-fns";

export function RecentTransactions() {
  const [, navigate] = useLocation();
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", { limit: 5 }],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`${queryKey[0]}?limit=5`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === "credit") {
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          <ArrowDown className="h-5 w-5" />
        </div>
      );
    } else if (transaction.category === "payment") {
      return (
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <ArrowUp className="h-5 w-5" />
        </div>
      );
    } else if (transaction.category === "bill") {
      return (
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <Receipt className="h-5 w-5" />
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
          <ArrowUpDown className="h-5 w-5" />
        </div>
      );
    }
  };

  return (
    <Card className="overflow-hidden mb-8">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
            <Button 
              variant="link" 
              className="text-primary hover:text-blue-700 text-sm font-medium p-0"
              onClick={() => navigate("/payments")}
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeleton
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg animate-pulse">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div className="ml-4">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-100 rounded mt-1"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-100 rounded mt-1"></div>
                  </div>
                </div>
              ))
            ) : transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    {getTransactionIcon(transaction)}
                    <div className="ml-4">
                      <p className="font-medium text-gray-800">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.recipientName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}${parseFloat(transaction.amount.toString()).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(transaction.date), "MMM d, yyyy, h:mm a")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
