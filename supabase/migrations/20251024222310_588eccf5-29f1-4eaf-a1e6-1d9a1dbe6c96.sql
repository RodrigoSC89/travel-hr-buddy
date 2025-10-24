-- PATCH 97.0 - Financial Transactions Table
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  payment_method TEXT,
  invoice_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_trans_org ON public.financial_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_financial_trans_date ON public.financial_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_trans_type ON public.financial_transactions(type);

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org transactions"
  ON public.financial_transactions FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Admins can manage transactions"
  ON public.financial_transactions FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
  ));