-- PATCH OPS-V7: Audit Logs Imutáveis (ISM/ISPS Ready)
-- 
-- REGRA: Logs críticos são append-only (sem UPDATE/DELETE)
-- Garante rastreabilidade completa para auditorias marítimas

-- =====================================================
-- 1. TABELA DE AUDIT LOGS IMUTÁVEIS
-- =====================================================

CREATE TABLE IF NOT EXISTS immutable_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  correlation_id UUID DEFAULT gen_random_uuid(),
  
  -- Actor (quem)
  actor_id UUID REFERENCES auth.users(id),
  actor_email TEXT,
  actor_role TEXT,
  actor_ip TEXT,
  actor_user_agent TEXT,
  
  -- Organization
  organization_id UUID,
  vessel_id UUID,
  
  -- Action (o quê)
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT', etc.
  entity_type TEXT NOT NULL, -- 'vessel', 'maintenance_record', 'incident', etc.
  entity_id UUID,
  entity_name TEXT,
  
  -- Data (antes/depois)
  data_before JSONB,
  data_after JSONB,
  data_diff JSONB,
  
  -- Source
  source_module TEXT,
  source_component TEXT,
  source_function TEXT,
  
  -- Compliance
  compliance_category TEXT, -- 'ISM', 'ISPS', 'MLC', 'SGSO', etc.
  requires_review BOOLEAN DEFAULT FALSE,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  
  -- Integrity
  checksum TEXT NOT NULL DEFAULT md5(random()::text)
);

-- Index para queries frequentes
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON immutable_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON immutable_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON immutable_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON immutable_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation ON immutable_audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_compliance ON immutable_audit_logs(compliance_category);

-- =====================================================
-- 2. TRIGGER: BLOQUEAR UPDATE/DELETE
-- =====================================================

CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'immutable_audit_logs é append-only. UPDATE e DELETE não são permitidos.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para UPDATE
DROP TRIGGER IF EXISTS trg_prevent_audit_log_update ON immutable_audit_logs;
CREATE TRIGGER trg_prevent_audit_log_update
  BEFORE UPDATE ON immutable_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- Trigger para DELETE  
DROP TRIGGER IF EXISTS trg_prevent_audit_log_delete ON immutable_audit_logs;
CREATE TRIGGER trg_prevent_audit_log_delete
  BEFORE DELETE ON immutable_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- =====================================================
-- 3. FUNÇÃO: INSERIR LOG COM CHECKSUM
-- =====================================================

CREATE OR REPLACE FUNCTION insert_audit_log(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_entity_name TEXT DEFAULT NULL,
  p_data_before JSONB DEFAULT NULL,
  p_data_after JSONB DEFAULT NULL,
  p_source_module TEXT DEFAULT NULL,
  p_compliance_category TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_actor_id UUID;
  v_actor_email TEXT;
  v_checksum TEXT;
BEGIN
  -- Obter usuário atual
  v_actor_id := auth.uid();
  SELECT email INTO v_actor_email FROM auth.users WHERE id = v_actor_id;
  
  -- Calcular checksum do conteúdo
  v_checksum := md5(
    COALESCE(p_action, '') || 
    COALESCE(p_entity_type, '') || 
    COALESCE(p_entity_id::text, '') ||
    COALESCE(p_data_before::text, '') ||
    COALESCE(p_data_after::text, '') ||
    NOW()::text
  );
  
  -- Inserir log
  INSERT INTO immutable_audit_logs (
    actor_id,
    actor_email,
    action,
    entity_type,
    entity_id,
    entity_name,
    data_before,
    data_after,
    data_diff,
    source_module,
    compliance_category,
    checksum
  ) VALUES (
    v_actor_id,
    v_actor_email,
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_data_before,
    p_data_after,
    CASE 
      WHEN p_data_before IS NOT NULL AND p_data_after IS NOT NULL 
      THEN jsonb_diff(p_data_before, p_data_after)
      ELSE NULL
    END,
    p_source_module,
    p_compliance_category,
    v_checksum
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. FUNÇÃO: JSONB DIFF
-- =====================================================

CREATE OR REPLACE FUNCTION jsonb_diff(old_data JSONB, new_data JSONB)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}';
  key TEXT;
BEGIN
  -- Iterar sobre as chaves do novo objeto
  FOR key IN SELECT jsonb_object_keys(new_data)
  LOOP
    IF NOT old_data ? key THEN
      -- Nova chave
      result := result || jsonb_build_object(key, jsonb_build_object('added', new_data->key));
    ELSIF old_data->key IS DISTINCT FROM new_data->key THEN
      -- Chave modificada
      result := result || jsonb_build_object(key, jsonb_build_object(
        'old', old_data->key,
        'new', new_data->key
      ));
    END IF;
  END LOOP;
  
  -- Verificar chaves removidas
  FOR key IN SELECT jsonb_object_keys(old_data)
  LOOP
    IF NOT new_data ? key THEN
      result := result || jsonb_build_object(key, jsonb_build_object('removed', old_data->key));
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 5. RLS: Apenas leitura para usuários
-- =====================================================

ALTER TABLE immutable_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins podem ver tudo
CREATE POLICY "admins_read_all_audit_logs" ON immutable_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'auditor', 'compliance_officer')
    )
  );

-- Usuários podem ver seus próprios logs
CREATE POLICY "users_read_own_audit_logs" ON immutable_audit_logs
  FOR SELECT
  TO authenticated
  USING (actor_id = auth.uid());

-- Insert permitido via função (SECURITY DEFINER)
CREATE POLICY "insert_via_function" ON immutable_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 6. VIEW: Resumo de Auditoria
-- =====================================================

CREATE OR REPLACE VIEW audit_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  action,
  entity_type,
  COUNT(*) as count,
  COUNT(DISTINCT actor_id) as unique_actors
FROM immutable_audit_logs
GROUP BY DATE_TRUNC('day', created_at), action, entity_type
ORDER BY date DESC, count DESC;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE immutable_audit_logs IS 'OPS-V7: Logs de auditoria imutáveis (append-only) para conformidade ISM/ISPS';
COMMENT ON FUNCTION insert_audit_log IS 'Insere log de auditoria com checksum de integridade';
COMMENT ON FUNCTION prevent_audit_log_modification IS 'Bloqueia UPDATE/DELETE em logs de auditoria';
