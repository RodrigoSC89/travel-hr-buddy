-- =====================================================
-- PATCH 850 - Document Workflow System (ISM/MLC/PSC)
-- =====================================================

-- Document types enum
DO $$ BEGIN
  CREATE TYPE document_category AS ENUM (
    'ism_procedure',
    'mlc_agreement', 
    'psc_checklist',
    'audit_report',
    'safety_manual',
    'crew_certificate',
    'vessel_certificate',
    'emergency_procedure',
    'training_record',
    'maintenance_procedure'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Document approval status
DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM (
    'draft',
    'pending_review',
    'pending_approval',
    'approved',
    'rejected',
    'superseded',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Main document registry
CREATE TABLE IF NOT EXISTS public.document_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  
  -- Document metadata
  document_number TEXT NOT NULL,
  title TEXT NOT NULL,
  category document_category NOT NULL,
  description TEXT,
  
  -- Version control
  version INTEGER NOT NULL DEFAULT 1,
  revision_number TEXT,
  is_current_version BOOLEAN DEFAULT true,
  parent_document_id UUID REFERENCES public.document_registry(id),
  
  -- Status and approval
  status approval_status DEFAULT 'draft',
  
  -- Storage
  file_path TEXT,
  file_size BIGINT,
  file_type TEXT,
  checksum TEXT,
  
  -- Validity
  effective_date DATE,
  expiry_date DATE,
  review_date DATE,
  
  -- Compliance references
  ism_code_reference TEXT,
  mlc_reference TEXT,
  solas_reference TEXT,
  marpol_reference TEXT,
  
  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Document versions history
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.document_registry(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  
  file_path TEXT NOT NULL,
  file_size BIGINT,
  checksum TEXT,
  
  change_summary TEXT,
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT now(),
  
  -- Snapshot of document state
  document_snapshot JSONB
);

-- Approval workflow
CREATE TABLE IF NOT EXISTS public.document_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.document_registry(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  
  -- Approval chain
  step_order INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  required_role TEXT,
  
  -- Approver details
  approver_id UUID,
  approver_name TEXT,
  approver_role TEXT,
  
  -- Decision
  decision TEXT CHECK (decision IN ('pending', 'approved', 'rejected', 'delegated')),
  comments TEXT,
  
  -- Digital signature
  signature_data JSONB,
  signed_at TIMESTAMPTZ,
  ip_address INET,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Document distribution tracking
CREATE TABLE IF NOT EXISTS public.document_distribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.document_registry(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  
  -- Recipient
  recipient_type TEXT CHECK (recipient_type IN ('user', 'department', 'vessel', 'role')),
  recipient_id UUID,
  recipient_name TEXT,
  
  -- Distribution details
  distribution_method TEXT CHECK (distribution_method IN ('email', 'system', 'print', 'manual')),
  distributed_at TIMESTAMPTZ DEFAULT now(),
  distributed_by UUID,
  
  -- Acknowledgment
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  acknowledgment_signature JSONB,
  
  -- Read tracking
  first_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0
);

-- PSC Inspection tracking
CREATE TABLE IF NOT EXISTS public.psc_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  
  -- Inspection details
  inspection_date DATE NOT NULL,
  port_name TEXT NOT NULL,
  port_country TEXT NOT NULL,
  port_state_authority TEXT,
  
  -- Inspection type
  inspection_type TEXT CHECK (inspection_type IN ('initial', 'expanded', 'concentrated', 'follow_up')),
  inspection_focus TEXT[],
  
  -- Results
  detention BOOLEAN DEFAULT false,
  detention_reason TEXT,
  deficiencies_count INTEGER DEFAULT 0,
  
  -- Documents
  report_file_path TEXT,
  
  -- Risk scoring
  risk_score DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- PSC Deficiencies
CREATE TABLE IF NOT EXISTS public.psc_deficiencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES public.psc_inspections(id) ON DELETE CASCADE,
  
  -- Deficiency details
  deficiency_code TEXT NOT NULL,
  deficiency_description TEXT NOT NULL,
  category TEXT,
  
  -- Severity and action
  severity TEXT CHECK (severity IN ('observation', 'deficiency', 'detainable')),
  action_code TEXT,
  
  -- Corrective action
  corrective_action TEXT,
  corrective_deadline DATE,
  corrected_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  
  -- Evidence
  evidence_files TEXT[],
  
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'corrected', 'verified', 'closed')),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Interaction Logs (for regulatory audits)
CREATE TABLE IF NOT EXISTS public.ai_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Request context
  user_id UUID,
  user_name TEXT,
  user_role TEXT,
  user_permission_level TEXT,
  
  -- AI interaction
  session_id UUID,
  interaction_type TEXT,
  module_name TEXT,
  
  -- Input
  user_input TEXT NOT NULL,
  input_hash TEXT,
  
  -- Output
  ai_response TEXT,
  response_hash TEXT,
  
  -- Model details
  model_provider TEXT,
  model_version TEXT,
  model_parameters JSONB,
  
  -- RAG details
  rag_enabled BOOLEAN DEFAULT false,
  rag_sources JSONB,
  rag_source_documents TEXT[],
  
  -- Confidence and scoring
  confidence_score DECIMAL(5,4),
  trust_score DECIMAL(5,4),
  quality_score DECIMAL(5,4),
  
  -- HITL (Human-in-the-loop)
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_by_name TEXT,
  approved_at TIMESTAMPTZ,
  approval_decision TEXT CHECK (approval_decision IN ('approved', 'rejected', 'modified')),
  approval_comments TEXT,
  
  -- Performance
  response_time_ms INTEGER,
  tokens_input INTEGER,
  tokens_output INTEGER,
  
  -- Audit trail
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psc_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psc_deficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view org documents" ON public.document_registry
  FOR SELECT USING (
    public.user_belongs_to_organization(organization_id, auth.uid())
  );

CREATE POLICY "Users can insert org documents" ON public.document_registry
  FOR INSERT WITH CHECK (
    public.user_belongs_to_organization(organization_id, auth.uid())
  );

CREATE POLICY "Users can update org documents" ON public.document_registry
  FOR UPDATE USING (
    public.user_belongs_to_organization(organization_id, auth.uid())
  );

CREATE POLICY "Users can view org PSC inspections" ON public.psc_inspections
  FOR SELECT USING (
    public.user_belongs_to_organization(organization_id, auth.uid())
  );

CREATE POLICY "Users can manage org PSC inspections" ON public.psc_inspections
  FOR ALL USING (
    public.user_belongs_to_organization(organization_id, auth.uid())
  );

CREATE POLICY "Users can view PSC deficiencies" ON public.psc_deficiencies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.psc_inspections pi 
      WHERE pi.id = inspection_id 
      AND public.user_belongs_to_organization(pi.organization_id, auth.uid())
    )
  );

CREATE POLICY "Users can view org AI logs" ON public.ai_audit_logs
  FOR SELECT USING (
    public.user_belongs_to_organization(organization_id, auth.uid())
  );

CREATE POLICY "System can insert AI logs" ON public.ai_audit_logs
  FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_document_registry_org ON public.document_registry(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_registry_category ON public.document_registry(category);
CREATE INDEX IF NOT EXISTS idx_document_registry_status ON public.document_registry(status);
CREATE INDEX IF NOT EXISTS idx_psc_inspections_vessel ON public.psc_inspections(vessel_id);
CREATE INDEX IF NOT EXISTS idx_psc_deficiencies_status ON public.psc_deficiencies(status);
CREATE INDEX IF NOT EXISTS idx_ai_audit_logs_created ON public.ai_audit_logs(created_at DESC);

-- Triggers for updated_at
CREATE TRIGGER update_document_registry_updated_at
  BEFORE UPDATE ON public.document_registry
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_psc_inspections_updated_at
  BEFORE UPDATE ON public.psc_inspections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();