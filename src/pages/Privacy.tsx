import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-medium">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Privacy Policy & Terms</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>1. Data Collection & Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed">
              <p>
                NS Tracker collects and processes the following data to provide you with financial tracking and AI-powered insights:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Email, display name, timezone preferences</li>
                <li><strong>Financial Data:</strong> Transactions, accounts, budgets, and goals you create</li>
                <li><strong>Usage Data:</strong> We hash your IP address (SHA-256 with salt) for security audit logs. We never store raw IP addresses.</li>
                <li><strong>AI Processing:</strong> Transaction data is sent to Google Gemini API for categorization and insights. No personal identifiers are included in AI requests.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>2. How We Protect Your Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS) and at rest</li>
                <li><strong>Row-Level Security:</strong> Database policies ensure you can only access your own data</li>
                <li><strong>IP Hashing:</strong> We use salted SHA-256 hashing for IP addresses in audit logs</li>
                <li><strong>Secure Authentication:</strong> Google OAuth and email/password via Supabase Auth</li>
                <li><strong>No Third-Party Sharing:</strong> Your financial data is never sold or shared with third parties</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>3. AI & Gemini Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed">
              <p>
                NS Tracker uses Google's Gemini AI to provide intelligent insights on your transactions:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Category predictions and confidence scores</li>
                <li>Anomaly detection for unusual spending</li>
                <li>Monthly summaries and savings recommendations</li>
                <li>12-month cashflow forecasts</li>
              </ul>
              <p className="mt-4">
                When we send data to Gemini, we include only transaction amounts, merchants, timestamps, and currency. 
                We never send your email, name, or other personal identifiers. All AI responses are validated before storage.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>4. Advertising (AdSense)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed">
              <p>
                NS Tracker displays advertisements through Google AdSense. This helps us keep the service free.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ads are loaded only after you provide cookie consent</li>
                <li>AdSense may use cookies to show relevant ads based on your browsing</li>
                <li>You can opt out of personalized ads at <a href="https://adssettings.google.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Ad Settings</a></li>
                <li>We do not share your financial data with advertising networks</li>
              </ul>
              <p className="mt-4">
                Publisher ID: ca-pub-4779140243670658
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>5. Your Rights (GDPR Compliance)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed">
              <p>You have the following rights regarding your data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of all your data (available in-app)</li>
                <li><strong>Rectification:</strong> Update or correct your information</li>
                <li><strong>Erasure:</strong> Delete your account and all associated data</li>
                <li><strong>Data Portability:</strong> Export your data in JSON/CSV format</li>
                <li><strong>Withdraw Consent:</strong> Opt out of analytics and personalized ads</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, use the export and delete functions in your account settings or contact us.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Active Data:</strong> Retained as long as your account is active</li>
                <li><strong>Audit Logs:</strong> Kept for 90 days, then automatically deleted</li>
                <li><strong>Deleted Accounts:</strong> All user data is permanently deleted within 30 days of account deletion request</li>
                <li><strong>Backups:</strong> Encrypted backups retained for 30 days for disaster recovery</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>7. Contact & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed">
              <p>
                For privacy concerns, data requests, or general inquiries:
              </p>
              <p className="font-medium">
                Email: <a href="mailto:support@nstracker.app" className="text-primary hover:underline">support@nstracker.app</a>
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                By using NS Tracker, you agree to this privacy policy. We may update this policy periodically 
                and will notify you of significant changes via email or in-app notification.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
