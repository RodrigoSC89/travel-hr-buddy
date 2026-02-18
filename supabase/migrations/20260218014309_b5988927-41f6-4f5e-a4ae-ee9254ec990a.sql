
-- Sprint 25-26: Bid Submissions + Sprint 29-30: Insurance & P&I + Sprint 31-32: Class Surveys Enhancement

-- 1. Bid Submissions (E-Procurement complement)
CREATE TABLE IF NOT EXISTS public.bid_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID REFERENCES public.rfq_requests(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  organization_id UUID REFERENCES public.organizations(id),
  bid_number TEXT,
  total_amount NUMERIC(14,2),
  currency TEXT DEFAULT 'USD',
  line_items JSONB DEFAULT '[]', -- [{item, qty, unit_price, total, lead_time_days}]
  delivery_terms TEXT, -- FOB, CIF, DAP
  payment_terms TEXT, -- 30NET, 60NET, LC
  validity_days INTEGER DEFAULT 30,
  technical_proposal TEXT,
  attachments JSONB DEFAULT '[]',
  compliance_score NUMERIC(5,2), -- auto-calculated vs RFQ requirements
  price_score NUMERIC(5,2),
  overall_score NUMERIC(5,2),
  status TEXT DEFAULT 'submitted', -- submitted, under_review, shortlisted, awarded, rejected
  evaluation_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bid_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View bids" ON public.bid_submissions FOR SELECT USING (true);
CREATE POLICY "Insert bids" ON public.bid_submissions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update bids" ON public.bid_submissions FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 2. Insurance Claims (complement insurance_policies + insurance_claims)
-- Check: insurance_policies and insurance_claims already exist, enhance with P&I specifics
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS pi_club TEXT; -- Gard, Skuld, West, Britannia
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS hull_value NUMERIC(14,2);
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS war_risk_premium NUMERIC(12,2);
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS loss_ratio NUMERIC(6,4);
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS claims_history JSONB DEFAULT '[]';
ALTER TABLE public.insurance_policies ADD COLUMN IF NOT EXISTS renewal_terms JSONB DEFAULT '{}';

-- 3. Class Conditions of Class (enhance class_surveys)
ALTER TABLE public.class_surveys ADD COLUMN IF NOT EXISTS conditions_of_class JSONB DEFAULT '[]'; -- [{condition, imposed_date, due_date, status}]
ALTER TABLE public.class_surveys ADD COLUMN IF NOT EXISTS memoranda JSONB DEFAULT '[]';
ALTER TABLE public.class_surveys ADD COLUMN IF NOT EXISTS recommendations JSONB DEFAULT '[]';
ALTER TABLE public.class_surveys ADD COLUMN IF NOT EXISTS hull_survey_status TEXT;
ALTER TABLE public.class_surveys ADD COLUMN IF NOT EXISTS machinery_survey_status TEXT;
ALTER TABLE public.class_surveys ADD COLUMN IF NOT EXISTS safety_equipment_status TEXT;
ALTER TABLE public.class_surveys ADD COLUMN IF NOT EXISTS load_line_status TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bids_rfq ON public.bid_submissions(rfq_id);
CREATE INDEX IF NOT EXISTS idx_bids_supplier ON public.bid_submissions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bid_submissions(status);
