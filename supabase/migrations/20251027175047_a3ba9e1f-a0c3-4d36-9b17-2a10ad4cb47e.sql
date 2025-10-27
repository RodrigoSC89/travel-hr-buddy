-- PATCH 261: Logistics Hub Tables
CREATE TABLE IF NOT EXISTS public.logistics_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_code TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10,2),
  location TEXT,
  supplier TEXT,
  last_restocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.logistics_supply_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  item_id UUID REFERENCES public.logistics_inventory(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_transit', 'delivered', 'failed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  supplier TEXT,
  delivery_address TEXT,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  notes TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PATCH 262: Project Timeline Tables
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  task_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID REFERENCES auth.users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, depends_on_task_id)
);

-- PATCH 263: Task Automation Tables
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('event', 'schedule', 'webhook', 'manual')),
  trigger_config JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  execution_count INTEGER NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  trigger_data JSONB,
  actions_executed JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PATCH 264: AI Documents Tables
CREATE TABLE IF NOT EXISTS public.ai_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  ocr_status TEXT NOT NULL DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.extracted_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.ai_documents(id) ON DELETE CASCADE,
  extraction_type TEXT NOT NULL CHECK (extraction_type IN ('ocr', 'structured', 'metadata')),
  content TEXT,
  structured_data JSONB,
  confidence_score DECIMAL(5,2),
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PATCH 265: Fuel Optimizer Tables
CREATE TABLE IF NOT EXISTS public.fuel_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID,
  route_name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance_nm DECIMAL(10,2) NOT NULL,
  estimated_consumption DECIMAL(10,2) NOT NULL,
  optimized_consumption DECIMAL(10,2),
  savings_percentage DECIMAL(5,2),
  weather_conditions JSONB,
  optimization_factors JSONB,
  status TEXT NOT NULL DEFAULT 'simulated' CHECK (status IN ('simulated', 'active', 'completed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.logistics_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_supply_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_optimizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Logistics
CREATE POLICY "Users can view logistics inventory in their organization"
  ON public.logistics_inventory FOR SELECT
  USING (public.user_belongs_to_organization(organization_id));

CREATE POLICY "Users can manage logistics inventory in their organization"
  ON public.logistics_inventory FOR ALL
  USING (public.user_belongs_to_organization(organization_id));

CREATE POLICY "Users can view supply orders in their organization"
  ON public.logistics_supply_orders FOR SELECT
  USING (public.user_belongs_to_organization(organization_id));

CREATE POLICY "Users can manage supply orders in their organization"
  ON public.logistics_supply_orders FOR ALL
  USING (public.user_belongs_to_organization(organization_id));

-- RLS Policies for Project Timeline
CREATE POLICY "Users can view project tasks in their organization"
  ON public.project_tasks FOR SELECT
  USING (public.user_belongs_to_organization(organization_id));

CREATE POLICY "Users can manage project tasks in their organization"
  ON public.project_tasks FOR ALL
  USING (public.user_belongs_to_organization(organization_id));

CREATE POLICY "Users can view project dependencies"
  ON public.project_dependencies FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.project_tasks WHERE id = task_id AND public.user_belongs_to_organization(organization_id)));

CREATE POLICY "Users can manage project dependencies"
  ON public.project_dependencies FOR ALL
  USING (EXISTS (SELECT 1 FROM public.project_tasks WHERE id = task_id AND public.user_belongs_to_organization(organization_id)));

-- RLS Policies for Automation
CREATE POLICY "Users can view automation rules in their organization"
  ON public.automation_rules FOR SELECT
  USING (public.user_belongs_to_organization(organization_id));

CREATE POLICY "Users can manage automation rules in their organization"
  ON public.automation_rules FOR ALL
  USING (public.user_belongs_to_organization(organization_id));

CREATE POLICY "Users can view automation logs in their organization"
  ON public.automation_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.automation_rules WHERE id = rule_id AND public.user_belongs_to_organization(organization_id)));

-- RLS Policies for AI Documents
CREATE POLICY "Users can view AI documents in their organization"
  ON public.ai_documents FOR SELECT
  USING (public.user_belongs_to_organization(organization_id));

CREATE POLICY "Users can manage AI documents in their organization"
  ON public.ai_documents FOR ALL
  USING (public.user_belongs_to_organization(organization_id));

CREATE POLICY "Users can view extracted data"
  ON public.extracted_data FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.ai_documents WHERE id = document_id AND public.user_belongs_to_organization(organization_id)));

-- RLS Policies for Fuel Optimizer
CREATE POLICY "Users can view fuel optimizations in their organization"
  ON public.fuel_optimizations FOR SELECT
  USING (public.user_belongs_to_organization(organization_id));

CREATE POLICY "Users can manage fuel optimizations in their organization"
  ON public.fuel_optimizations FOR ALL
  USING (public.user_belongs_to_organization(organization_id));

-- Triggers for updated_at
CREATE TRIGGER set_logistics_inventory_updated_at BEFORE UPDATE ON public.logistics_inventory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_logistics_supply_orders_updated_at BEFORE UPDATE ON public.logistics_supply_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_project_tasks_updated_at BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_ai_documents_updated_at BEFORE UPDATE ON public.ai_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_fuel_optimizations_updated_at BEFORE UPDATE ON public.fuel_optimizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();