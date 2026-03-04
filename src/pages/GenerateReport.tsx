import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

export default function GenerateReport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [form, setForm] = useState({
    doctor_name: "", report_date: new Date().toISOString().split("T")[0],
    diagnosis_notes: "", observations: "", prescription_notes: "",
  });
  const [report, setReport] = useState<any>(null);

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
      // 1. AI polish
      let aiSummary = null;
      try {
        const { data } = await supabase.functions.invoke("ai-report-polish", {
          body: {
            diagnosis_notes: form.diagnosis_notes,
            observations: form.observations,
            prescription_notes: form.prescription_notes,
          },
        });
        aiSummary = data;
      } catch {
        console.warn("AI report polish failed");
      }

      // 2. Save report
      const { data: reportData, error } = await supabase
        .from("reports")
        .insert({
          patient_id: patientId,
          doctor_name: form.doctor_name,
          report_date: form.report_date,
          diagnosis_notes: form.diagnosis_notes || null,
          observations: form.observations || null,
          prescription_notes: form.prescription_notes || null,
          ai_summary: aiSummary,
          created_by: user.id,
        })
        .select("*, patients(name, age, gender)")
        .single();
      if (error) throw error;

      setReport({ ...reportData, aiSummary });
      toast({ title: "Report generated", description: "Medical report created successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!report) return;
    const patient = report.patients;
    const content = `
MEDICAL REPORT
==============
Patient: ${patient?.name || "N/A"}
Age: ${patient?.age || "N/A"} | Gender: ${patient?.gender || "N/A"}
Doctor: ${report.doctor_name}
Date: ${report.report_date}

DIAGNOSIS NOTES
${report.diagnosis_notes || "N/A"}

OBSERVATIONS
${report.observations || "N/A"}

PRESCRIPTION
${report.prescription_notes || "N/A"}

AI SUMMARY
${report.aiSummary?.summary ? report.aiSummary.summary : "N/A"}

${report.aiSummary?.diagnosis_points ? "DIAGNOSIS OVERVIEW\n" + (report.aiSummary.diagnosis_points as string[]).map((p: string) => `• ${p}`).join("\n") : ""}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${patient?.name?.replace(/\s+/g, "-")}-${report.report_date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Generate Report</h2>

      <Card>
        <CardHeader><CardTitle>Report Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
                <Label>Date</Label>
                <Input type="date" value={form.report_date} onChange={(e) => handleChange("report_date", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Doctor Name *</Label>
              <Input value={form.doctor_name} onChange={(e) => handleChange("doctor_name", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Diagnosis Notes</Label>
              <Textarea value={form.diagnosis_notes} onChange={(e) => handleChange("diagnosis_notes", e.target.value)} rows={4} />
            </div>

            <div className="space-y-2">
              <Label>Observations</Label>
              <Textarea value={form.observations} onChange={(e) => handleChange("observations", e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Prescription Notes</Label>
              <Textarea value={form.prescription_notes} onChange={(e) => handleChange("prescription_notes", e.target.value)} rows={3} />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !patientId || !form.doctor_name}>
              {loading ? "Generating..." : "Generate Report"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Report Preview</CardTitle>
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="font-medium">Patient:</span> {report.patients?.name}</p>
            <p><span className="font-medium">Doctor:</span> {report.doctor_name}</p>
            <p><span className="font-medium">Date:</span> {report.report_date}</p>
            {report.aiSummary?.summary && (
              <div>
                <p className="font-medium">AI Summary:</p>
                <p className="text-muted-foreground">{report.aiSummary.summary}</p>
              </div>
            )}
            {report.aiSummary?.diagnosis_points && (
              <div>
                <p className="font-medium">Diagnosis Overview:</p>
                <ul className="list-disc pl-4">{(report.aiSummary.diagnosis_points as string[]).map((p: string, i: number) => <li key={i}>{p}</li>)}</ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
