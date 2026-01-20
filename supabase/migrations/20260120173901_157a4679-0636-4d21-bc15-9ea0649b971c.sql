-- =====================================================
-- NAUTI ONE v4.0 - Fleet Logs Table + Storage Bucket
-- =====================================================

-- 1. Create fleet_logs table for vessel telemetry
CREATE TABLE IF NOT EXISTS fleet_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  log_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  severity VARCHAR(20) DEFAULT 'info',
  source VARCHAR(100),
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID
);

-- 2. Indexes for fleet_logs
CREATE INDEX IF NOT EXISTS idx_fleet_logs_vessel_id ON fleet_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fleet_logs_recorded_at ON fleet_logs(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_fleet_logs_log_type ON fleet_logs(log_type);

-- 3. RLS for fleet_logs
ALTER TABLE fleet_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view fleet logs" 
ON fleet_logs FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert fleet logs" 
ON fleet_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- 4. Create storage bucket for audit evidence (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audit-evidence', 
  'audit-evidence', 
  false, 
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'audio/mpeg', 'audio/webm', 'video/mp4']
) ON CONFLICT (id) DO NOTHING;

-- 5. Storage policies for audit-evidence bucket (safe to recreate)
DROP POLICY IF EXISTS "Authenticated users can upload audit evidence" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view audit evidence files" ON storage.objects;

CREATE POLICY "Authenticated users can upload audit evidence"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'audit-evidence');

CREATE POLICY "Authenticated users can view audit evidence files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'audit-evidence');