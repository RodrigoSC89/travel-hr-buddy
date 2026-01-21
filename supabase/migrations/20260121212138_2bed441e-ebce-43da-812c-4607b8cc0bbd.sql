-- =====================================================
-- PATCH: Security Hardening + New Tables
-- =====================================================

-- 1. Fix fleet_logs policies - use user_id and vessel ownership
DROP POLICY IF EXISTS "Authenticated users can view fleet logs" ON public.fleet_logs;
DROP POLICY IF EXISTS "Authenticated users can insert fleet logs" ON public.fleet_logs;

CREATE POLICY "Authenticated users can view fleet logs"
ON public.fleet_logs FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR vessel_id IN (
    SELECT v.id FROM vessels v
    INNER JOIN organization_members om ON v.organization_id = om.organization_id
    WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can insert fleet logs"
ON public.fleet_logs FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

-- 2. Fix api_endpoints - keep authenticated access only
DROP POLICY IF EXISTS "public_api_endpoints" ON public.api_endpoints;

CREATE POLICY "Authenticated users can view API endpoints"
ON public.api_endpoints FOR SELECT
TO authenticated
USING (true);

-- 3. Create maritime_checklists table
CREATE TABLE IF NOT EXISTS public.maritime_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  description TEXT,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  vessel_name TEXT,
  inspector_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  inspector_name TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'pending_review', 'completed', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  items JSONB DEFAULT '[]'::jsonb,
  scheduled_for TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  compliance_score DECIMAL(5,2) DEFAULT 0,
  workflow JSONB DEFAULT '{}'::jsonb,
  tags TEXT[],
  location JSONB,
  weather JSONB,
  ai_analysis JSONB,
  sync_status TEXT DEFAULT 'synced',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.maritime_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklists in their organization"
ON public.maritime_checklists FOR SELECT
TO authenticated
USING (
  inspector_id = auth.uid()
  OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create checklists"
ON public.maritime_checklists FOR INSERT
TO authenticated
WITH CHECK (inspector_id = auth.uid());

CREATE POLICY "Users can update their own checklists"
ON public.maritime_checklists FOR UPDATE
TO authenticated
USING (inspector_id = auth.uid());

CREATE POLICY "Users can delete their draft checklists"
ON public.maritime_checklists FOR DELETE
TO authenticated
USING (inspector_id = auth.uid() AND status = 'draft');

CREATE INDEX IF NOT EXISTS idx_maritime_checklists_inspector ON public.maritime_checklists(inspector_id);
CREATE INDEX IF NOT EXISTS idx_maritime_checklists_org ON public.maritime_checklists(organization_id);
CREATE INDEX IF NOT EXISTS idx_maritime_checklists_status ON public.maritime_checklists(status);

-- 4. Create medical_records table
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  crew_member_name TEXT NOT NULL,
  blood_type TEXT,
  allergies TEXT[],
  conditions TEXT[],
  last_checkup DATE,
  next_checkup DATE,
  status TEXT DEFAULT 'fit' CHECK (status IN ('fit', 'restricted', 'unfit', 'pending')),
  vaccinations JSONB DEFAULT '[]'::jsonb,
  medical_history JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view medical records in their org"
ON public.medical_records FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager', 'medical_officer')
  )
);

CREATE POLICY "Medical staff can manage records"
ON public.medical_records FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'medical_officer')
  )
);

CREATE INDEX IF NOT EXISTS idx_medical_records_crew ON public.medical_records(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_org ON public.medical_records(organization_id);

-- 5. Create medical_supplies table
CREATE TABLE IF NOT EXISTS public.medical_supplies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  unit TEXT DEFAULT 'units',
  expiry_date DATE,
  batch_number TEXT,
  location TEXT,
  status TEXT DEFAULT 'ok' CHECK (status IN ('ok', 'low', 'critical', 'expired')),
  last_restock DATE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.medical_supplies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view medical supplies in their org"
ON public.medical_supplies FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Medical staff can manage supplies"
ON public.medical_supplies FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'medical_officer')
  )
);

CREATE INDEX IF NOT EXISTS idx_medical_supplies_org ON public.medical_supplies(organization_id);
CREATE INDEX IF NOT EXISTS idx_medical_supplies_status ON public.medical_supplies(status);