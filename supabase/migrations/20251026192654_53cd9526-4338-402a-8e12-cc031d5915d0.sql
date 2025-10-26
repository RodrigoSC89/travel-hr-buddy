-- ==========================================
-- PATCH 196-205 - Consolidated Migrations
-- ==========================================

-- PATCH 196: Learning Events Table
CREATE TABLE IF NOT EXISTS public.learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('user_action', 'system_decision', 'error_event', 'performance_metric', 'feedback')),
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id),
  module_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_events_type ON public.learning_events(event_type);
CREATE INDEX IF NOT EXISTS idx_learning_events_user ON public.learning_events(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_timestamp ON public.learning_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_learning_events_module ON public.learning_events(module_name);

ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert learning events" ON public.learning_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view all learning events" ON public.learning_events
  FOR SELECT USING (true);

-- PATCH 197: SaaS Engine Tables
CREATE TABLE IF NOT EXISTS public.tenant_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  module_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, module_name)
);

CREATE INDEX IF NOT EXISTS idx_tenant_modules_tenant ON public.tenant_modules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_modules_module ON public.tenant_modules(module_name);

ALTER TABLE public.tenant_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant modules" ON public.tenant_modules
  FOR SELECT USING (true);

-- PATCH 199: Knowledge Sync Tables
CREATE TABLE IF NOT EXISTS public.local_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_type TEXT NOT NULL,
  content JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.global_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_type TEXT NOT NULL,
  aggregated_data JSONB NOT NULL,
  source_count INTEGER DEFAULT 0,
  confidence_score NUMERIC(3,2),
  performance_metrics JSONB,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_local_knowledge_type ON public.local_knowledge(knowledge_type);
CREATE INDEX IF NOT EXISTS idx_global_knowledge_type ON public.global_knowledge(knowledge_type);

ALTER TABLE public.local_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read local knowledge" ON public.local_knowledge
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert local knowledge" ON public.local_knowledge
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update local knowledge" ON public.local_knowledge
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can read global knowledge" ON public.global_knowledge
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert global knowledge" ON public.global_knowledge
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update global knowledge" ON public.global_knowledge
  FOR UPDATE USING (true);

-- PATCH 201: Cognitive Feedback Table
CREATE TABLE IF NOT EXISTS public.cognitive_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL,
  operator_id UUID REFERENCES auth.users(id),
  operator_action TEXT,
  correction_type TEXT CHECK (correction_type IN ('incorrect', 'partially_correct', 'can_improve')),
  before_state JSONB,
  after_state JSONB,
  reason TEXT,
  context JSONB,
  module_name TEXT,
  impact_score INTEGER DEFAULT 0,
  applied BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cognitive_feedback_operator ON public.cognitive_feedback(operator_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_feedback_decision ON public.cognitive_feedback(decision_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_feedback_timestamp ON public.cognitive_feedback(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cognitive_feedback_type ON public.cognitive_feedback(correction_type);
CREATE INDEX IF NOT EXISTS idx_cognitive_feedback_module ON public.cognitive_feedback(module_name);

ALTER TABLE public.cognitive_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all feedback" ON public.cognitive_feedback
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own feedback" ON public.cognitive_feedback
  FOR INSERT WITH CHECK (auth.uid() = operator_id);

-- PATCH 204: Add missing columns to vessels table
ALTER TABLE public.vessels 
  ADD COLUMN IF NOT EXISTS flag TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_tenant_modules_updated_at ON public.tenant_modules;
CREATE TRIGGER update_tenant_modules_updated_at
  BEFORE UPDATE ON public.tenant_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_local_knowledge_updated_at ON public.local_knowledge;
CREATE TRIGGER update_local_knowledge_updated_at
  BEFORE UPDATE ON public.local_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_global_knowledge_updated_at ON public.global_knowledge;
CREATE TRIGGER update_global_knowledge_updated_at
  BEFORE UPDATE ON public.global_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();