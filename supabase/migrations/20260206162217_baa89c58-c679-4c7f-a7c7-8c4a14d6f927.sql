-- Fix audit_log constraint to allow INSERT action (needed by core_audit_trigger)
ALTER TABLE public.audit_log DROP CONSTRAINT IF EXISTS audit_log_action_check;
ALTER TABLE public.audit_log ADD CONSTRAINT audit_log_action_check 
  CHECK (action = ANY (ARRAY['CREATE'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text, 'READ'::text, 'APPROVE'::text, 'REJECT'::text, 'EXECUTE'::text]));
