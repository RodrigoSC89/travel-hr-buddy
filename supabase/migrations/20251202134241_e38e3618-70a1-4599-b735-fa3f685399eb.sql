-- PATCH 660.2 - Complete RLS + Fix Functions search_path

-- =====================================================
-- 1. webhook_integrations (Has secret_key - CRITICAL)
-- =====================================================
ALTER TABLE public.webhook_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view webhooks"
ON public.webhook_integrations FOR SELECT
USING (public.user_belongs_to_organization(organization_id));

CREATE POLICY "Org admins can manage webhooks"
ON public.webhook_integrations FOR ALL
USING (
  public.user_belongs_to_organization(organization_id) AND
  public.get_user_organization_role(organization_id) IN ('owner', 'admin')
);

-- =====================================================
-- 2. organization_metrics
-- =====================================================
ALTER TABLE public.organization_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view metrics"
ON public.organization_metrics FOR SELECT
USING (public.user_belongs_to_organization(organization_id));

CREATE POLICY "System can insert metrics"
ON public.organization_metrics FOR INSERT
WITH CHECK (public.user_belongs_to_organization(organization_id));

-- =====================================================
-- 3. Fix Functions without search_path (SECURITY)
-- =====================================================

-- Fix update_workflow_updated_at
CREATE OR REPLACE FUNCTION public.update_workflow_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_tenant_users_updated_at
CREATE OR REPLACE FUNCTION public.update_tenant_users_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix update_ai_memory_updated_at
CREATE OR REPLACE FUNCTION public.update_ai_memory_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix update_workspace_updated_at
CREATE OR REPLACE FUNCTION public.update_workspace_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix update_member_last_seen
CREATE OR REPLACE FUNCTION public.update_member_last_seen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.workspace_members
  SET last_seen_at = NOW()
  WHERE user_id = NEW.user_id AND channel_id = NEW.channel_id;
  RETURN NEW;
END;
$function$;

-- Fix update_workspace_tables_updated_at
CREATE OR REPLACE FUNCTION public.update_workspace_tables_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix update_adaptive_parameters_updated_at
CREATE OR REPLACE FUNCTION public.update_adaptive_parameters_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_ai_commands_updated_at
CREATE OR REPLACE FUNCTION public.update_ai_commands_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix update_conversation_last_message
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    UPDATE conversations 
    SET 
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100),
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$function$;

-- Fix update_crew_updated_at
CREATE OR REPLACE FUNCTION public.update_crew_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Fix cleanup_old_logs
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    DELETE FROM logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    RAISE NOTICE 'Old logs cleaned successfully';
END;
$function$;

-- Fix detect_reservation_conflicts trigger function
CREATE OR REPLACE FUNCTION public.detect_reservation_conflicts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM reservations 
        WHERE resource_id = NEW.resource_id 
        AND tsrange(start_time, end_time) && tsrange(NEW.start_time, NEW.end_time)
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND status != 'cancelled'
    ) THEN
        RAISE EXCEPTION 'Reservation conflict detected for resource % between % and %', 
            NEW.resource_id, NEW.start_time, NEW.end_time;
    END IF;
    
    RETURN NEW;
END;
$function$;