-- Atualizar tabela crew_dossier para incluir campos obrigatórios
ALTER TABLE public.crew_dossier 
ADD COLUMN IF NOT EXISTS employee_registration TEXT,
ADD COLUMN IF NOT EXISTS previous_position TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Atualizar crew_embarkations para incluir campos técnicos detalhados
ALTER TABLE public.crew_embarkations
ADD COLUMN IF NOT EXISTS vessel_type TEXT,
ADD COLUMN IF NOT EXISTS dp_class TEXT,
ADD COLUMN IF NOT EXISTS dp_operation_modes TEXT[],
ADD COLUMN IF NOT EXISTS equipment_operated TEXT[],
ADD COLUMN IF NOT EXISTS embark_location_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS disembark_location_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS operation_notes TEXT,
ADD COLUMN IF NOT EXISTS performance_rating NUMERIC,
ADD COLUMN IF NOT EXISTS completed_operations INTEGER DEFAULT 0;

-- Atualizar crew_certifications para incluos campos de validade e status
ALTER TABLE public.crew_certifications
ADD COLUMN IF NOT EXISTS course_provider TEXT,
ADD COLUMN IF NOT EXISTS course_location TEXT,
ADD COLUMN IF NOT EXISTS certificate_file_url TEXT,
ADD COLUMN IF NOT EXISTS renewal_date DATE,
ADD COLUMN IF NOT EXISTS is_internal_course BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS completion_percentage NUMERIC DEFAULT 100;

-- Criar tabela para histórico de avaliações detalhadas
CREATE TABLE IF NOT EXISTS public.crew_performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  embarkation_id UUID REFERENCES public.crew_embarkations(id) ON DELETE SET NULL,
  review_period TEXT NOT NULL,
  review_date DATE NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_position TEXT,
  technical_score NUMERIC NOT NULL CHECK (technical_score >= 0 AND technical_score <= 10),
  behavioral_score NUMERIC NOT NULL CHECK (behavioral_score >= 0 AND behavioral_score <= 10),
  leadership_score NUMERIC CHECK (leadership_score >= 0 AND leadership_score <= 10),
  safety_score NUMERIC NOT NULL CHECK (safety_score >= 0 AND safety_score <= 10),
  overall_score NUMERIC NOT NULL CHECK (overall_score >= 0 AND overall_score <= 10),
  strengths TEXT,
  improvement_areas TEXT,
  positive_feedback TEXT,
  incidents TEXT,
  recommendations TEXT,
  career_progression_notes TEXT,
  next_review_date DATE,
  review_status TEXT DEFAULT 'completed' CHECK (review_status IN ('draft', 'completed', 'approved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para documentos do dossiê
CREATE TABLE IF NOT EXISTS public.crew_dossier_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  document_category TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  expiry_date DATE,
  is_confidential BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para recomendações de IA
CREATE TABLE IF NOT EXISTS public.crew_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL,
  suggested_action TEXT,
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dismissed')),
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.crew_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_dossier_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para crew_performance_reviews
CREATE POLICY "Crew can view their own performance reviews" 
ON public.crew_performance_reviews FOR SELECT
USING (crew_member_id IN (
  SELECT id FROM public.crew_members WHERE user_id = auth.uid()
));

CREATE POLICY "HR can manage all performance reviews" 
ON public.crew_performance_reviews FOR ALL
USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'hr_manager'::user_role]));

-- Políticas RLS para crew_dossier_documents
CREATE POLICY "Crew can view their own documents" 
ON public.crew_dossier_documents FOR SELECT
USING (crew_member_id IN (
  SELECT id FROM public.crew_members WHERE user_id = auth.uid()
) OR get_user_role() = ANY (ARRAY['admin'::user_role, 'hr_manager'::user_role]));

CREATE POLICY "HR can manage all dossier documents" 
ON public.crew_dossier_documents FOR ALL
USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'hr_manager'::user_role]));

CREATE POLICY "Crew can upload their own documents" 
ON public.crew_dossier_documents FOR INSERT
WITH CHECK (crew_member_id IN (
  SELECT id FROM public.crew_members WHERE user_id = auth.uid()
));

-- Políticas RLS para crew_ai_recommendations
CREATE POLICY "Crew can view their own AI recommendations" 
ON public.crew_ai_recommendations FOR SELECT
USING (crew_member_id IN (
  SELECT id FROM public.crew_members WHERE user_id = auth.uid()
));

