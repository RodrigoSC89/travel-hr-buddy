-- Migration: Align schema with TypeScript interfaces
-- Add missing columns to mirror_instances for TypeScript compatibility

ALTER TABLE public.mirror_instances 
ADD COLUMN IF NOT EXISTS endpoint TEXT,
ADD COLUMN IF NOT EXISTS name TEXT;

-- Update name from instance_name for consistency
UPDATE public.mirror_instances 
SET name = instance_name 
WHERE name IS NULL AND instance_name IS NOT NULL;

-- Add notes column to mission_vessels if missing
ALTER TABLE public.mission_vessels 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add updated_at trigger for mission_vessels
DROP TRIGGER IF EXISTS update_mission_vessels_updated_at ON public.mission_vessels;
CREATE TRIGGER update_mission_vessels_updated_at
  BEFORE UPDATE ON public.mission_vessels
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Add id column to vessel_ai_contexts if it doesn't have proper naming
ALTER TABLE public.vessel_ai_contexts
ADD COLUMN IF NOT EXISTS model_version TEXT DEFAULT '1.0.0',
ADD COLUMN IF NOT EXISTS interaction_count INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mirror_instances_status ON public.mirror_instances(status);
CREATE INDEX IF NOT EXISTS idx_mission_vessels_mission_id ON public.mission_vessels(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_vessels_vessel_id ON public.mission_vessels(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_ai_contexts_vessel_id ON public.vessel_ai_contexts(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_ai_contexts_context_id ON public.vessel_ai_contexts(context_id);

-- Enable RLS on these tables
ALTER TABLE public.mirror_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_ai_contexts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for mirror_instances
DROP POLICY IF EXISTS "Authenticated users can view mirror_instances" ON public.mirror_instances;
CREATE POLICY "Authenticated users can view mirror_instances"
  ON public.mirror_instances FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage mirror_instances" ON public.mirror_instances;
CREATE POLICY "Admins can manage mirror_instances"
  ON public.mirror_instances FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Create RLS policies for mission_vessels
DROP POLICY IF EXISTS "Authenticated users can view mission_vessels" ON public.mission_vessels;
CREATE POLICY "Authenticated users can view mission_vessels"
  ON public.mission_vessels FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage mission_vessels" ON public.mission_vessels;
CREATE POLICY "Authenticated users can manage mission_vessels"
  ON public.mission_vessels FOR ALL
  TO authenticated
  USING (true);

-- Create RLS policies for vessel_ai_contexts
DROP POLICY IF EXISTS "Authenticated users can view vessel_ai_contexts" ON public.vessel_ai_contexts;
CREATE POLICY "Authenticated users can view vessel_ai_contexts"
  ON public.vessel_ai_contexts FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage vessel_ai_contexts" ON public.vessel_ai_contexts;
CREATE POLICY "Authenticated users can manage vessel_ai_contexts"
  ON public.vessel_ai_contexts FOR ALL
  TO authenticated
  USING (true);