-- StarFix API Integration - Database Schema
-- FSP Support System Tables

-- ============================================
-- Table: starfix_vessels
-- Stores vessel registration in StarFix system
-- ============================================
CREATE TABLE IF NOT EXISTS starfix_vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  imo_number TEXT NOT NULL UNIQUE,
  vessel_name TEXT NOT NULL,
  starfix_vessel_id TEXT UNIQUE,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'inactive', 'suspended')),
  last_sync_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_starfix_vessels_imo ON starfix_vessels(imo_number);
CREATE INDEX IF NOT EXISTS idx_starfix_vessels_vessel_id ON starfix_vessels(vessel_id);

-- ============================================
-- Table: starfix_inspections
-- Stores inspection data synced from StarFix
-- ============================================
CREATE TABLE IF NOT EXISTS starfix_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  imo_number TEXT NOT NULL,
  inspection_date DATE NOT NULL,
  port_name TEXT NOT NULL,
  port_country TEXT NOT NULL,
  inspection_type TEXT NOT NULL CHECK (inspection_type IN ('PSC', 'FSI', 'ISM', 'ISPS')),
  authority TEXT NOT NULL,
  deficiencies_count INTEGER DEFAULT 0,
  detentions INTEGER DEFAULT 0,
  inspection_result TEXT CHECK (inspection_result IN ('CLEAR', 'DEFICIENCY', 'DETENTION')),
  deficiencies JSONB DEFAULT '[]'::jsonb,
  starfix_sync_status TEXT DEFAULT 'pending' CHECK (starfix_sync_status IN ('pending', 'synced', 'failed')),
  last_sync_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_starfix_inspections_vessel ON starfix_inspections(vessel_id);
CREATE INDEX IF NOT EXISTS idx_starfix_inspections_imo ON starfix_inspections(imo_number);
CREATE INDEX IF NOT EXISTS idx_starfix_inspections_date ON starfix_inspections(inspection_date DESC);
CREATE INDEX IF NOT EXISTS idx_starfix_inspections_sync_status ON starfix_inspections(starfix_sync_status);

-- ============================================
-- Table: starfix_performance_metrics
-- Stores performance metrics from StarFix
-- ============================================
CREATE TABLE IF NOT EXISTS starfix_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  imo_number TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_inspections INTEGER DEFAULT 0,
  detentions_count INTEGER DEFAULT 0,
  deficiencies_count INTEGER DEFAULT 0,
  nil_deficiency_rate DECIMAL(5,2) DEFAULT 0,
  detention_rate DECIMAL(5,2) DEFAULT 0,
  performance_score DECIMAL(5,2) DEFAULT 0,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  flag_state_average_score DECIMAL(5,2),
  comparison_to_fleet DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vessel_id, period_start, period_end)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_starfix_metrics_vessel ON starfix_performance_metrics(vessel_id);
CREATE INDEX IF NOT EXISTS idx_starfix_metrics_imo ON starfix_performance_metrics(imo_number);
CREATE INDEX IF NOT EXISTS idx_starfix_metrics_period ON starfix_performance_metrics(period_end DESC);

-- ============================================
-- Table: starfix_sync_logs
-- Audit log for all StarFix synchronization operations
-- ============================================
CREATE TABLE IF NOT EXISTS starfix_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  imo_number TEXT,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('inspections', 'performance', 'full', 'submit')),
  sync_status TEXT NOT NULL CHECK (sync_status IN ('success', 'partial', 'failed')),
  synced_inspections INTEGER DEFAULT 0,
  submitted_inspections INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  sync_duration_ms INTEGER,
  triggered_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_starfix_sync_logs_vessel ON starfix_sync_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_starfix_sync_logs_created ON starfix_sync_logs(created_at DESC);

-- ============================================
-- Trigger: Update timestamp on row update
-- ============================================
CREATE OR REPLACE FUNCTION update_starfix_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_starfix_vessels_updated_at
  BEFORE UPDATE ON starfix_vessels
  FOR EACH ROW
  EXECUTE FUNCTION update_starfix_updated_at();

CREATE TRIGGER update_starfix_inspections_updated_at
  BEFORE UPDATE ON starfix_inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_starfix_updated_at();

CREATE TRIGGER update_starfix_metrics_updated_at
  BEFORE UPDATE ON starfix_performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_starfix_updated_at();

-- ============================================
-- RLS (Row Level Security) Policies
-- ============================================
ALTER TABLE starfix_vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE starfix_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE starfix_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE starfix_sync_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view StarFix data for their organization's vessels
CREATE POLICY "Users can view starfix_vessels"
  ON starfix_vessels FOR SELECT
  USING (
    vessel_id IN (
      SELECT id FROM vessels WHERE organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view starfix_inspections"
  ON starfix_inspections FOR SELECT
  USING (
    vessel_id IN (
      SELECT id FROM vessels WHERE organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view starfix_performance_metrics"
  ON starfix_performance_metrics FOR SELECT
  USING (
    vessel_id IN (
      SELECT id FROM vessels WHERE organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view starfix_sync_logs"
  ON starfix_sync_logs FOR SELECT
  USING (
    vessel_id IN (
      SELECT id FROM vessels WHERE organization_id = (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- Policy: Service role can do anything
CREATE POLICY "Service role full access to starfix_vessels"
  ON starfix_vessels FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to starfix_inspections"
  ON starfix_inspections FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to starfix_performance_metrics"
  ON starfix_performance_metrics FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to starfix_sync_logs"
  ON starfix_sync_logs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE starfix_vessels IS 'Vessels registered in StarFix FSP Support System';
COMMENT ON TABLE starfix_inspections IS 'Inspection records synced from StarFix API';
COMMENT ON TABLE starfix_performance_metrics IS 'Performance metrics and benchmarking data from StarFix';
COMMENT ON TABLE starfix_sync_logs IS 'Audit log for StarFix synchronization operations';
