-- PATCH 226-230: Interoperability System Tables

-- Protocol Adapter (PATCH 226)
CREATE TABLE IF NOT EXISTS public.interop_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_type TEXT NOT NULL,
  message JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent Swarm Bridge (PATCH 227)
CREATE TABLE IF NOT EXISTS public.agent_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'offline', 'error')),
  last_heartbeat TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agent_swarm_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL REFERENCES public.agent_registry(agent_id) ON DELETE CASCADE,
  task_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  avg_response_time_ms INTEGER NOT NULL DEFAULT 0,
  last_task_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Joint Tasking (PATCH 228)
CREATE TABLE IF NOT EXISTS public.external_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  trust_score DECIMAL(5,2) NOT NULL DEFAULT 50.00 CHECK (trust_score >= 0 AND trust_score <= 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.joint_mission_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id TEXT NOT NULL,
  task_name TEXT NOT NULL,
  assigned_entity TEXT NOT NULL REFERENCES public.external_entities(entity_id),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'failed')),
  result JSONB,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.joint_mission_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  details JSONB NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trust Compliance (PATCH 229)
CREATE TABLE IF NOT EXISTS public.trust_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id TEXT NOT NULL REFERENCES public.external_entities(entity_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  trust_score_before DECIMAL(5,2),
  trust_score_after DECIMAL(5,2) NOT NULL,
  details JSONB NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interop_log_protocol ON public.interop_log(protocol_type);
CREATE INDEX IF NOT EXISTS idx_interop_log_created ON public.interop_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_registry_status ON public.agent_registry(status);
CREATE INDEX IF NOT EXISTS idx_agent_swarm_metrics_agent ON public.agent_swarm_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_joint_mission_tasks_mission ON public.joint_mission_tasks(mission_id);
CREATE INDEX IF NOT EXISTS idx_joint_mission_tasks_entity ON public.joint_mission_tasks(assigned_entity);
CREATE INDEX IF NOT EXISTS idx_joint_mission_log_mission ON public.joint_mission_log(mission_id);
CREATE INDEX IF NOT EXISTS idx_trust_events_entity ON public.trust_events(entity_id);
CREATE INDEX IF NOT EXISTS idx_trust_events_created ON public.trust_events(created_at DESC);

-- Triggers for updated_at
CREATE TRIGGER update_agent_registry_updated_at
  BEFORE UPDATE ON public.agent_registry
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_agent_swarm_metrics_updated_at
  BEFORE UPDATE ON public.agent_swarm_metrics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_external_entities_updated_at
  BEFORE UPDATE ON public.external_entities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_joint_mission_tasks_updated_at
  BEFORE UPDATE ON public.joint_mission_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS Policies
ALTER TABLE public.interop_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_swarm_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joint_mission_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joint_mission_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all interop data
CREATE POLICY "Authenticated users can read interop logs"
  ON public.interop_log FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert interop logs"
  ON public.interop_log FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read agent registry"
  ON public.agent_registry FOR ALL
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can read agent metrics"
  ON public.agent_swarm_metrics FOR ALL
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage external entities"
  ON public.external_entities FOR ALL
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage joint mission tasks"
  ON public.joint_mission_tasks FOR ALL
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can read joint mission logs"
  ON public.joint_mission_log FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert joint mission logs"
  ON public.joint_mission_log FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read trust events"
  ON public.trust_events FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert trust events"
  ON public.trust_events FOR INSERT
  TO authenticated WITH CHECK (true);