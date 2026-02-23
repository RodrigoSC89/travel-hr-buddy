
-- =============================================
-- PATCH: Reestruturar módulos e pricing (padrão indústria marítima)
-- Modelo: por navio/mês (como TM Master, SERTICA, AMOS)
-- =============================================

-- 1) Adicionar colunas
ALTER TABLE public.module_pricing_plans 
  ADD COLUMN IF NOT EXISTS pricing_model text DEFAULT 'per_vessel_monthly',
  ADD COLUMN IF NOT EXISTS max_vessels integer DEFAULT NULL;

ALTER TABLE public.system_modules
  ADD COLUMN IF NOT EXISTS pricing_unit text DEFAULT 'per_vessel_monthly';

-- 2) Atualizar categorias dos módulos para padrão da indústria
UPDATE public.system_modules SET category = 'core' WHERE slug IN ('dashboard', 'documents');
UPDATE public.system_modules SET category = 'crewing' WHERE slug IN ('crew', 'medical', 'training', 'gamification');
UPDATE public.system_modules SET category = 'maintenance' WHERE slug IN ('maintenance');
UPDATE public.system_modules SET category = 'operations' WHERE slug IN ('vessels', 'voyages');
UPDATE public.system_modules SET category = 'qhse' WHERE slug IN ('compliance', 'audits', 'sgso', 'inspections', 'security');
UPDATE public.system_modules SET category = 'finance' WHERE slug IN ('finance', 'procurement');
UPDATE public.system_modules SET category = 'intelligence' WHERE slug IN ('ai-analytics', 'iot-telemetry', 'esg');
UPDATE public.system_modules SET category = 'communications' WHERE slug IN ('communications');

-- 3) Atualizar preços para modelo por navio/mês
UPDATE public.system_modules SET price_addon_brl = 0, price_addon_usd = 0, pricing_unit = 'included' WHERE is_core = true;
UPDATE public.system_modules SET price_addon_brl = 45, price_addon_usd = 9 WHERE slug = 'crew';
UPDATE public.system_modules SET price_addon_brl = 25, price_addon_usd = 5 WHERE slug = 'medical';
UPDATE public.system_modules SET price_addon_brl = 25, price_addon_usd = 5 WHERE slug = 'training';
UPDATE public.system_modules SET price_addon_brl = 15, price_addon_usd = 3 WHERE slug = 'gamification';
UPDATE public.system_modules SET price_addon_brl = 55, price_addon_usd = 11 WHERE slug = 'maintenance';
UPDATE public.system_modules SET price_addon_brl = 50, price_addon_usd = 10 WHERE slug = 'vessels';
UPDATE public.system_modules SET price_addon_brl = 50, price_addon_usd = 10 WHERE slug = 'voyages';
UPDATE public.system_modules SET price_addon_brl = 55, price_addon_usd = 11 WHERE slug = 'compliance';
UPDATE public.system_modules SET price_addon_brl = 45, price_addon_usd = 9 WHERE slug = 'audits';
UPDATE public.system_modules SET price_addon_brl = 45, price_addon_usd = 9 WHERE slug = 'sgso';
UPDATE public.system_modules SET price_addon_brl = 45, price_addon_usd = 9 WHERE slug = 'inspections';
UPDATE public.system_modules SET price_addon_brl = 35, price_addon_usd = 7 WHERE slug = 'security';
UPDATE public.system_modules SET price_addon_brl = 40, price_addon_usd = 8 WHERE slug = 'finance';
UPDATE public.system_modules SET price_addon_brl = 35, price_addon_usd = 7 WHERE slug = 'procurement';
UPDATE public.system_modules SET price_addon_brl = 60, price_addon_usd = 12 WHERE slug = 'ai-analytics';
UPDATE public.system_modules SET price_addon_brl = 30, price_addon_usd = 6 WHERE slug = 'iot-telemetry';
UPDATE public.system_modules SET price_addon_brl = 35, price_addon_usd = 7 WHERE slug = 'esg';
UPDATE public.system_modules SET price_addon_brl = 20, price_addon_usd = 4 WHERE slug = 'communications';

-- 4) Atualizar planos com preços por navio/mês (text[] para features)
UPDATE public.module_pricing_plans 
SET 
  price_brl = 89, 
  price_usd = 19,
  pricing_model = 'per_vessel_monthly',
  max_vessels = 5,
  description = 'Operações básicas — ideal para pequenas frotas',
  features = ARRAY['Dashboard & KPIs','Crew Management','Documentos','Suporte por email','Até 5 navios']
WHERE slug = 'starter';

UPDATE public.module_pricing_plans 
SET 
  price_brl = 199, 
  price_usd = 39,
  pricing_model = 'per_vessel_monthly',
  max_vessels = 20,
  description = 'Gestão completa — para frotas em crescimento',
  features = ARRAY['Tudo do Starter','PMS & Manutenção','QHSE & Compliance','Procurement','Operações & Viagens','Financeiro','Treinamento','Auditoria','Suporte prioritário','Até 20 navios'],
  is_popular = true
WHERE slug = 'professional';

UPDATE public.module_pricing_plans 
SET 
  price_brl = 399, 
  price_usd = 79,
  pricing_model = 'per_vessel_monthly',
  max_vessels = NULL,
  description = 'Solução total — para grandes armadores e petroleiras',
  features = ARRAY['Todos os módulos incluídos','IA & Analytics avançados','IoT & Telemetria','ESG & Emissões','SIRE 2.0 / OVID','Segurança avançada','API Access','Suporte 24/7','Navios ilimitados','Onboarding dedicado']
WHERE slug = 'enterprise';
