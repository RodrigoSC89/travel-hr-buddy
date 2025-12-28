-- Remover políticas existentes e recriar
DROP POLICY IF EXISTS "org_members_select" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_insert" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_update" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_delete" ON public.organization_members;

-- Recriar políticas SEM recursão
CREATE POLICY "org_members_select" ON public.organization_members
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "org_members_insert" ON public.organization_members
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR public.is_org_admin(auth.uid(), organization_id));

CREATE POLICY "org_members_update" ON public.organization_members
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "org_members_delete" ON public.organization_members
  FOR DELETE USING (auth.role() = 'service_role' OR public.is_org_admin(auth.uid(), organization_id));