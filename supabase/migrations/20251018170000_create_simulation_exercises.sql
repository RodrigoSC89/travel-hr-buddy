-- ===========================
-- SIMULATION EXERCISES (Stage 29)
-- Sistema de controle de simulações embarcadas
-- ===========================

-- Create simulation_exercises table
CREATE TABLE IF NOT EXISTS public.simulation_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID,
  type TEXT NOT NULL CHECK (type IN ('DP', 'Blackout', 'Abandono', 'Incêndio', 'Man Overboard', 'Spill')),
  normative_reference TEXT NOT NULL, -- IMCA M220, IBAMA SGSO, MTS Guidelines, etc
  frequency_days INTEGER NOT NULL CHECK (frequency_days > 0), -- 30, 90, 180
  last_simulation DATE,
  next_due DATE,
  crew_participants TEXT[] DEFAULT '{}',
  notes TEXT,
  attachments TEXT[] DEFAULT '{}', -- URLs to Supabase Storage
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'overdue', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.simulation_exercises ENABLE ROW LEVEL SECURITY;

-- Policies for simulation_exercises
CREATE POLICY "Admins e safety officers podem gerenciar simulações" 
  ON public.simulation_exercises
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'hr_manager', 'safety_officer')
    )
  );

CREATE POLICY "Usuários autenticados podem ver simulações" 
  ON public.simulation_exercises
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_simulation_exercises_vessel_id ON public.simulation_exercises(vessel_id);
CREATE INDEX IF NOT EXISTS idx_simulation_exercises_type ON public.simulation_exercises(type);
CREATE INDEX IF NOT EXISTS idx_simulation_exercises_status ON public.simulation_exercises(status);
CREATE INDEX IF NOT EXISTS idx_simulation_exercises_next_due ON public.simulation_exercises(next_due);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_simulation_exercises_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_simulation_exercises_updated_at
  BEFORE UPDATE ON public.simulation_exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_simulation_exercises_updated_at();

-- Function to automatically calculate next_due date
CREATE OR REPLACE FUNCTION calculate_simulation_next_due()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_simulation IS NOT NULL AND NEW.frequency_days IS NOT NULL THEN
    NEW.next_due = NEW.last_simulation + (NEW.frequency_days || ' days')::INTERVAL;
  END IF;
  
  -- Update status based on dates
  IF NEW.next_due IS NOT NULL THEN
    IF NEW.next_due < CURRENT_DATE THEN
      NEW.status = 'overdue';
    ELSIF NEW.last_simulation IS NOT NULL THEN
      NEW.status = 'completed';
    ELSE
      NEW.status = 'scheduled';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_simulation_next_due_trigger
  BEFORE INSERT OR UPDATE ON public.simulation_exercises
  FOR EACH ROW
  EXECUTE FUNCTION calculate_simulation_next_due();

-- Function to get overdue simulations
CREATE OR REPLACE FUNCTION get_overdue_simulations(vessel_filter UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  vessel_id UUID,
  type TEXT,
  normative_reference TEXT,
  next_due DATE,
  days_overdue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    se.id,
    se.vessel_id,
    se.type,
    se.normative_reference,
    se.next_due,
    (CURRENT_DATE - se.next_due)::INTEGER as days_overdue
  FROM public.simulation_exercises se
  WHERE se.status = 'overdue'
    AND (vessel_filter IS NULL OR se.vessel_id = vessel_filter)
  ORDER BY se.next_due ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get simulation statistics
CREATE OR REPLACE FUNCTION get_simulation_stats(vessel_filter UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'overdue', COUNT(*) FILTER (WHERE status = 'overdue'),
    'upcoming', COUNT(*) FILTER (WHERE status = 'scheduled' AND next_due IS NOT NULL AND next_due > CURRENT_DATE),
    'completion_rate', ROUND(
      (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
    )
  ) INTO result
  FROM public.simulation_exercises
  WHERE vessel_filter IS NULL OR vessel_id = vessel_filter;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add table comments
COMMENT ON TABLE public.simulation_exercises IS 'Controle de simulações embarcadas obrigatórias (IMCA, MTS, IBAMA)';
COMMENT ON COLUMN public.simulation_exercises.type IS 'Tipo de simulação: DP, Blackout, Abandono, Incêndio, Man Overboard, Spill';
COMMENT ON COLUMN public.simulation_exercises.normative_reference IS 'Referência normativa (ex: IMCA M220, IBAMA SGSO)';
COMMENT ON COLUMN public.simulation_exercises.frequency_days IS 'Frequência exigida em dias (30, 90, 180)';
COMMENT ON COLUMN public.simulation_exercises.crew_participants IS 'IDs ou nomes dos tripulantes participantes';
COMMENT ON COLUMN public.simulation_exercises.attachments IS 'URLs de evidências (vídeos, checklists, imagens)';
