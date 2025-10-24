import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Sparkles, BarChart3 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl gradient-primary shadow-medium">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">NS Tracker</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/privacy")}>
              Privacy
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            AI-Powered Finance Tracking
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Take Control of Your
            <span className="block gradient-primary bg-clip-text text-transparent">Financial Future</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track expenses, analyze spending patterns, and get AI-powered insights to make smarter financial decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
              Start Tracking Free
              <TrendingUp className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/privacy")}>
              Learn More
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          <div className="p-6 rounded-2xl bg-card shadow-card border border-border/50">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
            <p className="text-sm text-muted-foreground">
              Google Gemini automatically categorizes transactions and detects spending anomalies.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card shadow-card border border-border/50">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-success/10 mb-4">
              <BarChart3 className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Visualize spending patterns, track budgets, and forecast your financial future.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card shadow-card border border-border/50">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-warning/10 mb-4">
              <Shield className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
            <p className="text-sm text-muted-foreground">
              Bank-level security with encrypted data and privacy-preserving IP hashing.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center p-8 rounded-2xl bg-muted/30 border border-border">
          <h2 className="text-2xl font-bold mb-3">Ready to transform your finances?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands tracking smarter with NS Tracker
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Create Free Account
          </Button>
        </div>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 NS Tracker. Built with privacy and security in mind.</p>
          <div className="mt-2">
            <Button variant="link" onClick={() => navigate("/privacy")} className="text-muted-foreground">
              Privacy Policy
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
