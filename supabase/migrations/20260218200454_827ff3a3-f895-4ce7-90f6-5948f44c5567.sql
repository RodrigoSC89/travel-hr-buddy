
-- ============================================
-- NAUTI ONE — INTEGRATION BACKBONE TABLES
-- Event Outbox Pattern + Entity Documents + Integration Health
-- ============================================

-- 1) EVENT OUTBOX — Transactional event publishing
CREATE TABLE IF NOT EXISTS public.event_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'dead_letter')),
  retries integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  error_message text,
  source_entity_type text,
  source_entity_id uuid,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_outbox_status ON public.event_outbox(status) WHERE status = 'pending';
CREATE INDEX idx_event_outbox_event_type ON public.event_outbox(event_type);
CREATE INDEX idx_event_outbox_org ON public.event_outbox(organization_id);
CREATE INDEX idx_event_outbox_source ON public.event_outbox(source_entity_type, source_entity_id);

ALTER TABLE public.event_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org events"
  ON public.event_outbox FOR SELECT TO authenticated
  USING (actor_id = auth.uid() OR organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert events"
  ON public.event_outbox FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- 2) EVENT SUBSCRIPTIONS — Consumer registry
CREATE TABLE IF NOT EXISTS public.event_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_name text NOT NULL,
  event_type text NOT NULL,
  handler_function text,
  enabled boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  filter_conditions jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(consumer_name, event_type)
);

CREATE INDEX idx_event_subs_type ON public.event_subscriptions(event_type) WHERE enabled = true;

ALTER TABLE public.event_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view subscriptions"
  ON public.event_subscriptions FOR SELECT TO authenticated
  USING (true);

-- 3) ENTITY DOCUMENTS — Universal document linking
CREATE TABLE IF NOT EXISTS public.entity_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  document_id uuid NOT NULL,
  purpose text,
  organization_id uuid REFERENCES public.organizations(id),
  linked_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_entity_docs_entity ON public.entity_documents(entity_type, entity_id);
CREATE INDEX idx_entity_docs_document ON public.entity_documents(document_id);
CREATE INDEX idx_entity_docs_org ON public.entity_documents(organization_id);

ALTER TABLE public.entity_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org entity documents"
  ON public.entity_documents FOR SELECT TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can link documents"
  ON public.entity_documents FOR INSERT TO authenticated
  WITH CHECK (linked_by = auth.uid());

CREATE POLICY "Users can unlink documents"
  ON public.entity_documents FOR DELETE TO authenticated
  USING (linked_by = auth.uid());

-- 4) INTEGRATION HEALTH — Observability
CREATE TABLE IF NOT EXISTS public.integration_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name text NOT NULL,
  status text NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'down', 'unknown')),
  last_success_at timestamptz,
  last_failure_at timestamptz,
  error_count_24h integer NOT NULL DEFAULT 0,
  avg_latency_ms numeric,
  metadata jsonb,
  organization_id uuid REFERENCES public.organizations(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_integration_health_name ON public.integration_health(integration_name);
CREATE INDEX idx_integration_health_status ON public.integration_health(status);

ALTER TABLE public.integration_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view integration health"
  ON public.integration_health FOR SELECT TO authenticated
  USING (true);

-- 5) AUDIT EVENTS — Universal audit trail
CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  actor_id uuid,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  diff_json jsonb,
  metadata_json jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_events_entity ON public.audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_events_actor ON public.audit_events(actor_id);
CREATE INDEX idx_audit_events_org ON public.audit_events(organization_id);
CREATE INDEX idx_audit_events_action ON public.audit_events(action);
CREATE INDEX idx_audit_events_created ON public.audit_events(created_at DESC);

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org audit events"
  ON public.audit_events FOR SELECT TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert audit events"
  ON public.audit_events FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- 6) Helper function: publish event to outbox (transactional)
CREATE OR REPLACE FUNCTION public.publish_event(
  p_event_type text,
  p_payload jsonb DEFAULT '{}',
  p_source_entity_type text DEFAULT NULL,
  p_source_entity_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
  v_org_id uuid;
BEGIN
  SELECT organization_id INTO v_org_id FROM public.profiles WHERE id = auth.uid();
  
  INSERT INTO public.event_outbox (
    organization_id, event_type, payload, actor_id,
    source_entity_type, source_entity_id
  ) VALUES (
    v_org_id, p_event_type, p_payload, auth.uid(),
    p_source_entity_type, p_source_entity_id
  ) RETURNING id INTO v_event_id;
  
  -- Also log to audit_events
  INSERT INTO public.audit_events (
    organization_id, actor_id, entity_type,
    entity_id, action, metadata_json
  ) VALUES (
    v_org_id, auth.uid(), COALESCE(p_source_entity_type, 'system'),
    p_source_entity_id, p_event_type, p_payload
  );
  
  RETURN v_event_id;
END;
$$;
