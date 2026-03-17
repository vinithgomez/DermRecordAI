import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Brain, AlertTriangle, FileText } from "lucide-react";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [loadingHints, setLoadingHints] = useState(false);
  const [hints, setHints] = useState<any>(null);

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*, ai_summaries(*), medical_records(*), diagnoses(*), appointments(*)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const fetchHints = async () => {
    if (!patient) return;
    setLoadingHints(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-medical-hints", {
        body: {
          patient_name: patient.name,
          symptoms: patient.symptoms,
          previous_diagnosis: patient.previous_diagnosis,
          medical_history: patient.medical_history,
        },
      });
      if (error) throw error;
      setHints(data);
    } catch (err: any) {
      toast({ title: "AI Hints failed", description: err.message, variant: "destructive" });
    } finally {
      setLoadingHints(false);
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!patient) return <p className="text-muted-foreground">Patient not found.</p>;

  const aiSummary = patient.ai_summaries?.[0];
  const summaryPoints = Array.isArray(aiSummary?.summary_points) ? aiSummary.summary_points as string[] : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{patient.name}</h2>
        <Badge variant="secondary" className="capitalize">{patient.gender}, {patient.age}y</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Skin Profile</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Contact:</span> {patient.contact || "—"}</p>
            <p><span className="font-medium">Skin Symptoms:</span> {patient.symptoms || "—"}</p>
            <p><span className="font-medium">Dermatological History:</span> {patient.medical_history || "—"}</p>
            <p><span className="font-medium">Previous Skin Conditions:</span> {patient.previous_diagnosis || "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-4 w-4" /> AI Skin Condition Summary</CardTitle></CardHeader>
          <CardContent>
            {summaryPoints.length > 0 ? (
              <ul className="list-disc space-y-1 pl-4 text-sm">
                {summaryPoints.map((point, i) => <li key={i}>{point}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No AI summary available yet.</p>
            )}
            {aiSummary?.risk_level && (
              <Badge className="mt-3" variant={aiSummary.risk_level === "high" || aiSummary.risk_level === "critical" ? "destructive" : "secondary"}>
                Severity: {aiSummary.risk_level}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Dermatology Hints */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Dermatology Differential Hints</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchHints} disabled={loadingHints}>
            {loadingHints ? "Generating..." : "Get AI Hints"}
          </Button>
        </CardHeader>
        <CardContent>
          {hints ? (
            <div className="space-y-3 text-sm">
              {hints.context_notes && <p>{hints.context_notes}</p>}
              {hints.related_conditions && (
                <div>
                  <p className="font-medium">Related Skin Conditions:</p>
                  <ul className="list-disc pl-4">{(hints.related_conditions as string[]).map((c: string, i: number) => <li key={i}>{c}</li>)}</ul>
                </div>
              )}
              {hints.risk_indicators && (
                <div>
                  <p className="font-medium">Risk Indicators:</p>
                  <ul className="list-disc pl-4">{(hints.risk_indicators as string[]).map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
                </div>
              )}
              {hints.suggested_checks && (
                <div>
                  <p className="font-medium">Suggested Diagnostic Tests:</p>
                  <ul className="list-disc pl-4">{(hints.suggested_checks as string[]).map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                </div>
              )}
              <p className="text-xs text-muted-foreground italic">⚠️ Informational reference only. Not a substitute for clinical judgment.</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click "Get AI Hints" for differential diagnosis suggestions.</p>
          )}
        </CardContent>
      </Card>

      {/* Diagnosis Timeline */}
      {patient.diagnoses && patient.diagnoses.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Skin Condition Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {patient.diagnoses.map((d: any, i: number) => (
              <div key={d.id}>
                {i > 0 && <Separator className="my-3" />}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{d.summary || "No summary"}</p>
                    <p className="text-xs text-muted-foreground">{d.category || "General Dermatology"}</p>
                  </div>
                  <div className="text-right">
                    {d.risk_level && <Badge variant="secondary">{d.risk_level}</Badge>}
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(d.created_at), "MMM d, yyyy")}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Clinical Records */}
      {patient.medical_records && patient.medical_records.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Dermatology Clinical Records</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {patient.medical_records.map((r: any) => (
              <div key={r.id} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy")}</p>
                {r.symptoms && <p className="text-sm"><span className="font-medium">Skin Symptoms:</span> {r.symptoms}</p>}
                {r.observations && <p className="text-sm"><span className="font-medium">Examination Findings:</span> {r.observations}</p>}
                {r.raw_notes && <p className="text-sm"><span className="font-medium">Clinical Notes:</span> {r.raw_notes}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
