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