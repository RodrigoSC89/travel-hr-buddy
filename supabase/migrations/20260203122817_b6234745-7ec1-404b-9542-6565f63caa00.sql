-- =====================================================
-- PATCH: Expand Audit Trail Coverage to CORE Tables
-- Risk R08 (ISM/ISPS Compliance) Mitigation
-- =====================================================

-- Add audit triggers to existing critical tables
DO $$
BEGIN
  -- Maritime Certificates (critical for compliance)
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_maritime_certificates_trigger') THEN
    CREATE TRIGGER audit_maritime_certificates_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.maritime_certificates
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_audit_changes();
  END IF;
  
  -- Voyage Plans (operational critical)
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_voyage_plans_trigger') THEN
    CREATE TRIGGER audit_voyage_plans_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.voyage_plans
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_audit_changes();
  END IF;
  
  -- Safety Incidents
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_safety_incidents_trigger') THEN
    CREATE TRIGGER audit_safety_incidents_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.safety_incidents
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_audit_changes();
  END IF;
  
  -- Non-Conformities (NCs)
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_non_conformities_trigger') THEN
    CREATE TRIGGER audit_non_conformities_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.non_conformities
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_audit_changes();
  END IF;
  
  -- Crew Contracts
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_crew_contracts_trigger') THEN
    CREATE TRIGGER audit_crew_contracts_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.crew_contracts
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_audit_changes();
  END IF;
  
  -- Training Records
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_training_records_trigger') THEN
    CREATE TRIGGER audit_training_records_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.training_records
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_audit_changes();
  END IF;

END;
$$;

-- Add indexes for faster audit queries
CREATE INDEX IF NOT EXISTS idx_audit_trail_resource_type ON public.audit_trail(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON public.audit_trail(action);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON public.audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON public.audit_trail(timestamp DESC);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';