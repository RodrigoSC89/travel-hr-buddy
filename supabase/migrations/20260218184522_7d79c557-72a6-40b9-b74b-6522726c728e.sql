
-- =============================================================
-- SYSTEM EVENTS — Central Nervous System for Module Integration
-- =============================================================

-- 1. Core events table
CREATE TABLE public.system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  source_module TEXT NOT NULL,
  source_record_id UUID,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  processor_result JSONB,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast processing
CREATE INDEX idx_system_events_unprocessed ON public.system_events (created_at) WHERE processed = false;
CREATE INDEX idx_system_events_type ON public.system_events (event_type);
CREATE INDEX idx_system_events_vessel ON public.system_events (vessel_id) WHERE vessel_id IS NOT NULL;
CREATE INDEX idx_system_events_source ON public.system_events (source_module, source_record_id);

-- Enable RLS
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can read events for their org; system inserts via triggers
CREATE POLICY "Users can view org events" ON public.system_events
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND status = 'active')
    OR public.is_admin()
  );

CREATE POLICY "System can insert events" ON public.system_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Generic trigger function to emit events
CREATE OR REPLACE FUNCTION public.emit_system_event()
RETURNS TRIGGER AS $$
DECLARE
  v_vessel_id UUID;
  v_org_id UUID;
BEGIN
  -- Try to extract vessel_id and organization_id from the row
  IF to_jsonb(NEW) ? 'vessel_id' THEN
    v_vessel_id := (to_jsonb(NEW)->>'vessel_id')::UUID;
  END IF;
  IF to_jsonb(NEW) ? 'organization_id' THEN
    v_org_id := (to_jsonb(NEW)->>'organization_id')::UUID;
  END IF;

  INSERT INTO public.system_events (
    event_type, source_module, source_record_id,
    vessel_id, organization_id, payload, priority
  ) VALUES (
    TG_ARGV[0],
    TG_TABLE_NAME,
    NEW.id,
    v_vessel_id,
    v_org_id,
    to_jsonb(NEW),
    COALESCE(TG_ARGV[1], 'normal')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Attach triggers to critical tables

-- Voyages
CREATE TRIGGER trg_voyage_created AFTER INSERT ON public.voyage_plans
  FOR EACH ROW EXECUTE FUNCTION public.emit_system_event('voyage_created', 'high');

CREATE TRIGGER trg_voyage_updated AFTER UPDATE ON public.voyage_plans
  FOR EACH ROW EXECUTE FUNCTION public.emit_system_event('voyage_updated', 'normal');

-- Certificates
CREATE TRIGGER trg_certificate_created AFTER INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.emit_system_event('certificate_created', 'normal');

CREATE TRIGGER trg_certificate_updated AFTER UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.emit_system_event('certificate_updated', 'high');

-- Maintenance
CREATE TRIGGER trg_maintenance_created AFTER INSERT ON public.maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION public.emit_system_event('maintenance_created', 'normal');

CREATE TRIGGER trg_maintenance_updated AFTER UPDATE ON public.maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION public.emit_system_event('maintenance_updated', 'high');

-- Crew
CREATE TRIGGER trg_crew_updated AFTER UPDATE ON public.crew_members
  FOR EACH ROW EXECUTE FUNCTION public.emit_system_event('crew_status_changed', 'high');

-- Non-conformities
CREATE TRIGGER trg_nc_created AFTER INSERT ON public.non_conformities
  FOR EACH ROW EXECUTE FUNCTION public.emit_system_event('nc_created', 'high');

-- Expenses
CREATE TRIGGER trg_expense_created AFTER INSERT ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.emit_system_event('expense_created', 'normal');

-- SOC Alerts (incidents)
CREATE TRIGGER trg_incident_created AFTER INSERT ON public.soc_alerts
  FOR EACH ROW EXECUTE FUNCTION public.emit_system_event('incident_created', 'critical');

-- Compliance items
CREATE TRIGGER trg_compliance_updated AFTER UPDATE ON public.compliance_items
  FOR EACH ROW EXECUTE FUNCTION public.emit_system_event('compliance_updated', 'high');

-- 4. Event summary view
CREATE OR REPLACE VIEW public.system_events_summary AS
SELECT
  event_type,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE processed = true) AS processed,
  COUNT(*) FILTER (WHERE processed = false) AS pending,
  COUNT(*) FILTER (WHERE error_message IS NOT NULL) AS errors,
  MAX(created_at) AS last_event_at
FROM public.system_events
GROUP BY event_type
ORDER BY last_event_at DESC;
