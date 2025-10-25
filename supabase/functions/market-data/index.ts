import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols, type } = await req.json(); // type: 'stock' or 'crypto'
    
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Use free API for prices
    const prices: Record<string, number> = {};
    
    if (type === "crypto") {
      // Use CoinGecko free API
      for (const symbol of symbols) {
        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`
          );
          const data = await response.json();
          prices[symbol] = data[symbol.toLowerCase()]?.usd || 0;
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
          prices[symbol] = 0;
        }
      }
    } else if (type === "stock") {
      // For stocks, return mock data (free stock APIs have rate limits)
      for (const symbol of symbols) {
        prices[symbol] = Math.random() * 1000; // Mock price
      }
    }

    return new Response(
      JSON.stringify({ prices }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in market-data:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
