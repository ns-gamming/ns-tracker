import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Zap, ArrowUpRight, ArrowDownRight, PiggyBank } from "lucide-react";
import { useEffect, useState } from "react";

interface QuickStatsProps {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  totalIncome?: number;
  totalExpenses?: number;
  averageSavingsRate?: number;
  currency?: string;
}

export const QuickStats = ({ 
  netWorth, 
  monthlyIncome, 
  monthlyExpenses, 
  savingsRate,
  totalIncome = 0,
  totalExpenses = 0,
  averageSavingsRate = 0,
  currency = "INR"
}: QuickStatsProps) => {
  const [animatedNetWorth, setAnimatedNetWorth] = useState(0);
  const [animatedIncome, setAnimatedIncome] = useState(0);
  const [animatedExpenses, setAnimatedExpenses] = useState(0);
  const [animatedSavings, setAnimatedSavings] = useState(0);
  const [animatedTotalIncome, setAnimatedTotalIncome] = useState(0);
  const [animatedTotalExpenses, setAnimatedTotalExpenses] = useState(0);
  const [animatedAvgSavings, setAnimatedAvgSavings] = useState(0);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // Animate numbers on mount
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedNetWorth(netWorth * easeOut);
      setAnimatedIncome(monthlyIncome * easeOut);
      setAnimatedExpenses(monthlyExpenses * easeOut);
      setAnimatedSavings(savingsRate * easeOut);
      setAnimatedTotalIncome(totalIncome * easeOut);
      setAnimatedTotalExpenses(totalExpenses * easeOut);
      setAnimatedAvgSavings(averageSavingsRate * easeOut);

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [netWorth, monthlyIncome, monthlyExpenses, savingsRate, totalIncome, totalExpenses, averageSavingsRate]);

  const savings = monthlyIncome - monthlyExpenses;
  const savingsChange = savings >= 0 ? 'positive' : 'negative';

  const getCurrencySymbol = () => {
    const symbols: Record<string, string> = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
      USDT: "₮",
    };
    return symbols[currency] || "₹";
  };

  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol()}${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const stats = [
    {
      id: "networth",
      title: "Net Worth",
      value: animatedNetWorth,
      icon: DollarSign,
      color: "primary",
      bgColor: "bg-primary/10",
      textColor: "text-primary",
      badge: { icon: Zap, text: "Live", variant: "outline" as const },
      description: "Total balance across all accounts, assets, and investments"
    },
    {
      id: "monthly-income",
      title: "Monthly Income",
      value: animatedIncome,
      icon: TrendingUp,
      color: "success",
      bgColor: "bg-success/10",
      textColor: "text-success",
      badge: { icon: Calendar, text: "This month", variant: "default" as const, className: "bg-success/10 text-success border-success/30" },
      description: "Total income received this month",
      delta: monthlyIncome > 0 ? "+12.5%" : "0%"
    },
    {
      id: "monthly-expenses",
      title: "Monthly Expenses",
      value: animatedExpenses,
      icon: TrendingDown,
      color: "destructive",
      bgColor: "bg-destructive/10",
      textColor: "text-destructive",
      badge: { icon: Calendar, text: "This month", variant: "default" as const, className: "bg-destructive/10 text-destructive border-destructive/30" },
      description: "Total expenses this month",
      delta: monthlyExpenses > 0 ? "+8.2%" : "0%"
    },
    {
      id: "savings-rate",
      title: "Savings Rate",
      value: animatedSavings,
      icon: Target,
      color: "primary",
      bgColor: "bg-primary/10",
      textColor: "text-primary",
      isPercentage: true,
      badge: savingsChange === 'positive' 
        ? { icon: TrendingUp, text: "Good", variant: "default" as const, className: "bg-success/10 text-success border-success/30" }
        : { icon: TrendingDown, text: "Improve", variant: "default" as const, className: "bg-warning/10 text-warning border-warning/30" },
      description: `Savings rate = (Income – Expense) ÷ Income × 100. You saved ${formatCurrency(Math.abs(savings))}`
    },
    {
      id: "total-income",
      title: "Total Income",
      value: animatedTotalIncome,
      icon: ArrowUpRight,
      color: "success",
      bgColor: "bg-success/10",
      textColor: "text-success",
      badge: { icon: Calendar, text: "All time", variant: "outline" as const },
      description: "Cumulative income across all time"
    },
    {
      id: "total-expenses",
      title: "Total Expenses",
      value: animatedTotalExpenses,
      icon: ArrowDownRight,
      color: "destructive",
      bgColor: "bg-destructive/10",
      textColor: "text-destructive",
      badge: { icon: Calendar, text: "All time", variant: "outline" as const },
      description: "Cumulative expenses across all time"
    },
    {
      id: "avg-savings-rate",
      title: "Average Savings Rate",
      value: animatedAvgSavings,
      icon: PiggyBank,
      color: "primary",
      bgColor: "bg-primary/10",
      textColor: "text-primary",
      isPercentage: true,
      badge: { icon: TrendingUp, text: "Average", variant: "outline" as const },
      description: "Your average savings rate over all months"
    }
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.slice(0, 4).map((stat, index) => {
          const Icon = stat.icon;
          const BadgeIcon = stat.badge.icon;
          
          return (
            <Card 
              key={stat.id}
              className="shadow-card hover:shadow-medium transition-all hover:scale-105 animate-fade-in-up cursor-pointer group"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedCard(stat.id)}
            >
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <CardTitle className={`text-3xl tabular-nums ${stat.textColor}`}>
                    {stat.isPercentage 
                      ? `${stat.value.toFixed(0)}%`
                      : formatCurrency(stat.value)
                    }
                  </CardTitle>
                </div>
                <div className={`h-12 w-12 rounded-full ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={stat.badge.variant} className={`text-xs ${stat.badge.className || ''}`}>
                    <BadgeIcon className="h-3 w-3 mr-1" />
                    {stat.badge.text}
                  </Badge>
                  {stat.delta && (
                    <span className="text-xs text-muted-foreground">{stat.delta}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {stats.slice(4).map((stat, index) => {
          const Icon = stat.icon;
          const BadgeIcon = stat.badge.icon;
          
          return (
            <Card 
              key={stat.id}
              className="shadow-card hover:shadow-medium transition-all hover:scale-105 animate-fade-in-up cursor-pointer group"
              style={{ animationDelay: `${(index + 4) * 0.1}s` }}
              onClick={() => setSelectedCard(stat.id)}
            >
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <CardTitle className={`text-2xl tabular-nums ${stat.textColor}`}>
                    {stat.isPercentage 
                      ? `${stat.value.toFixed(0)}%`
                      : formatCurrency(stat.value)
                    }
                  </CardTitle>
                </div>
                <div className={`h-10 w-10 rounded-full ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-5 w-5 ${stat.textColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant={stat.badge.variant} className={`text-xs ${stat.badge.className || ''}`}>
                  <BadgeIcon className="h-3 w-3 mr-1" />
                  {stat.badge.text}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed View Modal */}
      <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedCard && (() => {
                const stat = stats.find(s => s.id === selectedCard);
                if (!stat) return null;
                const Icon = stat.icon;
                return (
                  <>
                    <Icon className={`h-5 w-5 ${stat.textColor}`} />
                    {stat.title}
                  </>
                );
              })()}
            </DialogTitle>
            <DialogDescription>
              {selectedCard && stats.find(s => s.id === selectedCard)?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCard && (() => {
              const stat = stats.find(s => s.id === selectedCard);
              if (!stat) return null;
              
              return (
                <div className="p-6 rounded-lg border bg-card">
                  <div className={`text-4xl font-bold ${stat.textColor} mb-2`}>
                    {stat.isPercentage 
                      ? `${stat.value.toFixed(1)}%`
                      : formatCurrency(stat.value)
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stat.title === "Net Worth" && "This includes all your accounts, investments, stocks, crypto, and assets"}
                    {stat.title === "Monthly Income" && "Income received in the current month"}
                    {stat.title === "Monthly Expenses" && "Expenses paid in the current month"}
                    {stat.title === "Savings Rate" && `Current month savings: ${formatCurrency(savings)}`}
                    {stat.title === "Total Income" && "All-time cumulative income"}
                    {stat.title === "Total Expenses" && "All-time cumulative expenses"}
                    {stat.title === "Average Savings Rate" && "Historical average across all months"}
                  </p>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
