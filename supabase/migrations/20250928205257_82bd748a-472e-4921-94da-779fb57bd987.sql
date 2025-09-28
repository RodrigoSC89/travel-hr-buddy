-- Criar tabela para o dossiê do tripulante
CREATE TABLE public.crew_dossier (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  internal_registration TEXT NOT NULL,
  cat_number TEXT,
  cir_number TEXT,
  cir_expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para histórico de embarques
CREATE TABLE public.crew_embarkations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  vessel_name TEXT NOT NULL,
  vessel_type TEXT NOT NULL, -- PSV, AHTS, OSRV, etc
  vessel_class TEXT, -- DP1, DP2, DP3
  dp_operation_type TEXT, -- auto, manual, heading, etc
  equipment_operated TEXT[], -- Array de equipamentos
  embark_date DATE NOT NULL,
  disembark_date DATE,
  embark_location TEXT,
  disembark_location TEXT,
  hours_worked INTEGER DEFAULT 0,
  function_role TEXT NOT NULL,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para histórico de cursos e certificações
CREATE TABLE public.crew_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  certification_type TEXT NOT NULL, -- STCW, HUET, NR, TBS, interno, externo
  issue_date DATE NOT NULL,
  expiry_date DATE,
  issuing_authority TEXT NOT NULL,
  certificate_number TEXT,
  status TEXT NOT NULL DEFAULT 'valid', -- valid, expired, pending
  grade NUMERIC(3,1),
  notes TEXT,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para histórico de avaliações
CREATE TABLE public.crew_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  embarkation_id UUID REFERENCES public.crew_embarkations(id),
  evaluation_period TEXT NOT NULL,
  technical_score NUMERIC(3,1) NOT NULL,
  behavioral_score NUMERIC(3,1) NOT NULL,
  overall_score NUMERIC(3,1) NOT NULL,
  positive_feedback TEXT,
  improvement_areas TEXT,
  incidents TEXT,
  evaluator_name TEXT NOT NULL,
  evaluation_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para documentos do dossiê
CREATE TABLE public.crew_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL, -- certificate, evaluation, training, medical, etc
  file_url TEXT NOT NULL,
  file_size BIGINT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id),
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.crew_dossier ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_embarkations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para crew_dossier
CREATE POLICY "Crew can view their own dossier" ON public.crew_dossier
FOR SELECT USING (
  crew_member_id IN (
    SELECT id FROM public.crew_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "HR can view all dossiers" ON public.crew_dossier
FOR SELECT USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);

CREATE POLICY "HR can manage dossiers" ON public.crew_dossier
FOR ALL USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);

-- Políticas RLS para crew_embarkations
CREATE POLICY "Crew can view their own embarkations" ON public.crew_embarkations
FOR SELECT USING (
  crew_member_id IN (
    SELECT id FROM public.crew_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "HR can view all embarkations" ON public.crew_embarkations
FOR SELECT USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);

CREATE POLICY "HR can manage embarkations" ON public.crew_embarkations
FOR ALL USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);

-- Políticas RLS para crew_certifications
CREATE POLICY "Crew can view their own certifications" ON public.crew_certifications
FOR SELECT USING (
  crew_member_id IN (
    SELECT id FROM public.crew_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "HR can view all certifications" ON public.crew_certifications
FOR SELECT USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);

CREATE POLICY "HR can manage certifications" ON public.crew_certifications
FOR ALL USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);

-- Políticas RLS para crew_evaluations
CREATE POLICY "Crew can view their own evaluations" ON public.crew_evaluations
FOR SELECT USING (
  crew_member_id IN (
    SELECT id FROM public.crew_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "HR can view all evaluations" ON public.crew_evaluations
FOR SELECT USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);

CREATE POLICY "HR can manage evaluations" ON public.crew_evaluations
FOR ALL USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);

-- Políticas RLS para crew_documents
CREATE POLICY "Crew can view their own documents" ON public.crew_documents
FOR SELECT USING (
  crew_member_id IN (
    SELECT id FROM public.crew_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "HR can view all documents" ON public.crew_documents
FOR SELECT USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);

CREATE POLICY "HR can manage documents" ON public.crew_documents
FOR ALL USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_crew_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_crew_dossier_updated_at
  BEFORE UPDATE ON public.crew_dossier
  FOR EACH ROW EXECUTE FUNCTION update_crew_updated_at();

CREATE TRIGGER update_crew_embarkations_updated_at
  BEFORE UPDATE ON public.crew_embarkations
  FOR EACH ROW EXECUTE FUNCTION update_crew_updated_at();

CREATE TRIGGER update_crew_certifications_updated_at
  BEFORE UPDATE ON public.crew_certifications
  FOR EACH ROW EXECUTE FUNCTION update_crew_updated_at();

CREATE TRIGGER update_crew_evaluations_updated_at
  BEFORE UPDATE ON public.crew_evaluations
  FOR EACH ROW EXECUTE FUNCTION update_crew_updated_at();

-- Inserir dados de exemplo para demonstração
INSERT INTO public.crew_dossier (crew_member_id, internal_registration, cat_number, cir_number, cir_expiry_date)
SELECT 
  id,
  CONCAT('MAT-', LPAD(ROW_NUMBER() OVER (ORDER BY id)::TEXT, 6, '0')),
  CONCAT('CAT-', LPAD(ROW_NUMBER() OVER (ORDER BY id)::TEXT, 8, '0')),
  CONCAT('CIR-', LPAD(ROW_NUMBER() OVER (ORDER BY id)::TEXT, 10, '0')),
  CURRENT_DATE + INTERVAL '2 years'
FROM public.crew_members
WHERE NOT EXISTS (
  SELECT 1 FROM public.crew_dossier WHERE crew_member_id = crew_members.id
);