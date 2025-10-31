-- PATCH 544: Core Tables for Technical Operations
-- Creating base tables without complex dependencies

-- 1. System Logs Table
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details JSONB,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')) DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_logs
CREATE POLICY "System logs are viewable by authenticated users"
  ON public.system_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert logs"
  ON public.system_logs FOR INSERT
  WITH CHECK (true);

-- Index for performance
CREATE INDEX idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX idx_system_logs_severity ON public.system_logs(severity);
CREATE INDEX idx_system_logs_module ON public.system_logs(module);

-- 2. Autofix History Table
CREATE TABLE IF NOT EXISTS public.autofix_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  fix_applied TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'applied', 'reverted', 'failed')) DEFAULT 'pending',
  details JSONB,
  applied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reverted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.autofix_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for autofix_history
CREATE POLICY "Autofix history viewable by authenticated users"
  ON public.autofix_history FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autofix history insertable by authenticated users"
  ON public.autofix_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autofix history updatable by authenticated users"
  ON public.autofix_history FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Index for performance
CREATE INDEX idx_autofix_history_file_path ON public.autofix_history(file_path);
CREATE INDEX idx_autofix_history_status ON public.autofix_history(status);
CREATE INDEX idx_autofix_history_applied_at ON public.autofix_history(applied_at DESC);

-- 3. DP Incidents Table (simplified, no dependencies)
CREATE TABLE IF NOT EXISTS public.dp_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID,
  incident_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  description TEXT NOT NULL,
  location JSONB,
  status TEXT CHECK (status IN ('open', 'investigating', 'resolved', 'closed')) DEFAULT 'open',
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.dp_incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dp_incidents
CREATE POLICY "DP incidents viewable by authenticated users"
  ON public.dp_incidents FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "DP incidents insertable by authenticated users"
  ON public.dp_incidents FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "DP incidents updatable by authenticated users"
  ON public.dp_incidents FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Index for performance
CREATE INDEX idx_dp_incidents_vessel_id ON public.dp_incidents(vessel_id);
CREATE INDEX idx_dp_incidents_severity ON public.dp_incidents(severity);
CREATE INDEX idx_dp_incidents_status ON public.dp_incidents(status);
CREATE INDEX idx_dp_incidents_reported_at ON public.dp_incidents(reported_at DESC);

-- 4. Checklist Completions Table (simplified, self-contained)
CREATE TABLE IF NOT EXISTS public.checklist_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_name TEXT NOT NULL,
  vessel_id UUID,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completion_data JSONB NOT NULL,
  score INTEGER,
  status TEXT CHECK (status IN ('draft', 'in_progress', 'completed', 'approved')) DEFAULT 'draft',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.checklist_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for checklist_completions
CREATE POLICY "Checklist completions viewable by authenticated users"
  ON public.checklist_completions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own checklist completions"
  ON public.checklist_completions FOR INSERT
  WITH CHECK (auth.uid() = completed_by);

CREATE POLICY "Users can update their own checklist completions"
  ON public.checklist_completions FOR UPDATE
  USING (auth.uid() = completed_by OR auth.uid() = approved_by);

-- Index for performance
CREATE INDEX idx_checklist_completions_vessel_id ON public.checklist_completions(vessel_id);
CREATE INDEX idx_checklist_completions_completed_by ON public.checklist_completions(completed_by);
CREATE INDEX idx_checklist_completions_status ON public.checklist_completions(status);
CREATE INDEX idx_checklist_completions_completed_at ON public.checklist_completions(completed_at DESC);