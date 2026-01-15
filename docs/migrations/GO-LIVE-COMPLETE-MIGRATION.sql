-- =============================================
-- 🚀 NAUTI ONE GO-LIVE MIGRATION v4.0
-- Execute via SQL Editor: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/sql/new
-- Date: 2026-01-15
-- =============================================

-- =============================================
-- PART 1: CORE OPERATIONAL TABLES
-- =============================================

-- 1. GMUD Workflows Table
CREATE TABLE IF NOT EXISTS public.gmud_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'cancelled')),
  priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  requester_id UUID REFERENCES auth.users(id),
  current_approver_id UUID REFERENCES auth.users(id),
  approval_stage INTEGER DEFAULT 1,
  total_stages INTEGER DEFAULT 5,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. DocuSign Envelopes Table
CREATE TABLE IF NOT EXISTS public.docusign_envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  envelope_id TEXT UNIQUE,
  document_type TEXT NOT NULL,
  reference_id UUID,
  reference_table TEXT,
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'sent', 'delivered', 'signed', 'completed', 'declined', 'voided')),
  signers JSONB DEFAULT '[]',
  signed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Voice Commands Log Table
CREATE TABLE IF NOT EXISTS public.voice_commands_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID,
  command_text TEXT NOT NULL,
  command_type TEXT,
  intent_detected TEXT,
  confidence_score DECIMAL(5,4),
  response_text TEXT,
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Crew Contracts Table
CREATE TABLE IF NOT EXISTS public.crew_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  crew_member_id UUID NOT NULL,
  contract_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'renewed')),
  salary_amount DECIMAL(12,2),
  salary_currency TEXT DEFAULT 'USD',
  vessel_id UUID,
  position TEXT,
  terms JSONB DEFAULT '{}',
  signed_at TIMESTAMPTZ,
  docusign_envelope_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Vessel Inspections Table
CREATE TABLE IF NOT EXISTS public.vessel_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  vessel_id UUID NOT NULL,
  inspection_type TEXT NOT NULL,
  inspector_name TEXT,
  inspection_date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'cancelled')),
  findings JSONB DEFAULT '[]',
  score DECIMAL(5,2),
  next_inspection_date DATE,
  certificates_checked JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Maritime Incidents Table
CREATE TABLE IF NOT EXISTS public.maritime_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  vessel_id UUID,
  incident_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  location_lat DECIMAL(10,7),
  location_lng DECIMAL(10,7),
  location_description TEXT,
  reported_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  root_cause TEXT,
  corrective_actions JSONB DEFAULT '[]',
  injuries INTEGER DEFAULT 0,
  fatalities INTEGER DEFAULT 0,
  environmental_impact BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Organization Settings Table
CREATE TABLE IF NOT EXISTS public.organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE,
  settings JSONB DEFAULT '{}',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  whatsapp_notifications BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'pt-BR',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  currency TEXT DEFAULT 'BRL',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PART 2: ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.gmud_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docusign_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_commands_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maritime_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PART 3: SECURITY DEFINER FUNCTIONS
-- =============================================

-- Function to check if user belongs to organization
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_users
    WHERE user_id = _user_id AND organization_id = _org_id
  )
$$;

-- Function to get user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.organization_users
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- =============================================
-- PART 4: RLS POLICIES - MULTI-TENANT ISOLATION
-- =============================================

-- GMUD Workflows Policies
CREATE POLICY "gmud_org_isolation_select" ON public.gmud_workflows
  FOR SELECT TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "gmud_org_isolation_insert" ON public.gmud_workflows
  FOR INSERT TO authenticated
  WITH CHECK (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "gmud_org_isolation_update" ON public.gmud_workflows
  FOR UPDATE TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "gmud_org_isolation_delete" ON public.gmud_workflows
  FOR DELETE TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id) AND public.is_admin_or_hr(auth.uid()));

