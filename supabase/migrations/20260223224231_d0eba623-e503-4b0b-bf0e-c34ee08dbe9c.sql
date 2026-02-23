
-- =====================================================
-- PRICING ATUALIZADO - BASEADO EM PESQUISA REAL DE MERCADO
-- Refs: SeaLogs ($35-75), Marad (€25), CFM/DNV (enterprise)
-- =====================================================

-- Módulos core = gratuitos
UPDATE public.system_modules SET price_addon_brl = 0, price_addon_usd = 0 WHERE category = 'core';

-- Crewing add-ons
UPDATE public.system_modules SET price_addon_brl = 49, price_addon_usd = 10 WHERE category = 'crewing';

-- Maintenance add-ons
UPDATE public.system_modules SET price_addon_brl = 59, price_addon_usd = 12 WHERE category = 'maintenance';

-- Operations add-ons
UPDATE public.system_modules SET price_addon_brl = 69, price_addon_usd = 14 WHERE category = 'operations';

-- QHSE add-ons
UPDATE public.system_modules SET price_addon_brl = 79, price_addon_usd = 16 WHERE category = 'qhse';

-- Finance add-ons
UPDATE public.system_modules SET price_addon_brl = 99, price_addon_usd = 20 WHERE category = 'finance';

-- Intelligence/AI add-ons
UPDATE public.system_modules SET price_addon_brl = 119, price_addon_usd = 25 WHERE category = 'intelligence';

-- Communications add-ons
UPDATE public.system_modules SET price_addon_brl = 39, price_addon_usd = 8 WHERE category = 'communications';

-- Atualizar pricing_unit para per_vessel_month
UPDATE public.system_modules SET pricing_unit = 'per_vessel_month' WHERE pricing_unit IS NULL OR pricing_unit = '';

-- =====================================================
-- PLANOS - Preços competitivos validados pelo mercado
-- =====================================================

-- Starter: US$ 29/vessel/mês (SeaLogs=$35, somos mais acessíveis)
UPDATE public.module_pricing_plans SET
  price_brl = 149,
  price_usd = 29,
  max_vessels = 10,
  description = 'Operações básicas — ideal para pequenas frotas (até 10 navios)',
  features = ARRAY[
    'Todos os módulos Core',
    'Crew Management básico',
    'Document Hub completo',
    'Certificados & Compliance',
    'Relatórios padrão',
    'Suporte por email (48h SLA)',
    'Até 10 embarcações'
  ]
WHERE slug = 'starter';

-- Professional: US$ 59/vessel/mês (SeaLogs=$55 + mais módulos)
UPDATE public.module_pricing_plans SET
  price_brl = 299,
  price_usd = 59,
  max_vessels = 50,
  description = 'Gestão completa — para frotas em crescimento (até 50 navios)',
  features = ARRAY[
    'Tudo do Starter',
    'PMS / Manutenção Planejada',
    'Procurement & Inventário',
    'QHSE & ISM Compliance',
    'Voyage Management',
    'Finance & Payroll',
    'Analytics avançados',
    'Suporte prioritário (24h SLA)',
    'Até 50 embarcações',
    'API access'
  ]
WHERE slug = 'professional';

-- Enterprise: US$ 149/vessel/mês (abaixo de AMOS/DNV >$200)
UPDATE public.module_pricing_plans SET
  price_brl = 749,
  price_usd = 149,
  max_vessels = 9999,
  description = 'Solução total — para grandes armadores e petroleiras',
  features = ARRAY[
    'Tudo do Professional',
    'AI Intelligence & Predictive',
    'IoT & Telemetria',
    'Manutenção Preditiva (CBM)',
    'SSO / SAML',
    'SLA 99.9% uptime',
    'Suporte dedicado (4h SLA)',
    'Embarcações ilimitadas',
    'Custom integrations (SAP, Oracle)',
    'Data export ilimitado',
    'Treinamento on-site'
  ]
WHERE slug = 'enterprise';

-- Inserir plano Trial (diferencial competitivo)
INSERT INTO public.module_pricing_plans (name, slug, price_brl, price_usd, billing_interval, max_vessels, pricing_model, description, features, is_active, is_popular, sort_order)
SELECT 'Trial', 'trial', 0, 0, 'monthly', 1, 'per_vessel_monthly',
  'Teste gratuito — 1 embarcação por 30 dias',
  ARRAY['Dashboard & KPIs básicos', 'Gestão de 1 embarcação', 'Documentos (até 100)', 'Suporte por email', '30 dias de trial completo'],
  true, false, 0
WHERE NOT EXISTS (SELECT 1 FROM public.module_pricing_plans WHERE slug = 'trial');
