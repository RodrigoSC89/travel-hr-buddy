-- ═══════════════════════════════════════════════════════════════════════════
-- NAUTI ONE ENTERPRISE INTELLIGENCE SUITE v6.0
-- Schema simplificado sem dependências de organization_id em profiles
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. ENTERPRISE KNOWLEDGE DOCUMENTS
CREATE TABLE IF NOT EXISTS public.enterprise_knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL DEFAULT 'manual',
  category TEXT,
  subcategory TEXT,
  version TEXT DEFAULT '1.0',
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT,
  storage_path TEXT NOT NULL,
  file_url TEXT,
  ocr_status TEXT DEFAULT 'pending',
  ocr_engines_used JSONB DEFAULT '[]',
  ocr_confidence_scores JSONB DEFAULT '{}',
  ocr_consensus_text TEXT,
  ocr_raw_results JSONB DEFAULT '{}',
  ocr_processed_at TIMESTAMPTZ,
  ai_classification TEXT,
  ai_classification_confidence DECIMAL(5,4),
  ai_suggested_categories TEXT[],
  ai_extracted_entities JSONB DEFAULT '{}',
  ai_summary TEXT,
  ai_keywords TEXT[],
  embedding_status TEXT DEFAULT 'pending',
  embedding_model TEXT,
  chunk_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  compliance_standards TEXT[],
  expiry_date DATE,
  review_date DATE,
  approval_status TEXT DEFAULT 'draft',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  parent_document_id UUID,
  is_latest_version BOOLEAN DEFAULT TRUE,
  tags TEXT[],
  vessel_ids UUID[],
  department TEXT,
  access_level TEXT DEFAULT 'internal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMPTZ
);

-- 2. DOCUMENT CHUNKS FOR RAG
CREATE TABLE IF NOT EXISTS public.enterprise_document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.enterprise_knowledge_documents(id) ON DELETE CASCADE NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_tokens INTEGER,
  page_number INTEGER,
  section_title TEXT,
  paragraph_index INTEGER,
  embedding TEXT,
  embedding_model TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FORM TEMPLATES
CREATE TABLE IF NOT EXISTS public.enterprise_form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  form_type TEXT NOT NULL DEFAULT 'checklist',
  category TEXT,
  code TEXT,
  form_schema JSONB NOT NULL DEFAULT '{"fields": []}',
  conditional_logic JSONB DEFAULT '[]',
  scoring_enabled BOOLEAN DEFAULT FALSE,
  scoring_rules JSONB DEFAULT '{}',
  max_score INTEGER,
  passing_score INTEGER,
  compliance_standards TEXT[],
  regulatory_reference TEXT,
  revision_number INTEGER DEFAULT 1,
  requires_signature BOOLEAN DEFAULT FALSE,
  requires_approval BOOLEAN DEFAULT FALSE,
  approval_workflow JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  vessel_types TEXT[],
  departments TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMPTZ
);

-- 4. FORM SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.enterprise_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.enterprise_form_templates(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID,
  vessel_id UUID,
  voyage_id UUID,
  mission_id UUID,
  responses JSONB NOT NULL DEFAULT '{}',
  calculated_score INTEGER,
  score_percentage DECIMAL(5,2),
  pass_fail_status TEXT,
  attachments JSONB DEFAULT '[]',
  photos JSONB DEFAULT '[]',
  signatures JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  submitted_by UUID,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  review_comments TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  location_name TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,
  device_info JSONB DEFAULT '{}',
  offline_sync_status TEXT DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. OCIMF SELF-ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.ocimf_self_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  vessel_id UUID NOT NULL,
  assessment_type TEXT NOT NULL DEFAULT 'OVMSA',
  assessment_version TEXT,
  status TEXT DEFAULT 'in_progress',
  overall_score DECIMAL(5,2),
  compliance_percentage DECIMAL(5,2),
  sections JSONB NOT NULL DEFAULT '{}',
  findings JSONB DEFAULT '[]',
  observations JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  gap_analysis JSONB DEFAULT '{}',
  improvement_plan JSONB DEFAULT '{}',
  evidence_documents JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  target_completion_date DATE,
  completed_at TIMESTAMPTZ,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 6. CREW FATIGUE RECORDS
CREATE TABLE IF NOT EXISTS public.crew_fatigue_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  crew_member_id UUID NOT NULL,
  vessel_id UUID,
  record_date DATE NOT NULL,
  work_hours_24h DECIMAL(4,2),
  work_hours_7d DECIMAL(5,2),
  rest_hours_24h DECIMAL(4,2),
  continuous_rest_hours DECIMAL(4,2),
  mlc_compliant BOOLEAN,
  mlc_violations JSONB DEFAULT '[]',
  fatigue_risk_score DECIMAL(5,2),
  fatigue_risk_level TEXT,
  fatigue_factors JSONB DEFAULT '{}',
  ai_recommendations JSONB DEFAULT '[]',
  predicted_performance_impact DECIMAL(5,2),
  intervention_required BOOLEAN DEFAULT FALSE,
  intervention_type TEXT,
  intervention_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREW MATCHING ANALYSES
CREATE TABLE IF NOT EXISTS public.crew_matching_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  vessel_id UUID,
  voyage_id UUID,
  mission_type TEXT,
  position_requirements JSONB NOT NULL DEFAULT '{}',
  candidates_analyzed JSONB NOT NULL DEFAULT '[]',
  recommended_crew_id UUID,
  match_score DECIMAL(5,2),
  match_factors JSONB DEFAULT '{}',
  team_compatibility_score DECIMAL(5,2),
  team_dynamics_analysis JSONB DEFAULT '{}',
  identified_risks JSONB DEFAULT '[]',
  mitigation_suggestions JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  accepted_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 8. CONTRACT AI ANALYSES
CREATE TABLE IF NOT EXISTS public.contract_ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  document_id UUID,
  contract_name TEXT NOT NULL,
  contract_type TEXT,
  parties JSONB DEFAULT '[]',
  analysis_status TEXT DEFAULT 'pending',
  analysis_model TEXT,
  analysis_confidence DECIMAL(5,4),
  extracted_clauses JSONB DEFAULT '[]',
  risk_clauses JSONB DEFAULT '[]',
  overall_risk_score DECIMAL(5,2),
  risk_categories JSONB DEFAULT '{}',
  key_dates JSONB DEFAULT '[]',
  financial_terms JSONB DEFAULT '{}',
  negotiation_opportunities JSONB DEFAULT '[]',
  potential_savings DECIMAL(15,2),
  market_comparison JSONB DEFAULT '{}',
  benchmark_score DECIMAL(5,2),
  ai_recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ,
  created_by UUID
);

