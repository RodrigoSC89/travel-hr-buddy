-- Fix: Replace permissive RLS policy with proper organization check
DROP POLICY IF EXISTS "System can insert BROA evidence" ON public.broa_evidence_logs;

CREATE POLICY "Users can insert BROA evidence for their organization"
  ON public.broa_evidence_logs FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );