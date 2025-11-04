import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Plus, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WalletAccount {
  id: string;
  account_name: string;
  account_type: string;
  balance: number;
  currency?: string;
  provider?: string;
}

export const WalletManagement = () => {
  const [wallets, setWallets] = useState<WalletAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletAccount | null>(null);
  const [deleteWallet, setDeleteWallet] = useState<WalletAccount | null>(null);
  
  const [formData, setFormData] = useState({
    account_name: "",
    account_type: "checking",
    balance: "",
    currency: "INR",
    provider: "",
  });

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error("Error loading wallets:", error);
      toast.error("Failed to load wallets");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingWallet) {
        const { error } = await supabase
          .from("accounts")
          .update({
            account_name: formData.account_name,
            account_type: formData.account_type,
            balance: parseFloat(formData.balance),
            currency: formData.currency,
            provider: formData.provider,
          })
          .eq("id", editingWallet.id);

        if (error) throw error;
        toast.success("Wallet updated successfully! 💰");
      } else {
        const { error } = await supabase
          .from("accounts")
          .insert({
            user_id: user.id,
            account_name: formData.account_name,
            account_type: formData.account_type,
            balance: parseFloat(formData.balance),
            currency: formData.currency,
            provider: formData.provider,
          });

        if (error) throw error;
        toast.success("Wallet added successfully! ✨");
      }

      setShowDialog(false);
      setEditingWallet(null);
      setFormData({
        account_name: "",
        account_type: "checking",
        balance: "",
        currency: "INR",
        provider: "",
      });
      loadWallets();
    } catch (error) {
      console.error("Error saving wallet:", error);
      toast.error("Failed to save wallet");
    }
  };

  const handleEdit = (wallet: WalletAccount) => {
    setEditingWallet(wallet);
    setFormData({
      account_name: wallet.account_name,
      account_type: wallet.account_type,
      balance: wallet.balance.toString(),
      currency: wallet.currency || "INR",
      provider: wallet.provider || "",
    });
    setShowDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteWallet) return;
    
    try {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", deleteWallet.id);

      if (error) throw error;
      
      toast.success("Wallet deleted successfully");
      setDeleteWallet(null);
      loadWallets();
    } catch (error) {
      console.error("Error deleting wallet:", error);
      toast.error("Failed to delete wallet");
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
      USDT: "₮",
    };
    return symbols[currency] || currency;
  };

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Wallets
              </CardTitle>
              <CardDescription>Manage your accounts and balances</CardDescription>
            </div>
            <Dialog open={showDialog} onOpenChange={(open) => {
              setShowDialog(open);
              if (!open) {
                setEditingWallet(null);
                setFormData({
                  account_name: "",
                  account_type: "checking",
                  balance: "",
                  currency: "INR",
                  provider: "",
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingWallet ? "Edit Wallet" : "Add New Wallet"}</DialogTitle>
                  <DialogDescription>
                    {editingWallet ? "Update your wallet details" : "Create a new wallet to track your finances"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="account_name">Wallet Name</Label>
                    <Input
                      id="account_name"
                      value={formData.account_name}
                      onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                      placeholder="e.g., Main Checking"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="account_type">Account Type</Label>
                    <Select value={formData.account_type} onValueChange={(value) => setFormData({ ...formData, account_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="credit">Credit Card</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="balance">Balance</Label>
                      <Input
                        id="balance"
                        type="number"
                        step="0.01"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">₹ INR</SelectItem>
                          <SelectItem value="USD">$ USD</SelectItem>
                          <SelectItem value="EUR">€ EUR</SelectItem>
                          <SelectItem value="GBP">£ GBP</SelectItem>
                          <SelectItem value="USDT">₮ USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="provider">Bank/Provider (Optional)</Label>
                    <Input
                      id="provider"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      placeholder="e.g., HDFC Bank"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingWallet ? "Update Wallet" : "Add Wallet"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading wallets...</div>
          ) : wallets.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No wallets yet — add your first one!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm hover:shadow-medium transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold">{wallet.account_name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{wallet.account_type}</p>
                      {wallet.provider && (
                        <p className="text-xs text-muted-foreground mt-1">{wallet.provider}</p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleEdit(wallet)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteWallet(wallet)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {getCurrencySymbol(wallet.currency || "INR")}{Number(wallet.balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteWallet} onOpenChange={(open) => !open && setDeleteWallet(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete?</AlertDialogTitle>
            <AlertDialogDescription>
              Your balance will be cleared. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete Wallet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
