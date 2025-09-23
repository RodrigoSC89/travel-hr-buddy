-- Primeiro, adicionar os novos valores ao enum
ALTER TYPE public.user_role ADD VALUE 'hr_analyst';
ALTER TYPE public.user_role ADD VALUE 'department_manager';
ALTER TYPE public.user_role ADD VALUE 'supervisor';
ALTER TYPE public.user_role ADD VALUE 'coordinator';