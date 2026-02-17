
-- Fix RLS: replace permissive ALL policies with specific operation policies
DROP POLICY IF EXISTS "Users can manage elements" ON public.audit_evidence_elements;
DROP POLICY IF EXISTS "Users can manage items" ON public.audit_evidence_items;
DROP POLICY IF EXISTS "Users can manage matches" ON public.audit_evidence_matches;

-- Elements: specific policies
CREATE POLICY "Users can insert elements" ON public.audit_evidence_elements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update elements" ON public.audit_evidence_elements FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete elements" ON public.audit_evidence_elements FOR DELETE USING (public.is_admin());

-- Items: specific policies
CREATE POLICY "Users can insert items" ON public.audit_evidence_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update items" ON public.audit_evidence_items FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete items" ON public.audit_evidence_items FOR DELETE USING (public.is_admin());

-- Matches: specific policies
CREATE POLICY "Users can insert matches" ON public.audit_evidence_matches FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update matches" ON public.audit_evidence_matches FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete matches" ON public.audit_evidence_matches FOR DELETE USING (public.is_admin());
