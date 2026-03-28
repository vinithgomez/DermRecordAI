
CREATE TABLE public.progress_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  note TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ongoing',
  severity TEXT,
  treatment_given TEXT,
  next_steps TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.progress_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view progress_notes" ON public.progress_notes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert progress_notes" ON public.progress_notes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated can update progress_notes" ON public.progress_notes
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Authenticated can delete progress_notes" ON public.progress_notes
  FOR DELETE TO authenticated USING (auth.uid() = created_by);
