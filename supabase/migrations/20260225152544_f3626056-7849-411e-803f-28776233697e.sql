
-- System Audit Trail for comprehensive action logging
CREATE TABLE IF NOT EXISTS public.system_audit_trail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL, -- 'create', 'update', 'delete', 'login', 'export', 'approve'
  module text NOT NULL, -- 'vessels', 'crew', 'maintenance', 'compliance', etc
  resource_type text, -- table/entity name
  resource_id text, -- ID of affected resource
  description text,
  changes jsonb, -- { field: { old: x, new: y } }
  metadata jsonb, -- extra context (IP, user_agent, etc)
  severity text DEFAULT 'info', -- 'info', 'warning', 'critical'
  created_at timestamptz DEFAULT now()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON public.system_audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_module ON public.system_audit_trail(module);
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON public.system_audit_trail(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created ON public.system_audit_trail(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_resource ON public.system_audit_trail(resource_type, resource_id);

-- RLS
ALTER TABLE public.system_audit_trail ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read audit trail
CREATE POLICY "Authenticated users can view audit trail"
  ON public.system_audit_trail FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Only system/authenticated can insert
CREATE POLICY "Authenticated users can create audit entries"
  ON public.system_audit_trail FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Cross-module risk scores (materialized view for dashboard)
CREATE TABLE IF NOT EXISTS public.vessel_risk_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid REFERENCES public.vessels(id) ON DELETE CASCADE,
  risk_category text NOT NULL, -- 'maintenance', 'compliance', 'safety', 'operational'
  risk_score integer DEFAULT 0, -- 0-100
  risk_factors jsonb,
  calculated_at timestamptz DEFAULT now(),
  valid_until timestamptz DEFAULT (now() + interval '24 hours'),
  UNIQUE(vessel_id, risk_category)
);

ALTER TABLE public.vessel_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vessel risk scores"
  ON public.vessel_risk_scores FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upsert vessel risk scores"
  ON public.vessel_risk_scores FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update vessel risk scores"
  ON public.vessel_risk_scores FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);
