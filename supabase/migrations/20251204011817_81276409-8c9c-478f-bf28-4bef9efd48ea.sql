-- Dropar tabela existente se incompleta
DROP TABLE IF EXISTS public.dp_incidents CASCADE;

-- Recriar DP Intelligence Center: Tabela de incidentes
CREATE TABLE public.dp_incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  incident_date DATE NOT NULL,
  vessel TEXT,
  location TEXT,
  root_cause TEXT,
  dp_class TEXT,
  source TEXT,
  link TEXT,
  summary TEXT,
  tags TEXT[],
  severity TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dp_incidents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Authenticated users can view incidents"
ON public.dp_incidents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert incidents"
ON public.dp_incidents FOR INSERT
TO authenticated
WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update incidents"
ON public.dp_incidents FOR UPDATE
TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete incidents"
ON public.dp_incidents FOR DELETE
TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER update_dp_incidents_updated_at
BEFORE UPDATE ON public.dp_incidents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Dados de exemplo
INSERT INTO public.dp_incidents (id, title, incident_date, vessel, location, root_cause, dp_class, source, link, summary, tags, severity) VALUES
('imca-2025-014', 'Loss of Position Due to Gyro Drift', '2025-09-12', 'DP Shuttle Tanker X', 'Campos Basin', 'Sensor drift not compensated', 'DP Class 2', 'IMCA Safety Flash 42/25', 'https://www.imca-int.com/safety-events/42-25/', 'The vessel experienced a gradual loss of position due to undetected gyro drift during tandem loading ops.', ARRAY['gyro', 'drive off', 'sensor', 'position loss'], 'high'),
('imca-2025-009', 'Thruster Control Software Failure During ROV Ops', '2025-08-05', 'DP DSV Subsea Alpha', 'North Sea', 'Unexpected software reboot', 'DP Class 3', 'IMCA SF 37/25', 'https://www.imca-int.com/safety-events/37-25/', 'During critical ROV launch, the vessel experienced a momentary loss of thruster control due to unexpected software reboot.', ARRAY['thruster', 'software', 'rov', 'reboot'], 'critical');