-- =====================================================================
-- AUDIT TRAIL IMUTÁVEL (R08 - ISM/ISPS Compliance)
-- Tabela append-only para rastreabilidade completa de ações críticas
-- =====================================================================

-- Criar tabela de audit trail se não existir
CREATE TABLE IF NOT EXISTS public.audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL,
  user_email TEXT,
  user_role TEXT,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'view', 'export', 'login', 'logout')),
  resource_type TEXT NOT NULL,
  resource_id UUID,
  resource_name TEXT,
  changes JSONB,
  previous_state JSONB,
  new_state JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  organization_id UUID,
  vessel_id UUID,
  module TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  metadata JSONB DEFAULT '{}',
  
  -- Índices para consultas frequentes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

-- Política: Apenas INSERT por usuários autenticados
CREATE POLICY "audit_trail_insert_policy"
  ON public.audit_trail
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Política: SELECT apenas para mesma organização ou admin
CREATE POLICY "audit_trail_select_policy"
  ON public.audit_trail
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'auditor')
    )
  );

-- BLOQUEAR UPDATE explicitamente (imutabilidade)
CREATE POLICY "audit_trail_no_update"
  ON public.audit_trail
  FOR UPDATE
  USING (false);

-- BLOQUEAR DELETE explicitamente (imutabilidade)
CREATE POLICY "audit_trail_no_delete"
  ON public.audit_trail
  FOR DELETE
  USING (false);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON public.audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_resource ON public.audit_trail(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON public.audit_trail(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_organization ON public.audit_trail(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON public.audit_trail(action);
CREATE INDEX IF NOT EXISTS idx_audit_trail_vessel ON public.audit_trail(vessel_id);

-- Function helper para criar audit log (usada por triggers e código)
CREATE OR REPLACE FUNCTION public.create_audit_entry(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_resource_name TEXT DEFAULT NULL,
  p_changes JSONB DEFAULT NULL,
  p_previous_state JSONB DEFAULT NULL,
  p_new_state JSONB DEFAULT NULL,
  p_module TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'info',
  p_vessel_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
  v_user_id UUID;
  v_user_email TEXT;
  v_user_role TEXT;
  v_org_id UUID;
BEGIN
  -- Obter usuário atual
  v_user_id := auth.uid();
  
  -- Obter email e org do perfil
  SELECT p.email, ur.role::TEXT, om.organization_id 
  INTO v_user_email, v_user_role, v_org_id
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  LEFT JOIN public.user_roles ur ON ur.user_id = au.id
  LEFT JOIN public.organization_members om ON om.user_id = au.id AND om.status = 'active'
  WHERE au.id = v_user_id
  LIMIT 1;
  
  -- Inserir registro de auditoria
  INSERT INTO public.audit_trail (
    user_id,
    user_email,
    user_role,
    action,
    resource_type,
    resource_id,
    resource_name,
    changes,
    previous_state,
    new_state,
    ip_address,
    organization_id,
    vessel_id,
    module,
    severity,
    metadata
  ) VALUES (
    COALESCE(v_user_id, '00000000-0000-0000-0000-000000000000'::UUID),
    v_user_email,
    v_user_role,
    p_action,
    p_resource_type,
    p_resource_id,
    p_resource_name,
    p_changes,
    p_previous_state,
    p_new_state,
    inet_client_addr(),
    v_org_id,
    p_vessel_id,
    p_module,
    p_severity,
    p_metadata
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- Trigger genérico para tabelas críticas
CREATE OR REPLACE FUNCTION public.trigger_audit_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action TEXT;
  v_resource_id UUID;
  v_changes JSONB;
  v_vessel_id UUID := NULL;
BEGIN
  -- Determinar ação
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_resource_id := NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_resource_id := NEW.id;
    -- Calcular mudanças
    v_changes := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_resource_id := OLD.id;
  END IF;
  
  -- Tentar extrair vessel_id se existir
  IF TG_OP = 'DELETE' THEN
    IF to_jsonb(OLD) ? 'vessel_id' THEN
      v_vessel_id := (to_jsonb(OLD)->>'vessel_id')::UUID;
    END IF;
  ELSE
    IF to_jsonb(NEW) ? 'vessel_id' THEN
      v_vessel_id := (to_jsonb(NEW)->>'vessel_id')::UUID;
    END IF;
  END IF;
  
  -- Criar entrada de auditoria
  PERFORM public.create_audit_entry(
    v_action,
    TG_TABLE_NAME,
    v_resource_id,
    NULL,
    v_changes,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN 'warning'
      ELSE 'info'
    END,
    v_vessel_id
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar triggers em tabelas críticas (vessels, crew_members, documents)
DO $$
BEGIN
  -- Vessels
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_vessels_trigger') THEN
    CREATE TRIGGER audit_vessels_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.vessels
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_audit_changes();
  END IF;
  
  -- Crew Members
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_crew_members_trigger') THEN
    CREATE TRIGGER audit_crew_members_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.crew_members
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_audit_changes();
  END IF;
  
  -- Crew Documents
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_crew_documents_trigger') THEN
    CREATE TRIGGER audit_crew_documents_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.crew_documents
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_audit_changes();
  END IF;
  
  -- Maintenance Records
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_maintenance_records_trigger') THEN
    CREATE TRIGGER audit_maintenance_records_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_records
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_audit_changes();
  END IF;
END;
$$;

-- Comentário de documentação
COMMENT ON TABLE public.audit_trail IS 'Audit trail imutável para compliance ISM/ISPS. Esta tabela é append-only - UPDATE e DELETE são bloqueados por RLS.';