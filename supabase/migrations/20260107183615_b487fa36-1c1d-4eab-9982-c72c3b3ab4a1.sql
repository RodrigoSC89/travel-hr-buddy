-- ============================================================================
-- SHIPMENTS TABLE - Para rastreamento de embarques/logística
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  
  -- Identificação
  tracking_number TEXT UNIQUE,
  external_reference TEXT,
  shipment_type TEXT DEFAULT 'cargo', -- cargo, equipment, supplies, crew_transfer
  
  -- Origem/Destino
  origin_port TEXT,
  origin_country TEXT,
  destination_port TEXT,
  destination_country TEXT,
  
  -- Datas
  departure_date TIMESTAMPTZ,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  
  -- Status e Detalhes
  status TEXT DEFAULT 'pending', -- pending, in_transit, arrived, delivered, cancelled
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  cargo_description TEXT,
  weight_kg NUMERIC(12,2),
  volume_cbm NUMERIC(12,2),
  
  -- Custos
  shipping_cost NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  
  -- Documentação
  documents JSONB DEFAULT '[]',
  customs_status TEXT,
  customs_clearance_date TIMESTAMPTZ,
  
  -- Rastreamento
  current_location TEXT,
  tracking_events JSONB DEFAULT '[]',
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  
  -- Auditoria
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- NON_CONFORMITIES TABLE - Para gestão de não conformidades SGSO/Compliance
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.non_conformities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  
  -- Identificação
  nc_number TEXT,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Classificação
  category TEXT, -- documentation, equipment, procedure, personnel, safety
  severity TEXT DEFAULT 'minor', -- minor, major, critical
  source TEXT, -- internal_audit, external_audit, psc, ovid, incident, observation
  source_reference TEXT, -- ID da inspeção/auditoria relacionada
  
  -- Normas/Requisitos
  standard_reference TEXT, -- ISO, MLC, STCW, SOLAS, etc.
  requirement_code TEXT,
  
  -- Status e Prazos
  status TEXT DEFAULT 'open', -- open, in_progress, pending_verification, closed, cancelled
  priority TEXT DEFAULT 'medium', -- low, medium, high, critical
  due_date DATE,
  closed_date TIMESTAMPTZ,
  
  -- Responsáveis
  reported_by UUID,
  assigned_to UUID,
  verified_by UUID,
  
  -- Ação Corretiva
  root_cause TEXT,
  corrective_action TEXT,
  preventive_action TEXT,
  action_deadline DATE,
  
  -- Evidências
  evidence_files JSONB DEFAULT '[]',
  verification_evidence JSONB DEFAULT '[]',
  
  -- Eficácia
  effectiveness_verified BOOLEAN DEFAULT false,
  effectiveness_notes TEXT,
  recurrence_count INTEGER DEFAULT 0,
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_shipments_org ON public.shipments(organization_id);
CREATE INDEX IF NOT EXISTS idx_shipments_vessel ON public.shipments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON public.shipments(tracking_number);

CREATE INDEX IF NOT EXISTS idx_non_conformities_org ON public.non_conformities(organization_id);
CREATE INDEX IF NOT EXISTS idx_non_conformities_vessel ON public.non_conformities(vessel_id);
CREATE INDEX IF NOT EXISTS idx_non_conformities_status ON public.non_conformities(status);
CREATE INDEX IF NOT EXISTS idx_non_conformities_severity ON public.non_conformities(severity);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.non_conformities ENABLE ROW LEVEL SECURITY;

-- Shipments policies
CREATE POLICY "Users can view shipments in their organization"
  ON public.shipments FOR SELECT
  USING (organization_id = public.get_current_organization_id());

CREATE POLICY "Users can insert shipments in their organization"
  ON public.shipments FOR INSERT
  WITH CHECK (organization_id = public.get_current_organization_id());

CREATE POLICY "Users can update shipments in their organization"
  ON public.shipments FOR UPDATE
  USING (organization_id = public.get_current_organization_id());

-- Non-conformities policies
CREATE POLICY "Users can view non_conformities in their organization"
  ON public.non_conformities FOR SELECT
  USING (organization_id = public.get_current_organization_id());

CREATE POLICY "Users can insert non_conformities in their organization"
  ON public.non_conformities FOR INSERT
  WITH CHECK (organization_id = public.get_current_organization_id());

CREATE POLICY "Users can update non_conformities in their organization"
  ON public.non_conformities FOR UPDATE
  USING (organization_id = public.get_current_organization_id());

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_shipments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_non_conformities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_shipments_timestamp
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_shipments_updated_at();

CREATE TRIGGER update_non_conformities_timestamp
  BEFORE UPDATE ON public.non_conformities
  FOR EACH ROW EXECUTE FUNCTION public.update_non_conformities_updated_at();