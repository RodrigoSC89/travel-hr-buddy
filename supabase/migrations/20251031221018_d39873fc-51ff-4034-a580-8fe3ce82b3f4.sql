-- PATCH 547 - Schemas Críticos Faltantes (Versão Defensiva)
-- Adiciona colunas faltantes e cria novas tabelas

-- =====================================================
-- 1. BETA FEEDBACK (Nova Tabela)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'feature', 'improvement', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented', 'dismissed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beta_feedback' AND policyname = 'Users can view their own feedback') THEN
    ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own feedback"
      ON public.beta_feedback FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can create their own feedback"
      ON public.beta_feedback FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Admins can view all feedback"
      ON public.beta_feedback FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_beta_feedback_user ON public.beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_status ON public.beta_feedback(status);

-- =====================================================
-- 2. IA PERFORMANCE LOG (Nova Tabela)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ia_performance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  memory_used_mb NUMERIC(10,2),
  cpu_usage_percent NUMERIC(5,2),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  input_size_bytes INTEGER,
  output_size_bytes INTEGER,
  model_version TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ia_performance_module ON public.ia_performance_log(module_name);
CREATE INDEX IF NOT EXISTS idx_ia_performance_created ON public.ia_performance_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ia_performance_success ON public.ia_performance_log(success);

-- =====================================================
-- 3. IA SUGGESTIONS LOG (Nova Tabela)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ia_suggestions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  suggestion_type TEXT NOT NULL,
  suggestion_text TEXT NOT NULL,
  confidence_score NUMERIC(5,4) CHECK (confidence_score BETWEEN 0 AND 1),
  context JSONB DEFAULT '{}'::jsonb,
  accepted BOOLEAN,
  feedback TEXT,
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  category TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ia_suggestions_user ON public.ia_suggestions_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ia_suggestions_type ON public.ia_suggestions_log(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_ia_suggestions_created ON public.ia_suggestions_log(created_at DESC);

-- =====================================================
-- 4. WATCHDOG BEHAVIOR ALERTS (Nova Tabela)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.watchdog_behavior_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  component_name TEXT NOT NULL,
  anomaly_detected TEXT NOT NULL,
  expected_behavior TEXT,
  actual_behavior TEXT,
  deviation_score NUMERIC(5,2),
  auto_resolved BOOLEAN DEFAULT false,
  resolution_action TEXT,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_watchdog_severity ON public.watchdog_behavior_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_watchdog_component ON public.watchdog_behavior_alerts(component_name);
CREATE INDEX IF NOT EXISTS idx_watchdog_created ON public.watchdog_behavior_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchdog_resolved ON public.watchdog_behavior_alerts(auto_resolved);

-- =====================================================
-- 5. PERFORMANCE METRICS (Adicionar Colunas Faltantes)
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'metric_type') THEN
    ALTER TABLE public.performance_metrics ADD COLUMN metric_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'component') THEN
    ALTER TABLE public.performance_metrics ADD COLUMN component TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'page_url') THEN
    ALTER TABLE public.performance_metrics ADD COLUMN page_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'user_id') THEN
    ALTER TABLE public.performance_metrics ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'session_id') THEN
    ALTER TABLE public.performance_metrics ADD COLUMN session_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'device_type') THEN
    ALTER TABLE public.performance_metrics ADD COLUMN device_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'browser') THEN
    ALTER TABLE public.performance_metrics ADD COLUMN browser TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'connection_type') THEN
    ALTER TABLE public.performance_metrics ADD COLUMN connection_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'metadata') THEN
    ALTER TABLE public.performance_metrics ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'unit') THEN
    ALTER TABLE public.performance_metrics ADD COLUMN unit TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_performance_type ON public.performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_component ON public.performance_metrics(component);
CREATE INDEX IF NOT EXISTS idx_performance_user ON public.performance_metrics(user_id);

