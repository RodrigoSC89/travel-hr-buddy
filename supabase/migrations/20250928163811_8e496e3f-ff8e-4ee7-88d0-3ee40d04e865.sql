-- Dashboard Enhancement Migration
-- Create tables for personalized dashboard data and user preferences

-- User dashboard configurations
CREATE TABLE public.user_dashboard_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  config_name TEXT NOT NULL DEFAULT 'default',
  layout_type TEXT NOT NULL DEFAULT 'grid', -- 'grid', 'compact', 'executive'
  active_widgets JSONB DEFAULT '[]'::jsonb,
  widget_positions JSONB DEFAULT '{}'::jsonb,
  filters JSONB DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dashboard KPIs and metrics
CREATE TABLE public.dashboard_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL, -- 'operational', 'financial', 'safety', 'compliance', 'hr'
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_change NUMERIC DEFAULT 0,
  metric_target NUMERIC,
  metric_unit TEXT DEFAULT '',
  department TEXT,
  vessel_id UUID,
  user_role TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Dashboard alerts and notifications
CREATE TABLE public.dashboard_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL, -- 'warning', 'error', 'info', 'success'
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  module TEXT NOT NULL, -- 'peotram', 'hr', 'fleet', 'compliance'
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  user_id UUID,
  department TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Recent activities log
CREATE TABLE public.dashboard_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL, -- 'audit', 'checklist', 'travel', 'document'
  title TEXT NOT NULL,
  description TEXT,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  module TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their dashboard configs" 
ON public.user_dashboard_configs 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view department metrics" 
ON public.dashboard_metrics 
FOR SELECT 
USING (true); -- Metrics are generally viewable by all authenticated users

CREATE POLICY "Admins can manage all metrics" 
ON public.dashboard_metrics 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM auth.users 
  WHERE auth.users.id = auth.uid() 
  AND auth.users.raw_user_meta_data->>'role' = 'admin'
));

CREATE POLICY "Users can view relevant alerts" 
ON public.dashboard_alerts 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can update their alert read status" 
ON public.dashboard_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all activities" 
ON public.dashboard_activities 
FOR SELECT 
USING (true);

-- Indexes for performance
CREATE INDEX idx_dashboard_configs_user_id ON public.user_dashboard_configs(user_id);
CREATE INDEX idx_dashboard_metrics_type_date ON public.dashboard_metrics(metric_type, recorded_at DESC);
CREATE INDEX idx_dashboard_alerts_user_priority ON public.dashboard_alerts(user_id, priority, created_at DESC);
CREATE INDEX idx_dashboard_activities_module_date ON public.dashboard_activities(module, created_at DESC);

-- Insert some sample data
INSERT INTO public.dashboard_metrics (metric_type, metric_name, metric_value, metric_change, metric_target, metric_unit, department) VALUES
('operational', 'Active Vessels', 24, 2, 30, 'units', 'fleet'),
('operational', 'Fleet Utilization', 87.5, 5.2, 90, '%', 'fleet'),
('safety', 'Safety Score', 94.8, 1.2, 95, '%', 'safety'),
('compliance', 'PEOTRAM Compliance', 96.2, -1.1, 98, '%', 'audit'),
('hr', 'Active Crew', 156, 8, 160, 'people', 'hr'),
('financial', 'Revenue', 2450000, 12.5, 3000000, 'BRL', 'finance'),
('operational', 'Fuel Efficiency', 8.2, -2.1, 8.5, 'L/nm', 'fleet'),
('compliance', 'Document Compliance', 92.1, 3.4, 95, '%', 'audit');

INSERT INTO public.dashboard_alerts (alert_type, title, description, priority, module, action_url) VALUES
('warning', 'Certificado vencendo', 'Certificado STCW do Cap. Silva vence em 15 dias', 'high', 'hr', '/hr'),
('error', 'Não conformidade PEOTRAM', 'Item 7.3 - Equipamento de segurança não testado', 'critical', 'peotram', '/peotram'),
('info', 'Nova viagem programada', 'Viagem Salvador-Angra programada para 15/10', 'medium', 'travel', '/travel'),
('success', 'Auditoria aprovada', 'Embarcação MV Ocean concluiu auditoria com 98% de aprovação', 'low', 'peotram', '/peotram');

INSERT INTO public.dashboard_activities (activity_type, title, description, user_name, module, entity_id) VALUES
('audit', 'Auditoria PEOTRAM concluída', 'MV Ocean Explorer - Score: 98.5%', 'João Silva', 'peotram', 'audit_001'),
('checklist', 'Checklist de segurança aprovado', 'Checklist pré-navegação - Todos os itens OK', 'Maria Santos', 'checklists', 'check_045'),
('travel', 'Nova viagem criada', 'Salvador → Rio de Janeiro - Partida: 20/10', 'Carlos Mendes', 'travel', 'trip_123'),
('document', 'Documento analisado por IA', 'Certificado STCW processado e validado', 'Sistema IA', 'documents', 'doc_789');