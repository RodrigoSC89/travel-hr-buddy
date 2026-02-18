
-- Sprint 15-16: Suppliers + TC Hire Statements (purchase_requisitions already exists)

-- Supplier Management
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  supplier_name TEXT NOT NULL,
  supplier_code TEXT,
  category TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  port_coverage TEXT[],
  payment_terms TEXT,
  currency TEXT DEFAULT 'USD',
  quality_score NUMERIC(5,2) DEFAULT 0,
  delivery_score NUMERIC(5,2) DEFAULT 0,
  price_score NUMERIC(5,2) DEFAULT 0,
  service_score NUMERIC(5,2) DEFAULT 0,
  overall_score NUMERIC(5,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(14,2) DEFAULT 0,
  on_time_delivery_rate NUMERIC(5,2) DEFAULT 0,
  defect_rate NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  blacklist_reason TEXT,
  iso_certified BOOLEAN DEFAULT false,
  certifications JSONB DEFAULT '[]',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Auth users manage suppliers') THEN
    CREATE POLICY "Auth users manage suppliers" ON public.suppliers FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- TC Hire Statements
CREATE TABLE IF NOT EXISTS public.tc_hire_statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  charter_party_id UUID REFERENCES public.charter_parties(id),
  statement_number TEXT NOT NULL,
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,
  daily_hire_rate NUMERIC(12,2) NOT NULL,
  hire_days NUMERIC(8,4) DEFAULT 0,
  gross_hire NUMERIC(14,2) DEFAULT 0,
  off_hire_days NUMERIC(8,4) DEFAULT 0,
  off_hire_amount NUMERIC(14,2) DEFAULT 0,
  off_hire_reasons JSONB DEFAULT '[]',
  bunker_deduction NUMERIC(14,2) DEFAULT 0,
  address_commission_pct NUMERIC(5,2) DEFAULT 0,
  address_commission NUMERIC(14,2) DEFAULT 0,
  broker_commission_pct NUMERIC(5,2) DEFAULT 0,
  broker_commission NUMERIC(14,2) DEFAULT 0,
  other_deductions NUMERIC(14,2) DEFAULT 0,
  deduction_details JSONB DEFAULT '[]',
  net_hire NUMERIC(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  exchange_rate NUMERIC(10,4) DEFAULT 1.0,
  payment_due_date DATE,
  payment_status TEXT DEFAULT 'pending',
  payment_date DATE,
  payment_reference TEXT,
  invoice_number TEXT,
  charter_form TEXT,
  anti_technicality_clause BOOLEAN DEFAULT false,
  withdrawal_notice_hours INTEGER DEFAULT 48,
  status TEXT DEFAULT 'draft',
  dispute_details TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tc_hire_statements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tc_hire_statements' AND policyname = 'Auth users manage tc_hire_statements') THEN
    CREATE POLICY "Auth users manage tc_hire_statements" ON public.tc_hire_statements FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Triggers (safe with IF NOT EXISTS pattern)
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();

DROP TRIGGER IF EXISTS update_tc_hire_statements_updated_at ON public.tc_hire_statements;
CREATE TRIGGER update_tc_hire_statements_updated_at BEFORE UPDATE ON public.tc_hire_statements FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
