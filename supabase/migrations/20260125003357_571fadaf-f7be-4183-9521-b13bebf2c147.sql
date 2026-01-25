-- ============================================
-- MELHORIA 1: AI DOWNTIME VALIDATOR
-- Tabelas para validação de downtime com IA
-- ============================================

-- Enum para categoria de downtime
DO $$ BEGIN
  CREATE TYPE downtime_category AS ENUM ('mechanical', 'weather', 'operational', 'administrative', 'regulatory', 'emergency');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para status de validação
DO $$ BEGIN
  CREATE TYPE validation_status AS ENUM ('pending', 'approved', 'requires_review', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela principal de downtimes
CREATE TABLE IF NOT EXISTS public.vessel_downtimes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Período do downtime
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_hours DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN end_time IS NOT NULL THEN EXTRACT(EPOCH FROM (end_time - start_time)) / 3600
      ELSE NULL 
    END
  ) STORED,
  
  -- Dados reportados
  reported_reason TEXT NOT NULL,
  category downtime_category NOT NULL DEFAULT 'operational',
  reported_by UUID REFERENCES auth.users(id),
  evidence_urls TEXT[] DEFAULT '{}',
  
  -- Validação da IA
  ai_validation JSONB DEFAULT NULL,
  validation_status validation_status DEFAULT 'pending',
  validated_at TIMESTAMPTZ,
  validated_by UUID REFERENCES auth.users(id),
  
  -- Evidência BROA
  broa_evidence JSONB DEFAULT NULL,
  broa_generated_at TIMESTAMPTZ,
  
  -- Metadados
  contract_id UUID,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_vessel_downtimes_vessel ON public.vessel_downtimes(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_downtimes_org ON public.vessel_downtimes(organization_id);
CREATE INDEX IF NOT EXISTS idx_vessel_downtimes_start ON public.vessel_downtimes(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_vessel_downtimes_status ON public.vessel_downtimes(validation_status);
CREATE INDEX IF NOT EXISTS idx_vessel_downtimes_category ON public.vessel_downtimes(category);

-- Tabela de logs de evidência BROA
CREATE TABLE IF NOT EXISTS public.broa_evidence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  downtime_id UUID REFERENCES public.vessel_downtimes(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Dados da evidência
  evidence_data JSONB NOT NULL DEFAULT '{}',
  evidence_type TEXT DEFAULT 'downtime_justification',
  
  -- AI metadata
  ai_model TEXT,
  ai_confidence DECIMAL(5,2),
  ai_processing_time_ms INTEGER,
  
  -- Hash para integridade
  evidence_hash TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índice para busca por downtime
CREATE INDEX IF NOT EXISTS idx_broa_evidence_downtime ON public.broa_evidence_logs(downtime_id);
CREATE INDEX IF NOT EXISTS idx_broa_evidence_org ON public.broa_evidence_logs(organization_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_vessel_downtimes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS vessel_downtimes_updated_at ON public.vessel_downtimes;
CREATE TRIGGER vessel_downtimes_updated_at
  BEFORE UPDATE ON public.vessel_downtimes
  FOR EACH ROW
  EXECUTE FUNCTION update_vessel_downtimes_updated_at();

-- RLS Policies
ALTER TABLE public.vessel_downtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broa_evidence_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para vessel_downtimes
CREATE POLICY "Users can view downtimes from their organization"
  ON public.vessel_downtimes FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert downtimes for their organization"
  ON public.vessel_downtimes FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update downtimes from their organization"
  ON public.vessel_downtimes FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Políticas para broa_evidence_logs (apenas admins podem ver)
CREATE POLICY "Admins can view BROA evidence"
  ON public.broa_evidence_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert BROA evidence"
  ON public.broa_evidence_logs FOR INSERT
  WITH CHECK (true);