-- Criar tabela de templates anuais de PEOTRAM
CREATE TABLE public.peotram_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  template_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT false,
  checklist_type TEXT NOT NULL DEFAULT 'vessel', -- 'vessel' ou 'shore'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(year, checklist_type, version)
);

-- Criar tabela de não conformidades
CREATE TABLE public.peotram_non_conformities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID REFERENCES public.peotram_audits(id) ON DELETE CASCADE,
  element_number TEXT NOT NULL,
  element_name TEXT NOT NULL,
  non_conformity_type TEXT NOT NULL, -- 'major', 'minor', 'observation'
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  corrective_action TEXT,
  responsible_person TEXT,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'closed', 'verified'
  vessel_id UUID REFERENCES public.vessels(id),
  area_department TEXT,
  severity_score INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de acesso granular por funcionalidade
CREATE TABLE public.user_feature_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  feature_module TEXT NOT NULL, -- 'peotram', 'fleet', 'hr', etc
  permission_level TEXT NOT NULL DEFAULT 'read', -- 'none', 'read', 'write', 'admin'
  vessel_access TEXT[] DEFAULT '{}', -- IDs específicos de navios
  area_access TEXT[] DEFAULT '{}', -- áreas específicas
  location_type TEXT NOT NULL DEFAULT 'both', -- 'vessel', 'shore', 'both'
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, organization_id, feature_module)
);

-- Adicionar colunas à tabela peotram_audits para melhor controle
ALTER TABLE public.peotram_audits 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.peotram_templates(id),
ADD COLUMN IF NOT EXISTS audit_type TEXT NOT NULL DEFAULT 'vessel',
ADD COLUMN IF NOT EXISTS vessel_id UUID REFERENCES public.vessels(id),
ADD COLUMN IF NOT EXISTS shore_location TEXT,
ADD COLUMN IF NOT EXISTS non_conformities_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS compliance_score NUMERIC(5,2) DEFAULT 0.00;

-- Enable RLS nas novas tabelas
ALTER TABLE public.peotram_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_non_conformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feature_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para templates PEOTRAM
CREATE POLICY "Organization members can view PEOTRAM templates"
ON public.peotram_templates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_users ou
    WHERE ou.user_id = auth.uid() AND ou.status = 'active'
  )
);

CREATE POLICY "Admins can manage PEOTRAM templates"
ON public.peotram_templates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organization_users ou
    WHERE ou.user_id = auth.uid() 
    AND ou.role IN ('owner', 'admin') 
    AND ou.status = 'active'
  )
);

-- Políticas RLS para não conformidades
CREATE POLICY "Users can view non-conformities based on permissions"
ON public.peotram_non_conformities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_feature_permissions ufp
    WHERE ufp.user_id = auth.uid() 
    AND ufp.feature_module = 'peotram'
    AND ufp.permission_level IN ('read', 'write', 'admin')
    AND ufp.is_active = true
    AND (
      ufp.vessel_access = '{}' OR 
      vessel_id::text = ANY(ufp.vessel_access) OR
      vessel_id IS NULL
    )
  )
);

CREATE POLICY "Users can manage non-conformities based on permissions"
ON public.peotram_non_conformities FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_feature_permissions ufp
    WHERE ufp.user_id = auth.uid() 
    AND ufp.feature_module = 'peotram'
    AND ufp.permission_level IN ('write', 'admin')
    AND ufp.is_active = true
    AND (
      ufp.vessel_access = '{}' OR 
      vessel_id::text = ANY(ufp.vessel_access) OR
      vessel_id IS NULL
    )
  )
);

-- Políticas RLS para permissões de features
CREATE POLICY "Admins can manage feature permissions"
ON public.user_feature_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organization_users ou
    WHERE ou.user_id = auth.uid() 
    AND ou.role IN ('owner', 'admin') 
    AND ou.status = 'active'
    AND ou.organization_id = user_feature_permissions.organization_id
  )
);

CREATE POLICY "Users can view their own permissions"
ON public.user_feature_permissions FOR SELECT
USING (user_id = auth.uid());

