
-- Fix: drop and recreate trigger that already exists
DROP TRIGGER IF EXISTS update_compliance_workflows_updated_at ON public.compliance_workflows;
CREATE TRIGGER update_compliance_workflows_updated_at
  BEFORE UPDATE ON public.compliance_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