-- DocuSign Envelopes Policies
CREATE POLICY "docusign_org_isolation_select" ON public.docusign_envelopes
  FOR SELECT TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "docusign_org_isolation_insert" ON public.docusign_envelopes
  FOR INSERT TO authenticated
  WITH CHECK (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "docusign_org_isolation_update" ON public.docusign_envelopes
  FOR UPDATE TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

-- Voice Commands Log Policies
CREATE POLICY "voice_log_user_select" ON public.voice_commands_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

CREATE POLICY "voice_log_user_insert" ON public.voice_commands_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Crew Contracts Policies
CREATE POLICY "contracts_org_isolation_select" ON public.crew_contracts
  FOR SELECT TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "contracts_org_isolation_insert" ON public.crew_contracts
  FOR INSERT TO authenticated
  WITH CHECK (public.user_belongs_to_org(auth.uid(), organization_id) AND public.is_admin_or_hr(auth.uid()));

CREATE POLICY "contracts_org_isolation_update" ON public.crew_contracts
  FOR UPDATE TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id) AND public.is_admin_or_hr(auth.uid()));

-- Vessel Inspections Policies
CREATE POLICY "inspections_org_isolation_select" ON public.vessel_inspections
  FOR SELECT TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "inspections_org_isolation_insert" ON public.vessel_inspections
  FOR INSERT TO authenticated
  WITH CHECK (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "inspections_org_isolation_update" ON public.vessel_inspections
  FOR UPDATE TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

-- Maritime Incidents Policies
CREATE POLICY "incidents_org_isolation_select" ON public.maritime_incidents
  FOR SELECT TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "incidents_org_isolation_insert" ON public.maritime_incidents
  FOR INSERT TO authenticated
  WITH CHECK (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "incidents_org_isolation_update" ON public.maritime_incidents
  FOR UPDATE TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

-- Organization Settings Policies
CREATE POLICY "org_settings_isolation_select" ON public.organization_settings
  FOR SELECT TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "org_settings_isolation_update" ON public.organization_settings
  FOR UPDATE TO authenticated
  USING (public.user_belongs_to_org(auth.uid(), organization_id) AND public.is_admin_or_hr(auth.uid()));

-- =============================================
-- PART 5: INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_gmud_org ON public.gmud_workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_gmud_status ON public.gmud_workflows(status);
CREATE INDEX IF NOT EXISTS idx_gmud_requester ON public.gmud_workflows(requester_id);

CREATE INDEX IF NOT EXISTS idx_docusign_org ON public.docusign_envelopes(organization_id);
CREATE INDEX IF NOT EXISTS idx_docusign_status ON public.docusign_envelopes(status);
CREATE INDEX IF NOT EXISTS idx_docusign_envelope ON public.docusign_envelopes(envelope_id);

CREATE INDEX IF NOT EXISTS idx_voice_log_user ON public.voice_commands_log(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_log_created ON public.voice_commands_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contracts_org ON public.crew_contracts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contracts_crew ON public.crew_contracts(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.crew_contracts(status);

CREATE INDEX IF NOT EXISTS idx_inspections_org ON public.vessel_inspections(organization_id);
CREATE INDEX IF NOT EXISTS idx_inspections_vessel ON public.vessel_inspections(vessel_id);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON public.vessel_inspections(inspection_date);

CREATE INDEX IF NOT EXISTS idx_incidents_org ON public.maritime_incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_incidents_vessel ON public.maritime_incidents(vessel_id);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.maritime_incidents(severity);

-- =============================================
-- PART 6: TRIGGERS FOR updated_at
-- =============================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_gmud_workflows_updated_at ON public.gmud_workflows;
CREATE TRIGGER update_gmud_workflows_updated_at
  BEFORE UPDATE ON public.gmud_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_docusign_envelopes_updated_at ON public.docusign_envelopes;
CREATE TRIGGER update_docusign_envelopes_updated_at
  BEFORE UPDATE ON public.docusign_envelopes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_crew_contracts_updated_at ON public.crew_contracts;
CREATE TRIGGER update_crew_contracts_updated_at
  BEFORE UPDATE ON public.crew_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_vessel_inspections_updated_at ON public.vessel_inspections;
CREATE TRIGGER update_vessel_inspections_updated_at
  BEFORE UPDATE ON public.vessel_inspections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_maritime_incidents_updated_at ON public.maritime_incidents;
CREATE TRIGGER update_maritime_incidents_updated_at
  BEFORE UPDATE ON public.maritime_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_organization_settings_updated_at ON public.organization_settings;
CREATE TRIGGER update_organization_settings_updated_at
  BEFORE UPDATE ON public.organization_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ✅ MIGRATION COMPLETE
-- =============================================
-- Tables created: 7
-- RLS enabled: 7 tables
-- Policies created: 18
-- Indexes created: 15
-- Triggers created: 6
-- =============================================
