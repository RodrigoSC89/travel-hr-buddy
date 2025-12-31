-- =====================================================
-- PEOTRAM 2024 - COMPLETE DATABASE SCHEMA
-- 13 Elementos Reais Petrobras + Storage + Auditorias
-- =====================================================

-- 1. TABELA DE ESTRUTURA PEOTRAM
CREATE TABLE IF NOT EXISTS public.peotram_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  cycle TEXT NOT NULL,
  total_elements INTEGER DEFAULT 13,
  total_items INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(year, cycle)
);

-- 2. TABELA DOS 13 ELEMENTOS
CREATE TABLE IF NOT EXISTS public.peotram_elements_2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id UUID REFERENCES public.peotram_structures(id) ON DELETE CASCADE,
  element_number INTEGER NOT NULL CHECK (element_number BETWEEN 1 AND 13),
  element_name TEXT NOT NULL,
  element_sigla TEXT,
  description TEXT,
  weight_percentage NUMERIC(5,2),
  is_critical BOOLEAN DEFAULT false,
  importance_level TEXT CHECK (importance_level IN ('critical', 'high', 'normal', 'low')),
  total_items INTEGER,
  documentation_required JSONB,
  norms_referenced TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(structure_id, element_number)
);

-- 3. TABELA DE SEÇÕES DOS ELEMENTOS
CREATE TABLE IF NOT EXISTS public.peotram_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id UUID REFERENCES public.peotram_elements_2024(id) ON DELETE CASCADE,
  section_number TEXT NOT NULL,
  section_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. TABELA DE ITENS (~150 itens do arquivo Excel)
CREATE TABLE IF NOT EXISTS public.peotram_items_2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.peotram_sections(id) ON DELETE CASCADE,
  element_id UUID REFERENCES public.peotram_elements_2024(id) ON DELETE CASCADE,
  item_number TEXT NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  requirement TEXT,
  verification_criteria_compliant TEXT,
  verification_criteria_non_compliant TEXT,
  possible_non_conformities TEXT[],
  evidence_required TEXT[],
  norm_reference TEXT,
  criticality_level TEXT CHECK (criticality_level IN ('critical', 'major', 'minor', 'observation')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. TABELA DE AUDITORIAS PEOTRAM
CREATE TABLE IF NOT EXISTS public.peotram_audits_2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID,
  organization_id UUID,
  structure_id UUID REFERENCES public.peotram_structures(id),
  audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  auditor_id UUID REFERENCES auth.users(id),
  auditor_name TEXT,
  audit_status TEXT DEFAULT 'in_progress' CHECK (audit_status IN ('draft', 'in_progress', 'completed', 'approved', 'rejected')),
  vessel_name TEXT,
  vessel_imo TEXT,
  
  -- Conformidade por elemento (1-13)
  element_1_score NUMERIC(5,2),
  element_2_score NUMERIC(5,2),
  element_3_score NUMERIC(5,2),
  element_4_score NUMERIC(5,2),
  element_5_score NUMERIC(5,2),
  element_6_score NUMERIC(5,2),
  element_7_score NUMERIC(5,2),
  element_8_score NUMERIC(5,2),
  element_9_score NUMERIC(5,2),
  element_10_score NUMERIC(5,2),
  element_11_score NUMERIC(5,2),
  element_12_score NUMERIC(5,2),
  element_13_score NUMERIC(5,2),
  
  overall_score NUMERIC(5,2),
  total_items_evaluated INTEGER DEFAULT 0,
  conformant_items INTEGER DEFAULT 0,
  non_conformant_items INTEGER DEFAULT 0,
  observations_items INTEGER DEFAULT 0,
  
  notes TEXT,
  report_pdf_path TEXT,
  report_docx_path TEXT,
  
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. TABELA DE RESPOSTAS POR ITEM
CREATE TABLE IF NOT EXISTS public.peotram_audit_responses_2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.peotram_audits_2024(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.peotram_items_2024(id),
  element_number INTEGER NOT NULL,
  item_number TEXT NOT NULL,
  
  status TEXT NOT NULL CHECK (status IN ('pending', 'compliant', 'non_compliant', 'observation', 'not_applicable')),
  score INTEGER CHECK (score >= 0 AND score <= 4),
  nc_classification TEXT CHECK (nc_classification IN ('A', 'B', 'C', 'D')),
  
  auditor_notes TEXT,
  observed_condition TEXT,
  
  -- Evidências (paths no storage)
  photographic_evidence TEXT[],
  documentary_evidence TEXT[],
  
  response_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(audit_id, item_number)
);

-- 7. TABELA DE EVIDÊNCIAS GERADAS POR IA
CREATE TABLE IF NOT EXISTS public.peotram_ai_evidences_2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_response_id UUID REFERENCES public.peotram_audit_responses_2024(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.peotram_audits_2024(id) ON DELETE CASCADE,
  element_number INTEGER,
  item_number TEXT,
  
  evidence_title TEXT NOT NULL,
  technical_analysis TEXT,
  norm_reference TEXT,
  risk_identified TEXT,
  recommendations TEXT,
  corrective_action_plan TEXT,
  full_content TEXT,
  
  generated_by_ai BOOLEAN DEFAULT true,
  ai_confidence NUMERIC(3,2),
  
  pdf_file_path TEXT,
  docx_file_path TEXT,
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. TABELA DE ASSINATURAS DIGITAIS
CREATE TABLE IF NOT EXISTS public.peotram_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.peotram_audits_2024(id) ON DELETE CASCADE,
  signer_role TEXT NOT NULL CHECK (signer_role IN ('auditor', 'captain', 'owner', 'dpc', 'petrobras')),
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  signature_image_path TEXT,
  signature_data TEXT, -- Base64 da assinatura
  ip_address TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(audit_id, signer_role)
);

-- 9. STORAGE BUCKET PARA EVIDÊNCIAS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'peotram-evidence',
  'peotram-evidence',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- 10. RLS POLICIES
ALTER TABLE public.peotram_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_elements_2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_items_2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_audits_2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_audit_responses_2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_ai_evidences_2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_signatures ENABLE ROW LEVEL SECURITY;

-- Policies para leitura pública (estrutura PEOTRAM)
CREATE POLICY "PEOTRAM structures are viewable by authenticated users"
  ON public.peotram_structures FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "PEOTRAM elements are viewable by authenticated users"
  ON public.peotram_elements_2024 FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "PEOTRAM sections are viewable by authenticated users"
  ON public.peotram_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "PEOTRAM items are viewable by authenticated users"
  ON public.peotram_items_2024 FOR SELECT
  TO authenticated
  USING (true);

-- Policies para auditorias (usuário logado)
CREATE POLICY "Users can view audits"
  ON public.peotram_audits_2024 FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create audits"
  ON public.peotram_audits_2024 FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their audits"
  ON public.peotram_audits_2024 FOR UPDATE
  TO authenticated
  USING (auditor_id = auth.uid() OR auditor_id IS NULL);

-- Policies para respostas
CREATE POLICY "Users can view responses"
  ON public.peotram_audit_responses_2024 FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create responses"
  ON public.peotram_audit_responses_2024 FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update responses"
  ON public.peotram_audit_responses_2024 FOR UPDATE
  TO authenticated
  USING (true);

-- Policies para evidências IA
CREATE POLICY "Users can view AI evidences"
  ON public.peotram_ai_evidences_2024 FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create AI evidences"
  ON public.peotram_ai_evidences_2024 FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies para assinaturas
CREATE POLICY "Users can view signatures"
  ON public.peotram_signatures FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create signatures"
  ON public.peotram_signatures FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Storage policies
CREATE POLICY "Anyone can view PEOTRAM evidence"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'peotram-evidence');

