-- PATCH 476: Satcom Links Table
-- Stores satellite communication link configurations and status

CREATE TABLE IF NOT EXISTS public.satcom_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('Iridium', 'Starlink', 'Inmarsat', 'Thuraya')),
  status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'degraded')) DEFAULT 'offline',
  signal_strength INTEGER CHECK (signal_strength BETWEEN 0 AND 100),
  latency_ms INTEGER,
  bandwidth_kbps INTEGER,
  last_ping_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  failure_reason TEXT,
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 10),
  is_primary BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX idx_satcom_links_vessel_id ON public.satcom_links(vessel_id);
CREATE INDEX idx_satcom_links_status ON public.satcom_links(status);
CREATE INDEX idx_satcom_links_provider ON public.satcom_links(provider);
CREATE INDEX idx_satcom_links_priority ON public.satcom_links(priority DESC);

-- Enable RLS
ALTER TABLE public.satcom_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view satcom links"
  ON public.satcom_links FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert satcom links"
  ON public.satcom_links FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update satcom links"
  ON public.satcom_links FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.satcom_links TO authenticated;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_satcom_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_satcom_links_timestamp
  BEFORE UPDATE ON public.satcom_links
  FOR EACH ROW
  EXECUTE FUNCTION update_satcom_links_updated_at();

-- Comment
COMMENT ON TABLE public.satcom_links IS 'PATCH 476: Satellite communication link configurations and status monitoring';
