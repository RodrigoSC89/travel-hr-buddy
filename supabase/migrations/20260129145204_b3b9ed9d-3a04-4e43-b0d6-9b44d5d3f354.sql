
-- =====================================================
-- SISTEMA DE ACESSO INDIVIDUALIZADO POR EMBARCAÇÃO
-- Nauti One v6.0 - Multi-Tenant Access Control
-- =====================================================

-- 1. Criar tabela de acesso usuário-embarcação
CREATE TABLE IF NOT EXISTS public.user_vessel_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
    access_level TEXT NOT NULL DEFAULT 'member' CHECK (access_level IN ('member', 'officer', 'captain', 'manager')),
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, vessel_id)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_vessel_access_user_id ON public.user_vessel_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vessel_access_vessel_id ON public.user_vessel_access(vessel_id);
CREATE INDEX IF NOT EXISTS idx_user_vessel_access_active ON public.user_vessel_access(is_active) WHERE is_active = true;

-- 3. Habilitar RLS na nova tabela
ALTER TABLE public.user_vessel_access ENABLE ROW LEVEL SECURITY;

-- 4. Vincular crew_members a auth.users (se ainda não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crew_members' 
        AND column_name = 'auth_user_id'
    ) THEN
        ALTER TABLE public.crew_members ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);
        CREATE INDEX idx_crew_members_auth_user_id ON public.crew_members(auth_user_id);
    END IF;
END $$;

-- 5. Função: Verificar se usuário tem acesso global (HR, Admin, Legal, Finance, etc.)
CREATE OR REPLACE FUNCTION public.has_global_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role::TEXT INTO v_role
    FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1;
    
    RETURN v_role IN ('admin', 'hr_manager', 'hr_analyst', 'legal', 'finance', 'purchasing', 'auditor', 'manager');
END;
$$;

-- 6. Função: Verificar se usuário tem acesso a uma embarcação específica
CREATE OR REPLACE FUNCTION public.has_vessel_access(_user_id UUID, _vessel_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Acesso global (admin, HR, jurídico, financeiro, etc.)
    IF public.has_global_access(_user_id) THEN
        RETURN TRUE;
    END IF;
    
    -- Acesso direto via user_vessel_access
    IF EXISTS (
        SELECT 1 FROM public.user_vessel_access
        WHERE user_id = _user_id
        AND vessel_id = _vessel_id
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > now())
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Tripulante vinculado à embarcação
    IF EXISTS (
        SELECT 1 FROM public.crew_members
        WHERE (auth_user_id = _user_id OR user_id = _user_id)
        AND vessel_id = _vessel_id
    ) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- 7. Função: Obter IDs de embarcações que o usuário pode acessar
CREATE OR REPLACE FUNCTION public.get_user_vessel_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Se tem acesso global, retorna todas as embarcações
    IF public.has_global_access(_user_id) THEN
        RETURN QUERY SELECT id FROM public.vessels;
        RETURN;
    END IF;
    
    -- Combina embarcações de diferentes fontes
    RETURN QUERY
    SELECT DISTINCT vessel_id 
    FROM (
        -- Embarcações com acesso direto
        SELECT vessel_id FROM public.user_vessel_access
        WHERE user_id = _user_id
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > now())
        
        UNION
        
        -- Embarcações onde é tripulante
        SELECT vessel_id FROM public.crew_members
        WHERE (auth_user_id = _user_id OR user_id = _user_id)
        AND vessel_id IS NOT NULL
    ) AS all_vessels;
END;
$$;

-- 8. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_user_vessel_access_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_vessel_access_timestamp ON public.user_vessel_access;
CREATE TRIGGER update_user_vessel_access_timestamp
    BEFORE UPDATE ON public.user_vessel_access
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_vessel_access_updated_at();

-- 9. Policies para user_vessel_access
CREATE POLICY "Users can view their own vessel access"
ON public.user_vessel_access FOR SELECT
USING (
    auth.uid() = user_id 
    OR public.has_global_access(auth.uid())
);

CREATE POLICY "Admins and HR can insert vessel access"
ON public.user_vessel_access FOR INSERT
WITH CHECK (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "Admins and HR can update vessel access"
ON public.user_vessel_access FOR UPDATE
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "Admins and HR can delete vessel access"
ON public.user_vessel_access FOR DELETE
USING (public.is_admin_or_hr(auth.uid()));

-- 10. Comentários para documentação
COMMENT ON TABLE public.user_vessel_access IS 'Controle de acesso usuário-embarcação para isolamento de dados';
COMMENT ON FUNCTION public.has_global_access IS 'Verifica se usuário tem acesso a todas as embarcações (HR, Admin, Jurídico, Financeiro, Compras)';
COMMENT ON FUNCTION public.has_vessel_access IS 'Verifica se usuário tem acesso a uma embarcação específica';
COMMENT ON FUNCTION public.get_user_vessel_ids IS 'Retorna IDs de todas as embarcações que o usuário pode acessar';
