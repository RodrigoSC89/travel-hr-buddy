
-- Fix the get_demo_data function - use correct column names
CREATE OR REPLACE FUNCTION public.get_demo_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'vessels', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', v.id,
        'name', v.name,
        'vessel_type', v.vessel_type,
        'status', v.status,
        'flag_state', v.flag_state,
        'imo_number', v.imo_number
      )), '[]'::jsonb)
      FROM (SELECT id, name, vessel_type, status, flag_state, imo_number FROM vessels ORDER BY created_at DESC LIMIT 10) v
    ),
    'vessels_count', (SELECT count(*)::int FROM vessels),
    
    'crew', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', c.id,
        'full_name', c.full_name,
        'rank', c.rank,
        'status', c.status,
        'nationality', c.nationality
      )), '[]'::jsonb)
      FROM (SELECT id, full_name, rank, status, nationality FROM crew_members ORDER BY created_at DESC LIMIT 10) c
    ),
    'crew_count', (SELECT count(*)::int FROM crew_members),
    
    'audits', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', a.id,
        'title', COALESCE(a.audit_number, 'Auditoria'),
        'status', a.status,
        'audit_type', a.audit_type
      )), '[]'::jsonb)
      FROM (SELECT id, audit_number, status, audit_type FROM internal_audits ORDER BY created_at DESC LIMIT 10) a
    ),
    'audits_count', (SELECT count(*)::int FROM internal_audits),
    
    'agents', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', ag.id,
        'name', ag.name,
        'status', ag.status,
        'agent_id', ag.agent_id
      )), '[]'::jsonb)
      FROM (SELECT id, name, status, agent_id FROM agent_registry ORDER BY created_at DESC LIMIT 10) ag
    ),
    'agents_count', (SELECT count(*)::int FROM agent_registry),
    
    'certificates', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', ce.id,
        'certificate_name', ce.certificate_name,
        'status', ce.status,
        'certificate_type', ce.certificate_type
      )), '[]'::jsonb)
      FROM (SELECT id, certificate_name, status, certificate_type FROM certificates ORDER BY created_at DESC LIMIT 10) ce
    ),
    'certificates_count', (SELECT count(*)::int FROM certificates),
    
    'voyages', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', vp.id,
        'voyage_number', vp.voyage_number,
        'status', vp.status,
        'origin_port', vp.origin_port,
        'destination_port', vp.destination_port
      )), '[]'::jsonb)
      FROM (SELECT id, voyage_number, status, origin_port, destination_port FROM voyage_plans ORDER BY created_at DESC LIMIT 10) vp
    ),
    'voyages_count', (SELECT count(*)::int FROM voyage_plans),
    
    'documents_count', (SELECT count(*)::int FROM ai_documents),
    'maintenance_count', (SELECT count(*)::int FROM mmi_maintenance_jobs),
    'ncs_count', (SELECT count(*)::int FROM non_conformities),
    'ai_conversations_count', (SELECT count(*)::int FROM ai_chat_conversations),
    'compliance_count', (SELECT count(*)::int FROM compliance_items),
    'medical_count', (SELECT count(*)::int FROM medical_records),
    'courses_count', (SELECT count(*)::int FROM academy_courses),
    'insights_count', (SELECT count(*)::int FROM ai_insights),
    'contracts_count', (SELECT count(*)::int FROM ai_contract_analysis)
  ) INTO result;
  
  RETURN result;
END;
$$;
