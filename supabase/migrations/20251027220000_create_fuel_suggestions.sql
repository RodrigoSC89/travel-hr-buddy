-- PATCH 327: Add fuel_suggestions table for AI-powered optimization suggestions
CREATE TABLE IF NOT EXISTS public.fuel_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('speed_optimization', 'route_alternative', 'fuel_type', 'weather_routing', 'trim_optimization', 'general')),
  suggestion_title TEXT NOT NULL,
  suggestion_description TEXT NOT NULL,
  estimated_fuel_saving NUMERIC,
  estimated_cost_saving NUMERIC,
  estimated_time_impact NUMERIC, -- in hours, can be negative (delay) or positive (saving)
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  ai_reasoning TEXT,
  implementation_complexity TEXT CHECK (implementation_complexity IN ('easy', 'moderate', 'complex')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected', 'implemented')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ,
  implementation_notes TEXT,
  actual_fuel_saving NUMERIC, -- measured after implementation
  actual_cost_saving NUMERIC,
  feedback_rating NUMERIC CHECK (feedback_rating >= 0 AND feedback_rating <= 5),
  feedback_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_fuel_suggestions_vessel ON fuel_suggestions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fuel_suggestions_route ON fuel_suggestions(route_id);
CREATE INDEX IF NOT EXISTS idx_fuel_suggestions_status ON fuel_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_fuel_suggestions_priority ON fuel_suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_fuel_suggestions_created ON fuel_suggestions(created_at DESC);

-- Enable RLS
ALTER TABLE fuel_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view fuel suggestions"
  ON fuel_suggestions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create suggestions"
  ON fuel_suggestions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update suggestions they created or reviewed"
  ON fuel_suggestions FOR UPDATE
  USING (auth.uid() = reviewed_by OR auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_fuel_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fuel_suggestions_updated_at
  BEFORE UPDATE ON fuel_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_fuel_suggestions_updated_at();

-- Function to auto-calculate savings when implemented
CREATE OR REPLACE FUNCTION calculate_fuel_suggestion_savings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'implemented' AND NEW.implemented_at IS NULL THEN
    NEW.implemented_at = now();
  END IF;
  
  -- Calculate ROI if both estimated and actual savings are available
  IF NEW.actual_fuel_saving IS NOT NULL AND NEW.estimated_fuel_saving IS NOT NULL THEN
    NEW.metadata = jsonb_set(
      COALESCE(NEW.metadata, '{}'::jsonb),
      '{savings_accuracy}',
      to_jsonb(ROUND((NEW.actual_fuel_saving / NULLIF(NEW.estimated_fuel_saving, 0)) * 100, 2))
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_fuel_suggestion_savings
  BEFORE UPDATE ON fuel_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_fuel_suggestion_savings();
