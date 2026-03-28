import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Brain, AlertTriangle, FileText, Pencil, Plus, Trash2 } from "lucide-react";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loadingHints, setLoadingHints] = useState(false);
  const [hints, setHints] = useState<any>(null);

  // Progress note form
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteForm, setNoteForm] = useState({
    note: "", status: "ongoing", severity: "", treatment_given: "", next_steps: "",
  });

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

  const { data: progressNotes } = useQuery({
    queryKey: ["progress-notes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("progress_notes")
        .select("*")
        .eq("patient_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setNoteLoading(true);
    try {
      const { error } = await supabase.from("progress_notes").insert({
        patient_id: id,
        created_by: user.id,
        note: noteForm.note,
        status: noteForm.status,
        severity: noteForm.severity || null,
        treatment_given: noteForm.treatment_given || null,
        next_steps: noteForm.next_steps || null,
      });
      if (error) throw error;
      toast({ title: "Progress note added" });
      setNoteForm({ note: "", status: "ongoing", severity: "", treatment_given: "", next_steps: "" });
      setShowNoteForm(false);
      queryClient.invalidateQueries({ queryKey: ["progress-notes", id] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setNoteLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const { error } = await supabase.from("progress_notes").delete().eq("id", noteId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["progress-notes", id] });
    }
  };

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/patients/${id}/edit`)}>
            <Pencil className="h-4 w-4" /> Edit Patient
          </Button>
          <Badge variant="secondary" className="capitalize">{patient.gender}, {patient.age}y</Badge>
        </div>
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

      {/* Treatment Progress Notes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Plus className="h-4 w-4" /> Treatment Progress</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowNoteForm(!showNoteForm)}>
            {showNoteForm ? "Cancel" : "Add Progress Note"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showNoteForm && (
            <form onSubmit={handleAddNote} className="space-y-3 rounded-lg border border-dashed p-4">
              <div className="space-y-2">
                <Label>Progress Note *</Label>
                <Textarea
                  placeholder="Describe the current condition, changes observed..."
                  value={noteForm.note}
                  onChange={(e) => setNoteForm((f) => ({ ...f, note: e.target.value }))}
                  rows={3}
                  required
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={noteForm.status} onValueChange={(v) => setNoteForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="improving">Improving</SelectItem>
                      <SelectItem value="worsening">Worsening</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="stable">Stable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={noteForm.severity} onValueChange={(v) => setNoteForm((f) => ({ ...f, severity: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Treatment Given</Label>
                <Textarea
                  placeholder="e.g., topical corticosteroid, phototherapy session..."
                  value={noteForm.treatment_given}
                  onChange={(e) => setNoteForm((f) => ({ ...f, treatment_given: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Next Steps / Follow-up</Label>
                <Textarea
                  placeholder="e.g., review in 2 weeks, switch to calcineurin inhibitor..."
                  value={noteForm.next_steps}
                  onChange={(e) => setNoteForm((f) => ({ ...f, next_steps: e.target.value }))}
                  rows={2}
                />
              </div>
              <Button type="submit" disabled={noteLoading || !noteForm.note} className="w-full">
                {noteLoading ? "Saving..." : "Save Progress Note"}
              </Button>
            </form>
          )}

          {progressNotes && progressNotes.length > 0 ? (
            progressNotes.map((note: any, i: number) => (
              <div key={note.id}>
                {i > 0 && <Separator className="my-3" />}
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        note.status === "resolved" ? "default" :
                        note.status === "improving" ? "secondary" :
                        note.status === "worsening" ? "destructive" : "outline"
                      } className="capitalize">{note.status}</Badge>
                      {note.severity && <Badge variant="outline" className="capitalize">{note.severity}</Badge>}
                      <span className="text-xs text-muted-foreground">{format(new Date(note.created_at), "MMM d, yyyy")}</span>
                    </div>
                    <p className="text-sm">{note.note}</p>
                    {note.treatment_given && <p className="text-sm"><span className="font-medium">Treatment:</span> {note.treatment_given}</p>}
                    {note.next_steps && <p className="text-sm"><span className="font-medium">Next Steps:</span> {note.next_steps}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleDeleteNote(note.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            !showNoteForm && <p className="text-sm text-muted-foreground">No progress notes yet. Click "Add Progress Note" to start tracking treatment progress.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
