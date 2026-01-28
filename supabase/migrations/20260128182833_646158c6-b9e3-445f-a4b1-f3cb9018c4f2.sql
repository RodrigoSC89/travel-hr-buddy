-- PATCH 901: Schema alignment for @ts-nocheck removal
-- Adiciona colunas faltantes em price_alerts e cria tabela fleet_sensors

-- 1. Adicionar colunas faltantes na tabela price_alerts
ALTER TABLE public.price_alerts 
  ADD COLUMN IF NOT EXISTS route TEXT,
  ADD COLUMN IF NOT EXISTS origin TEXT,
  ADD COLUMN IF NOT EXISTS destination TEXT,
  ADD COLUMN IF NOT EXISTS threshold_type TEXT DEFAULT 'below',
  ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS visual_notifications BOOLEAN DEFAULT true;

-- Criar índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_price_alerts_route ON public.price_alerts(route);
CREATE INDEX IF NOT EXISTS idx_price_alerts_origin ON public.price_alerts(origin);
CREATE INDEX IF NOT EXISTS idx_price_alerts_destination ON public.price_alerts(destination);

-- 2. Criar tabela fleet_sensors para telemetria da frota
CREATE TABLE IF NOT EXISTS public.fleet_sensors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  threshold_min NUMERIC,
  threshold_max NUMERIC,
  status TEXT DEFAULT 'normal',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fleet_sensors_vessel_id ON public.fleet_sensors(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fleet_sensors_organization_id ON public.fleet_sensors(organization_id);
CREATE INDEX IF NOT EXISTS idx_fleet_sensors_timestamp ON public.fleet_sensors(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_fleet_sensors_sensor_type ON public.fleet_sensors(sensor_type);

-- Habilitar RLS
ALTER TABLE public.fleet_sensors ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para fleet_sensors
CREATE POLICY "Users can view fleet sensors for their organization" 
ON public.fleet_sensors FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can insert fleet sensors for their organization" 
ON public.fleet_sensors FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can update fleet sensors for their organization" 
ON public.fleet_sensors FOR UPDATE 
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- 3. Criar tabela travel_price_history para histórico de preços
CREATE TABLE IF NOT EXISTS public.travel_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.price_alerts(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_travel_price_history_alert_id ON public.travel_price_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_travel_price_history_checked_at ON public.travel_price_history(checked_at DESC);

-- Habilitar RLS
ALTER TABLE public.travel_price_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para travel_price_history
CREATE POLICY "Users can view price history for their alerts" 
ON public.travel_price_history FOR SELECT 
USING (
  alert_id IN (
    SELECT id FROM public.price_alerts WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert price history for their alerts" 
ON public.travel_price_history FOR INSERT 
WITH CHECK (
  alert_id IN (
    SELECT id FROM public.price_alerts WHERE user_id = auth.uid()
  )
);

-- Comentários para documentação
COMMENT ON TABLE public.fleet_sensors IS 'Real-time sensor data from fleet vessels for telemetry and predictive maintenance';
COMMENT ON TABLE public.travel_price_history IS 'Price history tracking for price alerts';