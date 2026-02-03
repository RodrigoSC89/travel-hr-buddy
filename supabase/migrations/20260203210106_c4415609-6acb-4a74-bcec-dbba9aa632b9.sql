-- ============================================
-- AUDIT TRAIL INFRASTRUCTURE - P0 PRIORITY  
-- Migration: Create audit_log + maintenance_orders + triggers
-- ============================================

-- 1. Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID REFERENCES auth.users(id),
    user_role TEXT,
    module TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'READ', 'APPROVE', 'REJECT', 'EXECUTE')),
    before_state JSONB,
    after_state JSONB,
    correlation_id UUID DEFAULT gen_random_uuid(),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_event_timestamp ON public.audit_log(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_module ON public.audit_log(module);

-- 2. Create maintenance_orders table
CREATE TABLE IF NOT EXISTS public.maintenance_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id UUID REFERENCES public.vessels(id),
    organization_id UUID REFERENCES public.organizations(id),
    order_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'deferred')),
    category TEXT,
    equipment_id TEXT,
    equipment_name TEXT,
    assigned_to UUID,
    assigned_to_name TEXT,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_hours NUMERIC(10,2),
    actual_hours NUMERIC(10,2),
    parts_required JSONB DEFAULT '[]'::jsonb,
    labor_cost NUMERIC(12,2),
    parts_cost NUMERIC(12,2),
    total_cost NUMERIC(12,2),
    notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on maintenance_orders
ALTER TABLE public.maintenance_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for maintenance_orders
CREATE POLICY "maintenance_orders_select" ON public.maintenance_orders FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "maintenance_orders_insert" ON public.maintenance_orders FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "maintenance_orders_update" ON public.maintenance_orders FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- 3. Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_action TEXT;
    v_before JSONB;
    v_after JSONB;
BEGIN
    v_user_id := auth.uid();
    
    IF TG_OP = 'INSERT' THEN
        v_action := 'CREATE';
        v_before := NULL;
        v_after := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'UPDATE';
        v_before := to_jsonb(OLD);
        v_after := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'DELETE';
        v_before := to_jsonb(OLD);
        v_after := NULL;
    END IF;
    
    INSERT INTO public.audit_log (user_id, module, entity_type, entity_id, action, before_state, after_state, metadata)
    VALUES (v_user_id, TG_ARGV[0], TG_TABLE_NAME, COALESCE(NEW.id::text, OLD.id::text), v_action, v_before, v_after,
        jsonb_build_object('table_schema', TG_TABLE_SCHEMA, 'trigger_name', TG_NAME));
    
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Create audit triggers for CORE tables
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

-- 5. Enable RLS on audit_log (simple policy - users see their own logs)
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select" ON public.audit_log FOR SELECT USING (auth.uid() IS NOT NULL);

-- 6. Helper function
CREATE OR REPLACE FUNCTION public.get_entity_audit_trail(p_entity_type TEXT, p_entity_id TEXT, p_limit INT DEFAULT 50)
RETURNS TABLE (log_id UUID, log_timestamp TIMESTAMPTZ, log_user_id UUID, log_action TEXT, log_before JSONB, log_after JSONB) AS $$
BEGIN
    RETURN QUERY SELECT al.id, al.event_timestamp, al.user_id, al.action, al.before_state, al.after_state
    FROM public.audit_log al WHERE al.entity_type = p_entity_type AND al.entity_id = p_entity_id
    ORDER BY al.event_timestamp DESC LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_entity_audit_trail TO authenticated;