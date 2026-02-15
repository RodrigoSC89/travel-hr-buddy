
-- Purchase Requisitions table for procurement workflow
CREATE TABLE IF NOT EXISTS public.purchase_requisitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requisition_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  vessel_id UUID REFERENCES public.vessels(id),
  vessel_name TEXT,
  department TEXT DEFAULT 'operations',
  category TEXT DEFAULT 'spare_parts',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical', 'emergency')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'ordered', 'partially_received', 'received', 'cancelled')),
  requested_by TEXT,
  requested_by_id UUID,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  supplier_name TEXT,
  supplier_contact TEXT,
  currency TEXT DEFAULT 'USD',
  estimated_total DECIMAL(12,2) DEFAULT 0,
  actual_total DECIMAL(12,2),
  delivery_port TEXT,
  delivery_date DATE,
  items JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.purchase_requisitions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view purchase requisitions"
  ON public.purchase_requisitions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create purchase requisitions"
  ON public.purchase_requisitions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update purchase requisitions"
  ON public.purchase_requisitions FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete purchase requisitions"
  ON public.purchase_requisitions FOR DELETE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

-- Indexes
CREATE INDEX idx_purchase_req_status ON public.purchase_requisitions(status);
CREATE INDEX idx_purchase_req_vessel ON public.purchase_requisitions(vessel_id);
CREATE INDEX idx_purchase_req_priority ON public.purchase_requisitions(priority);

-- Updated_at trigger
CREATE TRIGGER update_purchase_requisitions_updated_at
  BEFORE UPDATE ON public.purchase_requisitions
  FOR EACH ROW EXECUTE FUNCTION public.update_modular_updated_at();
