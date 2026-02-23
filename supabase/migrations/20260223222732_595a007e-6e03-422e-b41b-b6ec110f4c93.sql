
-- ============================================
-- Module Pricing Plans (Packages)
-- ============================================
CREATE TABLE public.module_pricing_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_brl NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  billing_interval TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'yearly')),
  module_ids UUID[] NOT NULL DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  stripe_price_id TEXT,
  max_users INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.module_pricing_plans ENABLE ROW LEVEL SECURITY;

-- Everyone can read plans (for pricing page)
CREATE POLICY "Plans are publicly readable"
  ON public.module_pricing_plans FOR SELECT
  USING (true);

-- Only admins can manage plans
CREATE POLICY "Admins can manage plans"
  ON public.module_pricing_plans FOR ALL
  USING (public.user_has_module_access(auth.uid(), 'system'));

-- ============================================
-- Insert default plans using module IDs from system_modules
-- ============================================
INSERT INTO public.module_pricing_plans (name, slug, description, price_brl, price_usd, module_ids, features, is_popular, sort_order) VALUES
(
  'Starter',
  'starter',
  'Para pequenas operações marítimas',
  99,
  19,
  (SELECT ARRAY_AGG(id) FROM public.system_modules WHERE is_core = true),
  ARRAY['Dashboard', 'Embarcações', 'Tripulação', 'Documentos', 'Suporte por email'],
  false,
  1
),
(
  'Professional',
  'professional',
  'Para empresas em crescimento',
  499,
  99,
  (SELECT ARRAY_AGG(id) FROM public.system_modules WHERE slug IN ('dashboard', 'vessels', 'crew', 'documents', 'compliance', 'finance', 'voyages', 'procurement', 'audits', 'training')),
  ARRAY['Tudo do Starter', 'Compliance (MLC, STCW, ISM)', 'Financeiro', 'Viagens', 'Procurement', 'Auditoria', 'Treinamento', 'Suporte prioritário'],
  true,
  2
),
(
  'Enterprise',
  'enterprise',
  'Solução completa para grandes armadores',
  1990,
  399,
  (SELECT ARRAY_AGG(id) FROM public.system_modules WHERE is_active = true),
  ARRAY['Tudo do Professional', 'IA & Analytics', 'Manutenção PMS', 'IoT & Telemetria', 'SGSO/ISM', 'ESG', 'Segurança', 'Suporte 24/7', 'API Access'],
  false,
  3
);

-- Add organization_plan tracking to organizations if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'active_plan_id') THEN
    ALTER TABLE public.organizations ADD COLUMN active_plan_id UUID REFERENCES public.module_pricing_plans(id);
  END IF;
END $$;
