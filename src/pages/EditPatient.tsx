import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

export default function EditPatient() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", age: "", gender: "", contact: "",
    symptoms: "", previous_diagnosis: "", medical_history: "",
  });

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient-edit", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name || "",
        age: String(patient.age) || "",
        gender: patient.gender || "",
        contact: patient.contact || "",
        symptoms: patient.symptoms || "",
        previous_diagnosis: patient.previous_diagnosis || "",
        medical_history: patient.medical_history || "",
      });
    }
  }, [patient]);

  const handleChange = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("patients")
        .update({
          name: form.name,
          age: parseInt(form.age),
          gender: form.gender,
          contact: form.contact || null,
          symptoms: form.symptoms || null,
          previous_diagnosis: form.previous_diagnosis || null,
          medical_history: form.medical_history || null,
        })
        .eq("id", id);
      if (error) throw error;

      toast({ title: "Patient updated", description: `${form.name}'s profile has been updated.` });
      navigate(`/patients/${id}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!patient) return <p className="text-muted-foreground">Patient not found.</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold">Edit Patient Profile</h2>
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
              <Textarea id="symptoms" value={form.symptoms} onChange={(e) => handleChange("symptoms", e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previous_diagnosis">Previous Skin Conditions / Diagnosis</Label>
              <Textarea id="previous_diagnosis" value={form.previous_diagnosis} onChange={(e) => handleChange("previous_diagnosis", e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_history">Dermatological History & Allergies</Label>
              <Textarea id="medical_history" value={form.medical_history} onChange={(e) => handleChange("medical_history", e.target.value)} rows={3} />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={loading || !form.gender}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/patients/${id}`)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
