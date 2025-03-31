import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { Loader2, QrCode } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function QrTransactions() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Filter to only show QR-related transactions
  const qrTransactions = transactions?.filter(
    (transaction) => transaction.paymentMethod === "qr"
  );

  return (
    <Card className="mt-8">
      <CardContent className="p-0">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent QR Transactions</h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Loading transactions...</p>
                  </TableCell>
                </TableRow>
              ) : qrTransactions && qrTransactions.length > 0 ? (
                qrTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                          <QrCode className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                          <div className="text-sm text-gray-500">{transaction.recipientName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}<br />
                      <span className="text-xs">{format(new Date(transaction.date), "hh:mm a")}</span>
                    </TableCell>
                    <TableCell className={`text-sm font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}${parseFloat(transaction.amount.toString()).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${transaction.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                           transaction.status === 'processing' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                           'bg-red-100 text-red-800 hover:bg-red-100'}
                        `}
                      >
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-gray-500">No QR transactions found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
