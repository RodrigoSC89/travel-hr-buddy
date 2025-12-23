-- =====================================================
-- PATCH 853: Missing Tables for Type Safety
-- Creates: satcom_links, satcom_logs, job_embeddings, compliance_audit_logs
-- =====================================================

-- =====================================================
-- 1. SATCOM_LINKS - Satellite communication links
-- =====================================================
CREATE TABLE IF NOT EXISTS public.satcom_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('Iridium', 'Starlink', 'Inmarsat', 'Thuraya')),
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'degraded')),
  signal_strength INTEGER CHECK (signal_strength >= 0 AND signal_strength <= 100),
  latency_ms INTEGER CHECK (latency_ms >= 0),
  bandwidth_kbps INTEGER CHECK (bandwidth_kbps >= 0),
  last_ping_at TIMESTAMP WITH TIME ZONE,
  last_failure_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.satcom_links ENABLE ROW LEVEL SECURITY;

-- Policies for satcom_links
CREATE POLICY "Users can view satcom links" 
ON public.satcom_links FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage satcom links" 
ON public.satcom_links FOR ALL 
USING (auth.role() = 'authenticated');

-- Index for vessel queries
CREATE INDEX idx_satcom_links_vessel ON public.satcom_links(vessel_id);
CREATE INDEX idx_satcom_links_status ON public.satcom_links(status);

-- =====================================================
-- 2. SATCOM_LOGS - Satellite communication logs
-- =====================================================
CREATE TABLE IF NOT EXISTS public.satcom_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  transmission_type TEXT NOT NULL CHECK (transmission_type IN ('send', 'receive', 'status', 'heartbeat')),
  provider TEXT NOT NULL CHECK (provider IN ('Iridium', 'Starlink', 'Inmarsat', 'Thuraya')),
  message_content TEXT,
  signal_strength INTEGER CHECK (signal_strength >= 0 AND signal_strength <= 100),
  latency_ms INTEGER CHECK (latency_ms >= 0),
  bandwidth_kbps INTEGER CHECK (bandwidth_kbps >= 0),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'degraded', 'timeout')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.satcom_logs ENABLE ROW LEVEL SECURITY;

-- Policies for satcom_logs
CREATE POLICY "Users can view satcom logs" 
ON public.satcom_logs FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create satcom logs" 
ON public.satcom_logs FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Indexes for efficient queries
CREATE INDEX idx_satcom_logs_vessel ON public.satcom_logs(vessel_id);
CREATE INDEX idx_satcom_logs_created ON public.satcom_logs(created_at DESC);
CREATE INDEX idx_satcom_logs_metadata ON public.satcom_logs USING GIN(metadata);

-- =====================================================
-- 3. JOB_EMBEDDINGS - AI embeddings for job similarity
-- =====================================================
CREATE TABLE IF NOT EXISTS public.job_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  embedding JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id)
);

-- Enable RLS
ALTER TABLE public.job_embeddings ENABLE ROW LEVEL SECURITY;

-- Policies for job_embeddings
CREATE POLICY "Users can view job embeddings" 
ON public.job_embeddings FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage job embeddings" 
ON public.job_embeddings FOR ALL 
USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_job_embeddings_job ON public.job_embeddings(job_id);

-- =====================================================
-- 4. COMPLIANCE_AUDIT_LOGS - AI compliance audit results
-- =====================================================
CREATE TABLE IF NOT EXISTS public.compliance_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  score NUMERIC(5,4) NOT NULL CHECK (score >= 0 AND score <= 1),
  level TEXT NOT NULL CHECK (level IN ('Conforme', 'Risco', 'Não Conforme')),
  audit_type TEXT,
  rules_evaluated JSONB DEFAULT '[]'::jsonb,
  violations JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for compliance_audit_logs
CREATE POLICY "Users can view compliance audit logs" 
ON public.compliance_audit_logs FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create compliance audit logs" 
ON public.compliance_audit_logs FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_compliance_audit_vessel ON public.compliance_audit_logs(vessel_id);
CREATE INDEX idx_compliance_audit_level ON public.compliance_audit_logs(level);
CREATE INDEX idx_compliance_audit_timestamp ON public.compliance_audit_logs(timestamp DESC);

-- =====================================================
-- 5. TRIGGER for updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to satcom_links
DROP TRIGGER IF EXISTS update_satcom_links_updated_at ON public.satcom_links;
CREATE TRIGGER update_satcom_links_updated_at
  BEFORE UPDATE ON public.satcom_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to job_embeddings
DROP TRIGGER IF EXISTS update_job_embeddings_updated_at ON public.job_embeddings;
CREATE TRIGGER update_job_embeddings_updated_at
  BEFORE UPDATE ON public.job_embeddings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();