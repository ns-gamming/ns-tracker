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

    const [transactions, budgets, goals, family] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", user.id).order("timestamp", { ascending: false }).limit(100),
      supabase.from("budgets").select("*").eq("user_id", user.id),
      supabase.from("goals").select("*").eq("user_id", user.id),
      supabase.from("family_members").select("id, name, is_alive").eq("user_id", user.id),
    ]);

    const systemPrompt = `You are a helpful financial advisor assistant. You have access to the user's financial data and can provide personalized advice.

Current Financial Context:
- Recent Transactions: ${transactions.data?.length || 0} items (last 100)
- Active Budgets: ${budgets.data?.length || 0} budgets
- Financial Goals: ${goals.data?.length || 0} goals
- Family Members: ${family.data?.length || 0} members

Instructions:
- Analyze spending and income patterns, calculate savings rate, and identify overspending categories.
- Consider family_member_id on transactions to attribute expenses/income to the correct person; provide per-person tips.
- Provide concise, practical, and actionable advice with simple calculations when useful.`;

    // Call Gemini API
    const geminiMessages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...messages!.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
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
