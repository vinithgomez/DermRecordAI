import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function UploadPatient() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", age: "", gender: "", contact: "",
    symptoms: "", previous_diagnosis: "", medical_history: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .insert({
          name: form.name,
          age: parseInt(form.age),
          gender: form.gender,
          contact: form.contact || null,
          symptoms: form.symptoms || null,
          previous_diagnosis: form.previous_diagnosis || null,
          medical_history: form.medical_history || null,
          created_by: user.id,
        })
        .select()
        .single();
      if (patientError) throw patientError;

      await supabase.from("appointments").insert({
        patient_id: patient.id,
        created_by: user.id,
      });

      if (file) {
        const filePath = `${user.id}/${patient.id}/${file.name}`;
        await supabase.storage.from("patient-files").upload(filePath, file);
      }

      if (form.previous_diagnosis) {
        try {
          await supabase.functions.invoke("ai-summarize", {
            body: { patient_id: patient.id, text: form.previous_diagnosis },
          });
        } catch {
          console.warn("AI summarization failed, continuing...");
        }
      }

      toast({ title: "Patient registered", description: `${form.name} has been added to your dermatology schedule.` });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold">Register Dermatology Patient</h2>
      <Card>
        <CardHeader><CardTitle>Patient Skin Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Patient Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input id="age" type="number" min="1" max="199" value={form.age} onChange={(e) => handleChange("age", e.target.value)} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select value={form.gender} onValueChange={(v) => handleChange("gender", v)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input id="contact" value={form.contact} onChange={(e) => handleChange("contact", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Skin Symptoms / Complaints</Label>
              <Textarea id="symptoms" placeholder="e.g., itchy red patches on elbows, persistent acne on cheeks..." value={form.symptoms} onChange={(e) => handleChange("symptoms", e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previous_diagnosis">Previous Skin Conditions / Diagnosis</Label>
              <Textarea id="previous_diagnosis" placeholder="e.g., eczema, psoriasis, contact dermatitis..." value={form.previous_diagnosis} onChange={(e) => handleChange("previous_diagnosis", e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_history">Dermatological History & Allergies</Label>
              <Textarea id="medical_history" placeholder="e.g., family history of melanoma, drug allergies, previous treatments..." value={form.medical_history} onChange={(e) => handleChange("medical_history", e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload Report / Dermoscopy Image (PDF)</Label>
              <Input id="file" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !form.gender}>
              {loading ? "Registering..." : "Register Patient"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
