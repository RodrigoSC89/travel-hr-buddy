-- Terrastar Ionosphere API Integration - Database Schema
-- GPS/GNSS Ionospheric Correction System Tables

-- ============================================
-- Table: terrastar_ionosphere_data
-- Stores ionospheric data from Terrastar
-- ============================================
CREATE TABLE IF NOT EXISTS terrastar_ionosphere_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  position_lat DECIMAL(10, 7) NOT NULL,
  position_lon DECIMAL(10, 7) NOT NULL,
  vtec DECIMAL(10, 4), -- Vertical Total Electron Content
  stec DECIMAL(10, 4), -- Slant Total Electron Content
  ionospheric_delay DECIMAL(10, 4), -- milliseconds
  correction_type TEXT CHECK (correction_type IN ('L1', 'L2', 'L5')),
  quality_indicator INTEGER CHECK (quality_indicator >= 0 AND quality_indicator <= 100),
  satellite_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_terrastar_iono_vessel ON terrastar_ionosphere_data(vessel_id);
CREATE INDEX IF NOT EXISTS idx_terrastar_iono_timestamp ON terrastar_ionosphere_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_terrastar_iono_position ON terrastar_ionosphere_data(position_lat, position_lon);

-- ============================================
-- Table: terrastar_corrections
-- Stores position corrections from Terrastar
-- ============================================
CREATE TABLE IF NOT EXISTS terrastar_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  position_lat DECIMAL(10, 7) NOT NULL,
  position_lon DECIMAL(10, 7) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  vtec_correction DECIMAL(10, 4),
  horizontal_accuracy DECIMAL(10, 4), -- meters
  vertical_accuracy DECIMAL(10, 4), -- meters
  correction_age INTEGER, -- seconds
  service_level TEXT CHECK (service_level IN ('BASIC', 'PREMIUM', 'RTK')),
  signal_quality INTEGER CHECK (signal_quality >= 0 AND signal_quality <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_terrastar_corr_vessel ON terrastar_corrections(vessel_id);
CREATE INDEX IF NOT EXISTS idx_terrastar_corr_timestamp ON terrastar_corrections(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_terrastar_corr_accuracy ON terrastar_corrections(horizontal_accuracy);

-- ============================================
-- Table: terrastar_alerts
-- Stores ionospheric alerts from Terrastar
-- ============================================
CREATE TABLE IF NOT EXISTS terrastar_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('IONOSPHERIC_STORM', 'SIGNAL_DEGRADATION', 'CORRECTION_UNAVAILABLE', 'ACCURACY_WARNING')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  affected_area JSONB NOT NULL, -- {lat_min, lat_max, lon_min, lon_max}
  timestamp TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_terrastar_alerts_vessel ON terrastar_alerts(vessel_id);
CREATE INDEX IF NOT EXISTS idx_terrastar_alerts_severity ON terrastar_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_terrastar_alerts_acknowledged ON terrastar_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_terrastar_alerts_active ON terrastar_alerts(expires_at) WHERE acknowledged = FALSE;

-- ============================================
-- Table: terrastar_alert_subscriptions
-- Tracks alert subscriptions for vessels
-- ============================================
CREATE TABLE IF NOT EXISTS terrastar_alert_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL UNIQUE,
  bounding_box JSONB NOT NULL, -- {lat_min, lat_max, lon_min, lon_max}
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_terrastar_subs_vessel ON terrastar_alert_subscriptions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_terrastar_subs_active ON terrastar_alert_subscriptions(active) WHERE active = TRUE;

-- ============================================
-- Table: terrastar_forecast_data
-- Stores ionospheric forecast data
-- ============================================
CREATE TABLE IF NOT EXISTS terrastar_forecast_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  forecast_timestamp TIMESTAMPTZ NOT NULL,
  position_lat DECIMAL(10, 7) NOT NULL,
  position_lon DECIMAL(10, 7) NOT NULL,
  vtec_predicted DECIMAL(10, 4),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  condition TEXT CHECK (condition IN ('quiet', 'unsettled', 'active', 'storm')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_terrastar_forecast_vessel ON terrastar_forecast_data(vessel_id);
CREATE INDEX IF NOT EXISTS idx_terrastar_forecast_timestamp ON terrastar_forecast_data(forecast_timestamp);

-- ============================================
-- Table: terrastar_service_logs
-- Audit log for Terrastar service operations
-- ============================================
CREATE TABLE IF NOT EXISTS terrastar_service_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('ionosphere_data', 'correction', 'alert_subscription', 'forecast')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  request_details JSONB,
  response_details JSONB,
  latency_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_terrastar_logs_vessel ON terrastar_service_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_terrastar_logs_created ON terrastar_service_logs(created_at DESC);

-- ============================================
-- Trigger: Update timestamp on row update
-- ============================================
CREATE OR REPLACE FUNCTION update_terrastar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_terrastar_subscriptions_updated_at
  BEFORE UPDATE ON terrastar_alert_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_terrastar_updated_at();

-- ============================================
-- Trigger: Auto-acknowledge expired alerts
-- ============================================
CREATE OR REPLACE FUNCTION auto_acknowledge_expired_alerts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE terrastar_alerts
  SET acknowledged = TRUE
  WHERE expires_at < NOW() AND acknowledged = FALSE;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_acknowledge_alerts
  AFTER INSERT OR UPDATE ON terrastar_alerts
  FOR EACH STATEMENT
  EXECUTE FUNCTION auto_acknowledge_expired_alerts();

-- ============================================
-- RLS (Row Level Security) Policies
-- ============================================
ALTER TABLE terrastar_ionosphere_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrastar_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrastar_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrastar_alert_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrastar_forecast_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrastar_service_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view data for their organization's vessels
CREATE POLICY "Users can view terrastar_ionosphere_data"
  ON terrastar_ionosphere_data FOR SELECT
  USING (
    vessel_id IN (
      SELECT id FROM vessels WHERE organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view terrastar_corrections"
  ON terrastar_corrections FOR SELECT
  USING (
    vessel_id IN (
      SELECT id FROM vessels WHERE organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view terrastar_alerts"
  ON terrastar_alerts FOR SELECT
  USING (
    vessel_id IN (
      SELECT id FROM vessels WHERE organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their alerts"
  ON terrastar_alerts FOR UPDATE
  USING (
    vessel_id IN (
      SELECT id FROM vessels WHERE organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view terrastar_alert_subscriptions"
  ON terrastar_alert_subscriptions FOR SELECT
  USING (
    vessel_id IN (
      SELECT id FROM vessels WHERE organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view terrastar_forecast_data"
  ON terrastar_forecast_data FOR SELECT
  USING (
    vessel_id IN (
      SELECT id FROM vessels WHERE organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view terrastar_service_logs"
  ON terrastar_service_logs FOR SELECT
  USING (
    vessel_id IN (
      SELECT id FROM vessels WHERE organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- Policy: Service role can do anything
CREATE POLICY "Service role full access to terrastar_ionosphere_data"
  ON terrastar_ionosphere_data FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to terrastar_corrections"
  ON terrastar_corrections FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to terrastar_alerts"
  ON terrastar_alerts FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to terrastar_alert_subscriptions"
  ON terrastar_alert_subscriptions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to terrastar_forecast_data"
  ON terrastar_forecast_data FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to terrastar_service_logs"
  ON terrastar_service_logs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE terrastar_ionosphere_data IS 'Ionospheric data from Terrastar API for precise navigation';
COMMENT ON TABLE terrastar_corrections IS 'Position corrections from Terrastar based on ionospheric conditions';
COMMENT ON TABLE terrastar_alerts IS 'Ionospheric alerts and warnings from Terrastar';
COMMENT ON TABLE terrastar_alert_subscriptions IS 'Active alert subscriptions for vessels';
COMMENT ON TABLE terrastar_forecast_data IS 'Ionospheric forecast data for planning';
COMMENT ON TABLE terrastar_service_logs IS 'Audit log for Terrastar service operations';
