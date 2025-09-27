-- Finalizar correção das auditorias PEOTRAM
-- Garantir que todas as políticas estão corretas e funcionais

-- 1. Verificar e ajustar política de DELETE para peotram_audits
DROP POLICY IF EXISTS "Users can delete PEOTRAM audits" ON public.peotram_audits;
CREATE POLICY "Users can delete PEOTRAM audits"
ON public.peotram_audits FOR DELETE
USING (
  created_by = auth.uid() 
  OR public.get_user_role() IN ('admin','hr_manager')
);

-- 2. Garantir política de INSERT para peotram_non_conformities
DROP POLICY IF EXISTS "Users can create non-conformities based on permissions" ON public.peotram_non_conformities;
CREATE POLICY "Users can create non-conformities based on permissions"
ON public.peotram_non_conformities FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.peotram_audits pa
    WHERE pa.id = audit_id 
    AND (
      pa.created_by = auth.uid()
      OR public.get_user_role() IN ('admin','hr_manager')
      OR EXISTS (
        SELECT 1 FROM public.user_feature_permissions ufp
        WHERE ufp.user_id = auth.uid()
        AND ufp.feature_module = 'peotram'
        AND ufp.permission_level IN ('write','admin')
        AND ufp.is_active = true
      )
    )
  )
);

-- 3. Ajustar política de UPDATE para peotram_non_conformities
DROP POLICY IF EXISTS "Users can update non-conformities based on permissions" ON public.peotram_non_conformities;
CREATE POLICY "Users can update non-conformities based on permissions"
ON public.peotram_non_conformities FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.peotram_audits pa
    WHERE pa.id = audit_id 
    AND (
      pa.created_by = auth.uid()
      OR public.get_user_role() IN ('admin','hr_manager')
      OR EXISTS (
        SELECT 1 FROM public.user_feature_permissions ufp
        WHERE ufp.user_id = auth.uid()
        AND ufp.feature_module = 'peotram'
        AND ufp.permission_level IN ('write','admin')
        AND ufp.is_active = true
      )
    )
  )
);

-- 4. Garantir política de DELETE para peotram_non_conformities
DROP POLICY IF EXISTS "Users can delete non-conformities based on permissions" ON public.peotram_non_conformities;
CREATE POLICY "Users can delete non-conformities based on permissions"
ON public.peotram_non_conformities FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.peotram_audits pa
    WHERE pa.id = audit_id 
    AND (
      pa.created_by = auth.uid()
      OR public.get_user_role() IN ('admin','hr_manager')
    )
  )
);

-- 5. Completar política de INSERT para peotram_ai_analysis
DROP POLICY IF EXISTS "Users can create PEOTRAM AI analysis" ON public.peotram_ai_analysis;
CREATE POLICY "Users can create PEOTRAM AI analysis"
ON public.peotram_ai_analysis FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.peotram_audits pa
    WHERE pa.id = audit_id 
    AND (
      pa.created_by = auth.uid()
      OR public.get_user_role() IN ('admin','hr_manager')
    )
  )
);

-- 6. Garantir que o trigger de contagem de não conformidades funciona corretamente
DROP TRIGGER IF EXISTS trigger_update_audit_non_conformities_count ON public.peotram_non_conformities;
CREATE TRIGGER trigger_update_audit_non_conformities_count
  AFTER INSERT OR DELETE ON public.peotram_non_conformities
  FOR EACH ROW EXECUTE FUNCTION public.update_audit_non_conformities_count();

-- 7. Atualizar todas as auditorias existentes com contagem correta de não conformidades
UPDATE public.peotram_audits 
SET non_conformities_count = (
  SELECT COUNT(*) 
  FROM public.peotram_non_conformities nc 
  WHERE nc.audit_id = peotram_audits.id
);

-- 8. Garantir que compliance_score seja calculado corretamente quando não há valor
UPDATE public.peotram_audits 
SET compliance_score = GREATEST(0, 100 - (non_conformities_count * 5))
WHERE compliance_score IS NULL OR compliance_score = 0;

-- 9. Criar função para calcular score automático baseado em não conformidades
CREATE OR REPLACE FUNCTION public.calculate_peotram_compliance_score(audit_uuid uuid)
RETURNS numeric
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN non_conformities_count = 0 THEN 100
    WHEN non_conformities_count <= 5 THEN 100 - (non_conformities_count * 8)
    WHEN non_conformities_count <= 10 THEN 100 - (non_conformities_count * 10)
    ELSE GREATEST(0, 100 - (non_conformities_count * 12))
  END
  FROM public.peotram_audits 
  WHERE id = audit_uuid;
$$;