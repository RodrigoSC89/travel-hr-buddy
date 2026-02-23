
-- =====================================================
-- 1. Criar tabela user_module_access (controle granular)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_module_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.system_modules(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE public.user_module_access ENABLE ROW LEVEL SECURITY;

-- Admins podem ver/gerenciar todo acesso
CREATE POLICY "Admins manage all module access"
  ON public.user_module_access FOR ALL
  USING (public.is_admin_or_hr(auth.uid()));

-- Usuários podem ver seu próprio acesso
CREATE POLICY "Users view own module access"
  ON public.user_module_access FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE TRIGGER update_user_module_access_updated_at
  BEFORE UPDATE ON public.user_module_access
  FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();

-- =====================================================
-- 2. Criar tabela module_access_requests (solicitações)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.module_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.system_modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.module_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all requests"
  ON public.module_access_requests FOR ALL
  USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "Users manage own requests"
  ON public.module_access_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own requests"
  ON public.module_access_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_module_access_requests_updated_at
  BEFORE UPDATE ON public.module_access_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();

-- =====================================================
-- 3. Popular system_modules com os módulos do sistema
-- =====================================================
INSERT INTO public.system_modules (name, slug, description, icon, category, is_core, is_active, price_addon_brl, price_addon_usd, sort_order) VALUES
  ('Dashboard', 'dashboard', 'Painel principal e KPIs', 'LayoutDashboard', 'core', true, true, 0, 0, 1),
  ('Embarcações', 'vessels', 'Gestão de frota e embarcações', 'Ship', 'operations', true, true, 0, 0, 2),
  ('Tripulação', 'crew', 'Gestão de tripulantes e escalas', 'Users', 'hr', true, true, 0, 0, 3),
  ('Documentos', 'documents', 'Gestão documental e certificados', 'FileText', 'compliance', true, true, 0, 0, 4),
  ('Compliance', 'compliance', 'MLC, STCW, ISM, MARPOL', 'ShieldCheck', 'compliance', false, true, 890, 179, 5),
  ('Manutenção (PMS)', 'maintenance', 'Sistema de manutenção planejada', 'Wrench', 'technical', false, true, 1290, 259, 6),
  ('Financeiro', 'finance', 'Faturamento, despesas e payroll', 'DollarSign', 'finance', false, true, 990, 199, 7),
  ('Viagens', 'voyages', 'Planejamento e controle de viagens', 'Navigation', 'operations', false, true, 790, 159, 8),
  ('Procurement', 'procurement', 'Compras e gestão de fornecedores', 'ShoppingCart', 'finance', false, true, 690, 139, 9),
  ('Auditoria', 'audits', 'Auditorias internas e externas', 'ClipboardCheck', 'compliance', false, true, 590, 119, 10),
  ('Treinamento', 'training', 'Academia e certificações', 'GraduationCap', 'hr', false, true, 490, 99, 11),
  ('IA & Analytics', 'ai-analytics', 'Insights preditivos e IA', 'Brain', 'intelligence', false, true, 1490, 299, 12),
  ('SGSO/ISM', 'sgso', 'Sistema de gestão de segurança', 'Shield', 'compliance', false, true, 890, 179, 13),
  ('Telemetria & IoT', 'telemetry', 'Sensores e monitoramento', 'Activity', 'technical', false, true, 1190, 239, 14),
  ('Comunicações', 'communications', 'Chat, canais e WhatsApp', 'MessageSquare', 'core', false, true, 390, 79, 15),
  ('Medical', 'medical', 'Saúde e registros médicos', 'Heart', 'hr', false, true, 590, 119, 16),
  ('SIRE 2.0 / OVID', 'inspections', 'Inspeções e vetting', 'Search', 'compliance', false, true, 990, 199, 17),
  ('ESG & Emissões', 'esg', 'CII, EEXI, EU-ETS tracking', 'Leaf', 'compliance', false, true, 790, 159, 18),
  ('Relatórios', 'reports', 'Relatórios gerenciais e export', 'BarChart3', 'intelligence', false, true, 490, 99, 19),
  ('Gamificação', 'gamification', 'Engajamento e conquistas', 'Trophy', 'hr', false, true, 290, 59, 20)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  is_core = EXCLUDED.is_core,
  price_addon_brl = EXCLUDED.price_addon_brl,
  price_addon_usd = EXCLUDED.price_addon_usd,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- =====================================================
-- 4. Promover rodrigo para admin
-- =====================================================
UPDATE public.user_roles 
SET role = 'admin', updated_at = now()
WHERE user_id = '02c06ec0-4745-40c0-a374-d28e11b4754e';

-- =====================================================
-- 5. Função para verificar acesso a módulo por usuário
-- =====================================================
CREATE OR REPLACE FUNCTION public.user_has_module_access(_user_id UUID, _module_slug TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Admins têm acesso total
  IF public.is_admin_or_hr(_user_id) THEN
    RETURN TRUE;
  END IF;
  
  -- Módulos core são acessíveis a todos autenticados
  IF EXISTS (
    SELECT 1 FROM public.system_modules
    WHERE slug = _module_slug AND is_core = true AND is_active = true
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar acesso específico concedido
  RETURN EXISTS (
    SELECT 1 FROM public.user_module_access uma
    JOIN public.system_modules sm ON sm.id = uma.module_id
    WHERE uma.user_id = _user_id
    AND sm.slug = _module_slug
    AND uma.is_active = true
    AND sm.is_active = true
    AND (uma.expires_at IS NULL OR uma.expires_at > now())
  );
END;
$$;

-- =====================================================
-- 6. Função para listar módulos acessíveis do usuário
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_accessible_modules(_user_id UUID)
RETURNS TABLE(module_id UUID, slug TEXT, name TEXT, category TEXT, is_core BOOLEAN, granted_at TIMESTAMPTZ)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Admin: retorna todos os módulos ativos
  IF public.is_admin_or_hr(_user_id) THEN
    RETURN QUERY
    SELECT sm.id, sm.slug, sm.name, sm.category, sm.is_core, now() AS granted_at
    FROM public.system_modules sm
    WHERE sm.is_active = true
    ORDER BY sm.sort_order;
    RETURN;
  END IF;
  
  -- Usuário normal: core + módulos concedidos
  RETURN QUERY
  SELECT sm.id, sm.slug, sm.name, sm.category, sm.is_core, 
    COALESCE(uma.granted_at, sm.created_at) AS granted_at
  FROM public.system_modules sm
  LEFT JOIN public.user_module_access uma 
    ON uma.module_id = sm.id AND uma.user_id = _user_id AND uma.is_active = true
  WHERE sm.is_active = true
    AND (sm.is_core = true OR uma.id IS NOT NULL)
  ORDER BY sm.sort_order;
END;
$$;
