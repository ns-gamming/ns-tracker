import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Plus, DollarSign, Calendar, Check, X, AlertCircle } from "lucide-react";

interface Bill {
  id: string;
  bill_name: string;
  amount: number;
  currency: string;
  due_date: string;
  category: string;
  frequency: string;
  status: string;
  reminder_days_before: number;
  merchant?: string;
  notes?: string;
  payment_method?: string;
}

export const BillReminders = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    bill_name: "",
    amount: "",
    currency: "INR",
    due_date: "",
    category: "utilities",
    frequency: "monthly",
    reminder_days_before: "3",
    merchant: "",
    notes: "",
    payment_method: "",
  });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });

      if (error) throw error;
      
      // Update overdue bills
      const today = new Date().toISOString().split("T")[0];
      const updatedBills = data?.map(bill => {
        if (bill.due_date < today && bill.status === 'pending') {
          return { ...bill, status: 'overdue' };
        }
        return bill;
      }) || [];

      setBills(updatedBills);
    } catch (error: any) {
      console.error("Fetch bills error:", error);
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("bills").insert({
        user_id: user.id,
        bill_name: formData.bill_name,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        due_date: formData.due_date,
        category: formData.category,
        frequency: formData.frequency,
        reminder_days_before: parseInt(formData.reminder_days_before),
        merchant: formData.merchant || null,
        notes: formData.notes || null,
        payment_method: formData.payment_method || null,
      });

      if (error) throw error;

      toast.success("Bill reminder added!");
      setShowAddDialog(false);
      setFormData({
        bill_name: "",
        amount: "",
        currency: "INR",
        due_date: "",
        category: "utilities",
        frequency: "monthly",
        reminder_days_before: "3",
        merchant: "",
        notes: "",
        payment_method: "",
      });
      fetchBills();
    } catch (error: any) {
      toast.error(error.message || "Failed to add bill");
    }
  };

  const markAsPaid = async (billId: string) => {
    try {
      const { error } = await supabase
        .from("bills")
        .update({ 
          status: "paid",
          last_paid_date: new Date().toISOString().split("T")[0]
        })
        .eq("id", billId);

      if (error) throw error;
      toast.success("Bill marked as paid!");
      fetchBills();
    } catch (error: any) {
      toast.error("Failed to update bill");
    }
  };

  const deleteBill = async (billId: string) => {
    try {
      const { error } = await supabase
        .from("bills")
        .delete()
        .eq("id", billId);

      if (error) throw error;
      toast.success("Bill reminder deleted!");
      fetchBills();
    } catch (error: any) {
      toast.error("Failed to delete bill");
    }
  };

  const getStatusColor = (status: string, dueDate: string) => {
    const today = new Date().toISOString().split("T")[0];
    const daysDiff = Math.ceil((new Date(dueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));

    if (status === "paid") return "bg-success/10 text-success border-success/30";
    if (status === "overdue") return "bg-destructive/10 text-destructive border-destructive/30";
    if (daysDiff <= 3) return "bg-warning/10 text-warning border-warning/30";
    return "bg-primary/10 text-primary border-primary/30";
  };

  const getStatusIcon = (status: string) => {
    if (status === "paid") return <Check className="w-4 h-4" />;
    if (status === "overdue") return <AlertCircle className="w-4 h-4" />;
    return <Bell className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Bill Payment Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Bill Payment Reminders
          </CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Bill Reminder</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bill_name">Bill Name</Label>
                  <Input
                    id="bill_name"
                    required
                    value={formData.bill_name}
                    onChange={(e) => setFormData({ ...formData, bill_name: e.target.value })}
                    placeholder="e.g., Electricity Bill"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      required
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="loan">Loan/EMI</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminder_days">Remind (days before)</Label>
                    <Input
                      id="reminder_days"
                      type="number"
                      required
                      value={formData.reminder_days_before}
                      onChange={(e) => setFormData({ ...formData, reminder_days_before: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant (optional)</Label>
                  <Input
                    id="merchant"
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    placeholder="e.g., Electric Company"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes..."
                    className="min-h-[60px]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Bill
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {bills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No bill reminders yet</p>
            <p className="text-sm">Add your first bill reminder to track payments</p>
          </div>
        ) : (
          bills.map((bill) => {
            const today = new Date().toISOString().split("T")[0];
            const daysDiff = Math.ceil((new Date(bill.due_date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div
                key={bill.id}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-300 animate-slide-in-right"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getStatusColor(bill.status, bill.due_date)}`}>
                    {getStatusIcon(bill.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-medium">{bill.bill_name}</h4>
                        {bill.merchant && (
                          <p className="text-xs text-muted-foreground">{bill.merchant}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={getStatusColor(bill.status, bill.due_date)}>
                        {bill.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm mb-2">
                      <span className="flex items-center gap-1 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        {bill.currency === "INR" ? "₹" : bill.currency === "USD" ? "$" : "€"}
                        {bill.amount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(bill.due_date).toLocaleDateString()}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-muted">
                        {bill.frequency}
                      </span>
                    </div>
                    {daysDiff <= bill.reminder_days_before && daysDiff >= 0 && bill.status === "pending" && (
                      <p className="text-xs text-warning mb-2">
                        ⚠️ Due in {daysDiff} day{daysDiff !== 1 ? "s" : ""}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      {bill.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => markAsPaid(bill.id)} className="gap-1">
                          <Check className="w-3 h-3" />
                          Mark Paid
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => deleteBill(bill.id)} className="gap-1 text-destructive hover:text-destructive">
                        <X className="w-3 h-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
