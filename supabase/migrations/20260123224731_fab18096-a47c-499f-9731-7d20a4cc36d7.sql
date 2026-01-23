-- Alert Rules table for contract alerts
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('sla_breach', 'contract_expiry', 'downtime_critical', 'maintenance_due', 'custom')),
  condition_text TEXT,
  channels TEXT[] DEFAULT '{}',
  recipients TEXT[] DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT true,
  threshold NUMERIC,
  advance_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Contract Alert Logs table
CREATE TABLE IF NOT EXISTS public.contract_alert_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES public.alert_rules(id) ON DELETE SET NULL,
  channels TEXT[] DEFAULT '{}',
  recipients TEXT[] DEFAULT '{}',
  message TEXT,
  priority TEXT DEFAULT 'medium',
  is_test BOOLEAN DEFAULT false,
  results JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Predictions table for storing downtime predictions
CREATE TABLE IF NOT EXISTS public.ai_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  prediction_type TEXT NOT NULL,
  prediction_data JSONB,
  confidence_score NUMERIC,
  method TEXT,
  vessel_id UUID REFERENCES public.vessels(id),
  contract_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_alert_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;

-- Policies for alert_rules
CREATE POLICY "Users can view alert rules" ON public.alert_rules
  FOR SELECT USING (true);

CREATE POLICY "Users can manage alert rules" ON public.alert_rules
  FOR ALL USING (true);

-- Policies for contract_alert_logs
CREATE POLICY "Users can view alert logs" ON public.contract_alert_logs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert alert logs" ON public.contract_alert_logs
  FOR INSERT WITH CHECK (true);

-- Policies for ai_predictions
CREATE POLICY "Users can view predictions" ON public.ai_predictions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage predictions" ON public.ai_predictions
  FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alert_rules_type ON public.alert_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_alert_logs_sent_at ON public.contract_alert_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_type ON public.ai_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_created ON public.ai_predictions(created_at DESC);