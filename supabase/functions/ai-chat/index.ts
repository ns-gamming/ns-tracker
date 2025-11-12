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
    const { message, conversationId } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Get conversation history
    let convId = conversationId;
    if (!convId) {
      const { data: newConv, error: convError } = await supabase
        .from("chat_conversations")
        .insert({ user_id: user.id })
        .select()
        .single();
      
      if (convError) throw convError;
      convId = newConv.id;
    }

    // Save user message
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: "user",
      content: message,
    });

    // Get all messages for context
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    // Fetch comprehensive financial context
    const { data: transactions } = await supabase
      .from("transactions")
      .select(`
        *,
        category:categories(name, slug),
        family_member:family_members(name, relationship)
      `)
      .eq("user_id", user.id)
      .order("timestamp", { ascending: false })
      .limit(200);

    const { data: accounts } = await supabase.from("accounts").select("*").eq("user_id", user.id);
    const { data: budgets } = await supabase.from("budgets").select("*").eq("user_id", user.id);
    const { data: goals } = await supabase.from("goals").select("*").eq("user_id", user.id);
    const { data: familyMembers } = await supabase.from("family_members").select("*").eq("user_id", user.id);
    const { data: stocks } = await supabase.from("stocks").select("*").eq("user_id", user.id);
    const { data: crypto } = await supabase.from("crypto").select("*").eq("user_id", user.id);
    const { data: preciousMetals } = await supabase.from("precious_metals").select("*").eq("user_id", user.id);
    const { data: orders } = await supabase.from("orders").select("*").eq("user_id", user.id);
    const { data: achievements } = await supabase.from("achievements").select("*").eq("user_id", user.id);

    // Calculate financial summary
    const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const netWorth = accounts?.reduce((sum, a) => sum + Number(a.balance), 0) || 0;
    const stockValue = stocks?.reduce((sum, s) => sum + (Number(s.quantity) * Number(s.current_price || s.purchase_price)), 0) || 0;
    const cryptoValue = crypto?.reduce((sum, c) => sum + (Number(c.quantity) * Number(c.current_price || c.purchase_price)), 0) || 0;
    const metalValue = preciousMetals?.reduce((sum, m) => sum + (Number(m.quantity) * Number(m.current_price || m.purchase_price)), 0) || 0;

    // Detect language from user message
    const detectLanguage = (text: string) => {
      // Simple detection for Bengali (Bangla) characters
      const bengaliRegex = /[\u0980-\u09FF]/;
      return bengaliRegex.test(text) ? 'bn' : 'en';
    };

    const userLanguage = detectLanguage(message);
    
    const systemPrompt = `You are an expert AI financial advisor with comprehensive access to the user's complete financial portfolio.

LANGUAGE INSTRUCTION: The user is communicating in ${userLanguage === 'bn' ? 'Bengali/Bangla' : 'English'}. You MUST respond in the SAME language the user is using. Match their language exactly - if they write in Bengali, respond in Bengali; if in English, respond in English.

COMPLETE FINANCIAL SNAPSHOT:
📊 Net Worth: ₹${netWorth.toFixed(2)}
💰 Total Income: ₹${totalIncome.toFixed(2)}
💸 Total Expenses: ₹${totalExpenses.toFixed(2)}
📈 Investments: Stocks (₹${stockValue.toFixed(2)}), Crypto (₹${cryptoValue.toFixed(2)}), Metals (₹${metalValue.toFixed(2)})

DETAILED DATA ACCESS:
- ${transactions?.length || 0} transactions with full category and family member details
- ${accounts?.length || 0} accounts with current balances
- ${stocks?.length || 0} stock holdings
- ${crypto?.length || 0} crypto assets
- ${preciousMetals?.length || 0} precious metal investments
- ${orders?.length || 0} tracked orders
- ${budgets?.length || 0} active budgets
- ${goals?.length || 0} financial goals
- ${familyMembers?.length || 0} family members
- ${achievements?.length || 0} achievements earned

CAPABILITIES:
✓ Analyze spending patterns by category and family member
✓ Provide investment portfolio analysis
✓ Calculate savings rate and financial health metrics
✓ Suggest budget optimizations
✓ Track progress toward goals
✓ Give personalized advice based on actual data
✓ Identify unusual spending or opportunities

PERSONALITY:
- Be warm, friendly, and encouraging
- Use conversational, human-like language
- Give specific examples from their data
- Break down complex concepts simply
- Celebrate their wins and achievements
- Provide actionable, practical advice

Always provide specific, data-driven advice with exact amounts and actionable steps.
Reference actual transactions and patterns from the user's data.
Be encouraging about achievements and constructive about improvements.
REMEMBER: Respond in the same language as the user's message!`;

    // Call Gemini API
    const geminiMessages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...messages!.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();
    const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to help with your finances. Could you rephrase that?";

    // Save assistant response
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: assistantMessage,
    });

    return new Response(
      JSON.stringify({ 
        message: assistantMessage, 
        conversationId: convId 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in ai-chat:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
