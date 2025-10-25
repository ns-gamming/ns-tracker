import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  merchant: string;
  timestamp: string;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

export const RecentTransactions = ({ transactions = [] }: RecentTransactionsProps) => {
  if (transactions.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No transactions yet. Start by adding your first transaction!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === "income" ? "bg-success/10" : "bg-destructive/10"
                }`}>
                  {transaction.type === "income" ? (
                    <ArrowUpRight className="w-5 h-5 text-success" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{transaction.merchant}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === "income" ? "text-success" : "text-destructive"
                }`}>
                  {transaction.type === "income" ? "+" : "-"}₹{Math.abs(transaction.amount).toFixed(2)}
                </p>
                <Badge variant={transaction.type === "income" ? "default" : "secondary"} className="text-xs">
                  {transaction.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
