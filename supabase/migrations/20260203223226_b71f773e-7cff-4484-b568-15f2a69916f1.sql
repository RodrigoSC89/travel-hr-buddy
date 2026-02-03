-- ============================================
-- PATCH: Complete Audit Trail on CORE Tables
-- R04/R08 Mitigation: Triggers on 18 existing CORE tables
-- ============================================

-- Create/update the core audit trigger function
CREATE OR REPLACE FUNCTION public.core_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.audit_log (
    id,
    event_timestamp,
    user_id,
    user_role,
    module,
    entity_type,
    entity_id,
    action,
    before_state,
    after_state,
    correlation_id,
    created_at
  ) VALUES (
    gen_random_uuid(),
    now(),
    auth.uid(),
    COALESCE(current_setting('app.current_user_role', true), 'system'),
    'core',
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    gen_random_uuid(),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================
-- Apply triggers to 18 existing CORE tables
-- ============================================

-- 1. vessels
DROP TRIGGER IF EXISTS audit_vessels ON public.vessels;
CREATE TRIGGER audit_vessels
  AFTER INSERT OR UPDATE OR DELETE ON public.vessels
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 2. crew_members
DROP TRIGGER IF EXISTS audit_crew_members ON public.crew_members;
CREATE TRIGGER audit_crew_members
  AFTER INSERT OR UPDATE OR DELETE ON public.crew_members
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 3. maintenance_orders
DROP TRIGGER IF EXISTS audit_maintenance_orders ON public.maintenance_orders;
CREATE TRIGGER audit_maintenance_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_orders
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 4. voyage_plans
DROP TRIGGER IF EXISTS audit_voyage_plans ON public.voyage_plans;
CREATE TRIGGER audit_voyage_plans
  AFTER INSERT OR UPDATE OR DELETE ON public.voyage_plans
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 5. crew_payroll
DROP TRIGGER IF EXISTS audit_crew_payroll ON public.crew_payroll;
CREATE TRIGGER audit_crew_payroll
  AFTER INSERT OR UPDATE OR DELETE ON public.crew_payroll
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 6. crew_health_metrics
DROP TRIGGER IF EXISTS audit_crew_health_metrics ON public.crew_health_metrics;
CREATE TRIGGER audit_crew_health_metrics
  AFTER INSERT OR UPDATE OR DELETE ON public.crew_health_metrics
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 7. documents
DROP TRIGGER IF EXISTS audit_documents ON public.documents;
CREATE TRIGGER audit_documents
  AFTER INSERT OR UPDATE OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 8. certificates
DROP TRIGGER IF EXISTS audit_certificates ON public.certificates;
CREATE TRIGGER audit_certificates
  AFTER INSERT OR UPDATE OR DELETE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 9. incidents
DROP TRIGGER IF EXISTS audit_incidents ON public.incidents;
CREATE TRIGGER audit_incidents
  AFTER INSERT OR UPDATE OR DELETE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 10. training_records
DROP TRIGGER IF EXISTS audit_training_records ON public.training_records;
CREATE TRIGGER audit_training_records
  AFTER INSERT OR UPDATE OR DELETE ON public.training_records
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 11. sgso_audits
DROP TRIGGER IF EXISTS audit_sgso_audits ON public.sgso_audits;
CREATE TRIGGER audit_sgso_audits
  AFTER INSERT OR UPDATE OR DELETE ON public.sgso_audits
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 12. psc_inspections
DROP TRIGGER IF EXISTS audit_psc_inspections ON public.psc_inspections;
CREATE TRIGGER audit_psc_inspections
  AFTER INSERT OR UPDATE OR DELETE ON public.psc_inspections
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 13. peotram_audits
DROP TRIGGER IF EXISTS audit_peotram_audits ON public.peotram_audits;
CREATE TRIGGER audit_peotram_audits
  AFTER INSERT OR UPDATE OR DELETE ON public.peotram_audits
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 14. non_conformities
DROP TRIGGER IF EXISTS audit_non_conformities ON public.non_conformities;
CREATE TRIGGER audit_non_conformities
  AFTER INSERT OR UPDATE OR DELETE ON public.non_conformities
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 15. corrective_actions
DROP TRIGGER IF EXISTS audit_corrective_actions ON public.corrective_actions;
CREATE TRIGGER audit_corrective_actions
  AFTER INSERT OR UPDATE OR DELETE ON public.corrective_actions
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 16. internal_audits
DROP TRIGGER IF EXISTS audit_internal_audits ON public.internal_audits;
CREATE TRIGGER audit_internal_audits
  AFTER INSERT OR UPDATE OR DELETE ON public.internal_audits
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 17. improvement_suggestions
DROP TRIGGER IF EXISTS audit_improvement_suggestions ON public.improvement_suggestions;
CREATE TRIGGER audit_improvement_suggestions
  AFTER INSERT OR UPDATE OR DELETE ON public.improvement_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- 18. dp_incidents
DROP TRIGGER IF EXISTS audit_dp_incidents ON public.dp_incidents;
CREATE TRIGGER audit_dp_incidents
  AFTER INSERT OR UPDATE OR DELETE ON public.dp_incidents
  FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();