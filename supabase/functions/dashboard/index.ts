import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Calculate date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch last 30 days transactions
    const { data: recentTransactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', thirtyDaysAgo.toISOString())
      .order('timestamp', { ascending: false });

    // Fetch all accounts
    const { data: accounts } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user.id);

    // Calculate net worth (sum of all account balances)
    const netWorth = accounts?.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0) || 0;

    // Calculate income and expenses for last 30 days
    const income = recentTransactions
      ?.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0;

    const expenses = recentTransactions
      ?.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0;

    // Calculate savings rate
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    // Top categories by spending
    const categorySpending: Record<string, number> = {};
    recentTransactions?.forEach(t => {
      if (t.type === 'expense' && t.category_id) {
        categorySpending[t.category_id] = (categorySpending[t.category_id] || 0) + parseFloat(t.amount || 0);
      }
    });

    const topCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Fetch category names
    const categoryIds = topCategories.map(([id]) => id);
    const { data: categories } = await supabaseClient
      .from('categories')
      .select('id, name')
      .in('id', categoryIds);

    const topCategoriesWithNames = topCategories.map(([id, amount]) => ({
      category: categories?.find(c => c.id === id)?.name || 'Unknown',
      amount,
    }));

    // Daily cashflow for sparkline (last 30 days)
    const dailyCashflow: Record<string, number> = {};
    recentTransactions?.forEach(t => {
      const date = new Date(t.timestamp).toISOString().split('T')[0];
      const amount = parseFloat(t.amount || 0);
      dailyCashflow[date] = (dailyCashflow[date] || 0) + (t.type === 'income' ? amount : -amount);
    });

    const cashflowSparkline = Object.entries(dailyCashflow)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));

    return new Response(
      JSON.stringify({
        netWorth,
        monthlyIncome: income,
        monthlyExpenses: expenses,
        savingsRate: savingsRate.toFixed(1),
        topCategories: topCategoriesWithNames,
        cashflowSparkline,
        transactionCount: recentTransactions?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in dashboard function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
