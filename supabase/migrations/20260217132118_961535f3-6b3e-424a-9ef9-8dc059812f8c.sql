
-- ═══════════════════════════════════════════════════════════
-- Smart Audit Evidence Organizer - Database Schema
-- Estrutura para organizar evidências de auditorias PEO-DP e PEOTRAM
-- ═══════════════════════════════════════════════════════════

-- 1. Pacote principal de evidências (vinculado a um upload de checklist)
CREATE TABLE public.audit_evidence_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID NOT NULL,
  framework TEXT NOT NULL CHECK (framework IN ('peodp', 'peotram', 'ism', 'mlc', 'isps', 'sgso', 'ovid')),
  title TEXT NOT NULL,
  description TEXT,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  source_file_name TEXT,
  source_file_path TEXT,
  source_file_type TEXT CHECK (source_file_type IN ('pdf', 'xlsx', 'csv', 'docx')),
  vessel_id UUID REFERENCES public.vessels(id),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'parsed', 'matching', 'completed', 'error')),
  total_elements INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  matched_items INTEGER DEFAULT 0,
  unmatched_items INTEGER DEFAULT 0,
  partial_items INTEGER DEFAULT 0,
  overall_score NUMERIC(5,2) DEFAULT 0,
  ai_processing_log JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Elementos extraídos do checklist (pastas)
CREATE TABLE public.audit_evidence_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES public.audit_evidence_packs(id) ON DELETE CASCADE,
  element_number INTEGER NOT NULL,
  element_code TEXT,
  element_name TEXT NOT NULL,
  element_description TEXT,
  total_items INTEGER DEFAULT 0,
  matched_count INTEGER DEFAULT 0,
  unmatched_count INTEGER DEFAULT 0,
  partial_count INTEGER DEFAULT 0,
  compliance_score NUMERIC(5,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Itens individuais de cada elemento (subpastas)
CREATE TABLE public.audit_evidence_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  element_id UUID NOT NULL REFERENCES public.audit_evidence_elements(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES public.audit_evidence_packs(id) ON DELETE CASCADE,
  item_number TEXT NOT NULL,
  item_code TEXT,
  item_text TEXT NOT NULL,
  requirement_description TEXT,
  evidence_status TEXT NOT NULL DEFAULT 'pending' CHECK (evidence_status IN ('found', 'partial', 'not_found', 'pending', 'manual')),
  ai_response TEXT,
  ai_suggestion TEXT,
  ai_confidence NUMERIC(5,2),
  sort_order INTEGER DEFAULT 0,
  is_critical BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Evidências vinculadas a cada item
CREATE TABLE public.audit_evidence_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.audit_evidence_items(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES public.audit_evidence_packs(id) ON DELETE CASCADE,
  document_id UUID,
  document_title TEXT,
  document_type TEXT,
  document_path TEXT,
  match_source TEXT NOT NULL DEFAULT 'ai' CHECK (match_source IN ('ai', 'manual', 'suggested')),
  match_confidence NUMERIC(5,2),
  match_reason TEXT,
  is_accepted BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_evidence_packs_org ON public.audit_evidence_packs(organization_id);
CREATE INDEX idx_evidence_packs_framework ON public.audit_evidence_packs(framework);
CREATE INDEX idx_evidence_packs_vessel ON public.audit_evidence_packs(vessel_id);
CREATE INDEX idx_evidence_elements_pack ON public.audit_evidence_elements(pack_id);
CREATE INDEX idx_evidence_items_element ON public.audit_evidence_items(element_id);
CREATE INDEX idx_evidence_items_pack ON public.audit_evidence_items(pack_id);
CREATE INDEX idx_evidence_items_status ON public.audit_evidence_items(evidence_status);
CREATE INDEX idx_evidence_matches_item ON public.audit_evidence_matches(item_id);
CREATE INDEX idx_evidence_matches_pack ON public.audit_evidence_matches(pack_id);

-- RLS
ALTER TABLE public.audit_evidence_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_evidence_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_evidence_matches ENABLE ROW LEVEL SECURITY;

-- Policies - Authenticated users
CREATE POLICY "Users can view evidence packs" ON public.audit_evidence_packs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create evidence packs" ON public.audit_evidence_packs FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their packs" ON public.audit_evidence_packs FOR UPDATE USING (auth.uid() = created_by OR public.is_admin());
CREATE POLICY "Users can delete their packs" ON public.audit_evidence_packs FOR DELETE USING (auth.uid() = created_by OR public.is_admin());

CREATE POLICY "Users can view elements" ON public.audit_evidence_elements FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage elements" ON public.audit_evidence_elements FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view items" ON public.audit_evidence_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage items" ON public.audit_evidence_items FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view matches" ON public.audit_evidence_matches FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage matches" ON public.audit_evidence_matches FOR ALL USING (auth.uid() IS NOT NULL);

-- Triggers
CREATE TRIGGER update_evidence_packs_updated_at BEFORE UPDATE ON public.audit_evidence_packs
  FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();

CREATE TRIGGER update_evidence_elements_updated_at BEFORE UPDATE ON public.audit_evidence_elements
  FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();

CREATE TRIGGER update_evidence_items_updated_at BEFORE UPDATE ON public.audit_evidence_items
  FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
