-- ============================================
-- CRIAÇÃO DE TABELA: organization_members
-- Data: 2025-01-06 (PRÉ-REQUISITO)
-- Propósito: Tabela fundamental para controle de membros de organizações
-- IMPORTANTE: Esta migration DEVE ser executada PRIMEIRO
-- ============================================

-- ============================================
-- ORGANIZATION_MEMBERS
-- Relaciona usuários às organizações com seus papéis
-- ============================================
CREATE TABLE IF NOT EXISTS public.organization_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('admin', 'manager', 'member', 'viewer', 'super_admin')),
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at timestamptz DEFAULT now(),
    joined_at timestamptz,
    last_active_at timestamptz,
    permissions jsonb DEFAULT '{}', -- Permissões customizadas
    metadata jsonb DEFAULT '{}', -- Metadados adicionais
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(organization_id, user_id)
);

-- Indexes
CREATE INDEX idx_organization_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_organization_members_user ON public.organization_members(user_id);
CREATE INDEX idx_organization_members_role ON public.organization_members(role);
CREATE INDEX idx_organization_members_status ON public.organization_members(status);
CREATE INDEX idx_organization_members_org_user ON public.organization_members(organization_id, user_id);

-- RLS Policies
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- SELECT: Membros podem ver outros membros da mesma organização
CREATE POLICY "organization_members_select" ON public.organization_members
    FOR SELECT USING (
        auth.uid() = user_id
        OR
        auth.uid() IN (
            SELECT user_id 
            FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.status = 'active'
        )
    );

-- INSERT: Apenas admins podem adicionar novos membros
CREATE POLICY "organization_members_insert" ON public.organization_members
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id 
            FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.role IN ('admin', 'super_admin')
            AND om.status = 'active'
        )
        OR auth.role() = 'service_role'
    );

-- UPDATE: Admins podem atualizar; membros podem atualizar próprio perfil
CREATE POLICY "organization_members_update" ON public.organization_members
    FOR UPDATE USING (
        auth.uid() = user_id
        OR
        auth.uid() IN (
            SELECT user_id 
            FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.role IN ('admin', 'super_admin')
            AND om.status = 'active'
        )
    );

-- DELETE: Apenas admins podem remover membros
CREATE POLICY "organization_members_delete" ON public.organization_members
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id 
            FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.role IN ('admin', 'super_admin')
            AND om.status = 'active'
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- TRIGGER para updated_at
-- ============================================
CREATE TRIGGER update_organization_members_updated_at
    BEFORE UPDATE ON public.organization_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Auto-set joined_at quando status muda para active
-- ============================================
CREATE OR REPLACE FUNCTION public.auto_set_joined_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'active' AND OLD.status != 'active' AND NEW.joined_at IS NULL THEN
        NEW.joined_at = now();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_set_joined_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW EXECUTE FUNCTION auto_set_joined_at();

-- ============================================
-- FUNÇÃO: get_user_organizations
-- Retorna organizações do usuário
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_organizations(p_user_id uuid)
RETURNS TABLE (
    organization_id uuid,
    organization_name text,
    role text,
    status text,
    joined_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        om.organization_id,
        o.name as organization_name,
        om.role,
        om.status,
        om.joined_at
    FROM organization_members om
    JOIN organizations o ON o.id = om.organization_id
    WHERE om.user_id = p_user_id
    AND om.status = 'active'
    ORDER BY om.joined_at DESC;
$$;

-- ============================================
-- FUNÇÃO: check_user_permission
-- Verifica se usuário tem permissão específica
-- ============================================
CREATE OR REPLACE FUNCTION public.check_user_permission(
    p_user_id uuid,
    p_organization_id uuid,
    p_required_role text DEFAULT 'member'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_role text;
    v_role_hierarchy jsonb;
BEGIN
    -- Hierarchy: super_admin > admin > manager > member > viewer
    v_role_hierarchy := '{"super_admin": 5, "admin": 4, "manager": 3, "member": 2, "viewer": 1}'::jsonb;
    
    SELECT role INTO v_user_role
    FROM organization_members
    WHERE user_id = p_user_id
    AND organization_id = p_organization_id
    AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Compare role levels
    RETURN (v_role_hierarchy->>v_user_role)::int >= (v_role_hierarchy->>p_required_role)::int;
END;
$$;

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON TABLE organization_members IS 'Relacionamento entre usuários e organizações com controle de papéis e permissões';
COMMENT ON FUNCTION get_user_organizations IS 'Retorna todas as organizações ativas de um usuário';
COMMENT ON FUNCTION check_user_permission IS 'Verifica se usuário tem permissão baseado em hierarquia de roles';

-- ============================================
-- VALIDAÇÃO
-- ============================================
DO $$
BEGIN
    -- Verificar se tabela foi criada
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'organization_members'
    ) THEN
        RAISE NOTICE '✅ Tabela organization_members criada com sucesso';
    ELSE
        RAISE EXCEPTION '❌ Falha ao criar tabela organization_members';
    END IF;
    
    -- Verificar RLS habilitado
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'organization_members'
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS habilitado na tabela organization_members';
    ELSE
        RAISE EXCEPTION '❌ RLS não habilitado na tabela organization_members';
    END IF;
END $$;

-- Mostrar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'organization_members'
ORDER BY policyname;
