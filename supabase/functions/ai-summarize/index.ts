import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { patient_id, record_id, text, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = type === "record"
      ? "You are a medical documentation assistant. Analyze the provided medical record and extract structured findings. Be medically neutral. Do not prescribe treatment. Return structured JSON via the tool call."
      : "You are a medical documentation assistant. Summarize the provided previous diagnosis into concise bullet points. Be medically neutral. Do not prescribe treatment. Return structured JSON via the tool call.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        tools: [{
          type: "function",
          function: {
            name: "medical_summary",
            description: "Return a structured medical summary",
            parameters: {
              type: "object",
              properties: {
                summary_points: {
                  type: "array",
                  items: { type: "string" },
                  description: "3-5 concise bullet points summarizing key findings",
                },
                risk_level: {
                  type: "string",
                  enum: ["low", "medium", "high", "critical"],
                  description: "Overall risk assessment",
                },
                recommended_tests: {
                  type: "array",
                  items: { type: "string" },
                  description: "Suggested diagnostic tests if applicable",
                },
                context_notes: {
                  type: "string",
                  description: "Brief contextual notes about the condition",
                },
              },
              required: ["summary_points", "risk_level"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "medical_summary" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error: " + response.status);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    let parsed = { summary_points: [], risk_level: "low", recommended_tests: [], context_notes: "" };

    if (toolCall?.function?.arguments) {
      try {
        parsed = JSON.parse(toolCall.function.arguments);
      } catch {
        console.error("Failed to parse tool call arguments");
      }
    }

    // Store in ai_summaries table
    if (patient_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("ai_summaries").insert({
        patient_id,
        record_id: record_id || null,
        summary_points: parsed.summary_points,
        risk_level: parsed.risk_level,
        recommended_tests: parsed.recommended_tests,
        context_notes: parsed.context_notes,
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-summarize error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
