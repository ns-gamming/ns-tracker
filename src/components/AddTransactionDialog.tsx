import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, Plus, ChevronDown,
  Package, Utensils, Home, Car, Briefcase, Gamepad2, Hospital, Plane,
  ShoppingCart, Coins, Book, Music, Film, Activity, Pill, GraduationCap,
  TrendingUp, TrendingDown, Landmark, MapPin, Upload, Flag, Lightbulb,
  Building2, Wallet, Bitcoin, CreditCard, Banknote
} from "lucide-react";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Category { id: string; name: string; color?: string; icon?: string; category_type?: string }
interface Member { id: string; name: string; is_alive: boolean }

const iconMap: Record<string, any> = {
  Package, Utensils, Home, Car, Briefcase, Gamepad2, Hospital, Plane,
  ShoppingCart, Coins, Book, Music, Film, Activity, Pill, GraduationCap,
  TrendingUp, TrendingDown, Landmark
};

const getIconComponent = (iconName?: string) => {
  if (!iconName) return Package;
  return iconMap[iconName] || Package;
};

export const AddTransactionDialog = ({ open, onOpenChange, onSuccess }: AddTransactionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    icon: "Package",
    color: "#3b82f6",
  });
  const [aiSuggestions, setAiSuggestions] = useState<{
    merchant: string;
    notes: string;
    averageAmount: number;
  } | null>(null);
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    currency: "INR",
    merchant: "",
    notes: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category_id: "",
    family_member_id: "",
    payment_source: "",
    is_flagged: false,
    flag_reason: "",
    tags: "",
    location: "",
    receipt_url: "",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'USDT': return '₮';
      case 'INR': default: return '₹';
    }
  };

  const quickAmounts = [50, 100, 500, 1000, 2000, 5000];

  const handleQuickAmount = (amount: number) => {
    setFormData({ ...formData, amount: amount.toString() });
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      toast.success("Receipt uploaded (feature coming soon)");
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          setFormData({ ...formData, location });
          toast.success("Location added");
        },
        () => toast.error("Could not get location")
      );
    }
  };

  // Filter categories based on category_type, fallback to showing all if none match
  const filteredCategories = categories.filter(cat => {
    if (!cat.category_type) return false;
    return cat.category_type === formData.type;
  });

  // If no categories match the type, show all categories as fallback
  const displayCategories = filteredCategories.length > 0 ? filteredCategories : categories;

  useEffect(() => {
    const load = async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;
      const [{ data: cats }, { data: mems }] = await Promise.all([
        supabase.from("categories").select("id, name, color, icon, category_type").or(`user_id.eq.${userId},user_id.is.null`),
        supabase.from("family_members").select("id, name, is_alive").eq("user_id", userId),
      ]);
      setCategories(cats || []);
      setMembers((mems || []).filter(m => m.is_alive));
    };
    if (open) load();
  }, [open]);

  // Fetch AI suggestions when category changes
  useEffect(() => {
    if (formData.category_id && formData.category_id !== "") {
      fetchAiSuggestions();
    }
  }, [formData.category_id]);

  const fetchAiSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-suggest-transaction", {
        body: { categoryId: formData.category_id },
      });

      if (error) throw error;
      setAiSuggestions(data);

      // Auto-fill if fields are empty and user preferences allow (opt-in)
      const userPrefsOptIn = true; // Can be fetched from user preferences
      if (userPrefsOptIn) {
        if (data.merchant && !formData.merchant) {
          setFormData((prev) => ({ ...prev, merchant: data.merchant }));
          toast.success("AI suggested merchant filled!", { duration: 2000 });
        }
        if (data.notes && !formData.notes) {
          setFormData((prev) => ({ ...prev, notes: data.notes }));
        }
        if (data.averageAmount && !formData.amount) {
          setFormData((prev) => ({ ...prev, amount: data.averageAmount.toString() }));
        }
      }
    } catch (error: any) {
      console.error("AI suggestions error:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const createNewCategory = async () => {
    if (!newCategoryData.name) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const slug = newCategoryData.name.toLowerCase().replace(/\s+/g, "_");
      const categoryData = {
        name: newCategoryData.name,
        slug,
        icon: newCategoryData.icon,
        color: newCategoryData.color,
        category_type: formData.type,
        user_id: user.id,
        is_default: false,
      };

      const { data, error } = await supabase.from("categories").insert(categoryData).select().single();

      if (error) throw error;

      toast.success("Category created successfully!");
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (userId) {
        const { data: cats } = await supabase.from("categories").select("id, name, color, icon, category_type").or(`user_id.eq.${userId},user_id.is.null`);
        setCategories(cats || []);
      }

      setFormData({ ...formData, category_id: data.id });
      setNewCategoryData({ name: "", icon: "Package", color: "#3b82f6" });
      setShowCreateCategory(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create category");
    }
  };

  const iconOptions = [
    { name: "Package", icon: Package },
    { name: "Utensils", icon: Utensils },
    { name: "Home", icon: Home },
    { name: "Car", icon: Car },
    { name: "Briefcase", icon: Briefcase },
    { name: "Gamepad2", icon: Gamepad2 },
    { name: "Hospital", icon: Hospital },
    { name: "Plane", icon: Plane },
    { name: "ShoppingCart", icon: ShoppingCart },
    { name: "Coins", icon: Coins },
    { name: "Book", icon: Book },
    { name: "Music", icon: Music },
    { name: "Film", icon: Film },
    { name: "Activity", icon: Activity },
    { name: "Pill", icon: Pill },
    { name: "GraduationCap", icon: GraduationCap }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const amountNum = parseFloat(formData.amount);
    if (!amountNum || amountNum <= 0 || isNaN(amountNum)) {
      toast.error("Please enter a valid amount greater than zero");
      return;
    }

    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("transactions", {
        body: {
          type: formData.type,
          amount: amountNum,
          merchant: formData.merchant || "Unknown",
          notes: formData.notes || null,
          description: formData.description || null,
          currency: formData.currency,
          timestamp: new Date(formData.date).toISOString(),
          category_id: formData.category_id || null,
          family_member_id: formData.family_member_id && formData.family_member_id !== "none" ? formData.family_member_id : null,
          payment_source: formData.payment_source && formData.payment_source !== "none" ? formData.payment_source : null,
          is_flagged: formData.is_flagged,
          flag_reason: formData.is_flagged ? formData.flag_reason : null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        },
      });

      if (error) {
        console.error("Transaction error:", error);
        throw error;
      }

      toast.success("Transaction added successfully");
      setFormData({
        type: "expense",
        amount: "",
        currency: "INR",
        merchant: "",
        notes: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        category_id: "",
        family_member_id: "",
        payment_source: "",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto animate-enter backdrop-blur-sm p-4 sm:p-6">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Add Transaction
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Record a new transaction - income, expense, or savings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">Transaction Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value, category_id: "" })}>
                <SelectTrigger className="transition-all hover:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Income
                    </span>
                  </SelectItem>
                  <SelectItem value="expense">
                    <span className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Expense
                    </span>
                  </SelectItem>
                  <SelectItem value="savings">
                    <span className="flex items-center gap-2">
                      <Landmark className="w-4 h-4" />
                      Savings
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.type === "income" ? "Money coming in" : formData.type === "savings" ? "Money saved" : "Money spent"}
              </p>
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
                  <SelectItem value="USDT">USDT (₮)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({getCurrencySymbol(formData.currency)})</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="text-lg font-semibold"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {quickAmounts.map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(amt)}
                    className="text-xs"
                  >
                    {getCurrencySymbol(formData.currency)}{amt}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category {formData.type && `(${formData.type} categories)`}
              </Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger className="h-11 bg-background border-border transition-all hover:border-primary">
                  <SelectValue placeholder={`Select ${formData.type} category`} />
                </SelectTrigger>
                <SelectContent 
                  className="max-h-[60vh] overflow-y-auto bg-popover border-border z-[100]"
                  position="popper"
                  sideOffset={4}
                >
                  {displayCategories.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading categories...
                    </div>
                  ) : (
                    <div className="p-1">
                      {displayCategories.map((c) => (
                        <SelectItem 
                          key={c.id} 
                          value={c.id} 
                          className="cursor-pointer hover:bg-accent focus:bg-accent rounded-md my-0.5 h-10 flex items-center transition-all"
                        >
                          <span className="flex items-center gap-2">
                            {c.icon && (() => {
                              const IconComponent = getIconComponent(c.icon);
                              return <IconComponent className="w-4 h-4" />;
                            })()}
                            <span className="text-base">{c.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {formData.category_id === "" && (
                <p className="text-xs text-muted-foreground animate-fade-in flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Tip: Choose a category that best matches this {formData.type}
                </p>
              )}

              <Collapsible open={showCreateCategory} onOpenChange={setShowCreateCategory}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 video-smooth"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {showCreateCategory ? "Cancel" : "Create New Category"}
                    <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showCreateCategory ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 animate-fade-in">
                  <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                    <div>
                      <Label htmlFor="new-category-name">Category Name</Label>
                      <Input
                        id="new-category-name"
                        value={newCategoryData.name}
                        onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                        placeholder="e.g., Groceries, Entertainment"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="new-category-icon">Icon</Label>
                        <Select 
                          value={newCategoryData.icon} 
                          onValueChange={(value) => setNewCategoryData({ ...newCategoryData, icon: value })}
                        >
                          <SelectTrigger id="new-category-icon" className="mt-1">
                            <SelectValue>
                              {(() => {
                                const IconComponent = getIconComponent(newCategoryData.icon);
                                return (
                                  <span className="flex items-center gap-2">
                                    <IconComponent className="w-4 h-4" />
                                    {newCategoryData.icon}
                                  </span>
                                );
                              })()}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map((option) => (
                              <SelectItem key={option.name} value={option.name}>
                                <span className="flex items-center gap-2">
                                  <option.icon className="w-4 h-4" />
                                  {option.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="new-category-color">Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            id="new-category-color"
                            value={newCategoryData.color}
                            onChange={(e) => setNewCategoryData({ ...newCategoryData, color: e.target.value })}
                            className="w-16 h-9 p-1 cursor-pointer"
                          />
                          <Input
                            value={newCategoryData.color}
                            onChange={(e) => setNewCategoryData({ ...newCategoryData, color: e.target.value })}
                            placeholder="#3b82f6"
                            className="flex-1 h-9"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={createNewCategory}
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Category
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      This category will be created as "{formData.type}" type
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <div className="space-y-2">
              <Label htmlFor="member">Family Member (Optional)</Label>
              <Select value={formData.family_member_id} onValueChange={(value) => setFormData({ ...formData, family_member_id: value })}>
                <SelectTrigger className="h-11 bg-background border-border">
                  <SelectValue placeholder="Select family member (optional)" />
                </SelectTrigger>
                <SelectContent 
                  className="max-h-[40vh] overflow-y-auto bg-popover border-border"
                  position="popper"
                  sideOffset={4}
                >
                  {members.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No family members added yet
                    </div>
                  ) : (
                    <div className="p-1">
                      <SelectItem value="none" className="cursor-pointer hover:bg-accent focus:bg-accent rounded-md my-0.5 h-10">
                        <span className="text-muted-foreground">None (Personal)</span>
                      </SelectItem>
                      {members.map((m) => (
                        <SelectItem 
                          key={m.id} 
                          value={m.id}
                          className="cursor-pointer hover:bg-accent focus:bg-accent rounded-md my-0.5 h-10"
                        >
                          {m.name}
                        </SelectItem>
                      ))}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant" className="flex items-center gap-2">
                Merchant/Source (Optional)
                {loadingSuggestions && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
              </Label>
              <Input
                id="merchant"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                placeholder="e.g., Salary, Grocery Store"
                className="transition-all"
              />
              {aiSuggestions && formData.merchant === aiSuggestions.merchant && (
                <p className="text-xs text-primary animate-fade-in flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  AI suggested based on your history
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_source">Payment Source (Optional)</Label>
              <Select value={formData.payment_source} onValueChange={(value) => setFormData({ ...formData, payment_source: value })}>
                <SelectTrigger className="h-11 bg-background border-border">
                  <SelectValue placeholder="Select payment source" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-[100]">
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="bank">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Bank Account
                    </span>
                  </SelectItem>
                  <SelectItem value="wallet">
                    <span className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Wallet
                    </span>
                  </SelectItem>
                  <SelectItem value="binance">
                    <span className="flex items-center gap-2">
                      <Bitcoin className="w-4 h-4" />
                      Binance
                    </span>
                  </SelectItem>
                  <SelectItem value="paypal">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      PayPal
                    </span>
                  </SelectItem>
                  <SelectItem value="crypto_wallet">
                    <span className="flex items-center gap-2">
                      <Bitcoin className="w-4 h-4" />
                      Crypto Wallet
                    </span>
                  </SelectItem>
                  <SelectItem value="cash">
                    <span className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" />
                      Cash
                    </span>
                  </SelectItem>
                  <SelectItem value="other">
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Other
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Why this transaction? How was the money earned/spent?"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any other details..."
              className="min-h-[60px]"
            />
          </div>

          <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_flagged"
                checked={formData.is_flagged}
                onChange={(e) => setFormData({ ...formData, is_flagged: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="is_flagged" className="cursor-pointer flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Flag this transaction for review
              </Label>
            </div>
            
            {formData.is_flagged && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="flag_reason">Flag Reason</Label>
                <Input
                  id="flag_reason"
                  value={formData.flag_reason}
                  onChange={(e) => setFormData({ ...formData, flag_reason: e.target.value })}
                  placeholder="e.g., Needs receipt, Verify amount, Tax deductible"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated, optional)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., urgent, recurring, business"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Add location manually or use GPS"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={getCurrentLocation}
                  title="Use current location"
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt Upload (optional)</Label>
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={handleReceiptUpload}
                className="cursor-pointer"
              />
              {receiptFile && (
                <p className="text-xs text-success">✓ {receiptFile.name}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};