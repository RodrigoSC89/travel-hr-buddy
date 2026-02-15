
-- FMEA/FMECA Items table for PEO-DP compliance
CREATE TABLE IF NOT EXISTS public.peodp_fmea_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  sistema TEXT NOT NULL,
  subsistema TEXT NOT NULL,
  componente TEXT NOT NULL,
  funcao TEXT NOT NULL,
  modo_falha TEXT NOT NULL,
  causa_falha TEXT NOT NULL,
  efeitos_locais TEXT NOT NULL,
  efeitos_globais TEXT NOT NULL,
  tipo_deteccao TEXT NOT NULL,
  capacidade_deteccao INTEGER NOT NULL DEFAULT 5 CHECK (capacidade_deteccao BETWEEN 1 AND 10),
  frequencia INTEGER NOT NULL DEFAULT 5 CHECK (frequencia BETWEEN 1 AND 10),
  severidade INTEGER NOT NULL DEFAULT 5 CHECK (severidade BETWEEN 1 AND 10),
  npr INTEGER GENERATED ALWAYS AS (capacidade_deteccao * frequencia * severidade) STORED,
  acoes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'mitigated', 'accepted', 'monitoring')),
  gap_status TEXT CHECK (gap_status IN ('atendeu', 'nao_atendeu', 'na')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.peodp_fmea_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view FMEA items" ON public.peodp_fmea_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create FMEA items" ON public.peodp_fmea_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update FMEA items" ON public.peodp_fmea_items FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete FMEA items" ON public.peodp_fmea_items FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_peodp_fmea_vessel ON public.peodp_fmea_items(vessel_id);
CREATE INDEX idx_peodp_fmea_sistema ON public.peodp_fmea_items(sistema);
CREATE INDEX idx_peodp_fmea_status ON public.peodp_fmea_items(status);

CREATE TRIGGER update_peodp_fmea_items_updated_at
  BEFORE UPDATE ON public.peodp_fmea_items
  FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();

-- Tracking alerts table for geofencing
CREATE TABLE IF NOT EXISTS public.tracking_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  alert_type TEXT NOT NULL DEFAULT 'geofence' CHECK (alert_type IN ('geofence', 'speed', 'route_deviation', 'ais_loss', 'anchor_drag', 'weather', 'port_approach')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geofence_id UUID,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracking alerts" ON public.tracking_alerts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create tracking alerts" ON public.tracking_alerts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update tracking alerts" ON public.tracking_alerts FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete tracking alerts" ON public.tracking_alerts FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_tracking_alerts_vessel ON public.tracking_alerts(vessel_id);
CREATE INDEX idx_tracking_alerts_type ON public.tracking_alerts(alert_type);
CREATE INDEX idx_tracking_alerts_resolved ON public.tracking_alerts(is_resolved);

CREATE TRIGGER update_tracking_alerts_updated_at
  BEFORE UPDATE ON public.tracking_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
