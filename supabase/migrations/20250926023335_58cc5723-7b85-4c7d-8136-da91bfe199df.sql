-- Criação das tabelas restantes para o Sistema Marítimo

-- Tabela de Portos
CREATE TABLE public.ports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  country TEXT NOT NULL,
  coordinates POINT,
  timezone TEXT,
  facilities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Tripulantes
CREATE TABLE public.crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  rank TEXT,
  nationality TEXT NOT NULL,
  passport_number TEXT,
  phone TEXT,
  email TEXT,
  emergency_contact JSONB,
  status TEXT DEFAULT 'available' CHECK (status IN ('active', 'shore_leave', 'training', 'medical', 'unavailable')),
  experience_years INTEGER DEFAULT 0,
  contract_start DATE,
  contract_end DATE,
  vessel_id UUID REFERENCES public.vessels(id),
  join_date DATE,
  leave_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Designações de Tripulação
CREATE TABLE public.crew_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Rotas
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  origin_port_id UUID REFERENCES public.ports(id),
  destination_port_id UUID REFERENCES public.ports(id),
  distance_nautical_miles NUMERIC,
  estimated_duration_hours INTEGER,
  route_points JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Viagens
CREATE TABLE public.voyages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  route_id UUID REFERENCES public.routes(id),
  voyage_number TEXT UNIQUE NOT NULL,
  planned_departure TIMESTAMP WITH TIME ZONE,
  actual_departure TIMESTAMP WITH TIME ZONE,
  planned_arrival TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'delayed')),
  cargo_manifest JSONB,
  fuel_consumption NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Rastreamento de Embarcações
CREATE TABLE public.vessel_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  speed_knots NUMERIC,
  heading NUMERIC,
  fuel_level NUMERIC,
  engine_status TEXT,
  weather_conditions JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Cronograma de Manutenção
CREATE TABLE public.maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue')),
  cost NUMERIC,
  vendor TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Tipos de Certificação Marítima
CREATE TABLE public.maritime_certification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('STCW', 'Flag_State', 'IMO', 'Company', 'Medical')),
  validity_period_months INTEGER NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  description TEXT,
  issuing_authorities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Requisitos de Certificação por Posição
CREATE TABLE public.certification_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position TEXT NOT NULL,
  certification_type_id UUID REFERENCES public.maritime_certification_types(id),
  is_mandatory BOOLEAN DEFAULT true,
  experience_required_months INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Certificações Marítimas
CREATE TABLE public.maritime_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  certification_type_id UUID REFERENCES public.maritime_certification_types(id),
  certificate_number TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  issuing_authority TEXT NOT NULL,
  issuing_country TEXT,
  status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'expiring', 'expired', 'suspended', 'cancelled')),
  document_url TEXT,
  renewal_cost NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voyages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maritime_certification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maritime_certificates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para acesso dos usuários

-- Portos - todos podem visualizar
CREATE POLICY "Everyone can view ports" ON public.ports FOR SELECT USING (true);
CREATE POLICY "Maritime managers can manage ports" ON public.ports FOR ALL USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);

-- Tripulantes - acesso baseado em função
CREATE POLICY "HR can manage all crew members" ON public.crew_members FOR ALL USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);
CREATE POLICY "Users can view crew members" ON public.crew_members FOR SELECT USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role]) OR 
  user_id = auth.uid()
);

-- Designações de tripulação
CREATE POLICY "Maritime managers can manage crew assignments" ON public.crew_assignments FOR ALL USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);
CREATE POLICY "Crew can view their assignments" ON public.crew_assignments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.crew_members cm 
    WHERE cm.id = crew_assignments.crew_member_id 
    AND (cm.user_id = auth.uid() OR get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role]))
  )
);

-- Rotas - todos autenticados podem visualizar
CREATE POLICY "Authenticated users can view routes" ON public.routes FOR SELECT 
USING (auth.role() = 'authenticated');
CREATE POLICY "Maritime managers can manage routes" ON public.routes FOR ALL USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);

-- Viagens - todos autenticados podem visualizar
CREATE POLICY "Authenticated users can view voyages" ON public.voyages FOR SELECT 
USING (auth.role() = 'authenticated');
CREATE POLICY "Maritime managers can manage voyages" ON public.voyages FOR ALL USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);

-- Rastreamento de embarcações
CREATE POLICY "Maritime personnel can view vessel tracking" ON public.vessel_tracking FOR SELECT USING (
  auth.role() = 'authenticated'
);
CREATE POLICY "System can insert vessel tracking" ON public.vessel_tracking FOR INSERT WITH CHECK (true);

