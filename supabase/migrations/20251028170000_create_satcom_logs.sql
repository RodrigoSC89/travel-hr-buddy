-- PATCH 420: Satcom Logs Table
-- Stores satellite communication transmission logs

CREATE TABLE IF NOT EXISTS public.satcom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  transmission_type TEXT NOT NULL CHECK (transmission_type IN ('send', 'receive', 'status', 'heartbeat')),
  provider TEXT NOT NULL CHECK (provider IN ('Iridium', 'Starlink', 'Inmarsat', 'Thuraya')),
  message_content TEXT,
  signal_strength INTEGER CHECK (signal_strength BETWEEN 0 AND 100),
  latency_ms INTEGER,
  bandwidth_kbps INTEGER,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'degraded', 'timeout')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX idx_satcom_logs_vessel_id ON public.satcom_logs(vessel_id);
CREATE INDEX idx_satcom_logs_created_at ON public.satcom_logs(created_at DESC);
CREATE INDEX idx_satcom_logs_provider ON public.satcom_logs(provider);
CREATE INDEX idx_satcom_logs_status ON public.satcom_logs(status);

-- Enable RLS
ALTER TABLE public.satcom_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view satcom logs"
  ON public.satcom_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert satcom logs"
  ON public.satcom_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT, INSERT ON public.satcom_logs TO authenticated;

-- Comment
COMMENT ON TABLE public.satcom_logs IS 'PATCH 420: Satellite communication transmission logs with signal quality metrics';
