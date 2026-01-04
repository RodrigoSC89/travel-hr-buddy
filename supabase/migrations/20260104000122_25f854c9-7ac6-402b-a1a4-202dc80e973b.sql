-- Tabela para logs de backup
CREATE TABLE IF NOT EXISTS public.backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'point_in_time')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'verified')),
  size_bytes BIGINT,
  tables_backed_up TEXT[],
  duration_ms INTEGER,
  storage_location TEXT,
  error_message TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Tabela para health checks do sistema
CREATE TABLE IF NOT EXISTS public.system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
  response_time_ms INTEGER,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela para auditoria de segurança
CREATE TABLE IF NOT EXISTS public.security_scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  finding_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  table_name TEXT,
  recommendation TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored', 'false_positive')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON public.backup_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_logs_status ON public.backup_logs(status);
CREATE INDEX IF NOT EXISTS idx_system_health_checks_type ON public.system_health_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_security_scan_results_severity ON public.security_scan_results(severity);
CREATE INDEX IF NOT EXISTS idx_security_scan_results_status ON public.security_scan_results(status);

-- RLS para backup_logs (apenas admins podem ver)
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view backup logs"
  ON public.backup_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role can insert backup logs"
  ON public.backup_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update backup logs"
  ON public.backup_logs FOR UPDATE
  USING (true);

-- RLS para system_health_checks
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view health checks"
  ON public.system_health_checks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can insert health checks"
  ON public.system_health_checks FOR INSERT
  WITH CHECK (true);

-- RLS para security_scan_results
ALTER TABLE public.security_scan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security scans"
  ON public.security_scan_results FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role can manage security scans"
  ON public.security_scan_results FOR ALL
  USING (true);

-- Função para corrigir search_path em funções existentes
-- (Corrige warnings do linter)
CREATE OR REPLACE FUNCTION public.update_peotram_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_training_modules_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_mlc_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_set_joined_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'active' AND OLD.status != 'active' AND NEW.joined_at IS NULL THEN
        NEW.joined_at = now();
    END IF;
    RETURN NEW;
END;
$$;