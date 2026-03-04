import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function CreateRecord() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [form, setForm] = useState({ symptoms: "", observations: "", lab_results: "", raw_notes: "" });
  const [aiResult, setAiResult] = useState<any>(null);

  const { data: patients } = useQuery({
    queryKey: ["patients-list"],
    queryFn: async () => {
      const { data } = await supabase.from("patients").select("id, name").order("name");
      return data ?? [];
    },
  });

  const handleChange = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !patientId) return;
    setLoading(true);

    try {
      // 1. Save raw record
      const { data: record, error } = await supabase
        .from("medical_records")
        .insert({
          patient_id: patientId,
          created_by: user.id,
          symptoms: form.symptoms || null,
          observations: form.observations || null,
          lab_results: form.lab_results || null,
          raw_notes: form.raw_notes || null,
        })
        .select()
        .single();
      if (error) throw error;

      // 2. AI processing
      try {
        const { data: aiData } = await supabase.functions.invoke("ai-summarize", {
          body: {
            patient_id: patientId,
            record_id: record.id,
            text: `Symptoms: ${form.symptoms}\nObservations: ${form.observations}\nLab Results: ${form.lab_results}\nNotes: ${form.raw_notes}`,
            type: "record",
          },
        });

        // Update record with AI processed notes
        if (aiData) {
          await supabase.from("medical_records").update({ ai_processed_notes: aiData }).eq("id", record.id);
          setAiResult(aiData);
        }
      } catch {
        console.warn("AI processing failed");
      }

      toast({ title: "Record created", description: "Medical record saved and processed." });
      if (!aiResult) navigate("/patients/" + patientId);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Create Medical Record</h2>

      <Card>
        <CardHeader><CardTitle>Consultation Notes</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Current Symptoms</Label>
              <Textarea value={form.symptoms} onChange={(e) => handleChange("symptoms", e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Observations</Label>
              <Textarea value={form.observations} onChange={(e) => handleChange("observations", e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Lab Results</Label>
              <Textarea value={form.lab_results} onChange={(e) => handleChange("lab_results", e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Diagnosis Notes</Label>
              <Textarea value={form.raw_notes} onChange={(e) => handleChange("raw_notes", e.target.value)} rows={5} placeholder="Detailed diagnosis notes..." />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !patientId}>
              {loading ? "Saving & Processing..." : "Save Record"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {aiResult && (
        <Card>
          <CardHeader><CardTitle>AI-Processed Notes</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {aiResult.summary_points && (
              <div>
                <p className="font-medium">Key Findings:</p>
                <ul className="list-disc pl-4">{(aiResult.summary_points as string[]).map((p: string, i: number) => <li key={i}>{p}</li>)}</ul>
              </div>
            )}
            {aiResult.risk_level && <p><span className="font-medium">Risk Category:</span> {aiResult.risk_level}</p>}
            <Button variant="outline" onClick={() => navigate("/patients/" + patientId)}>View Patient</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