-- =====================================================
-- 6. SYSTEM HEALTH (Nova Tabela)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down', 'maintenance')),
  response_time_ms INTEGER,
  uptime_percentage NUMERIC(5,2),
  error_rate NUMERIC(5,2),
  last_error TEXT,
  last_check TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_health_service ON public.system_health(service_name);
CREATE INDEX IF NOT EXISTS idx_system_health_status ON public.system_health(status);
CREATE INDEX IF NOT EXISTS idx_system_health_updated ON public.system_health(updated_at DESC);

-- =====================================================
-- 7. SGSO AUDITS (Nova Tabela)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sgso_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID,
  auditor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  audit_date DATE NOT NULL,
  audit_type TEXT CHECK (audit_type IN ('internal', 'external', 'certification', 'followup')),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  compliance_score NUMERIC(5,2),
  non_conformities_count INTEGER DEFAULT 0,
  findings TEXT,
  recommendations TEXT,
  next_audit_date DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sgso_audits') THEN
    ALTER TABLE public.sgso_audits ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view audits they're involved with"
      ON public.sgso_audits FOR SELECT
      USING (
        auth.uid() = auditor_id OR
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role IN ('admin', 'auditor')
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sgso_audits_vessel ON public.sgso_audits(vessel_id);
CREATE INDEX IF NOT EXISTS idx_sgso_audits_auditor ON public.sgso_audits(auditor_id);
CREATE INDEX IF NOT EXISTS idx_sgso_audits_date ON public.sgso_audits(audit_date DESC);
CREATE INDEX IF NOT EXISTS idx_sgso_audits_status ON public.sgso_audits(status);

-- =====================================================
-- 8. SGSO AUDIT ITEMS (Nova Tabela)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sgso_audit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.sgso_audits(id) ON DELETE CASCADE NOT NULL,
  requirement_number INTEGER NOT NULL,
  requirement_title TEXT NOT NULL,
  compliance_status TEXT NOT NULL CHECK (compliance_status IN ('compliant', 'non_compliant', 'not_applicable', 'pending')),
  evidence TEXT,
  comment TEXT,
  corrective_action TEXT,
  responsible TEXT,
  deadline DATE,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sgso_audit_items') THEN
    ALTER TABLE public.sgso_audit_items ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view audit items from audits they can access"
      ON public.sgso_audit_items FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.sgso_audits
          WHERE id = audit_id AND (
            auditor_id = auth.uid() OR
            EXISTS (
              SELECT 1 FROM public.user_roles
              WHERE user_id = auth.uid() AND role IN ('admin', 'auditor')
            )
          )
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sgso_items_audit ON public.sgso_audit_items(audit_id);
CREATE INDEX IF NOT EXISTS idx_sgso_items_status ON public.sgso_audit_items(compliance_status);

-- =====================================================
-- 9. TEMPLATES (Nova Tabela)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_favorite BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'templates') THEN
    ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view public templates and their own"
      ON public.templates FOR SELECT
      USING (
        is_private = false OR 
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );

    CREATE POLICY "Users can create their own templates"
      ON public.templates FOR INSERT
      WITH CHECK (auth.uid() = created_by);

    CREATE POLICY "Users can update their own templates"
      ON public.templates FOR UPDATE
      USING (auth.uid() = created_by);

    CREATE POLICY "Users can delete their own templates"
      ON public.templates FOR DELETE
      USING (auth.uid() = created_by);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_templates_created_by ON public.templates(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_tags ON public.templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_templates_favorite ON public.templates(is_favorite) WHERE is_favorite = true;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_beta_feedback_updated_at') THEN
    CREATE TRIGGER update_beta_feedback_updated_at
      BEFORE UPDATE ON public.beta_feedback
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_system_health_updated_at') THEN
    CREATE TRIGGER update_system_health_updated_at
      BEFORE UPDATE ON public.system_health
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sgso_audits_updated_at') THEN
    CREATE TRIGGER update_sgso_audits_updated_at
      BEFORE UPDATE ON public.sgso_audits
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_templates_updated_at') THEN
    CREATE TRIGGER update_templates_updated_at
      BEFORE UPDATE ON public.templates
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;