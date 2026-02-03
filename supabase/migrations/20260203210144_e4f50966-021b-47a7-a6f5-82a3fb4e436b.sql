-- Create audit triggers for CORE tables (complementary)
DROP TRIGGER IF EXISTS audit_vessels_trigger ON public.vessels;
CREATE TRIGGER audit_vessels_trigger AFTER INSERT OR UPDATE OR DELETE ON public.vessels
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function('fleet');

DROP TRIGGER IF EXISTS audit_crew_members_trigger ON public.crew_members;
CREATE TRIGGER audit_crew_members_trigger AFTER INSERT OR UPDATE OR DELETE ON public.crew_members
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function('crew');

DROP TRIGGER IF EXISTS audit_maintenance_orders_trigger ON public.maintenance_orders;
CREATE TRIGGER audit_maintenance_orders_trigger AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_orders
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function('maintenance');

DROP TRIGGER IF EXISTS audit_documents_trigger ON public.documents;
CREATE TRIGGER audit_documents_trigger AFTER INSERT OR UPDATE OR DELETE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function('documents');