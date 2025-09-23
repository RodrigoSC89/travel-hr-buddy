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