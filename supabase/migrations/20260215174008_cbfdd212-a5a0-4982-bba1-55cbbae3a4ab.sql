
-- Bunker Management table
CREATE TABLE IF NOT EXISTS public.bunker_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  vessel_name TEXT NOT NULL,
  port_name TEXT NOT NULL,
  operation_type TEXT NOT NULL DEFAULT 'receiving',
  fuel_type TEXT NOT NULL DEFAULT 'VLSFO',
  quantity_mt NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit_price NUMERIC(10,2),
  total_cost NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  supplier TEXT,
  bdn_number TEXT,
  rob_before NUMERIC(10,2),
  rob_after NUMERIC(10,2),
  density NUMERIC(6,4),
  sulfur_content NUMERIC(4,2),
  viscosity NUMERIC(6,2),
  temperature NUMERIC(5,1),
  sample_number TEXT,
  quality_status TEXT DEFAULT 'pending',
  operation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  organization_id UUID,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bunker_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bunker ops" ON public.bunker_operations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create bunker ops" ON public.bunker_operations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update bunker ops" ON public.bunker_operations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete bunker ops" ON public.bunker_operations FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_bunker_ops_vessel ON public.bunker_operations(vessel_id);
CREATE INDEX IF NOT EXISTS idx_bunker_ops_type ON public.bunker_operations(fuel_type);

-- Voyage P&L table
CREATE TABLE IF NOT EXISTS public.voyage_pnl (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voyage_id TEXT NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id),
  vessel_name TEXT NOT NULL,
  route_description TEXT,
  load_port TEXT,
  discharge_port TEXT,
  cargo_type TEXT,
  cargo_quantity_mt NUMERIC(12,2),
  freight_rate NUMERIC(10,2),
  freight_revenue NUMERIC(14,2) DEFAULT 0,
  demurrage_income NUMERIC(12,2) DEFAULT 0,
  other_revenue NUMERIC(12,2) DEFAULT 0,
  total_revenue NUMERIC(14,2) DEFAULT 0,
  bunker_cost NUMERIC(12,2) DEFAULT 0,
  port_charges NUMERIC(12,2) DEFAULT 0,
  canal_dues NUMERIC(12,2) DEFAULT 0,
  crew_cost NUMERIC(12,2) DEFAULT 0,
  insurance_cost NUMERIC(12,2) DEFAULT 0,
  agency_fees NUMERIC(12,2) DEFAULT 0,
  other_expenses NUMERIC(12,2) DEFAULT 0,
  total_expenses NUMERIC(14,2) DEFAULT 0,
  net_profit NUMERIC(14,2) DEFAULT 0,
  tce_rate NUMERIC(10,2),
  voyage_days NUMERIC(6,1),
  sea_days NUMERIC(6,1),
  port_days NUMERIC(6,1),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'estimated',
  organization_id UUID,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.voyage_pnl ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view voyage pnl" ON public.voyage_pnl FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create voyage pnl" ON public.voyage_pnl FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update voyage pnl" ON public.voyage_pnl FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete voyage pnl" ON public.voyage_pnl FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_voyage_pnl_vessel ON public.voyage_pnl(vessel_id);
CREATE INDEX IF NOT EXISTS idx_voyage_pnl_status ON public.voyage_pnl(status);