CREATE POLICY "Authenticated users can upload PEOTRAM evidence"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'peotram-evidence');

CREATE POLICY "Authenticated users can update PEOTRAM evidence"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'peotram-evidence');

CREATE POLICY "Authenticated users can delete PEOTRAM evidence"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'peotram-evidence');

-- 11. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_peotram_elements_number ON public.peotram_elements_2024(element_number);
CREATE INDEX IF NOT EXISTS idx_peotram_items_element ON public.peotram_items_2024(element_id);
CREATE INDEX IF NOT EXISTS idx_peotram_audits_vessel ON public.peotram_audits_2024(vessel_id);
CREATE INDEX IF NOT EXISTS idx_peotram_audits_status ON public.peotram_audits_2024(audit_status);
CREATE INDEX IF NOT EXISTS idx_peotram_responses_audit ON public.peotram_audit_responses_2024(audit_id);
CREATE INDEX IF NOT EXISTS idx_peotram_responses_element ON public.peotram_audit_responses_2024(element_number);

-- 12. FUNÇÃO PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION public.update_peotram_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_peotram_structures_updated_at ON public.peotram_structures;
CREATE TRIGGER update_peotram_structures_updated_at
  BEFORE UPDATE ON public.peotram_structures
  FOR EACH ROW EXECUTE FUNCTION public.update_peotram_updated_at();

DROP TRIGGER IF EXISTS update_peotram_audits_updated_at ON public.peotram_audits_2024;
CREATE TRIGGER update_peotram_audits_updated_at
  BEFORE UPDATE ON public.peotram_audits_2024
  FOR EACH ROW EXECUTE FUNCTION public.update_peotram_updated_at();

DROP TRIGGER IF EXISTS update_peotram_responses_updated_at ON public.peotram_audit_responses_2024;
CREATE TRIGGER update_peotram_responses_updated_at
  BEFORE UPDATE ON public.peotram_audit_responses_2024
  FOR EACH ROW EXECUTE FUNCTION public.update_peotram_updated_at();