
CREATE TABLE public.cargo_shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  voyage_id UUID,
  cargo_type TEXT NOT NULL,
  commodity TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'MT',
  bl_number TEXT,
  shipper TEXT,
  consignee TEXT,
  load_port TEXT,
  discharge_port TEXT,
  loading_date TIMESTAMPTZ,
  discharge_date TIMESTAMPTZ,
  stowage_plan JSONB DEFAULT '{}',
  hazmat_class TEXT,
  un_number TEXT,
  temperature_required NUMERIC,
  humidity_required NUMERIC,
  status TEXT NOT NULL DEFAULT 'booked',
  freight_rate NUMERIC DEFAULT 0,
  freight_amount NUMERIC DEFAULT 0,
  demurrage_rate NUMERIC DEFAULT 0,
  demurrage_days NUMERIC DEFAULT 0,
  demurrage_amount NUMERIC DEFAULT 0,
  despatch_amount NUMERIC DEFAULT 0,
  documents JSONB DEFAULT '[]',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cargo_shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage cargo_shipments" ON public.cargo_shipments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_cargo_shipments_vessel ON public.cargo_shipments(vessel_id);
CREATE INDEX idx_cargo_shipments_status ON public.cargo_shipments(status);
