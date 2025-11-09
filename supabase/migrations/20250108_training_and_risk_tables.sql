-- ============================================
-- TABELAS DE TREINAMENTO E AVALIAÇÃO DE RISCO
-- Data: 2025-01-08
-- Objetivo: Criar tabelas faltantes para AI Training e Risk Operations
-- ============================================

-- ============================================
-- 1. CREW TRAINING QUIZZES
-- ============================================
CREATE TABLE IF NOT EXISTS public.crew_training_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  quiz_title TEXT NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('ism', 'isps', 'marpol', 'stcw', 'colreg', 'solas', 'general')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  passing_score INTEGER NOT NULL DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para crew_training_quizzes
CREATE INDEX IF NOT EXISTS idx_crew_training_quizzes_crew_member 
  ON public.crew_training_quizzes(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_training_quizzes_type 
  ON public.crew_training_quizzes(quiz_type);

-- RLS para crew_training_quizzes
ALTER TABLE public.crew_training_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_training_quizzes_select" ON public.crew_training_quizzes
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = (
        SELECT organization_id FROM crew_members WHERE id = crew_training_quizzes.crew_member_id
      )
    )
  );

CREATE POLICY "crew_training_quizzes_insert" ON public.crew_training_quizzes
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = (
        SELECT organization_id FROM crew_members WHERE id = crew_training_quizzes.crew_member_id
      )
      AND role IN ('admin', 'manager')
    )
  );

-- ============================================
-- 2. CREW TRAINING RESULTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.crew_training_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.crew_training_quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para crew_training_results
CREATE INDEX IF NOT EXISTS idx_crew_training_results_crew_member 
  ON public.crew_training_results(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_training_results_quiz 
  ON public.crew_training_results(quiz_id);

-- RLS para crew_training_results
ALTER TABLE public.crew_training_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_training_results_select" ON public.crew_training_results
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = (
        SELECT organization_id FROM crew_members WHERE id = crew_training_results.crew_member_id
      )
    )
  );

-- ============================================
-- 3. CREW LEARNING PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS public.crew_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  total_quizzes_taken INTEGER NOT NULL DEFAULT 0,
  total_quizzes_passed INTEGER NOT NULL DEFAULT 0,
  average_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  last_quiz_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crew_member_id, category)
);

-- Índices para crew_learning_progress
CREATE INDEX IF NOT EXISTS idx_crew_learning_progress_crew_member 
  ON public.crew_learning_progress(crew_member_id);

-- RLS para crew_learning_progress
ALTER TABLE public.crew_learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_learning_progress_select" ON public.crew_learning_progress
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = (
        SELECT organization_id FROM crew_members WHERE id = crew_learning_progress.crew_member_id
      )
    )
  );

-- ============================================
-- 4. NONCOMPLIANCE EXPLANATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.noncompliance_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_finding_id UUID REFERENCES public.audit_findings(id) ON DELETE CASCADE,
  explanation_text TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  recommendations JSONB DEFAULT '[]'::jsonb,
  regulatory_references JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para noncompliance_explanations
CREATE INDEX IF NOT EXISTS idx_noncompliance_explanations_finding 
  ON public.noncompliance_explanations(audit_finding_id);
CREATE INDEX IF NOT EXISTS idx_noncompliance_explanations_severity 
  ON public.noncompliance_explanations(severity);

-- RLS para noncompliance_explanations
ALTER TABLE public.noncompliance_explanations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "noncompliance_explanations_select" ON public.noncompliance_explanations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members om
      JOIN audit_findings af ON af.id = noncompliance_explanations.audit_finding_id
      WHERE om.organization_id = af.organization_id
    )
  );

-- ============================================
-- 5. RISK ASSESSMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_type TEXT NOT NULL,
  risk_type TEXT NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'mitigated', 'accepted', 'closed')),
  description TEXT,
  impact_analysis JSONB DEFAULT '{}'::jsonb,
  mitigation_plan JSONB DEFAULT '{}'::jsonb,
  assessed_by UUID REFERENCES auth.users(id),
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para risk_assessments
CREATE INDEX IF NOT EXISTS idx_risk_assessments_vessel 
  ON public.risk_assessments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_org 
  ON public.risk_assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_severity 
  ON public.risk_assessments(severity);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_status 
  ON public.risk_assessments(status);

-- RLS para risk_assessments
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "risk_assessments_select" ON public.risk_assessments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = risk_assessments.organization_id
    )
  );

CREATE POLICY "risk_assessments_insert" ON public.risk_assessments
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = risk_assessments.organization_id
      AND role IN ('admin', 'manager')
    )
  );

