import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FamilySummaryItem {
  id: string;
  name: string;
  is_alive: boolean | null;
  income: number;
  expenses: number;
  net: number;
}

export const FamilyOverview = ({ items = [] as FamilySummaryItem[] }) => {
  if (!items || items.length === 0) return null;
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Family Overview</CardTitle>
        <CardDescription>Income and expenses by family member (30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <div key={m.id} className="p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{m.name}</div>
                {m.is_alive !== null && (
                  <Badge variant={m.is_alive ? "default" : "secondary"}>
                    {m.is_alive ? "Alive" : "Not alive"}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">Income</div>
              <div className="text-success font-semibold">₹{Number(m.income).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-2">Expenses</div>
              <div className="text-destructive font-semibold">₹{Number(m.expenses).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-2">Net</div>
              <div className={`font-semibold ${m.net >= 0 ? 'text-success' : 'text-destructive'}`}>₹{Number(m.net).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};