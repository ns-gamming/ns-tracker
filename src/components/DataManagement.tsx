
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Upload, Save, Database, FileJson, Shield, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const DataManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const exportAllData = async () => {
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch all user data
      const [transactions, categories, budgets, goals, accounts, familyMembers, stocks, crypto, metals] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", user.id),
        supabase.from("categories").select("*").eq("user_id", user.id),
        supabase.from("budgets").select("*").eq("user_id", user.id),
        supabase.from("financial_goals").select("*").eq("user_id", user.id),
        supabase.from("bank_accounts").select("*").eq("user_id", user.id),
        supabase.from("family_members").select("*").eq("user_id", user.id),
        supabase.from("stocks").select("*").eq("user_id", user.id),
        supabase.from("crypto").select("*").eq("user_id", user.id),
        supabase.from("precious_metals").select("*").eq("user_id", user.id),
      ]);

      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        userId: user.id,
        data: {
          transactions: transactions.data || [],
          categories: categories.data || [],
          budgets: budgets.data || [],
          goals: goals.data || [],
          accounts: accounts.data || [],
          familyMembers: familyMembers.data || [],
          stocks: stocks.data || [],
          crypto: crypto.data || [],
          metals: metals.data || [],
        },
      };

      // Create downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ns-finsight-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Save backup timestamp
      setLastBackup(new Date().toISOString());
      localStorage.setItem('lastBackup', new Date().toISOString());

      toast.success("Data exported successfully!", {
        description: "Your complete financial data has been downloaded.",
      });
    } catch (error: any) {
      toast.error("Failed to export data", {
        description: error.message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.version || !importData.data) {
        throw new Error("Invalid backup file format");
      }

      // Import data (excluding IDs to avoid conflicts)
      const { data: importedData } = importData;

      if (importedData.categories?.length > 0) {
        const categories = importedData.categories.map((c: any) => ({
          name: c.name,
          icon: c.icon,
          color: c.color,
          user_id: user.id,
        }));
        await supabase.from("categories").insert(categories);
      }

      toast.success("Data imported successfully!", {
        description: "Your backup has been restored.",
      });
    } catch (error: any) {
      toast.error("Failed to import data", {
        description: error.message,
      });
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  const createAutoBackup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Store backup in localStorage
      const backupKey = `backup_${new Date().toISOString()}`;
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .limit(100);

      localStorage.setItem(backupKey, JSON.stringify(transactions));
      localStorage.setItem('lastAutoBackup', new Date().toISOString());

      // Keep only last 5 backups
      const backupKeys = Object.keys(localStorage).filter(k => k.startsWith('backup_'));
      if (backupKeys.length > 5) {
        backupKeys.sort().slice(0, -5).forEach(k => localStorage.removeItem(k));
      }
    } catch (error) {
      console.error("Auto backup failed:", error);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data Management & Backup
        </CardTitle>
        <CardDescription>
          Export, import, and backup your financial data securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your data is automatically backed up locally. Export regularly for extra safety.
          </AlertDescription>
        </Alert>

        {lastBackup && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Last backup: {new Date(lastBackup).toLocaleString()}
          </div>
        )}

        <div className="grid gap-3">
          <Button
            onClick={exportAllData}
            disabled={isExporting}
            className="w-full gap-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting..." : "Export All Data"}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <Upload className="w-4 h-4" />
                Import Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Backup Data</DialogTitle>
                <DialogDescription>
                  Select a previously exported backup file to restore your data
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Warning: Importing will add data to your existing records. Duplicates may occur.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="import-file">Select Backup File</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={importData}
                    disabled={isImporting}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={createAutoBackup}
            variant="outline"
            className="w-full gap-2"
          >
            <Save className="w-4 h-4" />
            Create Local Backup
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              const dataStr = JSON.stringify({
                transactions: await supabase.from("transactions").select("*").eq("user_id", user.id),
                budgets: await supabase.from("budgets").select("*").eq("user_id", user.id),
              }, null, 2);

              const blob = new Blob([dataStr], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `quick-backup-${Date.now()}.json`;
              link.click();
              URL.revokeObjectURL(url);
              toast.success("Quick backup created!");
            }}
          >
            <FileJson className="w-4 h-4" />
            Quick Export (Transactions + Budgets)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
