-- Expandir sistema de roles com mais opções
-- Atualizar enum de roles para incluir mais funções
ALTER TYPE public.user_role ADD VALUE 'hr_analyst';
ALTER TYPE public.user_role ADD VALUE 'department_manager';
ALTER TYPE public.user_role ADD VALUE 'supervisor';
ALTER TYPE public.user_role ADD VALUE 'coordinator';

-- Criar tabela para permissões de sistema
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    permission_name TEXT NOT NULL,
    can_read BOOLEAN DEFAULT false,
    can_write BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_manage BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(role, permission_name)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for role_permissions
CREATE POLICY "Admins can manage all permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (public.get_user_role() = 'admin');

CREATE POLICY "HR managers can view permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (public.get_user_role() IN ('admin', 'hr_manager'));

-- Inserir permissões padrão para cada role
INSERT INTO public.role_permissions (role, permission_name, can_read, can_write, can_delete, can_manage) VALUES
-- Admin - Pode tudo
('admin', 'users', true, true, true, true),
('admin', 'certificates', true, true, true, true),
('admin', 'reports', true, true, true, true),
('admin', 'system_settings', true, true, true, true),
('admin', 'analytics', true, true, true, true),

-- HR Manager - Gestão de pessoas e certificados
('hr_manager', 'users', true, true, false, true),
('hr_manager', 'certificates', true, true, true, true),
('hr_manager', 'reports', true, true, false, false),
('hr_manager', 'analytics', true, false, false, false),

-- HR Analyst - Análise e relatórios
('hr_analyst', 'users', true, false, false, false),
('hr_analyst', 'certificates', true, true, false, false),
('hr_analyst', 'reports', true, true, false, false),
('hr_analyst', 'analytics', true, false, false, false),

-- Department Manager - Gestão do próprio departamento
('department_manager', 'users', true, false, false, false),
('department_manager', 'certificates', true, false, false, false),
('department_manager', 'reports', true, false, false, false),

-- Supervisor - Supervisão limitada
('supervisor', 'users', true, false, false, false),
('supervisor', 'certificates', true, false, false, false),
('supervisor', 'reports', true, false, false, false),

-- Coordinator - Coordenação específica
('coordinator', 'certificates', true, true, false, false),
('coordinator', 'reports', true, false, false, false),

-- Employee - Acesso básico
('employee', 'certificates', true, false, false, false)

ON CONFLICT (role, permission_name) DO NOTHING;

-- Função para verificar permissões específicas
CREATE OR REPLACE FUNCTION public.has_permission(
    permission_name TEXT,
    permission_type TEXT DEFAULT 'read',
    user_uuid UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT CASE permission_type
        WHEN 'read' THEN COALESCE(rp.can_read, false)
        WHEN 'write' THEN COALESCE(rp.can_write, false)
        WHEN 'delete' THEN COALESCE(rp.can_delete, false)
        WHEN 'manage' THEN COALESCE(rp.can_manage, false)
        ELSE false
    END
    FROM public.user_roles ur
    LEFT JOIN public.role_permissions rp ON ur.role = rp.role AND rp.permission_name = permission_name
    WHERE ur.user_id = user_uuid;
$$;

-- Atualizar perfis com mais campos para departamentos
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS employee_id TEXT,
ADD COLUMN IF NOT EXISTS hire_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated'));

-- Trigger para atualizar timestamps
CREATE TRIGGER update_role_permissions_updated_at
    BEFORE UPDATE ON public.role_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();