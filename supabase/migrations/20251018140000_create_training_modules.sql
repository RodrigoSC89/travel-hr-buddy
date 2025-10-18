-- ===========================
-- TRAINING MODULES - Micro Treinamento
-- Sistema de capacitação baseado em falhas detectadas em auditorias
-- ===========================

-- Create training_modules table
CREATE TABLE IF NOT EXISTS public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  gap_detected TEXT NOT NULL,
  norm_reference TEXT NOT NULL,
  training_content TEXT NOT NULL,
  quiz JSONB DEFAULT '[]', -- Array de perguntas no formato: {"question": "...", "options": ["A", "B", "C"], "correct_answer": 1}
  vessel_id UUID,
  audit_id UUID REFERENCES public.auditorias_imca(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create training_completions table to track who completed training per vessel
CREATE TABLE IF NOT EXISTS public.training_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vessel_id UUID,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  quiz_score INTEGER CHECK (quiz_score >= 0 AND quiz_score <= 100),
  quiz_answers JSONB DEFAULT '[]',
  passed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(training_module_id, user_id, vessel_id)
);

-- Enable Row Level Security
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_completions ENABLE ROW LEVEL SECURITY;

-- Políticas para training_modules
CREATE POLICY "Usuários autenticados podem ver módulos ativos" 
  ON public.training_modules
  FOR SELECT 
  USING (auth.uid() IS NOT NULL AND status = 'active');

CREATE POLICY "Admins podem gerenciar módulos de treinamento" 
  ON public.training_modules
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Políticas para training_completions
CREATE POLICY "Usuários podem ver seus próprios completamentos" 
  ON public.training_completions
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem registrar seus completamentos" 
  ON public.training_completions
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos completamentos" 
  ON public.training_completions
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_training_modules_vessel_id ON public.training_modules(vessel_id);
CREATE INDEX IF NOT EXISTS idx_training_modules_audit_id ON public.training_modules(audit_id);
CREATE INDEX IF NOT EXISTS idx_training_modules_status ON public.training_modules(status);
CREATE INDEX IF NOT EXISTS idx_training_modules_created_at ON public.training_modules(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_training_completions_module_id ON public.training_completions(training_module_id);
CREATE INDEX IF NOT EXISTS idx_training_completions_user_id ON public.training_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_completions_vessel_id ON public.training_completions(vessel_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_training_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_training_modules_updated_at
  BEFORE UPDATE ON public.training_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_training_modules_updated_at();

-- Add table comments
COMMENT ON TABLE public.training_modules IS 'Módulos de micro treinamento gerados a partir de falhas detectadas em auditorias';
COMMENT ON COLUMN public.training_modules.title IS 'Título do módulo de treinamento';
COMMENT ON COLUMN public.training_modules.gap_detected IS 'Descrição da falha/gap detectada';
COMMENT ON COLUMN public.training_modules.norm_reference IS 'Referência à norma (ex: IMCA M220 4.3.1)';
COMMENT ON COLUMN public.training_modules.training_content IS 'Conteúdo do treinamento (markdown/text)';
COMMENT ON COLUMN public.training_modules.quiz IS 'Questionário de validação em formato JSON';
COMMENT ON COLUMN public.training_modules.vessel_id IS 'ID da embarcação relacionada (opcional)';
COMMENT ON COLUMN public.training_modules.audit_id IS 'ID da auditoria que originou o treinamento';
COMMENT ON COLUMN public.training_modules.status IS 'Status do módulo: active, archived, draft';

COMMENT ON TABLE public.training_completions IS 'Histórico de completamento de treinamentos por usuário e embarcação';
COMMENT ON COLUMN public.training_completions.training_module_id IS 'ID do módulo de treinamento';
COMMENT ON COLUMN public.training_completions.user_id IS 'ID do usuário que completou';
COMMENT ON COLUMN public.training_completions.vessel_id IS 'ID da embarcação onde o treinamento foi realizado';
COMMENT ON COLUMN public.training_completions.quiz_score IS 'Pontuação obtida no questionário (0-100)';
COMMENT ON COLUMN public.training_completions.passed IS 'Se o usuário passou no treinamento';
