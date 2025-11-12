
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import logoImage from "../assets/ns-finsight-logo.png";
import { AdSense } from "@/components/AdSense";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 glass-morphism sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0">
                <div className="h-full w-full rounded-full overflow-hidden bg-white shadow-lg ring-2 ring-primary/40">
                  <img src={logoImage} alt="NS FinSight Logo" className="h-full w-full object-contain p-1" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary/90 to-success bg-clip-text text-transparent">
                NS FinSight
              </span>
            </div>
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-muted-foreground">Last Updated: December 2, 2024</p>
        </div>

        <AdSense slot="TERMS_TOP_SLOT" format="horizontal" className="mb-8" />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                By accessing and using NS FinSight, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Use License</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>Permission is granted to temporarily use NS FinSight for personal, non-commercial transitory viewing only.</p>
              <ul>
                <li>You may not modify or copy the materials</li>
                <li>You may not use the materials for any commercial purpose</li>
                <li>You may not attempt to reverse engineer any software</li>
                <li>You may not remove any copyright or proprietary notations</li>
              </ul>
            </CardContent>
          </Card>

          <AdSense slot="TERMS_MIDDLE_SLOT" format="auto" className="my-8" />

          <Card>
            <CardHeader>
              <CardTitle>3. User Account</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>You are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Financial Data</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>NS FinSight provides tools to track and analyze your financial data. We:</p>
              <ul>
                <li>Do not provide financial advice</li>
                <li>Are not responsible for any financial decisions you make</li>
                <li>Encrypt and protect your data with industry-standard security</li>
                <li>Will never sell your financial data to third parties</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Prohibited Activities</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>You agree not to:</p>
              <ul>
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to the service</li>
                <li>Interfere with or disrupt the service</li>
                <li>Upload malicious code or viruses</li>
                <li>Scrape or harvest data from the service</li>
              </ul>
            </CardContent>
          </Card>

          <AdSense slot="TERMS_BOTTOM_SLOT" format="horizontal" className="my-8" />

          <Card>
            <CardHeader>
              <CardTitle>6. Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                The materials on NS FinSight are provided on an 'as is' basis. NS FinSight makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Limitations</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                In no event shall NS FinSight or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use NS FinSight.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                If you have any questions about these Terms, please contact us at: support@nsfinsight.xyz
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Terms;