-- Cronograma de manutenção
CREATE POLICY "Maritime managers can manage maintenance schedules" ON public.maintenance_schedules FOR ALL USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);
CREATE POLICY "Users can view maintenance schedules" ON public.maintenance_schedules FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Tipos de certificação marítima - todos podem visualizar
CREATE POLICY "Everyone can view certification types" ON public.maritime_certification_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage certification types" ON public.maritime_certification_types FOR ALL USING (
  get_user_role() = 'admin'::user_role
);

-- Requisitos de certificação - todos podem visualizar
CREATE POLICY "Everyone can view certification requirements" ON public.certification_requirements FOR SELECT USING (true);
CREATE POLICY "Admins can manage certification requirements" ON public.certification_requirements FOR ALL USING (
  get_user_role() = 'admin'::user_role
);

-- Certificações marítimas
CREATE POLICY "HR can manage all maritime certificates" ON public.maritime_certificates FOR ALL USING (
  get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role])
);
CREATE POLICY "Crew can view their certificates" ON public.maritime_certificates FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.crew_members cm 
    WHERE cm.id = maritime_certificates.crew_member_id 
    AND (cm.user_id = auth.uid() OR get_user_role() = ANY(ARRAY['admin'::user_role, 'hr_manager'::user_role]))
  )
);

-- Triggers para updated_at
CREATE TRIGGER update_ports_updated_at BEFORE UPDATE ON public.ports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crew_members_updated_at BEFORE UPDATE ON public.crew_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crew_assignments_updated_at BEFORE UPDATE ON public.crew_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voyages_updated_at BEFORE UPDATE ON public.voyages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_schedules_updated_at BEFORE UPDATE ON public.maintenance_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maritime_certification_types_updated_at BEFORE UPDATE ON public.maritime_certification_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certification_requirements_updated_at BEFORE UPDATE ON public.certification_requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maritime_certificates_updated_at BEFORE UPDATE ON public.maritime_certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais

-- Inserir portos principais do Brasil
INSERT INTO public.ports (name, code, country, timezone, facilities) VALUES
('Porto de Santos', 'BRSTS', 'Brasil', 'America/Sao_Paulo', ARRAY['container', 'bulk', 'oil', 'cruise']),
('Porto do Rio de Janeiro', 'BRRIO', 'Brasil', 'America/Sao_Paulo', ARRAY['container', 'cruise', 'naval']),
('Porto de Paranaguá', 'BRPNG', 'Brasil', 'America/Sao_Paulo', ARRAY['bulk', 'container', 'grain']),
('Porto do Recife', 'BRREC', 'Brasil', 'America/Recife', ARRAY['container', 'cruise', 'fuel']),
('Porto de Salvador', 'BRSAL', 'Brasil', 'America/Bahia', ARRAY['container', 'oil', 'cruise']);

-- Inserir tipos de certificação marítima
INSERT INTO public.maritime_certification_types (name, code, category, validity_period_months, is_mandatory, description) VALUES
('Basic Safety Training', 'BST', 'STCW', 60, true, 'STCW Basic Safety Training including fire fighting, survival at sea, first aid'),
('Certificate of Competency - Master', 'COC-MASTER', 'Flag_State', 60, true, 'Certificate of Competency for Masters of seagoing ships'),
('Certificate of Competency - Chief Officer', 'COC-CO', 'Flag_State', 60, true, 'Certificate of Competency for Chief Officers'),
('RADAR/ARPA Certificate', 'RADAR-ARPA', 'IMO', 36, false, 'RADAR and Automatic Radar Plotting Aid certificate'),
('Ship Security Officer', 'SSO', 'STCW', 60, true, 'Ship Security Officer training certificate'),
('Engine Room Safety', 'ERS', 'Company', 24, true, 'Company-specific engine room safety training'),
('Medical Fitness Certificate', 'MED-FIT', 'Medical', 12, true, 'Medical fitness certificate for seafarers'),
('GMDSS General Operator', 'GMDSS-GO', 'IMO', 60, false, 'Global Maritime Distress and Safety System operator certificate');

-- Função para atualizar status de certificação baseado na data de expiração
CREATE OR REPLACE FUNCTION public.update_maritime_certificate_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date <= CURRENT_DATE THEN
    NEW.status = 'expired';
  ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN
    NEW.status = 'expiring';
  ELSE
    NEW.status = 'valid';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar status automaticamente
CREATE TRIGGER update_maritime_certificate_status_trigger
  BEFORE INSERT OR UPDATE ON public.maritime_certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_maritime_certificate_status();