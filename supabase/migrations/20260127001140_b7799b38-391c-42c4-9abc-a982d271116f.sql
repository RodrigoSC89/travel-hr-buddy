-- Create vessel_positions table for real-time AIS tracking
CREATE TABLE IF NOT EXISTS public.vessel_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  mmsi VARCHAR(15),
  imo VARCHAR(20),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION DEFAULT 0,
  course DOUBLE PRECISION DEFAULT 0,
  heading DOUBLE PRECISION DEFAULT 0,
  nav_status VARCHAR(50) DEFAULT 'underway',
  destination VARCHAR(100),
  eta TIMESTAMPTZ,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'manual',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX idx_vessel_positions_vessel_id ON public.vessel_positions(vessel_id);
CREATE INDEX idx_vessel_positions_mmsi ON public.vessel_positions(mmsi);
CREATE INDEX idx_vessel_positions_recorded_at ON public.vessel_positions(recorded_at DESC);

-- Enable RLS
ALTER TABLE public.vessel_positions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read access to vessel_positions"
  ON public.vessel_positions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to vessel_positions"
  ON public.vessel_positions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to vessel_positions"
  ON public.vessel_positions FOR UPDATE
  TO authenticated
  USING (true);

-- Insert initial positions for existing vessels (realistic Brazilian coast positions)
INSERT INTO public.vessel_positions (vessel_id, mmsi, imo, latitude, longitude, speed, course, heading, nav_status, destination, source)
SELECT 
  v.id,
  CONCAT('710', LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0')),
  v.imo_number,
  CASE 
    WHEN v.current_location ILIKE '%santos%' THEN -23.9619
    WHEN v.current_location ILIKE '%rio%' THEN -22.8938
    WHEN v.current_location ILIKE '%paranagua%' OR v.current_location ILIKE '%paranaguá%' THEN -25.5207
    WHEN v.current_location ILIKE '%recife%' THEN -8.0476
    ELSE -23.5505 + (RANDOM() * 5 - 2.5)
  END,
  CASE 
    WHEN v.current_location ILIKE '%santos%' THEN -46.3121
    WHEN v.current_location ILIKE '%rio%' THEN -43.1729
    WHEN v.current_location ILIKE '%paranagua%' OR v.current_location ILIKE '%paranaguá%' THEN -48.5207
    WHEN v.current_location ILIKE '%recife%' THEN -34.8770
    ELSE -46.6333 + (RANDOM() * 5 - 2.5)
  END,
  FLOOR(RANDOM() * 15)::DOUBLE PRECISION,
  FLOOR(RANDOM() * 360)::DOUBLE PRECISION,
  FLOOR(RANDOM() * 360)::DOUBLE PRECISION,
  CASE v.status 
    WHEN 'active' THEN 'underway'
    WHEN 'in_port' THEN 'moored'
    WHEN 'docked' THEN 'moored'
    WHEN 'maintenance' THEN 'at_anchor'
    ELSE 'underway'
  END,
  v.current_location,
  'database'
FROM public.vessels v
WHERE NOT EXISTS (
  SELECT 1 FROM public.vessel_positions vp WHERE vp.vessel_id = v.id
);

-- Create trigger for updated_at
CREATE OR REPLACE TRIGGER update_vessel_positions_updated_at
  BEFORE UPDATE ON public.vessel_positions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();