-- 9. COMPLIANCE PREDICTIONS
CREATE TABLE IF NOT EXISTS public.compliance_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  vessel_id UUID,
  inspection_type TEXT NOT NULL,
  target_port TEXT,
  target_date DATE,
  predicted_outcome TEXT,
  confidence_score DECIMAL(5,2),
  predicted_ncs JSONB DEFAULT '[]',
  historical_patterns JSONB DEFAULT '{}',
  similar_inspections JSONB DEFAULT '[]',
  risk_areas JSONB DEFAULT '{}',
  preparation_checklist JSONB DEFAULT '[]',
  priority_actions JSONB DEFAULT '[]',
  estimated_prep_time_hours INTEGER,
  preparation_status TEXT DEFAULT 'not_started',
  preparation_progress DECIMAL(5,2),
  actual_outcome TEXT,
  actual_ncs JSONB DEFAULT '[]',
  prediction_accuracy DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. RAG CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.rag_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  user_id UUID NOT NULL,
  title TEXT,
  context_type TEXT DEFAULT 'knowledge_base',
  message_count INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rag_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.rag_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  tokens_used INTEGER,
  model_used TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_ekd_org ON public.enterprise_knowledge_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_ekd_type ON public.enterprise_knowledge_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_ekd_cat ON public.enterprise_knowledge_documents(category);
CREATE INDEX IF NOT EXISTS idx_ekd_ocr ON public.enterprise_knowledge_documents(ocr_status);
CREATE INDEX IF NOT EXISTS idx_ekd_emb ON public.enterprise_knowledge_documents(embedding_status);
CREATE INDEX IF NOT EXISTS idx_edc_doc ON public.enterprise_document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_eft_org ON public.enterprise_form_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_efs_tmpl ON public.enterprise_form_submissions(template_id);
CREATE INDEX IF NOT EXISTS idx_cfr_crew ON public.crew_fatigue_records(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_cfr_date ON public.crew_fatigue_records(record_date);
CREATE INDEX IF NOT EXISTS idx_cp_vessel ON public.compliance_predictions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_rag_user ON public.rag_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_rag_msg ON public.rag_messages(conversation_id);

-- RLS
ALTER TABLE public.enterprise_knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocimf_self_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_fatigue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_matching_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_messages ENABLE ROW LEVEL SECURITY;

-- Simple authenticated-only policies
CREATE POLICY "auth_ekd" ON public.enterprise_knowledge_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_edc" ON public.enterprise_document_chunks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_eft" ON public.enterprise_form_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_efs" ON public.enterprise_form_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_ocimf" ON public.ocimf_self_assessments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_cfr" ON public.crew_fatigue_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_cma" ON public.crew_matching_analyses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_caa" ON public.contract_ai_analyses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_cp" ON public.compliance_predictions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "own_rag_conv" ON public.rag_conversations FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own_rag_msg" ON public.rag_messages FOR ALL TO authenticated USING (conversation_id IN (SELECT id FROM public.rag_conversations WHERE user_id = auth.uid())) WITH CHECK (conversation_id IN (SELECT id FROM public.rag_conversations WHERE user_id = auth.uid()));