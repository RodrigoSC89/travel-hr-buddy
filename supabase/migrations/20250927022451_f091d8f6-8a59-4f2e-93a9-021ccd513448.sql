-- Primeiro corrigir as funções RLS e depois criar tabelas de automação
-- Criar função que estava faltando
CREATE OR REPLACE FUNCTION public.can_manage_tenant(tenant_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.tenant_users 
    WHERE tenant_id = tenant_uuid 
    AND user_id = user_uuid 
    AND role IN ('owner', 'admin') 
    AND status = 'active'
  );
$$;

-- Tabelas para sistema de automação
CREATE TABLE IF NOT EXISTS public.automation_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.saas_tenants(id),
  organization_id uuid REFERENCES public.organizations(id),
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL, -- 'schedule', 'event', 'condition'
  trigger_config jsonb NOT NULL DEFAULT '{}',
  actions jsonb NOT NULL DEFAULT '[]',
  conditions jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  last_executed_at timestamp with time zone,
  execution_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.automation_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  triggered_by text, -- 'schedule', 'event', 'manual'
  trigger_data jsonb DEFAULT '{}',
  execution_log jsonb DEFAULT '[]',
  error_message text,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  duration_ms integer
);

CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tenant_id uuid REFERENCES public.saas_tenants(id),
  organization_id uuid REFERENCES public.organizations(id),
  type text NOT NULL, -- 'action', 'insight', 'reminder', 'optimization'
  title text NOT NULL,
  description text NOT NULL,
  action_data jsonb DEFAULT '{}',
  priority integer DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=urgent
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  is_acted_upon boolean DEFAULT false,
  valid_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.automated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.saas_tenants(id),
  organization_id uuid REFERENCES public.organizations(id),
  name text NOT NULL,
  description text,
  report_type text NOT NULL, -- 'weekly_summary', 'monthly_analysis', 'compliance_check', etc.
  schedule_cron text NOT NULL, -- Cron expression for scheduling
  recipients jsonb NOT NULL DEFAULT '[]', -- Array of email addresses
  filters jsonb DEFAULT '{}',
  format text DEFAULT 'pdf', -- 'pdf', 'excel', 'html'
  template_config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_generated_at timestamp with time zone,
  next_scheduled_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tenant_id uuid REFERENCES public.saas_tenants(id),
  organization_id uuid REFERENCES public.organizations(id),
  current_step text NOT NULL DEFAULT 'welcome',
  completed_steps jsonb DEFAULT '[]',
  user_type text, -- 'admin', 'hr', 'captain', 'operator'
  company_profile jsonb DEFAULT '{}',
  preferences jsonb DEFAULT '{}',
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS simplificadas
CREATE POLICY "Users can view workflows from their context"
ON public.automation_workflows
FOR SELECT
USING (
  (tenant_id IS NOT NULL AND tenant_id IN (SELECT tm.tenant_id FROM public.tenant_users tm WHERE tm.user_id = auth.uid() AND tm.status = 'active'))
  OR
  (organization_id IS NOT NULL AND organization_id IN (SELECT om.organization_id FROM public.organization_users om WHERE om.user_id = auth.uid() AND om.status = 'active'))
);

CREATE POLICY "Admins can manage workflows"
ON public.automation_workflows
FOR ALL
USING (
  (tenant_id IS NOT NULL AND public.can_manage_tenant(tenant_id))
  OR
  (organization_id IS NOT NULL AND public.user_belongs_to_organization(organization_id))
);

CREATE POLICY "Users can view AI suggestions"
ON public.ai_suggestions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can create AI suggestions"
ON public.ai_suggestions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their AI suggestions"
ON public.ai_suggestions
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can view their onboarding"
ON public.onboarding_progress
FOR ALL
USING (user_id = auth.uid());

-- Inserir dados demo para automação
INSERT INTO public.automation_workflows (name, description, trigger_type, trigger_config, actions, organization_id, created_by)
VALUES 
(
  'Alerta de Certificados Vencendo',
  'Verifica certificados que vencem em 30 dias e envia notificações',
  'schedule',
  '{"cron": "0 9 * * *", "timezone": "America/Sao_Paulo"}',
  '[
    {"type": "check_certificates", "days_ahead": 30},
    {"type": "send_notification", "template": "certificate_expiry"},
    {"type": "email_notification", "recipients": ["hr@empresa.com"]}
  ]',
  (SELECT id FROM public.organizations LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Relatório Semanal de Operações',
  'Gera relatório semanal de atividades e envia por email',
  'schedule',
  '{"cron": "0 8 * * MON", "timezone": "America/Sao_Paulo"}',
  '[
    {"type": "generate_report", "type": "weekly_operations"},
    {"type": "email_report", "format": "pdf", "recipients": ["gestao@empresa.com"]}
  ]',
  (SELECT id FROM public.organizations LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Sugestão de Otimização de Escalas',
  'IA analisa padrões e sugere otimizações nas escalas',
  'condition',
  '{"condition": "new_schedule_created"}',
  '[
    {"type": "ai_analysis", "model": "schedule_optimizer"},
    {"type": "create_suggestion", "category": "optimization"}
  ]',
  (SELECT id FROM public.organizations LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
);

-- Inserir sugestões de IA demo
INSERT INTO public.ai_suggestions (user_id, title, description, type, priority, action_data, organization_id)
VALUES 
(
  (SELECT id FROM auth.users LIMIT 1),
  'Certificados Vencendo em Breve',
  'Você tem 3 certificados marítimos que vencem nos próximos 15 dias. Recomendo renovar agora para evitar indisponibilidade.',
  'reminder',
  3,
  '{"certificates": ["STCW Basic Safety", "Medical Certificate", "Radar Certificate"], "action": "renew_certificates"}',
  (SELECT id FROM public.organizations LIMIT 1)
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Otimização de Escalas Detectada',
  'Identifiquei uma oportunidade de economia de 15% nos custos de tripulação reorganizando as escalas da próxima semana.',
  'optimization',
  2,
  '{"savings": "15%", "type": "crew_optimization", "action": "review_schedule"}',
  (SELECT id FROM public.organizations LIMIT 1)
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Checklist PEOTRAM Pendente',
  'O audit PEOTRAM do navio MV Atlantic está 2 dias em atraso. Deseja atribuir a um auditor disponível?',
  'action',
  4,
  '{"vessel": "MV Atlantic", "audit_type": "PEOTRAM", "days_overdue": 2, "action": "assign_auditor"}',
  (SELECT id FROM public.organizations LIMIT 1)
);

-- Inserir progresso de onboarding demo
INSERT INTO public.onboarding_progress (user_id, user_type, current_step, completed_steps, company_profile, organization_id)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'admin',
  'company_setup',
  '["welcome", "profile_setup"]',
  '{"company_type": "shipping", "fleet_size": "medium", "primary_operations": ["cargo", "logistics"]}',
  (SELECT id FROM public.organizations LIMIT 1)
);