CREATE POLICY "HR can manage all AI recommendations" 
ON public.crew_ai_recommendations FOR ALL
USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'hr_manager'::user_role]));

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_crew_performance_reviews_crew_member ON public.crew_performance_reviews(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_performance_reviews_date ON public.crew_performance_reviews(review_date);
CREATE INDEX IF NOT EXISTS idx_crew_dossier_documents_crew_member ON public.crew_dossier_documents(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_dossier_documents_category ON public.crew_dossier_documents(document_category);
CREATE INDEX IF NOT EXISTS idx_crew_ai_recommendations_crew_member ON public.crew_ai_recommendations(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_ai_recommendations_status ON public.crew_ai_recommendations(status);

-- Função para calcular score geral de performance
CREATE OR REPLACE FUNCTION public.calculate_crew_overall_performance(crew_uuid UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(AVG(overall_score), 0)
  FROM public.crew_performance_reviews 
  WHERE crew_member_id = crew_uuid 
  AND review_date >= CURRENT_DATE - INTERVAL '2 years';
$$;

-- Função para gerar recomendações automáticas de IA
CREATE OR REPLACE FUNCTION public.generate_crew_ai_recommendations(crew_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  crew_record public.crew_members%ROWTYPE;
  expired_certs_count INTEGER;
  expiring_certs_count INTEGER;
  last_embark_date DATE;
  total_sea_time_hours INTEGER;
BEGIN
  -- Buscar dados do tripulante
  SELECT * INTO crew_record FROM public.crew_members WHERE id = crew_uuid;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Contar certificações expiradas
  SELECT COUNT(*) INTO expired_certs_count
  FROM public.crew_certifications 
  WHERE crew_member_id = crew_uuid 
  AND expiry_date < CURRENT_DATE;
  
  -- Contar certificações expirando em 90 dias
  SELECT COUNT(*) INTO expiring_certs_count
  FROM public.crew_certifications 
  WHERE crew_member_id = crew_uuid 
  AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days';
  
  -- Último embarque
  SELECT MAX(embark_date) INTO last_embark_date
  FROM public.crew_embarkations 
  WHERE crew_member_id = crew_uuid;
  
  -- Total de horas embarcado
  SELECT COALESCE(SUM(hours_worked), 0) INTO total_sea_time_hours
  FROM public.crew_embarkations 
  WHERE crew_member_id = crew_uuid;
  
  -- Limpar recomendações antigas ativas
  UPDATE public.crew_ai_recommendations 
  SET status = 'dismissed' 
  WHERE crew_member_id = crew_uuid AND status = 'active';
  
  -- Gerar recomendação para certificações expiradas
  IF expired_certs_count > 0 THEN
    INSERT INTO public.crew_ai_recommendations (
      crew_member_id, recommendation_type, title, description, priority, category, suggested_action
    ) VALUES (
      crew_uuid,
      'certification_renewal',
      'Certificações Expiradas',
      'Você possui ' || expired_certs_count || ' certificação(ões) expirada(s) que necessitam renovação.',
      'urgent',
      'compliance',
      'Renovar certificações expiradas imediatamente para manter status operacional'
    );
  END IF;
  
  -- Gerar recomendação para certificações expirando
  IF expiring_certs_count > 0 THEN
    INSERT INTO public.crew_ai_recommendations (
      crew_member_id, recommendation_type, title, description, priority, category, suggested_action, deadline
    ) VALUES (
      crew_uuid,
      'certification_renewal',
      'Certificações Expirando',
      'Você possui ' || expiring_certs_count || ' certificação(ões) expirando nos próximos 90 dias.',
      'high',
      'compliance',
      'Programar renovação das certificações antes do vencimento',
      CURRENT_DATE + INTERVAL '30 days'
    );
  END IF;
  
  -- Recomendação baseada em tempo sem embarcar
  IF last_embark_date IS NOT NULL AND last_embark_date < CURRENT_DATE - INTERVAL '6 months' THEN
    INSERT INTO public.crew_ai_recommendations (
      crew_member_id, recommendation_type, title, description, priority, category, suggested_action
    ) VALUES (
      crew_uuid,
      'career_development',
      'Tempo Prolongado em Terra',
      'Você está há mais de 6 meses sem embarcar. Considere atualizar suas competências.',
      'medium',
      'career',
      'Participar de cursos de atualização ou treinamentos práticos'
    );
  END IF;
  
  -- Recomendação para progressão de carreira
  IF total_sea_time_hours > 8760 AND crew_record.position = 'Marinheiro' THEN -- 1 ano
    INSERT INTO public.crew_ai_recommendations (
      crew_member_id, recommendation_type, title, description, priority, category, suggested_action
    ) VALUES (
      crew_uuid,
      'career_advancement',
      'Oportunidade de Progressão',
      'Com mais de 1 ano de experiência embarcada, você pode estar qualificado para promoção.',
      'medium',
      'career',
      'Discutir oportunidades de progressão com RH e considerar cursos de liderança'
    );
  END IF;
  
END;
$$;