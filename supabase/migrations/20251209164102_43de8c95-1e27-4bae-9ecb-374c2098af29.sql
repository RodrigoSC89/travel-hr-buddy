-- Fix missing RLS policies for document_versions, document_approvals, document_distribution

-- document_versions policies
CREATE POLICY "Users can view document versions" ON public.document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.document_registry dr 
      WHERE dr.id = document_id 
      AND public.user_belongs_to_organization(dr.organization_id, auth.uid())
    )
  );

CREATE POLICY "Users can insert document versions" ON public.document_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.document_registry dr 
      WHERE dr.id = document_id 
      AND public.user_belongs_to_organization(dr.organization_id, auth.uid())
    )
  );

-- document_approvals policies
CREATE POLICY "Users can view document approvals" ON public.document_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.document_registry dr 
      WHERE dr.id = document_id 
      AND public.user_belongs_to_organization(dr.organization_id, auth.uid())
    )
  );

CREATE POLICY "Users can manage document approvals" ON public.document_approvals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.document_registry dr 
      WHERE dr.id = document_id 
      AND public.user_belongs_to_organization(dr.organization_id, auth.uid())
    )
  );

-- document_distribution policies  
CREATE POLICY "Users can view document distribution" ON public.document_distribution
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.document_registry dr 
      WHERE dr.id = document_id 
      AND public.user_belongs_to_organization(dr.organization_id, auth.uid())
    )
  );

CREATE POLICY "Users can manage document distribution" ON public.document_distribution
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.document_registry dr 
      WHERE dr.id = document_id 
      AND public.user_belongs_to_organization(dr.organization_id, auth.uid())
    )
  );

-- PSC deficiencies management policy
CREATE POLICY "Users can manage PSC deficiencies" ON public.psc_deficiencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.psc_inspections pi 
      WHERE pi.id = inspection_id 
      AND public.user_belongs_to_organization(pi.organization_id, auth.uid())
    )
  );