-- ============================================
-- 6. RISK HEATMAP DATA
-- ============================================
CREATE TABLE IF NOT EXISTS public.risk_heatmap_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT,
  risk_level INTEGER NOT NULL CHECK (risk_level >= 0 AND risk_level <= 100),
  frequency INTEGER NOT NULL DEFAULT 1,
  impact_score DECIMAL(5,2),
  last_occurrence TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, category, subcategory)
);

-- Índices para risk_heatmap_data
CREATE INDEX IF NOT EXISTS idx_risk_heatmap_org 
  ON public.risk_heatmap_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_risk_heatmap_category 
  ON public.risk_heatmap_data(category);

-- RLS para risk_heatmap_data
ALTER TABLE public.risk_heatmap_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "risk_heatmap_data_select" ON public.risk_heatmap_data
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = risk_heatmap_data.organization_id
    )
  );

-- ============================================
-- 7. RISK TRENDS
-- ============================================
CREATE TABLE IF NOT EXISTS public.risk_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  trend_date DATE NOT NULL,
  total_risks INTEGER NOT NULL DEFAULT 0,
  high_risks INTEGER NOT NULL DEFAULT 0,
  medium_risks INTEGER NOT NULL DEFAULT 0,
  low_risks INTEGER NOT NULL DEFAULT 0,
  trend_direction TEXT CHECK (trend_direction IN ('increasing', 'stable', 'decreasing')),
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, trend_date)
);

-- Índices para risk_trends
CREATE INDEX IF NOT EXISTS idx_risk_trends_org 
  ON public.risk_trends(organization_id);
CREATE INDEX IF NOT EXISTS idx_risk_trends_date 
  ON public.risk_trends(trend_date DESC);

-- RLS para risk_trends
ALTER TABLE public.risk_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "risk_trends_select" ON public.risk_trends
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = risk_trends.organization_id
    )
  );

-- ============================================
-- 8. RISK ALERTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para risk_alerts
CREATE INDEX IF NOT EXISTS idx_risk_alerts_vessel 
  ON public.risk_alerts(vessel_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_org 
  ON public.risk_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_severity 
  ON public.risk_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_read 
  ON public.risk_alerts(is_read);

-- RLS para risk_alerts
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "risk_alerts_select" ON public.risk_alerts
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = risk_alerts.organization_id
    )
  );

CREATE POLICY "risk_alerts_update" ON public.risk_alerts
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = risk_alerts.organization_id
    )
  );

-- ============================================
-- 9. RISK EXPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.risk_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('pdf', 'excel', 'csv', 'json')),
  export_scope TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::jsonb,
  file_url TEXT,
  file_size INTEGER,
  exported_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para risk_exports
CREATE INDEX IF NOT EXISTS idx_risk_exports_org 
  ON public.risk_exports(organization_id);
CREATE INDEX IF NOT EXISTS idx_risk_exports_created 
  ON public.risk_exports(created_at DESC);

-- RLS para risk_exports
ALTER TABLE public.risk_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "risk_exports_select" ON public.risk_exports
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = risk_exports.organization_id
    )
  );

-- ============================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ============================================

-- Trigger para crew_training_quizzes
CREATE OR REPLACE FUNCTION update_crew_training_quizzes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crew_training_quizzes_updated_at
  BEFORE UPDATE ON public.crew_training_quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_crew_training_quizzes_timestamp();

-- Trigger para crew_learning_progress
CREATE TRIGGER crew_learning_progress_updated_at
  BEFORE UPDATE ON public.crew_learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_crew_training_quizzes_timestamp();

-- Trigger para risk_assessments
CREATE TRIGGER risk_assessments_updated_at
  BEFORE UPDATE ON public.risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_crew_training_quizzes_timestamp();

-- ============================================
-- VALIDAÇÃO
-- ============================================
DO $$
DECLARE
  table_count integer;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public'
  AND table_name IN (
    'crew_training_quizzes',
    'crew_training_results',
    'crew_learning_progress',
    'noncompliance_explanations',
    'risk_assessments',
    'risk_heatmap_data',
    'risk_trends',
    'risk_alerts',
    'risk_exports'
  );
  
  IF table_count = 9 THEN
    RAISE NOTICE '✅ SUCCESS: All 9 training and risk tables created';
  ELSE
    RAISE WARNING '⚠️ WARNING: Only % of 9 tables created', table_count;
  END IF;
END $$;

-- Mostrar relatório de tabelas criadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND table_name = t.table_name) as column_count,
  (SELECT COUNT(*) FROM pg_indexes 
   WHERE schemaname = 'public' AND tablename = t.table_name) as index_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
  'crew_training_quizzes',
  'crew_training_results',
  'crew_learning_progress',
  'noncompliance_explanations',
  'risk_assessments',
  'risk_heatmap_data',
  'risk_trends',
  'risk_alerts',
  'risk_exports'
)
ORDER BY table_name;
