import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { TrendingUp, LogOut, Plus, Moon, Sun, RefreshCw, MessageSquare, Users, Link as LinkIcon, Shield, Keyboard, Tag, Settings, Maximize2, Minimize2, TrendingDown, Target } from "lucide-react";
import logoImage from "../assets/ns-finsight-logo.png";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { BudgetDialog } from "@/components/BudgetDialog";
import { FinancialChatbot } from "@/components/FinancialChatbot";
import { useDashboardData } from "@/hooks/useDashboardData";
import { EnhancedFinancialCharts } from "@/components/EnhancedFinancialCharts";
import { AdvancedCharts } from "@/components/AdvancedCharts";
import { ShortcutsHelp } from "@/components/ShortcutsHelp";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SecurityMonitor } from "@/components/SecurityMonitor";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { QuickStats } from "@/components/QuickStats";
import { RecentTransactions } from "@/components/RecentTransactions";
import { FamilyOverview } from "@/components/FamilyOverview";
import { BudgetAlerts } from "@/components/BudgetAlerts";
import { SmartAlerts } from "@/components/SmartAlerts";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { BillReminders } from "@/components/BillReminders";
import { MarketHoldings } from "@/components/MarketHoldings";
import { UserProfile } from "@/components/UserProfile";
import { OrderTracking } from "@/components/OrderTracking";
import { PreciousMetals } from "@/components/PreciousMetals";
import { Achievements } from "@/components/Achievements";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { NewsWidget } from "@/components/NewsWidget";
import { AdSense } from "@/components/AdSense";
import { FinancialTips } from "@/components/FinancialTips";
import { RealityCheck } from "@/components/RealityCheck";
import { NotesWidget } from "@/components/NotesWidget";
import { LoadingScreen } from "@/components/LoadingScreen";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { WalletManagement } from "@/components/WalletManagement";
import { UnifiedAssetDialog } from "@/components/UnifiedAssetDialog";
import { RealTimeAlerts } from "@/components/RealTimeAlerts";
import { CategoryManager } from "@/components/CategoryManager";
import { DataManagement } from "@/components/DataManagement";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type ChartComplexity = "simple" | "intermediate" | "advanced" | "expert";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [chartComplexity, setChartComplexity] = useState<ChartComplexity>("simple");
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, refetch } = useDashboardData();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Add animation for theme transition
    document.documentElement.classList.add("theme-transition");
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    const animationEndHandler = () => {
      document.documentElement.classList.remove("theme-transition");
      document.documentElement.removeEventListener("transitionend", animationEndHandler);
    };
    document.documentElement.addEventListener("transitionend", animationEndHandler);

    toast.success(`${newTheme === "dark" ? "Dark" : "Light"} mode enabled`);
  };

  useKeyboardShortcuts([
    { key: 'n', ctrlKey: true, action: () => setShowAddTransaction(true), description: 'Add transaction' },
    { key: 'b', ctrlKey: true, action: () => setShowBudgetDialog(true), description: 'Set budget' },
    { key: 'c', ctrlKey: true, action: () => setShowChatbot(true), description: 'Open AI advisor' },
    { key: 'f', ctrlKey: true, action: () => navigate('/family'), description: 'View family' },
    { key: 'r', ctrlKey: true, action: () => refetch(), description: 'Refresh data' },
    { key: 'd', ctrlKey: true, action: toggleTheme, description: 'Toggle theme' },
    { key: '/', ctrlKey: true, action: () => setShowShortcuts(true), description: 'Show shortcuts' },
    { key: 's', ctrlKey: true, action: () => setShowSettings(!showSettings), description: 'Toggle settings' },
  ]);

  useRealtimeUpdates({
    table: 'transactions',
    onInsert: () => refetch(),
    onUpdate: () => refetch(),
    onDelete: () => refetch(),
    enabled: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadUserPreferences(session.user.id);
        setTimeout(() => setInitialLoading(false), 1000);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserPreferences = async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("dashboard_preferences")
      .eq("id", userId)
      .single();

    if (data?.dashboard_preferences) {
      setChartComplexity(data.dashboard_preferences.chartComplexity || "simple");
    }
  };

  const saveChartComplexity = async (complexity: ChartComplexity) => {
    if (!user) return;

    setChartComplexity(complexity);

    const { error } = await supabase
      .from("users")
      .update({
        dashboard_preferences: {
          chartComplexity: complexity,
          showAnimations: true,
        }
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save preferences");
    } else {
      toast.success("Chart complexity updated");
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  if (initialLoading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  // Extract data for new components
  const { monthlyIncome = 0, monthlyExpenses = 0, totalIncome = 0, totalExpenses = 0 } = dashboardData || {};

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-floating-smooth"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-success/8 rounded-full blur-3xl animate-floating-smooth animate-morph" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-chart-4/5 rounded-full blur-3xl animate-pulse-slow animate-morph" style={{ animationDelay: "4s" }}></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-warning/5 rounded-full blur-2xl animate-floating-smooth" style={{ animationDelay: "3s" }}></div>
      </div>

      <header className="border-b border-border/50 glass-morphism sticky top-0 z-50 animate-slide-in-up backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-md animate-ripple"></div>
                <div className="h-full w-full rounded-full overflow-hidden bg-white shadow-lg ring-2 ring-primary/40 relative z-10 hover-glow">
                  <img src={logoImage} alt="NS FinSight Logo" className="h-full w-full object-contain p-1 transition-transform duration-300 hover:scale-110" loading="eager" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary/90 to-success bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto] hover:scale-105 transition-transform">
                NS FinSight
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} title="Dashboard Settings" className="hover-glow hover:scale-110 transition-all duration-300">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowChatbot(true)} title="AI Financial Advisor" className="hover-glow hover:scale-110 transition-all duration-300">
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/family")} title="Family Members" className="hover-glow hover:scale-110 transition-all duration-300">
                <Users className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/privacy")} title="Privacy & Security" className="hover-glow hover:scale-110 transition-all duration-300">
                <Shield className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover-glow hover:scale-110 transition-all duration-300 hover:rotate-180">
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" onClick={handleSignOut} className="hover-glow hover:scale-105 transition-all duration-300">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 relative z-10">
        {showSettings && (
          <Card className="mb-6 glass-morphism border-primary/20 animate-slide-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Dashboard Customization
              </CardTitle>
              <CardDescription>Control chart complexity and visualization options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="complexity">Chart Complexity Level</Label>
                <Select value={chartComplexity} onValueChange={(value: ChartComplexity) => saveChartComplexity(value)}>
                  <SelectTrigger id="complexity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">
                      <div className="flex items-center gap-2">
                        <Minimize2 className="w-4 h-4" />
                        <span>Simple - Basic charts only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="intermediate">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Intermediate - Standard analytics</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div className="flex items-center gap-2">
                        <Maximize2 className="w-4 h-4" />
                        <span>Advanced - Detailed insights</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="expert">
                      <div className="flex items-center gap-2">
                        <Maximize2 className="w-4 h-4" />
                        <span>Expert - Maximum customization</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {chartComplexity === "simple" && "Shows only essential charts with minimal options"}
                  {chartComplexity === "intermediate" && "Includes standard analytics with moderate customization"}
                  {chartComplexity === "advanced" && "Displays comprehensive charts with detailed controls"}
                  {chartComplexity === "expert" && "Full suite of visualizations with maximum customization"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-6 sm:mb-8 flex items-center justify-between animate-card-entrance">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-foreground via-primary to-foreground/70 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">Welcome back!</h2>
            <p className="text-muted-foreground text-sm sm:text-lg opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>Here's your financial overview</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading} className="shrink-0 hover-glow hover:scale-110 transition-all duration-300">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              <div className="opacity-0 animate-card-entrance" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
                <QuickStats
                  netWorth={dashboardData?.netWorth || 0}
                  monthlyIncome={dashboardData?.monthlyIncome || 0}
                  monthlyExpenses={dashboardData?.monthlyExpenses || 0}
                  savingsRate={dashboardData?.savingsRate || 0}
                  totalIncome={dashboardData?.totalIncome || 0}
                  totalExpenses={dashboardData?.totalExpenses || 0}
                  averageSavingsRate={dashboardData?.averageSavingsRate || 0}
                  currency="INR"
                />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 mb-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="opacity-0 animate-card-entrance card-shine" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
                  <RealTimeAlerts />
                </div>
                <div className="opacity-0 animate-card-entrance card-shine" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
                  <SmartAlerts />
                </div>
              </div>
              <div className="space-y-6">
                <BudgetAlerts />
                <DataManagement />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 mb-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="opacity-0 animate-card-entrance card-shine" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
                  {chartComplexity === "expert" && (
                    <EnhancedFinancialCharts
                      monthlyTrend={dashboardData?.monthlyTrend}
                      categoryBreakdown={dashboardData?.categoryBreakdown}
                    />
                  )}
                  {(chartComplexity === "advanced" || chartComplexity === "intermediate") && (
                    <AdvancedCharts
                      monthlyTrend={dashboardData?.monthlyTrend}
                      categoryBreakdown={dashboardData?.categoryBreakdown}
                    />
                  )}
                  {chartComplexity === "simple" && (
                    <AdvancedCharts
                      monthlyTrend={dashboardData?.monthlyTrend}
                      categoryBreakdown={dashboardData?.categoryBreakdown}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div className="opacity-0 animate-card-entrance card-shine" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
                  <RecentTransactions transactions={dashboardData?.recentTransactions} />
                </div>
              </div>
            </div>

            {(chartComplexity === "advanced" || chartComplexity === "expert") && (
              <div className="mb-8 opacity-0 animate-card-entrance card-shine perspective-card" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
                <AnalyticsDashboard />
              </div>
            )}

            <div className="mb-8 opacity-0 animate-card-entrance card-shine" style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}>
              <WalletManagement />
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <div className="opacity-0 animate-card-entrance card-shine" style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}>
                <FamilyOverview items={dashboardData?.familySummary || []} />
              </div>
              <div className="opacity-0 animate-card-entrance card-shine" style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}>
                <BillReminders />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <UserProfile />
              <SecurityMonitor />
            </div>

            <div className="mb-8">
              <Achievements />
            </div>

            <div className="mb-8">
              <AdSense slot="1234567890" format="horizontal" className="my-8" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3 mb-8">
              <div className="lg:col-span-2">
                <MarketHoldings />
              </div>
              <div className="space-y-6">
                <NewsWidget />
                <NotesWidget />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <FinancialTips />
              <RealityCheck />
            </div>

            <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "1.0s" }}>
              <AdSense slot="2345678901" format="horizontal" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <Card className="shadow-card glass-morphism border-border/50 animate-card-entrance" style={{ animationDelay: "1.1s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    Income Trends
                  </CardTitle>
                  <CardDescription>Track your income sources and growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-success/10">
                      <div>
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold text-success">₹{monthlyIncome.toLocaleString()}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-success" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
                      <div>
                        <p className="text-sm text-muted-foreground">Average Monthly</p>
                        <p className="text-2xl font-bold text-primary">₹{(totalIncome / 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card glass-morphism border-border/50 animate-card-entrance" style={{ animationDelay: "1.2s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-destructive" />
                    Expense Analysis
                  </CardTitle>
                  <CardDescription>Monitor your spending patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10">
                      <div>
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold text-destructive">₹{monthlyExpenses.toLocaleString()}</p>
                      </div>
                      <TrendingDown className="w-8 h-8 text-destructive" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-warning/10">
                      <div>
                        <p className="text-sm text-muted-foreground">Average Monthly</p>
                        <p className="text-2xl font-bold text-warning">₹{(totalExpenses / 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <Target className="w-8 h-8 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8">
              <PreciousMetals />
            </div>
          </>
        )}

        <AddTransactionDialog
          open={showAddTransaction}
          onOpenChange={setShowAddTransaction}
          onSuccess={() => refetch()}
        />

        <BudgetDialog
          open={showBudgetDialog}
          onOpenChange={setShowBudgetDialog}
          onSuccess={() => refetch()}
        />

        <UnifiedAssetDialog
          open={showAssetDialog}
          onOpenChange={setShowAssetDialog}
          onSuccess={() => refetch()}
        />

        <FinancialChatbot
          open={showChatbot}
          onOpenChange={setShowChatbot}
        />

        <ShortcutsHelp
          open={showShortcuts}
          onOpenChange={setShowShortcuts}
        />

        <FloatingActionButton onClick={() => setShowAddTransaction(true)} />
      </main>
    </div>
  );
};

export default Dashboard;