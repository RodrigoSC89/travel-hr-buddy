
-- ============================================
-- PMS FOUNDATION: 5-Level Job Hierarchy + Work Order Lifecycle
-- System → Subsystem → Component → Job → Task
-- ============================================

-- Level 1: Systems (e.g., Main Engine, Aux Engine, Deck Equipment)
CREATE TABLE IF NOT EXISTS public.pms_systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_type VARCHAR(50), -- 'propulsion', 'auxiliary', 'deck', 'navigation', 'safety', 'hull'
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  installation_date DATE,
  is_critical BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Level 2: Subsystems (e.g., Fuel System, Cooling System, Turbocharger)
CREATE TABLE IF NOT EXISTS public.pms_subsystems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  system_id UUID NOT NULL REFERENCES public.pms_systems(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Level 3: Components (e.g., Fuel Injector #1, Coolant Pump, Turbo Bearing)
CREATE TABLE IF NOT EXISTS public.pms_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subsystem_id UUID NOT NULL REFERENCES public.pms_subsystems(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  part_number TEXT,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  running_hours_current NUMERIC DEFAULT 0,
  running_hours_at_last_maintenance NUMERIC DEFAULT 0,
  condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 5), -- CAP style 1-5
  is_critical BOOLEAN DEFAULT false,
  impa_code VARCHAR(20), -- IMPA catalog reference
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Level 4: Jobs (Planned maintenance jobs for a component)
CREATE TABLE IF NOT EXISTS public.pms_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  component_id UUID NOT NULL REFERENCES public.pms_components(id) ON DELETE CASCADE,
  job_code VARCHAR(30) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  job_type VARCHAR(30) NOT NULL DEFAULT 'preventive', -- 'preventive', 'corrective', 'predictive', 'condition_based'
  priority VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  
  -- Scheduling
  interval_hours NUMERIC, -- Running hours interval
  interval_days INTEGER, -- Calendar days interval
  interval_months INTEGER, -- Calendar months interval
  last_done_date DATE,
  last_done_hours NUMERIC,
  next_due_date DATE,
  next_due_hours NUMERIC,
  
  -- Class/Regulatory
  is_class_required BOOLEAN DEFAULT false,
  class_survey_type VARCHAR(50), -- 'annual', 'intermediate', 'special', 'docking'
  regulatory_reference TEXT, -- e.g., 'SOLAS Ch.II-1 Reg.26'
  
  -- Execution
  estimated_hours NUMERIC,
  estimated_cost NUMERIC,
  requires_docking BOOLEAN DEFAULT false,
  can_do_at_sea BOOLEAN DEFAULT true,
  spare_parts_required JSONB DEFAULT '[]'::jsonb,
  tools_required JSONB DEFAULT '[]'::jsonb,
  safety_precautions TEXT,
  procedure_reference TEXT,
  
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'completed', 'cancelled'
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Level 5: Work Orders (actual execution instances of a job)
CREATE TABLE IF NOT EXISTS public.pms_work_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_number VARCHAR(30) NOT NULL,
  job_id UUID REFERENCES public.pms_jobs(id),
  vessel_id UUID REFERENCES public.vessels(id),
  component_id UUID REFERENCES public.pms_components(id),
  
  title TEXT NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  work_order_type VARCHAR(30) NOT NULL DEFAULT 'planned', -- 'planned', 'unplanned', 'emergency', 'class_survey'
  
  -- 8-State Lifecycle
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  -- draft → planned → approved → in_progress → pending_parts → completed → verified → closed
  
  -- Assignment
  assigned_to TEXT,
  assigned_department TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  
  -- Scheduling
  planned_start DATE,
  planned_end DATE,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  
  -- Running Hours
  running_hours_at_start NUMERIC,
  running_hours_at_completion NUMERIC,
  
  -- Costs
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  spare_parts_used JSONB DEFAULT '[]'::jsonb,
  
  -- Documentation
  work_done_report TEXT,
  findings TEXT,
  recommendations TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Class/Safety
  is_class_related BOOLEAN DEFAULT false,
  permit_to_work_required BOOLEAN DEFAULT false,
  risk_assessment_done BOOLEAN DEFAULT false,
  
  -- Trigger source
  triggered_by VARCHAR(30), -- 'schedule', 'running_hours', 'condition', 'defect', 'manual'
  source_reference_id UUID, -- Reference to defect, sensor alert, etc.
  
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Running Hours Thresholds for automatic work order generation
CREATE TABLE IF NOT EXISTS public.pms_running_hours_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  component_id UUID NOT NULL REFERENCES public.pms_components(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.pms_jobs(id) ON DELETE CASCADE,
  sensor_id UUID REFERENCES public.iot_sensors(id),
  threshold_hours NUMERIC NOT NULL,
  last_triggered_at TIMESTAMPTZ,
  last_triggered_hours NUMERIC,
  is_active BOOLEAN DEFAULT true,
  auto_create_work_order BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_pms_systems_vessel ON public.pms_systems(vessel_id);
CREATE INDEX idx_pms_subsystems_system ON public.pms_subsystems(system_id);
CREATE INDEX idx_pms_components_subsystem ON public.pms_components(subsystem_id);
CREATE INDEX idx_pms_jobs_component ON public.pms_jobs(component_id);
CREATE INDEX idx_pms_jobs_next_due ON public.pms_jobs(next_due_date);
CREATE INDEX idx_pms_work_orders_vessel ON public.pms_work_orders(vessel_id);
CREATE INDEX idx_pms_work_orders_status ON public.pms_work_orders(status);
CREATE INDEX idx_pms_work_orders_job ON public.pms_work_orders(job_id);
CREATE INDEX idx_pms_rh_triggers_component ON public.pms_running_hours_triggers(component_id);

-- RLS
ALTER TABLE public.pms_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pms_subsystems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pms_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pms_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pms_work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pms_running_hours_triggers ENABLE ROW LEVEL SECURITY;

-- Policies (authenticated users can CRUD)
CREATE POLICY "Authenticated users can manage pms_systems" ON public.pms_systems FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage pms_subsystems" ON public.pms_subsystems FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage pms_components" ON public.pms_components FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage pms_jobs" ON public.pms_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage pms_work_orders" ON public.pms_work_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage pms_rh_triggers" ON public.pms_running_hours_triggers FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_pms_systems_updated_at BEFORE UPDATE ON public.pms_systems FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pms_subsystems_updated_at BEFORE UPDATE ON public.pms_subsystems FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pms_components_updated_at BEFORE UPDATE ON public.pms_components FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pms_jobs_updated_at BEFORE UPDATE ON public.pms_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pms_work_orders_updated_at BEFORE UPDATE ON public.pms_work_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
