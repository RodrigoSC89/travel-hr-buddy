-- MIGRATION: Create missing tables - Part 2 (Safety, Training, Inventory, Procurement)

-- 5. SAFETY_INCIDENTS
CREATE TABLE IF NOT EXISTS public.safety_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  incident_number TEXT,
  incident_type TEXT NOT NULL DEFAULT 'other',
  severity TEXT DEFAULT 'low',
  status TEXT DEFAULT 'reported',
  title TEXT NOT NULL,
  description TEXT,
  incident_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  incident_location TEXT,
  persons_involved JSONB DEFAULT '[]'::jsonb,
  injuries_count INTEGER DEFAULT 0,
  immediate_actions TEXT,
  root_cause TEXT,
  corrective_actions JSONB DEFAULT '[]'::jsonb,
  reported_by UUID,
  reported_by_name TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. TRAINING_RECORDS
CREATE TABLE IF NOT EXISTS public.training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  user_id UUID,
  training_type TEXT NOT NULL DEFAULT 'general',
  training_name TEXT NOT NULL,
  training_provider TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  duration_hours NUMERIC(6,2),
  status TEXT DEFAULT 'scheduled',
  score NUMERIC(5,2),
  passed BOOLEAN,
  certificate_number TEXT,
  certificate_url TEXT,
  certificate_expiry_date DATE,
  is_mandatory BOOLEAN DEFAULT false,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. INVENTORY_ITEMS
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id),
  item_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit TEXT DEFAULT 'unit',
  quantity NUMERIC(12,3) DEFAULT 0,
  min_quantity NUMERIC(12,3) DEFAULT 0,
  max_quantity NUMERIC(12,3),
  unit_cost NUMERIC(12,4),
  currency TEXT DEFAULT 'USD',
  location TEXT,
  supplier_name TEXT,
  is_critical BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. PROCUREMENT_ORDERS
CREATE TABLE IF NOT EXISTS public.procurement_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id),
  order_number TEXT NOT NULL,
  order_type TEXT DEFAULT 'purchase',
  status TEXT DEFAULT 'draft',
  priority TEXT DEFAULT 'normal',
  supplier_id UUID,
  supplier_name TEXT,
  delivery_port TEXT,
  delivery_date DATE,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC(14,2),
  total_amount NUMERIC(14,2),
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  requested_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add frequency column to price_alerts if missing
ALTER TABLE public.price_alerts ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'once';

-- Add alert_id to price_notifications if missing
ALTER TABLE public.price_notifications ADD COLUMN IF NOT EXISTS alert_id UUID REFERENCES public.price_alerts(id);

-- Enable RLS
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "auth_access" ON public.safety_incidents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.training_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.inventory_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.procurement_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_si_vessel ON public.safety_incidents(vessel_id);
CREATE INDEX IF NOT EXISTS idx_si_date ON public.safety_incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_tr_crew ON public.training_records(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_ii_vessel ON public.inventory_items(vessel_id);
CREATE INDEX IF NOT EXISTS idx_po_vessel ON public.procurement_orders(vessel_id);