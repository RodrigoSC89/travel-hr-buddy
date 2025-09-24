-- Inserir permissões padrão para o sistema de roles
-- Limpar permissões existentes para reconfiguraração
DELETE FROM public.role_permissions;

-- Permissões para ADMIN (acesso total)
INSERT INTO public.role_permissions (role, permission_name, can_read, can_write, can_delete, can_manage) VALUES
('admin', 'users', true, true, true, true),
('admin', 'certificates', true, true, true, true),
('admin', 'reports', true, true, true, true),
('admin', 'system_settings', true, true, true, true),
('admin', 'analytics', true, true, true, true);

-- Permissões para HR_MANAGER
INSERT INTO public.role_permissions (role, permission_name, can_read, can_write, can_delete, can_manage) VALUES
('hr_manager', 'users', true, true, false, true),
('hr_manager', 'certificates', true, true, true, true),
('hr_manager', 'reports', true, true, false, false),
('hr_manager', 'system_settings', true, false, false, false),
('hr_manager', 'analytics', true, false, false, false);

-- Permissões para HR_ANALYST
INSERT INTO public.role_permissions (role, permission_name, can_read, can_write, can_delete, can_manage) VALUES
('hr_analyst', 'users', true, false, false, false),
('hr_analyst', 'certificates', true, true, false, false),
('hr_analyst', 'reports', true, true, false, false),
('hr_analyst', 'system_settings', false, false, false, false),
('hr_analyst', 'analytics', true, false, false, false);

-- Permissões para DEPARTMENT_MANAGER
INSERT INTO public.role_permissions (role, permission_name, can_read, can_write, can_delete, can_manage) VALUES
('department_manager', 'users', true, false, false, false),
('department_manager', 'certificates', true, false, false, false),
('department_manager', 'reports', true, false, false, false),
('department_manager', 'system_settings', false, false, false, false),
('department_manager', 'analytics', true, false, false, false);

-- Permissões para SUPERVISOR
INSERT INTO public.role_permissions (role, permission_name, can_read, can_write, can_delete, can_manage) VALUES
('supervisor', 'users', true, false, false, false),
('supervisor', 'certificates', true, false, false, false),
('supervisor', 'reports', true, false, false, false),
('supervisor', 'system_settings', false, false, false, false),
('supervisor', 'analytics', false, false, false, false);

-- Permissões para COORDINATOR
INSERT INTO public.role_permissions (role, permission_name, can_read, can_write, can_delete, can_manage) VALUES
('coordinator', 'users', false, false, false, false),
('coordinator', 'certificates', true, false, false, false),
('coordinator', 'reports', true, false, false, false),
('coordinator', 'system_settings', false, false, false, false),
('coordinator', 'analytics', false, false, false, false);

-- Permissões para MANAGER
INSERT INTO public.role_permissions (role, permission_name, can_read, can_write, can_delete, can_manage) VALUES
('manager', 'users', true, false, false, false),
('manager', 'certificates', true, false, false, false),
('manager', 'reports', true, false, false, false),
('manager', 'system_settings', false, false, false, false),
('manager', 'analytics', true, false, false, false);

-- Permissões para EMPLOYEE (acesso básico)
INSERT INTO public.role_permissions (role, permission_name, can_read, can_write, can_delete, can_manage) VALUES
('employee', 'users', false, false, false, false),
('employee', 'certificates', false, false, false, false),
('employee', 'reports', false, false, false, false),
('employee', 'system_settings', false, false, false, false),
('employee', 'analytics', false, false, false, false);