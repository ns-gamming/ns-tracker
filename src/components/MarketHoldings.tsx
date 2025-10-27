import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Stock { id: string; symbol: string; name: string; quantity: number; purchase_price: number; currency: string; current_price?: number }
interface Crypto { id: string; symbol: string; name: string; quantity: number; purchase_price: number; currency: string; current_price?: number }

export const MarketHoldings = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [crypto, setCrypto] = useState<Crypto[]>([]);
  const [adding, setAdding] = useState<{ type: 'stock' | 'crypto' | null }>({ type: null });
  const [form, setForm] = useState({ type: 'stock' as 'stock' | 'crypto', symbol: '', name: '', quantity: '', purchase_price: '', currency: 'USD' });
  const [prices, setPrices] = useState<Record<string, number>>({});

  const load = async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;
    const [{ data: s }, { data: c }] = await Promise.all([
      supabase.from('stocks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('crypto').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);
    setStocks((s || []) as any);
    setCrypto((c || []) as any);
    fetchPrices(s || [], c || []);
  };

  const fetchPrices = async (stocksList?: Stock[], cryptoList?: Crypto[]) => {
    const s = stocksList || stocks;
    const c = cryptoList || crypto;

    if (s.length > 0) {
      try {
        const { data } = await supabase.functions.invoke("market-data", {
          body: { symbols: s.map((stock) => stock.symbol), type: "stock" },
        });
        if (data?.prices) {
          setPrices((prev) => ({ ...prev, ...data.prices }));
          // Update database with current prices
          s.forEach(async (stock) => {
            if (data.prices[stock.symbol]) {
              await supabase.from("stocks").update({ current_price: data.prices[stock.symbol] }).eq("id", stock.id);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching stock prices:", error);
      }
    }

    if (c.length > 0) {
      try {
        const { data } = await supabase.functions.invoke("market-data", {
          body: { symbols: c.map((coin) => coin.symbol), type: "crypto" },
        });
        if (data?.prices) {
          setPrices((prev) => ({ ...prev, ...data.prices }));
          // Update database with current prices
          c.forEach(async (coin) => {
            if (data.prices[coin.symbol]) {
              await supabase.from("crypto").update({ current_price: data.prices[coin.symbol] }).eq("id", coin.id);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching crypto prices:", error);
      }
    }
  };

  useEffect(() => {
    load();
    // Real-time price updates every 30 seconds
    const interval = setInterval(() => fetchPrices(), 30000);
    return () => clearInterval(interval);
  }, []);

  const addHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;
    try {
      if (form.type === 'stock') {
        const { error } = await supabase.from('stocks').insert({
          user_id: userId,
          symbol: form.symbol.toUpperCase(),
          name: form.name,
          quantity: Number(form.quantity),
          purchase_price: Number(form.purchase_price),
          currency: form.currency,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('crypto').insert({
          user_id: userId,
          symbol: form.symbol.toUpperCase(),
          name: form.name,
          quantity: Number(form.quantity),
          purchase_price: Number(form.purchase_price),
          currency: form.currency,
        });
        if (error) throw error;
      }
      toast.success('Added successfully');
      setAdding({ type: null });
      setForm({ type: 'stock', symbol: '', name: '', quantity: '', purchase_price: '', currency: 'USD' });
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to add');
    }
  };

  const renderList = (title: string, items: any[], type: 'stock' | 'crypto') => (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Your {title.toLowerCase()} holdings</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setAdding({ type })}>Add</Button>
        </div>
      </CardHeader>
      <CardContent>
        {adding.type === type && (
          <form onSubmit={addHolding} className="grid sm:grid-cols-5 gap-3 mb-4 animate-enter">
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Symbol</Label>
              <Input required value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="e.g., AAPL / BTC" />
            </div>
            <div className="space-y-1">
              <Label>Name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Company / Coin" />
            </div>
            <div className="space-y-1">
              <Label>Qty</Label>
              <Input required type="number" step="0.0001" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Buy Price</Label>
              <Input required type="number" step="0.01" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-5 flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setAdding({ type: null })}>Cancel</Button>
            </div>
          </form>
        )}
        <div className="grid gap-3">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">No holdings yet.</p>
          )}
          {items.map((it: any) => {
            const price = prices[it.symbol?.toUpperCase()] ?? it.current_price ?? null;
            const currentValue = price ? Number(price) * Number(it.quantity) : null;
            const invested = Number(it.purchase_price) * Number(it.quantity);
            const pnl = currentValue !== null ? currentValue - invested : null;
            const currencySymbol = it.currency === "INR" ? "₹" : it.currency === "USD" ? "$" : "€";
            return (
              <div key={it.id} className="p-3 rounded-lg border border-border bg-card/50 flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.symbol} • {it.name}</div>
                  <div className="text-xs text-muted-foreground">Qty {Number(it.quantity)} @ {currencySymbol}{Number(it.purchase_price).toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Price: {price ? `${currencySymbol}${Number(price).toFixed(2)}` : '—'}</div>
                  <div className={`text-sm ${pnl !== null ? (pnl >= 0 ? 'text-success' : 'text-destructive') : ''}`}>
                    {pnl !== null ? `PnL: ${currencySymbol}${pnl.toFixed(2)}` : 'PnL: —'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {renderList('Stocks', stocks, 'stock')}
      {renderList('Crypto', crypto, 'crypto')}
    </div>
  );
};
