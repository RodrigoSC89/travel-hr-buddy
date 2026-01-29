-- =====================================================
-- ENTERPRISE DOCUMENT MANAGEMENT SYSTEM
-- Similar to SoftExpert, Fluig, Unisea, TMmaster but superior
-- =====================================================

-- Table: Document Categories (Hierarchical)
CREATE TABLE IF NOT EXISTS public.document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  parent_id UUID REFERENCES public.document_categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#3B82F6',
  is_system BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, slug)
);

-- Table: Enterprise Documents (Main repository)
CREATE TABLE IF NOT EXISTS public.enterprise_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  category_id UUID REFERENCES public.document_categories(id),
  
  -- Document info
  title TEXT NOT NULL,
  description TEXT,
  document_code TEXT, -- e.g., MAN-001, PROC-002
  document_type TEXT NOT NULL, -- manual, procedure, checklist, form, policy, training_material, certificate, contract, etc.
  
  -- File info
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT DEFAULT 0,
  storage_path TEXT,
  file_url TEXT,
  
  -- Version control
  version TEXT DEFAULT '1.0',
  version_number INTEGER DEFAULT 1,
  is_latest BOOLEAN DEFAULT true,
  parent_document_id UUID REFERENCES public.enterprise_documents(id),
  
  -- Status and workflow
  status TEXT DEFAULT 'draft', -- draft, pending_review, approved, published, archived, obsolete
  review_status TEXT DEFAULT 'not_reviewed', -- not_reviewed, under_review, approved, rejected
  approval_date TIMESTAMPTZ,
  approved_by UUID,
  
  -- Access control
  access_level TEXT DEFAULT 'organization', -- public, organization, department, vessel, private
  department_access TEXT[], -- which departments can access
  
  -- Compliance
  regulatory_reference TEXT[], -- MLC 2006, STCW, ISM, MARPOL, etc.
  compliance_category TEXT,
  valid_from DATE,
  valid_until DATE,
  review_date DATE,
  review_frequency TEXT, -- monthly, quarterly, semi-annual, annual
  
  -- AI Integration
  ai_summary TEXT,
  ai_keywords TEXT[],
  ai_classification TEXT,
  ai_confidence DECIMAL(5,4),
  ocr_text TEXT,
  ocr_status TEXT DEFAULT 'pending',
  
  -- Metadata
  tags TEXT[],
  language TEXT DEFAULT 'pt-BR',
  page_count INTEGER,
  is_template BOOLEAN DEFAULT false,
  template_fields JSONB,
  custom_fields JSONB DEFAULT '{}',
  
  -- Statistics
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Audit
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Table: Document Revisions (Full version history)
CREATE TABLE IF NOT EXISTS public.document_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.enterprise_documents(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  
  -- Revision info
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT,
  
  -- Changes
  change_summary TEXT,
  change_type TEXT, -- minor, major, correction, update
  changed_sections TEXT[],
  
  -- Status at revision time
  status TEXT,
  review_status TEXT,
  
  -- Audit
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Table: Document Workflows (Approval processes)
CREATE TABLE IF NOT EXISTS public.document_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  document_id UUID REFERENCES public.enterprise_documents(id) ON DELETE CASCADE,
  
  workflow_type TEXT NOT NULL, -- review, approval, distribution, revision
  workflow_name TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 1,
  
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  
  initiated_by UUID,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: Workflow Steps
CREATE TABLE IF NOT EXISTS public.document_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.document_workflows(id) ON DELETE CASCADE,
  
  step_number INTEGER NOT NULL,
  step_type TEXT NOT NULL, -- review, approve, sign, acknowledge, distribute
  step_name TEXT,
  
  assignee_id UUID,
  assignee_role TEXT, -- can be role-based
  
  status TEXT DEFAULT 'pending', -- pending, in_progress, approved, rejected, skipped
  decision TEXT,
  comments TEXT,
  signature_data JSONB,
  
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: Document Acknowledgements (Reading confirmations)
CREATE TABLE IF NOT EXISTS public.document_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.enterprise_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  acknowledged_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  device_info JSONB,
  
  -- For mandatory reading
  is_mandatory BOOLEAN DEFAULT false,
  deadline TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  
  signature_data JSONB,
  comments TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: Document Access Log
CREATE TABLE IF NOT EXISTS public.document_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.enterprise_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  action TEXT NOT NULL, -- view, download, print, share, edit, delete
  action_details JSONB,
  
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: Document Templates (For generating new docs)
CREATE TABLE IF NOT EXISTS public.document_templates_enterprise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  category_id UUID REFERENCES public.document_categories(id),
  
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL, -- checklist, form, report, certificate, contract, procedure
  
  -- Template content
  content_html TEXT,
  content_json JSONB,
  template_fields JSONB, -- field definitions
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  auto_numbering BOOLEAN DEFAULT true,
  numbering_prefix TEXT,
  numbering_format TEXT, -- e.g., 'XXXX-YYYY-NNN'
  
  -- Usage stats
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Audit
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: Training Documents (Specific for training module)
CREATE TABLE IF NOT EXISTS public.training_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  course_id UUID REFERENCES public.academy_courses(id),
  
  document_id UUID REFERENCES public.enterprise_documents(id),
  document_type TEXT NOT NULL, -- training_material, assessment, certificate, attendance, evaluation
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- File info
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT,
  
  -- Training specific
  module_number INTEGER,
  is_mandatory BOOLEAN DEFAULT true,
  completion_required BOOLEAN DEFAULT true,
  
  -- Metadata
  duration_minutes INTEGER,
  language TEXT DEFAULT 'pt-BR',
  
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: Checklists (Interactive checklists)
CREATE TABLE IF NOT EXISTS public.enterprise_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  template_id UUID REFERENCES public.document_templates_enterprise(id),
  
  title TEXT NOT NULL,
  description TEXT,
  checklist_type TEXT NOT NULL, -- safety, maintenance, inspection, audit, operational
  
  -- Items
  items JSONB NOT NULL DEFAULT '[]', -- array of checklist items
  total_items INTEGER DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Schedule
  scheduled_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  
  -- Assignee
  assigned_to UUID,
  completed_by UUID,
  
  -- Compliance
  regulatory_reference TEXT,
  is_mandatory BOOLEAN DEFAULT false,
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Signature
  signature_required BOOLEAN DEFAULT false,
  signature_data JSONB,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enterprise_docs_org ON public.enterprise_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_docs_vessel ON public.enterprise_documents(vessel_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_docs_category ON public.enterprise_documents(category_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_docs_type ON public.enterprise_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_enterprise_docs_status ON public.enterprise_documents(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_docs_code ON public.enterprise_documents(document_code);
CREATE INDEX IF NOT EXISTS idx_enterprise_docs_search ON public.enterprise_documents USING gin(to_tsvector('portuguese', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_doc_revisions_doc ON public.document_revisions(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_workflows_doc ON public.document_workflows(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_ack_doc ON public.document_acknowledgements(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_ack_user ON public.document_acknowledgements(user_id);
CREATE INDEX IF NOT EXISTS idx_training_docs_course ON public.training_documents(course_id);
CREATE INDEX IF NOT EXISTS idx_checklists_org ON public.enterprise_checklists(organization_id);
CREATE INDEX IF NOT EXISTS idx_checklists_vessel ON public.enterprise_checklists(vessel_id);

-- Enable RLS on all tables
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates_enterprise ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_checklists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_categories
CREATE POLICY "Users can view categories in their organization" ON public.document_categories
  FOR SELECT USING (
    organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
    OR is_system = true
  );

CREATE POLICY "Admins can manage categories" ON public.document_categories
  FOR ALL USING (public.is_admin_or_hr(auth.uid()));

-- RLS Policies for enterprise_documents (with vessel access control)
CREATE POLICY "Users can view documents they have access to" ON public.enterprise_documents
  FOR SELECT USING (
    deleted_at IS NULL
    AND (
      public.has_global_access(auth.uid())
      OR (vessel_id IS NULL AND organization_id IN (SELECT public.get_user_org_ids(auth.uid())))
      OR (vessel_id IS NOT NULL AND public.has_vessel_access(auth.uid(), vessel_id))
    )
  );

CREATE POLICY "Authorized users can create documents" ON public.enterprise_documents
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      public.has_global_access(auth.uid())
      OR organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
    )
  );

CREATE POLICY "Authorized users can update documents" ON public.enterprise_documents
  FOR UPDATE USING (
    created_by = auth.uid()
    OR public.has_global_access(auth.uid())
  );

-- RLS for other tables
CREATE POLICY "Access document revisions" ON public.document_revisions
  FOR SELECT USING (
    document_id IN (SELECT id FROM public.enterprise_documents WHERE deleted_at IS NULL)
  );

CREATE POLICY "Access document workflows" ON public.document_workflows
  FOR SELECT USING (
    organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
    OR public.has_global_access(auth.uid())
  );

CREATE POLICY "Access workflow steps" ON public.document_workflow_steps
  FOR SELECT USING (
    workflow_id IN (SELECT id FROM public.document_workflows)
  );

CREATE POLICY "Users can view own acknowledgements" ON public.document_acknowledgements
  FOR SELECT USING (user_id = auth.uid() OR public.has_global_access(auth.uid()));

CREATE POLICY "Users can create acknowledgements" ON public.document_acknowledgements
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Access document logs" ON public.document_access_logs
  FOR SELECT USING (user_id = auth.uid() OR public.has_global_access(auth.uid()));

CREATE POLICY "Users can create access logs" ON public.document_access_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Access document templates" ON public.document_templates_enterprise
  FOR SELECT USING (
    organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
    OR is_system = true
    OR public.has_global_access(auth.uid())
  );

CREATE POLICY "Admins can manage templates" ON public.document_templates_enterprise
  FOR ALL USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "Access training documents" ON public.training_documents
  FOR SELECT USING (
    organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
    OR public.has_global_access(auth.uid())
  );

CREATE POLICY "Authorized users can manage training docs" ON public.training_documents
  FOR ALL USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "Access checklists" ON public.enterprise_checklists
  FOR SELECT USING (
    organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
    OR (vessel_id IS NOT NULL AND public.has_vessel_access(auth.uid(), vessel_id))
    OR public.has_global_access(auth.uid())
  );

CREATE POLICY "Users can manage own checklists" ON public.enterprise_checklists
  FOR ALL USING (
    created_by = auth.uid()
    OR assigned_to = auth.uid()
    OR public.has_global_access(auth.uid())
  );

-- Insert default document categories
INSERT INTO public.document_categories (name, slug, description, icon, is_system) VALUES
  ('Manuais', 'manuals', 'Manuais operacionais, técnicos e de segurança', 'book-open', true),
  ('Procedimentos', 'procedures', 'Procedimentos operacionais padrão (POPs)', 'clipboard-list', true),
  ('Políticas', 'policies', 'Políticas da empresa e regulamentos internos', 'shield', true),
  ('Checklists', 'checklists', 'Listas de verificação e inspeção', 'check-square', true),
  ('Formulários', 'forms', 'Formulários diversos', 'file-text', true),
  ('Certificados', 'certificates', 'Certificados e licenças', 'award', true),
  ('Contratos', 'contracts', 'Contratos e documentos legais', 'file-contract', true),
  ('Treinamentos', 'training', 'Materiais de treinamento e capacitação', 'graduation-cap', true),
  ('Relatórios', 'reports', 'Relatórios e análises', 'bar-chart', true),
  ('Compliance', 'compliance', 'Documentos de conformidade regulatória', 'shield-check', true),
  ('Segurança', 'safety', 'Documentos de segurança e SMS', 'alert-triangle', true),
  ('RH', 'hr', 'Documentos de recursos humanos', 'users', true)
ON CONFLICT (organization_id, slug) DO NOTHING;

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_enterprise_docs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_enterprise_documents_updated_at
  BEFORE UPDATE ON public.enterprise_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_enterprise_docs_updated_at();

CREATE TRIGGER update_enterprise_checklists_updated_at
  BEFORE UPDATE ON public.enterprise_checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_enterprise_docs_updated_at();

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates_enterprise
  FOR EACH ROW EXECUTE FUNCTION public.update_enterprise_docs_updated_at();