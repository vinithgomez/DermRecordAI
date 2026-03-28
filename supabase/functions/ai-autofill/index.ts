import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { patient_id, mode } = await req.json();
    if (!patient_id) throw new Error("patient_id is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch patient info
    const { data: patient } = await supabase
      .from("patients")
      .select("*")
      .eq("id", patient_id)
      .single();

    // Fetch past records
    const { data: records } = await supabase
      .from("medical_records")
      .select("*")
      .eq("patient_id", patient_id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch past diagnoses
    const { data: diagnoses } = await supabase
      .from("diagnoses")
      .select("*")
      .eq("patient_id", patient_id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch AI summaries
    const { data: aiSummaries } = await supabase
      .from("ai_summaries")
      .select("*")
      .eq("patient_id", patient_id)
      .order("created_at", { ascending: false })
      .limit(5);

    const patientContext = `
PATIENT: ${patient?.name || "Unknown"}, Age: ${patient?.age}, Gender: ${patient?.gender}
Skin Symptoms: ${patient?.symptoms || "None recorded"}
Previous Diagnosis: ${patient?.previous_diagnosis || "None"}
Medical History: ${patient?.medical_history || "None"}

PAST MEDICAL RECORDS (${records?.length || 0}):
${(records || []).map((r, i) => `Record ${i + 1} (${r.created_at}):
  Symptoms: ${r.symptoms || "N/A"}
  Observations: ${r.observations || "N/A"}
  Lab Results: ${r.lab_results || "N/A"}
  Notes: ${r.raw_notes || "N/A"}
  AI Notes: ${r.ai_processed_notes ? JSON.stringify(r.ai_processed_notes) : "N/A"}`).join("\n")}

PAST DIAGNOSES (${diagnoses?.length || 0}):
${(diagnoses || []).map((d, i) => `${i + 1}. Category: ${d.category || "N/A"}, Risk: ${d.risk_level || "N/A"}, Summary: ${d.summary || "N/A"}`).join("\n")}

AI SUMMARIES (${aiSummaries?.length || 0}):
${(aiSummaries || []).map((s, i) => `${i + 1}. Risk: ${s.risk_level}, Points: ${JSON.stringify(s.summary_points)}, Notes: ${s.context_notes || "N/A"}`).join("\n")}
`.trim();

    let toolDef: any;
    let systemPrompt: string;

    if (mode === "record") {
      systemPrompt = `You are a dermatology clinical assistant. Based on the patient's history, past records, and diagnoses, generate pre-filled clinical notes for a new dermatology examination record. Reference past conditions, ongoing treatments, and areas that need follow-up. Be specific to dermatological terminology. If no past data exists, provide appropriate template suggestions.`;
      toolDef = {
        name: "autofill_record",
        description: "Pre-fill dermatology clinical record fields based on patient history",
        parameters: {
          type: "object",
          properties: {
            symptoms: { type: "string", description: "Suggested skin symptoms to document based on history and ongoing conditions" },
            observations: { type: "string", description: "Suggested examination findings/lesion descriptions based on past observations" },
            lab_results: { type: "string", description: "Suggested lab/biopsy tests to follow up on or order" },
            raw_notes: { type: "string", description: "Comprehensive clinical notes referencing patient history, progression, and treatment plan" },
          },
          required: ["symptoms", "observations", "lab_results", "raw_notes"],
          additionalProperties: false,
        },
      };
    } else {
      systemPrompt = `You are a dermatology report assistant. Based on the patient's full clinical history, records, and diagnoses, generate a comprehensive dermatology report. Synthesize all available data into professional report sections. Be thorough and reference specific findings from past records.`;
      toolDef = {
        name: "autofill_report",
        description: "Pre-fill dermatology report fields based on patient clinical history",
        parameters: {
          type: "object",
          properties: {
            diagnosis_notes: { type: "string", description: "Comprehensive skin condition diagnosis synthesized from all records" },
            observations: { type: "string", description: "Summary of all examination findings across visits" },
            prescription_notes: { type: "string", description: "Treatment plan and prescriptions based on diagnosis history and progression" },
          },
          required: ["diagnosis_notes", "observations", "prescription_notes"],
          additionalProperties: false,
        },
      };
    }

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
          { role: "user", content: `Based on this patient data, generate pre-filled fields:\n\n${patientContext}` },
        ],
        tools: [{ type: "function", function: toolDef }],
        tool_choice: { type: "function", function: { name: toolDef.name } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again." }), {
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
    let parsed = {};

    if (toolCall?.function?.arguments) {
      try { parsed = JSON.parse(toolCall.function.arguments); } catch {}
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-autofill error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
