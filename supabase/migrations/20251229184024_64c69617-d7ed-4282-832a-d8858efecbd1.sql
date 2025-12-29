-- ============================================
-- DGNSS & Precision Tracking Module
-- Tables for GNSS tracking, devices, waypoints and alerts
-- ============================================

-- GNSS Devices Registry
CREATE TABLE public.gnss_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id),
  device_name TEXT NOT NULL,
  device_type TEXT DEFAULT 'gps', -- gps, dgps, rtk, ppp
  serial_number TEXT,
  manufacturer TEXT,
  model TEXT,
  firmware_version TEXT,
  is_active BOOLEAN DEFAULT true,
  is_online BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ,
  vessel_id UUID REFERENCES public.vessels(id),
  configuration JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- GNSS Position Logs
CREATE TABLE public.tracking_gnss_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id),
  device_id UUID REFERENCES public.gnss_devices(id),
  vessel_id UUID REFERENCES public.vessels(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  altitude DECIMAL(10, 2),
  speed DECIMAL(8, 2), -- knots
  heading DECIMAL(5, 2), -- degrees
  accuracy DECIMAL(8, 3), -- meters
  hdop DECIMAL(5, 2), -- Horizontal Dilution of Precision
  vdop DECIMAL(5, 2), -- Vertical Dilution of Precision
  pdop DECIMAL(5, 2), -- Position Dilution of Precision
  satellites_used INTEGER,
  fix_type TEXT DEFAULT 'gps', -- gps, dgps, rtk_float, rtk_fixed, ppp
  correction_source TEXT, -- rbmc, ibge_ppp, ntrip, oceanix
  correction_age_ms INTEGER,
  signal_quality INTEGER, -- 0-100
  raw_data JSONB,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Waypoints
CREATE TABLE public.gnss_waypoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meters DECIMAL(10, 2) DEFAULT 100,
  waypoint_type TEXT DEFAULT 'marker', -- marker, geofence, destination, origin
  is_active BOOLEAN DEFAULT true,
  vessel_id UUID REFERENCES public.vessels(id),
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- GNSS Alerts
CREATE TABLE public.gnss_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id),
  device_id UUID REFERENCES public.gnss_devices(id),
  vessel_id UUID REFERENCES public.vessels(id),
  alert_type TEXT NOT NULL, -- signal_loss, accuracy_degraded, geofence_breach, route_deviation, correction_loss
  severity TEXT DEFAULT 'warning', -- info, warning, critical
  title TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  threshold_value DECIMAL(10, 2),
  actual_value DECIMAL(10, 2),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- GNSS AI Recommendations
CREATE TABLE public.gnss_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id),
  device_id UUID REFERENCES public.gnss_devices(id),
  vessel_id UUID REFERENCES public.vessels(id),
  recommendation_type TEXT NOT NULL, -- trajectory_prediction, signal_optimization, route_correction
  title TEXT NOT NULL,
  description TEXT,
  confidence DECIMAL(5, 4), -- 0.0000 to 1.0000
  predicted_trajectory JSONB, -- array of lat/lng points
  suggested_action TEXT,
  is_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  applied_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Correction Stations (RBMC/NTRIP)
CREATE TABLE public.gnss_correction_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_code TEXT NOT NULL UNIQUE,
  station_name TEXT NOT NULL,
  provider TEXT NOT NULL, -- rbmc, ibge, ntrip_caster
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  altitude DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  last_data_at TIMESTAMPTZ,
  data_quality INTEGER, -- 0-100
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gnss_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_gnss_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gnss_waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gnss_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gnss_ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gnss_correction_stations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view GNSS devices" ON public.gnss_devices FOR SELECT USING (true);
CREATE POLICY "Users can manage GNSS devices" ON public.gnss_devices FOR ALL USING (true);

CREATE POLICY "Users can view GNSS logs" ON public.tracking_gnss_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert GNSS logs" ON public.tracking_gnss_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view waypoints" ON public.gnss_waypoints FOR SELECT USING (true);
CREATE POLICY "Users can manage waypoints" ON public.gnss_waypoints FOR ALL USING (true);

CREATE POLICY "Users can view GNSS alerts" ON public.gnss_alerts FOR SELECT USING (true);
CREATE POLICY "Users can manage GNSS alerts" ON public.gnss_alerts FOR ALL USING (true);

CREATE POLICY "Users can view AI recommendations" ON public.gnss_ai_recommendations FOR SELECT USING (true);
CREATE POLICY "Users can manage AI recommendations" ON public.gnss_ai_recommendations FOR ALL USING (true);

CREATE POLICY "Public can view correction stations" ON public.gnss_correction_stations FOR SELECT USING (true);
CREATE POLICY "Admins can manage correction stations" ON public.gnss_correction_stations FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX idx_gnss_logs_device ON public.tracking_gnss_logs(device_id);
CREATE INDEX idx_gnss_logs_vessel ON public.tracking_gnss_logs(vessel_id);
CREATE INDEX idx_gnss_logs_recorded ON public.tracking_gnss_logs(recorded_at DESC);
CREATE INDEX idx_gnss_alerts_device ON public.gnss_alerts(device_id);
CREATE INDEX idx_gnss_alerts_resolved ON public.gnss_alerts(is_resolved);
CREATE INDEX idx_gnss_waypoints_vessel ON public.gnss_waypoints(vessel_id);