-- ════════════════════════════════════════════════════════════
-- KNOWLEDGE HUB - Schema Completo
-- ════════════════════════════════════════════════════════════

-- Tabela principal de documentos de conhecimento
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL DEFAULT 'other',
  category TEXT NOT NULL DEFAULT 'general',
  subcategory TEXT,
  
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  thumbnail_url TEXT,
  
  ai_status TEXT DEFAULT 'pending',
  extracted_text TEXT,
  summary TEXT,
  key_entities JSONB DEFAULT '[]',
  keywords TEXT[] DEFAULT '{}',
  
  chapters JSONB DEFAULT '[]',
  tables_extracted JSONB DEFAULT '[]',
  checklists_extracted JSONB DEFAULT '[]',
  procedures_extracted JSONB DEFAULT '[]',
  forms_extracted JSONB DEFAULT '[]',
  
  regulatory_references JSONB DEFAULT '[]',
  expiry_date DATE,
  review_date DATE,
  version INTEGER DEFAULT 1,
  revision_history JSONB DEFAULT '[]',
  
  access_level TEXT DEFAULT 'internal',
  allowed_roles TEXT[] DEFAULT '{}',
  allowed_vessels UUID[] DEFAULT '{}',
  
  tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'pt',
  page_count INTEGER,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_org ON public.knowledge_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_type ON public.knowledge_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_category ON public.knowledge_documents(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_ai_status ON public.knowledge_documents(ai_status);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_tags ON public.knowledge_documents USING GIN(tags);

-- Enable RLS
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Política simples para usuários autenticados
CREATE POLICY "Authenticated users can manage knowledge docs"
ON public.knowledge_documents FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Checklists interativos
CREATE TABLE IF NOT EXISTS public.knowledge_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  source_document_id UUID REFERENCES public.knowledge_documents(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  frequency TEXT,
  responsible_role TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total_items INTEGER DEFAULT 0,
  is_template BOOLEAN DEFAULT true,
  parent_template_id UUID REFERENCES public.knowledge_checklists(id),
  tags TEXT[] DEFAULT '{}',
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.knowledge_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage checklists"
ON public.knowledge_checklists FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Formulários digitais
CREATE TABLE IF NOT EXISTS public.knowledge_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  source_document_id UUID REFERENCES public.knowledge_documents(id),
  title TEXT NOT NULL,
  form_code TEXT,
  description TEXT,
  instructions TEXT,
  fields JSONB NOT NULL DEFAULT '[]',
  sections JSONB DEFAULT '[]',
  is_template BOOLEAN DEFAULT true,
  parent_template_id UUID REFERENCES public.knowledge_forms(id),
  requires_approval BOOLEAN DEFAULT false,
  approval_workflow JSONB,
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.knowledge_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage forms"
ON public.knowledge_forms FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Execuções de checklists
CREATE TABLE IF NOT EXISTS public.knowledge_checklist_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  checklist_id UUID REFERENCES public.knowledge_checklists(id) NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id),
  responses JSONB NOT NULL DEFAULT '{}',
  completed_items INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  completion_percent DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  non_conformities JSONB DEFAULT '[]',
  signed_by UUID REFERENCES auth.users(id),
  signed_at TIMESTAMPTZ,
  signature_data JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.knowledge_checklist_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage checklist executions"
ON public.knowledge_checklist_executions FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Submissões de formulários
CREATE TABLE IF NOT EXISTS public.knowledge_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  form_id UUID REFERENCES public.knowledge_forms(id) NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id),
  responses JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  digital_signature JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.knowledge_form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage form submissions"
ON public.knowledge_form_submissions FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);