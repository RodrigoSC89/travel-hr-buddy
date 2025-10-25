-- PATCH 167.0: Distributed AI Engine Tables
-- Support for vessel-specific AI contexts and decision tracking

-- Create vessel_ai_contexts table for storing vessel-specific AI learning data
CREATE TABLE IF NOT EXISTS vessel_ai_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE NOT NULL UNIQUE,
  context_id text NOT NULL UNIQUE,
  local_data jsonb DEFAULT '{}'::jsonb,
  global_data jsonb DEFAULT '{}'::jsonb,
  last_sync timestamptz DEFAULT now(),
  model_version text DEFAULT '1.0.0',
  interaction_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ai_decisions table for tracking AI recommendations and decisions
CREATE TABLE IF NOT EXISTS ai_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  decision_type text NOT NULL,
  input_data jsonb NOT NULL,
  output_data jsonb NOT NULL,
  confidence numeric(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  reasoning text,
  model_used text CHECK (model_used IN ('local', 'global', 'fallback')),
  feedback_score integer CHECK (feedback_score >= 1 AND feedback_score <= 5),
  feedback_notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_vessel_ai_contexts_vessel_id ON vessel_ai_contexts(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_ai_contexts_last_sync ON vessel_ai_contexts(last_sync);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_vessel_id ON ai_decisions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_decision_type ON ai_decisions(decision_type);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_created_at ON ai_decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_confidence ON ai_decisions(confidence);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_model_used ON ai_decisions(model_used);

-- Enable Row Level Security
ALTER TABLE vessel_ai_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_decisions ENABLE ROW LEVEL SECURITY;

-- RLS policies for vessel_ai_contexts
CREATE POLICY "Authenticated users can read vessel AI contexts"
  ON vessel_ai_contexts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create vessel AI contexts"
  ON vessel_ai_contexts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update vessel AI contexts"
  ON vessel_ai_contexts FOR UPDATE
  TO authenticated
  USING (true);

-- RLS policies for ai_decisions
CREATE POLICY "Authenticated users can read AI decisions"
  ON ai_decisions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create AI decisions"
  ON ai_decisions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their AI decisions feedback"
  ON ai_decisions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_vessel_ai_contexts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vessel_ai_contexts_updated_at
  BEFORE UPDATE ON vessel_ai_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_vessel_ai_contexts_updated_at();

-- Create function to increment interaction count
CREATE OR REPLACE FUNCTION increment_vessel_context_interactions(p_vessel_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE vessel_ai_contexts
  SET 
    interaction_count = interaction_count + 1,
    updated_at = now()
  WHERE vessel_id = p_vessel_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get AI performance metrics
CREATE OR REPLACE FUNCTION get_ai_performance_metrics(p_vessel_id uuid DEFAULT NULL, p_days integer DEFAULT 7)
RETURNS TABLE (
  vessel_id uuid,
  total_decisions bigint,
  avg_confidence numeric,
  model_distribution jsonb,
  decision_type_distribution jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.vessel_id,
    COUNT(*) as total_decisions,
    ROUND(AVG(d.confidence)::numeric, 3) as avg_confidence,
    jsonb_object_agg(d.model_used, model_count) as model_distribution,
    jsonb_object_agg(d.decision_type, type_count) as decision_type_distribution
  FROM ai_decisions d
  LEFT JOIN (
    SELECT vessel_id, model_used, COUNT(*) as model_count
    FROM ai_decisions
    WHERE (p_vessel_id IS NULL OR vessel_id = p_vessel_id)
      AND created_at >= now() - (p_days || ' days')::interval
    GROUP BY vessel_id, model_used
  ) m ON d.vessel_id = m.vessel_id AND d.model_used = m.model_used
  LEFT JOIN (
    SELECT vessel_id, decision_type, COUNT(*) as type_count
    FROM ai_decisions
    WHERE (p_vessel_id IS NULL OR vessel_id = p_vessel_id)
      AND created_at >= now() - (p_days || ' days')::interval
    GROUP BY vessel_id, decision_type
  ) t ON d.vessel_id = t.vessel_id AND d.decision_type = t.decision_type
  WHERE (p_vessel_id IS NULL OR d.vessel_id = p_vessel_id)
    AND d.created_at >= now() - (p_days || ' days')::interval
  GROUP BY d.vessel_id;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE vessel_ai_contexts IS 'PATCH 167.0: Vessel-specific AI learning contexts with local and global knowledge';
COMMENT ON TABLE ai_decisions IS 'PATCH 167.0: AI decision tracking for audit and learning purposes';
COMMENT ON COLUMN vessel_ai_contexts.local_data IS 'Vessel-specific learned patterns and insights';
COMMENT ON COLUMN vessel_ai_contexts.global_data IS 'Fleet-wide shared knowledge synchronized every 12 hours';
COMMENT ON COLUMN ai_decisions.confidence IS 'AI confidence score between 0 and 1';
COMMENT ON COLUMN ai_decisions.model_used IS 'Which AI model was used: local, global, or fallback';
COMMENT ON FUNCTION increment_vessel_context_interactions IS 'Increments interaction count for a vessel AI context';
COMMENT ON FUNCTION get_ai_performance_metrics IS 'Returns AI performance metrics for vessels over specified time period';

-- Insert sample AI contexts for existing vessels
INSERT INTO vessel_ai_contexts (vessel_id, context_id, local_data, model_version)
SELECT 
  id,
  'ctx_' || id || '_' || extract(epoch from now())::bigint,
  jsonb_build_object(
    'initialization', 'auto',
    'vessel_name', name,
    'vessel_type', vessel_type
  ),
  '1.0.0'
FROM vessels
ON CONFLICT (vessel_id) DO NOTHING;
