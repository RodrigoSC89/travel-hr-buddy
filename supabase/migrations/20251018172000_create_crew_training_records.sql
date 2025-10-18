-- ===========================
-- CREW TRAINING RECORDS (Stage 31)
-- Sistema de rastreamento de treinamento e certificações da tripulação
-- ===========================

-- Create crew_training_records table
CREATE TABLE IF NOT EXISTS public.crew_training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL,
  training_module_id UUID REFERENCES public.training_modules(id) ON DELETE SET NULL,
  date_completed DATE NOT NULL,
  result TEXT,
  cert_url TEXT, -- URL do certificado PDF
  valid_until DATE,
  category TEXT CHECK (category IN (
    'DP Operations',
    'Emergency Response', 
    'Fire Fighting',
    'Blackout Recovery',
    'MOB Response',
    'SGSO Compliance',
    'Technical'
  )),
  incident_id UUID, -- Link to technical failure that motivated training
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.crew_training_records ENABLE ROW LEVEL SECURITY;

-- Policies for crew_training_records
CREATE POLICY "Admins e hr_managers podem gerenciar registros de treinamento" 
  ON public.crew_training_records
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'hr_manager', 'training_coordinator')
    )
  );

CREATE POLICY "Usuários podem ver seus próprios treinamentos" 
  ON public.crew_training_records
  FOR SELECT 
  USING (auth.uid() = crew_id OR auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crew_training_records_crew_id ON public.crew_training_records(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_training_records_training_module_id ON public.crew_training_records(training_module_id);
CREATE INDEX IF NOT EXISTS idx_crew_training_records_category ON public.crew_training_records(category);
CREATE INDEX IF NOT EXISTS idx_crew_training_records_valid_until ON public.crew_training_records(valid_until);
CREATE INDEX IF NOT EXISTS idx_crew_training_records_incident_id ON public.crew_training_records(incident_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_crew_training_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crew_training_records_updated_at
  BEFORE UPDATE ON public.crew_training_records
  FOR EACH ROW
  EXECUTE FUNCTION update_crew_training_records_updated_at();

-- Function to automatically calculate valid_until based on training module
CREATE OR REPLACE FUNCTION calculate_training_validity()
RETURNS TRIGGER AS $$
DECLARE
  module_expiration_months INTEGER;
BEGIN
  -- Get expiration period from training module (if exists)
  IF NEW.training_module_id IS NOT NULL THEN
    SELECT 12 INTO module_expiration_months; -- Default 12 months
    
    -- Calculate valid_until if not already set
    IF NEW.valid_until IS NULL AND NEW.date_completed IS NOT NULL THEN
      NEW.valid_until = NEW.date_completed + (module_expiration_months || ' months')::INTERVAL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_training_validity_trigger
  BEFORE INSERT OR UPDATE ON public.crew_training_records
  FOR EACH ROW
  EXECUTE FUNCTION calculate_training_validity();

-- Function to get expired training records
CREATE OR REPLACE FUNCTION get_expired_training_records(crew_filter UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  crew_id UUID,
  training_module_id UUID,
  category TEXT,
  valid_until DATE,
  days_expired INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ctr.id,
    ctr.crew_id,
    ctr.training_module_id,
    ctr.category,
    ctr.valid_until,
    (CURRENT_DATE - ctr.valid_until)::INTEGER as days_expired
  FROM public.crew_training_records ctr
  WHERE ctr.valid_until IS NOT NULL
    AND ctr.valid_until < CURRENT_DATE
    AND (crew_filter IS NULL OR ctr.crew_id = crew_filter)
  ORDER BY ctr.valid_until ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get upcoming training expirations
CREATE OR REPLACE FUNCTION get_upcoming_training_expirations(days_ahead INTEGER DEFAULT 30, crew_filter UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  crew_id UUID,
  training_module_id UUID,
  category TEXT,
  valid_until DATE,
  days_until_expiration INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ctr.id,
    ctr.crew_id,
    ctr.training_module_id,
    ctr.category,
    ctr.valid_until,
    (ctr.valid_until - CURRENT_DATE)::INTEGER as days_until_expiration
  FROM public.crew_training_records ctr
  WHERE ctr.valid_until IS NOT NULL
    AND ctr.valid_until >= CURRENT_DATE
    AND ctr.valid_until <= CURRENT_DATE + (days_ahead || ' days')::INTERVAL
    AND (crew_filter IS NULL OR ctr.crew_id = crew_filter)
  ORDER BY ctr.valid_until ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get crew training statistics
CREATE OR REPLACE FUNCTION get_crew_training_stats(crew_filter UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_trainings', COUNT(*),
    'active_certifications', COUNT(*) FILTER (WHERE valid_until IS NOT NULL AND valid_until >= CURRENT_DATE),
    'expired_certifications', COUNT(*) FILTER (WHERE valid_until IS NOT NULL AND valid_until < CURRENT_DATE),
    'upcoming_expirations', COUNT(*) FILTER (
      WHERE valid_until IS NOT NULL 
        AND valid_until >= CURRENT_DATE 
        AND valid_until <= CURRENT_DATE + INTERVAL '30 days'
    ),
    'compliance_rate', ROUND(
      (COUNT(*) FILTER (WHERE valid_until IS NULL OR valid_until >= CURRENT_DATE)::NUMERIC / 
       NULLIF(COUNT(*), 0)) * 100, 2
    )
  ) INTO result
  FROM public.crew_training_records
  WHERE crew_filter IS NULL OR crew_id = crew_filter;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add columns to training_modules table for enhanced functionality
ALTER TABLE public.training_modules
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN (
  'DP Operations',
  'Emergency Response', 
  'Fire Fighting',
  'Blackout Recovery',
  'MOB Response',
  'SGSO Compliance',
  'Technical'
)),
ADD COLUMN IF NOT EXISTS duration_hours INTEGER,
ADD COLUMN IF NOT EXISTS expiration_months INTEGER DEFAULT 12;

-- Insert sample training modules with categories
INSERT INTO public.training_modules (title, gap_detected, norm_reference, training_content, quiz, status, category, duration_hours, expiration_months) VALUES
  (
    'DP Operations - Basic Training',
    'Falta de conhecimento operacional básico em sistemas DP',
    'IMCA M220 Section 4.3',
    'Treinamento básico sobre operações de Dynamic Positioning incluindo modos operacionais, monitoramento de sistemas e procedimentos de emergência.',
    '[{"question": "Qual modo DP oferece maior redundância?", "options": ["DP1", "DP2", "DP3"], "correct_answer": 2}]'::jsonb,
    'active',
    'DP Operations',
    8,
    12
  ),
  (
    'Emergency Response - Fire Fighting',
    'Procedimentos inadequados de combate a incêndio',
    'ISM Code Chapter 8',
    'Treinamento sobre procedimentos de combate a incêndio embarcado, uso de EPIs e protocolos de evacuação.',
    '[{"question": "Qual o primeiro passo ao detectar um incêndio?", "options": ["Combater", "Alarmar", "Evacuar"], "correct_answer": 1}]'::jsonb,
    'active',
    'Fire Fighting',
    16,
    12
  ),
  (
    'Blackout Recovery Procedures',
    'Recuperação inadequada após blackout',
    'MTS DP Guidelines',
    'Procedimentos detalhados para recuperação de sistemas após blackout total, incluindo sequência de restauração e verificações de segurança.',
    '[{"question": "Qual sistema deve ser restaurado primeiro?", "options": ["Propulsão", "Energia", "Comunicação"], "correct_answer": 1}]'::jsonb,
    'active',
    'Blackout Recovery',
    4,
    12
  )
ON CONFLICT DO NOTHING;

-- Add table comments
COMMENT ON TABLE public.crew_training_records IS 'Registro de treinamentos e certificações da tripulação';
COMMENT ON COLUMN public.crew_training_records.crew_id IS 'ID do membro da tripulação';
COMMENT ON COLUMN public.crew_training_records.cert_url IS 'URL do certificado PDF gerado';
COMMENT ON COLUMN public.crew_training_records.valid_until IS 'Data de validade do certificado/treinamento';
COMMENT ON COLUMN public.crew_training_records.incident_id IS 'ID da falha técnica que motivou o treinamento';
