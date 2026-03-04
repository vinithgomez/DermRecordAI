
-- Fix permissive RLS policy on ai_summaries
DROP POLICY "Authenticated can insert ai_summaries" ON public.ai_summaries;
CREATE POLICY "Authenticated can insert ai_summaries" ON public.ai_summaries
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.created_by = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );
