import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { patient_name, symptoms, previous_diagnosis, medical_history } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Patient: ${patient_name || "Unknown"}
Symptoms: ${symptoms || "Not provided"}
Previous Diagnosis: ${previous_diagnosis || "Not provided"}
Medical History: ${medical_history || "Not provided"}

Provide contextual medical hints for this patient.`;

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
            content: "You are a medical reference assistant. Provide informational medical context ONLY. Do NOT prescribe treatment or medication. Be medically neutral. Provide related conditions, risk indicators, and suggested diagnostic checks. This is for informational reference only.",
          },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "medical_hints",
            description: "Return contextual medical hints",
            parameters: {
              type: "object",
              properties: {
                related_conditions: {
                  type: "array",
                  items: { type: "string" },
                  description: "Related medical conditions to consider",
                },
                risk_indicators: {
                  type: "array",
                  items: { type: "string" },
                  description: "Risk indicators based on patient profile",
                },
                suggested_checks: {
                  type: "array",
                  items: { type: "string" },
                  description: "Suggested diagnostic checks",
                },
                context_notes: {
                  type: "string",
                  description: "Brief contextual explanation",
                },
              },
              required: ["related_conditions", "risk_indicators", "suggested_checks", "context_notes"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "medical_hints" } },
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
    let parsed = { related_conditions: [], risk_indicators: [], suggested_checks: [], context_notes: "" };

    if (toolCall?.function?.arguments) {
      try { parsed = JSON.parse(toolCall.function.arguments); } catch {}
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-medical-hints error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
