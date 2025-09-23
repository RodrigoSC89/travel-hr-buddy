-- Expandir sistema de roles com mais opções
-- Atualizar enum de roles para incluir mais funções
ALTER TYPE public.user_role ADD VALUE 'hr_analyst';
ALTER TYPE public.user_role ADD VALUE 'department_manager';
ALTER TYPE public.user_role ADD VALUE 'supervisor';
ALTER TYPE public.user_role ADD VALUE 'coordinator';