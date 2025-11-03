import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface FinancialChartsProps {
  monthlyTrend?: Array<{ month: string; income: number; expenses: number }>;
  categoryBreakdown?: Array<{ category: string; amount: number }>;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export const FinancialCharts = ({ monthlyTrend = [], categoryBreakdown = [] }: FinancialChartsProps) => {
  const hasData = monthlyTrend.length > 0 || categoryBreakdown.length > 0;

  if (!hasData) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Monthly comparison</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
            No transaction data yet. Add your first transaction to see insights!
          </CardContent>
        </Card>
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Category breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
            No category data yet
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {monthlyTrend.length > 0 && (
        <Card className="shadow-card hover-scale animate-fade-in transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📈 Income vs Expenses
            </CardTitle>
            <CardDescription>6-month trend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number) => `₹${value.toFixed(2)}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  name="Income" 
                  dot={{ fill: "#10b981", r: 5 }}
                  activeDot={{ r: 7 }}
                  animationDuration={1000}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  name="Expenses" 
                  dot={{ fill: "#ef4444", r: 5 }}
                  activeDot={{ r: 7 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {categoryBreakdown.length > 0 && (
        <Card className="shadow-card hover-scale animate-fade-in transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Spending by Category
            </CardTitle>
            <CardDescription>This month's breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="hsl(var(--primary))"
                  dataKey="amount"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number) => `₹${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {monthlyTrend.length > 0 && (
        <Card className="shadow-card md:col-span-2 hover-scale animate-fade-in transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Monthly Overview
            </CardTitle>
            <CardDescription>Bar chart comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number) => `₹${value.toFixed(2)}`}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" radius={[8, 8, 0, 0]} animationDuration={800} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[8, 8, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