-- Funções para controle de acesso
CREATE OR REPLACE FUNCTION public.has_feature_permission(
  feature_name TEXT, 
  required_level TEXT DEFAULT 'read',
  target_vessel_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_feature_permissions ufp
    WHERE ufp.user_id = auth.uid()
    AND ufp.feature_module = feature_name
    AND ufp.is_active = true
    AND (ufp.expires_at IS NULL OR ufp.expires_at > now())
    AND CASE required_level
      WHEN 'read' THEN ufp.permission_level IN ('read', 'write', 'admin')
      WHEN 'write' THEN ufp.permission_level IN ('write', 'admin')
      WHEN 'admin' THEN ufp.permission_level = 'admin'
      ELSE false
    END
    AND (
      target_vessel_id IS NULL OR
      ufp.vessel_access = '{}' OR
      target_vessel_id::text = ANY(ufp.vessel_access)
    )
  );
$$;

-- Trigger para atualizar contadores de não conformidades
CREATE OR REPLACE FUNCTION public.update_audit_non_conformities_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.peotram_audits 
    SET non_conformities_count = non_conformities_count + 1
    WHERE id = NEW.audit_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.peotram_audits 
    SET non_conformities_count = GREATEST(non_conformities_count - 1, 0)
    WHERE id = OLD.audit_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_non_conformities_count
  AFTER INSERT OR DELETE ON public.peotram_non_conformities
  FOR EACH ROW EXECUTE FUNCTION public.update_audit_non_conformities_count();

-- Inserir template padrão para 2024
INSERT INTO public.peotram_templates (year, checklist_type, template_data, is_active) VALUES
(2024, 'vessel', '{
  "elements": [
    {"number": "01", "name": "Política de Segurança, Qualidade e Meio Ambiente", "requirements": ["Política documentada", "Divulgação adequada", "Revisão periódica"]},
    {"number": "02", "name": "Responsabilidade e Autoridade", "requirements": ["Organograma atualizado", "Descrição de cargos", "Matriz de responsabilidades"]},
    {"number": "03", "name": "Recursos e Pessoal", "requirements": ["Qualificação adequada", "Treinamentos atualizados", "Documentação de competência"]},
    {"number": "04", "name": "Desenvolvimento de Planos", "requirements": ["Planos operacionais", "Procedimentos documentados", "Cronogramas definidos"]},
    {"number": "05", "name": "Implementação de Planos", "requirements": ["Execução conforme planejado", "Registros de atividades", "Controle de mudanças"]},
    {"number": "06", "name": "Emergências", "requirements": ["Planos de emergência", "Treinamentos regulares", "Equipamentos adequados"]},
    {"number": "07", "name": "Relatórios de Não Conformidades", "requirements": ["Sistema de registro", "Análise de causas", "Ações corretivas"]},
    {"number": "08", "name": "Análise Crítica pela Administração", "requirements": ["Reuniões periódicas", "Análise de indicadores", "Planos de melhoria"]},
    {"number": "09", "name": "Auditorias Internas", "requirements": ["Programa de auditorias", "Auditores qualificados", "Relatórios de auditoria"]},
    {"number": "10", "name": "Desenvolvimento e Manutenção", "requirements": ["Manutenção preventiva", "Registros de manutenção", "Peças e materiais"]},
    {"number": "11", "name": "Documentação", "requirements": ["Controle de documentos", "Distribuição adequada", "Revisões periódicas"]},
    {"number": "12", "name": "Registros", "requirements": ["Sistema de arquivo", "Preservação adequada", "Acesso controlado"]},
    {"number": "13", "name": "Verificação, Medição e Monitoramento", "requirements": ["Indicadores definidos", "Medições regulares", "Análise de tendências"]}
  ]
}', true),
(2024, 'shore', '{
  "elements": [
    {"number": "01", "name": "Política de Segurança, Qualidade e Meio Ambiente", "requirements": ["Política corporativa", "Comunicação interna", "Alinhamento estratégico"]},
    {"number": "02", "name": "Responsabilidade e Autoridade", "requirements": ["Estrutura organizacional", "Delegação de autoridade", "Interfaces definidas"]},
    {"number": "03", "name": "Recursos e Pessoal", "requirements": ["Dimensionamento adequado", "Desenvolvimento profissional", "Gestão de competências"]},
    {"number": "08", "name": "Análise Crítica pela Administração", "requirements": ["Governança corporativa", "Análise estratégica", "Tomada de decisão"]},
    {"number": "09", "name": "Auditorias Internas", "requirements": ["Programa corporativo", "Metodologia padronizada", "Acompanhamento sistêmico"]},
    {"number": "11", "name": "Documentação", "requirements": ["Sistema documental", "Controle de versões", "Gestão de conhecimento"]},
    {"number": "12", "name": "Registros", "requirements": ["Banco de dados central", "Backup e recuperação", "Governança de dados"]}
  ]
}', true);