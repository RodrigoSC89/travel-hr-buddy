-- Criar tabelas para PEO-DP (Petrobras - Dynamic Positioning System Audit)

-- Tabela principal de auditorias PEO-DP
CREATE TABLE IF NOT EXISTS public.peo_dp_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id),
  audit_period TEXT NOT NULL,
  audit_date DATE NOT NULL,
  audit_type TEXT NOT NULL DEFAULT 'annual' CHECK (audit_type IN ('annual', 'intermediate', 'special')),
  status TEXT NOT NULL DEFAULT 'preparation' CHECK (status IN ('preparation', 'in_progress', 'completed', 'approved', 'rejected')),
  auditor_name TEXT NOT NULL,
  dp_class TEXT CHECK (dp_class IN ('DP1', 'DP2', 'DP3')),
  compliance_score NUMERIC CHECK (compliance_score >= 0 AND compliance_score <= 100),
  non_conformities_count INTEGER DEFAULT 0,
  critical_findings INTEGER DEFAULT 0,
  vessel_location TEXT,
  weather_conditions JSONB,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Tabela de sistemas de posicionamento dinâmico
CREATE TABLE IF NOT EXISTS public.dynamic_positioning_systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.peo_dp_audits(id) ON DELETE CASCADE,
  system_type TEXT NOT NULL CHECK (system_type IN ('main', 'backup', 'emergency')),
  manufacturer TEXT,
  model TEXT,
  software_version TEXT,
  operational_status TEXT NOT NULL CHECK (operational_status IN ('operational', 'degraded', 'failed', 'maintenance')),
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  redundancy_level TEXT CHECK (redundancy_level IN ('none', 'partial', 'full')),
  fmea_analysis JSONB,
  performance_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de propulsores (thrusters)
CREATE TABLE IF NOT EXISTS public.dp_thrusters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.peo_dp_audits(id) ON DELETE CASCADE,
  thruster_name TEXT NOT NULL,
  thruster_type TEXT NOT NULL CHECK (thruster_type IN ('main', 'bow', 'stern', 'azimuth', 'tunnel')),
  position TEXT NOT NULL,
  power_rating NUMERIC,
  operational_status TEXT NOT NULL CHECK (operational_status IN ('operational', 'degraded', 'failed')),
  response_time NUMERIC,
  efficiency_percentage NUMERIC CHECK (efficiency_percentage >= 0 AND efficiency_percentage <= 100),
  maintenance_status TEXT,
  test_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de capability plots
CREATE TABLE IF NOT EXISTS public.dp_capability_plots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.peo_dp_audits(id) ON DELETE CASCADE,
  plot_type TEXT NOT NULL CHECK (plot_type IN ('intact', 'worst_case', 'fmea')),
  wind_speed NUMERIC NOT NULL,
  current_speed NUMERIC NOT NULL,
  wave_height NUMERIC,
  heading NUMERIC CHECK (heading >= 0 AND heading < 360),
  available_thrust NUMERIC,
  plot_data JSONB NOT NULL,
  validation_status TEXT CHECK (validation_status IN ('pending', 'approved', 'rejected')),
  validated_by TEXT,
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de power management
CREATE TABLE IF NOT EXISTS public.dp_power_management (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.peo_dp_audits(id) ON DELETE CASCADE,
  generator_name TEXT NOT NULL,
  power_rating NUMERIC NOT NULL,
  operational_status TEXT NOT NULL CHECK (operational_status IN ('online', 'standby', 'offline', 'maintenance')),
  load_percentage NUMERIC CHECK (load_percentage >= 0 AND load_percentage <= 100),
  redundancy_configuration TEXT,
  blackout_prevention_systems JSONB,
  test_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de relatórios Petrobras
CREATE TABLE IF NOT EXISTS public.peo_dp_petrobras_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.peo_dp_audits(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('preliminary', 'final', 'correction', 'special')),
  report_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  generated_by UUID NOT NULL,
  file_url TEXT,
  petrobras_reference TEXT,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_peo_dp_audits_org ON public.peo_dp_audits(organization_id);
CREATE INDEX IF NOT EXISTS idx_peo_dp_audits_vessel ON public.peo_dp_audits(vessel_id);
CREATE INDEX IF NOT EXISTS idx_peo_dp_audits_status ON public.peo_dp_audits(status);
CREATE INDEX IF NOT EXISTS idx_dp_systems_audit ON public.dynamic_positioning_systems(audit_id);
CREATE INDEX IF NOT EXISTS idx_dp_thrusters_audit ON public.dp_thrusters(audit_id);
CREATE INDEX IF NOT EXISTS idx_dp_capability_audit ON public.dp_capability_plots(audit_id);
CREATE INDEX IF NOT EXISTS idx_dp_power_audit ON public.dp_power_management(audit_id);

-- Comentários nas tabelas
COMMENT ON TABLE public.peo_dp_audits IS 'Auditorias PEO-DP da Petrobras para Sistemas de Posicionamento Dinâmico';
COMMENT ON TABLE public.dynamic_positioning_systems IS 'Sistemas de posicionamento dinâmico auditados';
COMMENT ON TABLE public.dp_thrusters IS 'Propulsores do sistema DP';
COMMENT ON TABLE public.dp_capability_plots IS 'Capability plots e análise de performance DP';
COMMENT ON TABLE public.dp_power_management IS 'Gestão de energia e geradores';
COMMENT ON TABLE public.peo_dp_petrobras_reports IS 'Relatórios oficiais Petrobras';
