import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardData {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    merchant: string;
    timestamp: string;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
  }>;
}

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("dashboard");

      if (error) throw error;
      return data as DashboardData;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
