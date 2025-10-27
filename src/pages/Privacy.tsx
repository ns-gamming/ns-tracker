import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Eye, Database, UserCheck, FileText, ArrowLeft } from "lucide-react";
import logoImage from "@/assets/ns-tracker-logo.png";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="NS TRACKER" className="h-10 w-10 rounded-full ring-2 ring-primary" />
              <h1 className="text-xl font-bold">NS TRACKER Privacy</h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center animate-fade-in">
          <h2 className="text-4xl font-bold mb-4 gradient-text">Privacy & Security</h2>
          <p className="text-muted-foreground text-lg">Your data security is our top priority</p>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg gradient-primary">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Data Protection</CardTitle>
                  <CardDescription>How we secure your information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>🔒 All data encrypted with AES-256</p>
              <p>🔐 Industry-standard authentication with optional 2FA</p>
              <p>🛡️ Row-Level Security ensures you only access your own data</p>
            </CardContent>
          </Card>

          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg gradient-success">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Data Collection</CardTitle>
                  <CardDescription>What we collect</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>📊 Financial data (transactions, accounts, investments)</p>
              <p>👤 Profile info (email, name, optional age/gender)</p>
              <p>🔍 Anonymized usage analytics</p>
            </CardContent>
          </Card>

          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-warning to-destructive">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Data Usage</CardTitle>
                  <CardDescription>How we use your information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>✅ Provide financial tracking and AI advice</p>
              <p>✅ Display portfolio performance</p>
              <p>❌ NEVER sell your data to third parties</p>
              <p>❌ NEVER share with advertisers</p>
            </CardContent>
          </Card>

          <div className="p-6 rounded-xl bg-gradient-primary text-white text-center animate-fade-in">
            <Shield className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Your Trust, Our Priority</h3>
            <p className="opacity-90 mb-4">Bank-level encryption and security measures</p>
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
