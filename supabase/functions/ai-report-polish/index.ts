import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { diagnosis_notes, observations, prescription_notes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Polish the following dermatology report into a clean, professional summary:

Skin Condition Diagnosis: ${diagnosis_notes || "Not provided"}
Examination Findings: ${observations || "Not provided"}
Treatment/Prescription Notes: ${prescription_notes || "Not provided"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a dermatology report formatting assistant. Polish and structure dermatological clinical notes into a clean, professional dermatology report summary. Focus on skin condition descriptions, lesion characteristics, differential diagnoses, and treatment plans. Be concise and accurate. Do not add information not present in the original notes.",
          },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "polished_report",
            description: "Return a polished dermatology report summary",
            parameters: {
              type: "object",
              properties: {
                summary: {
                  type: "string",
                  description: "Clean dermatology summary paragraph",
                },
                diagnosis_points: {
                  type: "array",
                  items: { type: "string" },
                  description: "Bullet-point skin condition diagnosis overview",
                },
                key_observations: {
                  type: "array",
                  items: { type: "string" },
                  description: "Key dermatological examination observations",
                },
              },
              required: ["summary", "diagnosis_points"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "polished_report" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error: " + response.status);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    let parsed = { summary: "", diagnosis_points: [], key_observations: [] };

    if (toolCall?.function?.arguments) {
      try { parsed = JSON.parse(toolCall.function.arguments); } catch {}
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-report-polish error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
