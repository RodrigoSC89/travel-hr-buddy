-- =====================================================
-- SISCOMEX INTEGRATION MVP + FATURAMENTO AUTOMATIZADO
-- =====================================================

-- 1. SISCOMEX TRANSMISSION TYPES
CREATE TYPE siscomex_transmission_type AS ENUM ('entry', 'exit', 'manifest', 'crew_list', 'cargo_declaration');
CREATE TYPE siscomex_transmission_status AS ENUM ('pending', 'processing', 'sent', 'acknowledged', 'error', 'cancelled');

-- 2. SISCOMEX TRANSMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.siscomex_transmissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  voyage_id UUID,
  transmission_type siscomex_transmission_type NOT NULL,
  status siscomex_transmission_status NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL DEFAULT '{}',
  siscomex_protocol TEXT,
  siscomex_response JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SISCOMEX AUDIT LOG
CREATE TABLE IF NOT EXISTS public.siscomex_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transmission_id UUID REFERENCES public.siscomex_transmissions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. INVOICE STATUS ENUM
CREATE TYPE invoice_status AS ENUM ('draft', 'pending_approval', 'approved', 'sent', 'paid', 'overdue', 'cancelled', 'disputed');

-- 5. INVOICES TABLE (Faturamento para Charterers)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  voyage_id UUID,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  charterer_id UUID REFERENCES public.organizations(id),
  invoice_number TEXT UNIQUE,
  status invoice_status NOT NULL DEFAULT 'draft',
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  issued_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_terms TEXT DEFAULT 'Net 30',
  notes TEXT,
  erp_reference TEXT,
  erp_sync_status TEXT DEFAULT 'pending',
  erp_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. INVOICE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,4) NOT NULL,
  unit TEXT DEFAULT 'unit',
  amount DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  category TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. PRICING RULES TABLE
CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL, -- 'fuel', 'port_fee', 'charter_rate', 'demurrage', etc.
  base_rate DECIMAL(12,4) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  unit TEXT NOT NULL, -- 'day', 'ton', 'hour', 'voyage'
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. SOC DASHBOARD ALERTS (Real-time)
CREATE TABLE IF NOT EXISTS public.soc_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL, -- 'compliance', 'maintenance', 'crew', 'safety', 'weather', 'port'
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  source_module TEXT,
  source_reference_id UUID,
  metadata JSONB DEFAULT '{}',
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. INDEXES
CREATE INDEX idx_siscomex_transmissions_org ON public.siscomex_transmissions(organization_id);
CREATE INDEX idx_siscomex_transmissions_status ON public.siscomex_transmissions(status);
CREATE INDEX idx_siscomex_transmissions_vessel ON public.siscomex_transmissions(vessel_id);
CREATE INDEX idx_siscomex_audit_transmission ON public.siscomex_audit_log(transmission_id);

CREATE INDEX idx_invoices_org ON public.invoices(organization_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_charterer ON public.invoices(charterer_id);
CREATE INDEX idx_invoices_due_at ON public.invoices(due_at);
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);

CREATE INDEX idx_soc_alerts_org ON public.soc_alerts(organization_id);
CREATE INDEX idx_soc_alerts_severity ON public.soc_alerts(severity);
CREATE INDEX idx_soc_alerts_unresolved ON public.soc_alerts(organization_id, resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_soc_alerts_created ON public.soc_alerts(created_at DESC);

-- 10. RLS POLICIES
ALTER TABLE public.siscomex_transmissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siscomex_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soc_alerts ENABLE ROW LEVEL SECURITY;

-- SISCOMEX Policies
CREATE POLICY "siscomex_transmissions_org_access" ON public.siscomex_transmissions
  FOR ALL TO authenticated
  USING (organization_id = public.get_current_organization_id());

CREATE POLICY "siscomex_audit_log_org_access" ON public.siscomex_audit_log
  FOR ALL TO authenticated
  USING (transmission_id IN (
    SELECT id FROM public.siscomex_transmissions 
    WHERE organization_id = public.get_current_organization_id()
  ));

-- Invoice Policies
CREATE POLICY "invoices_org_access" ON public.invoices
  FOR ALL TO authenticated
  USING (organization_id = public.get_current_organization_id());

CREATE POLICY "invoice_items_via_invoice" ON public.invoice_items
  FOR ALL TO authenticated
  USING (invoice_id IN (
    SELECT id FROM public.invoices 
    WHERE organization_id = public.get_current_organization_id()
  ));

CREATE POLICY "pricing_rules_org_access" ON public.pricing_rules
  FOR ALL TO authenticated
  USING (organization_id = public.get_current_organization_id());

-- SOC Alerts Policies
CREATE POLICY "soc_alerts_org_access" ON public.soc_alerts
  FOR ALL TO authenticated
  USING (organization_id = public.get_current_organization_id());

-- 11. TRIGGERS
CREATE TRIGGER update_siscomex_transmissions_updated_at
  BEFORE UPDATE ON public.siscomex_transmissions
  FOR EACH ROW EXECUTE FUNCTION public.update_workflow_updated_at();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_workflow_updated_at();

CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_workflow_updated_at();

-- 12. FUNCTION: Generate Invoice Number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year TEXT;
  v_sequence INTEGER;
BEGIN
  v_year := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-' || v_year || '-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO v_sequence
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || v_year || '-%';
  
  NEW.invoice_number := 'INV-' || v_year || '-' || LPAD(v_sequence::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION public.generate_invoice_number();

-- 13. FUNCTION: Create SOC Alert
CREATE OR REPLACE FUNCTION public.create_soc_alert(
  p_organization_id UUID,
  p_alert_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_message TEXT,
  p_vessel_id UUID DEFAULT NULL,
  p_source_module TEXT DEFAULT NULL,
  p_source_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_alert_id UUID;
BEGIN
  INSERT INTO public.soc_alerts (
    organization_id, vessel_id, alert_type, severity,
    title, message, source_module, source_reference_id, metadata
  ) VALUES (
    p_organization_id, p_vessel_id, p_alert_type, p_severity,
    p_title, p_message, p_source_module, p_source_reference_id, p_metadata
  ) RETURNING id INTO v_alert_id;
  
  -- Notify realtime subscribers
  PERFORM pg_notify('soc_alerts', json_build_object(
    'id', v_alert_id,
    'organization_id', p_organization_id,
    'alert_type', p_alert_type,
    'severity', p_severity,
    'title', p_title
  )::text);
  
  RETURN v_alert_id;
END;
$$;

-- 14. Enable Realtime for SOC Alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.soc_alerts;