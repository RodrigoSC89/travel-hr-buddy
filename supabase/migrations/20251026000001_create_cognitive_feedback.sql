-- PATCH 201.0: Cognitive Feedback System
-- Create table to store AI decisions and operator corrections for learning

CREATE TABLE IF NOT EXISTS cognitive_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Decision tracking
  decision_type TEXT NOT NULL, -- 'suggestion', 'automation', 'recommendation', etc.
  module_name TEXT NOT NULL, -- which AI module made the decision
  decision_context JSONB NOT NULL, -- situation/context when decision was made
  ai_decision JSONB NOT NULL, -- what AI suggested/did
  
  -- Operator interaction
  operator_action TEXT, -- 'accepted', 'rejected', 'modified', 'ignored'
  operator_change JSONB, -- what operator did instead (if modified/rejected)
  operator_feedback TEXT, -- optional text feedback from operator
  
  -- Outcome tracking
  result TEXT, -- 'success', 'failure', 'partial'
  result_metrics JSONB, -- quantifiable outcomes
  
  -- Pattern detection metadata
  similar_decisions_count INTEGER DEFAULT 0,
  pattern_category TEXT, -- detected pattern category
  insight_generated TEXT, -- human-readable insight
  confidence_score DECIMAL(3,2), -- 0.00-1.00
  
  -- Audit fields
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id TEXT,
  vessel_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_cognitive_feedback_module ON cognitive_feedback(module_name);
CREATE INDEX idx_cognitive_feedback_user ON cognitive_feedback(user_id);
CREATE INDEX idx_cognitive_feedback_operator_action ON cognitive_feedback(operator_action);
CREATE INDEX idx_cognitive_feedback_pattern ON cognitive_feedback(pattern_category);
CREATE INDEX idx_cognitive_feedback_created_at ON cognitive_feedback(created_at DESC);
CREATE INDEX idx_cognitive_feedback_tenant ON cognitive_feedback(tenant_id);
CREATE INDEX idx_cognitive_feedback_vessel ON cognitive_feedback(vessel_id);

-- Enable RLS
ALTER TABLE cognitive_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own feedback"
  ON cognitive_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
  ON cognitive_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON cognitive_feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin policy (users with admin role can see all)
CREATE POLICY "Admins can view all feedback"
  ON cognitive_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cognitive_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER cognitive_feedback_updated_at
  BEFORE UPDATE ON cognitive_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_cognitive_feedback_updated_at();

-- Create view for weekly feedback reports
CREATE OR REPLACE VIEW cognitive_feedback_weekly_report AS
SELECT 
  module_name,
  operator_action,
  pattern_category,
  COUNT(*) as total_interactions,
  AVG(confidence_score) as avg_confidence,
  COUNT(CASE WHEN result = 'success' THEN 1 END) as success_count,
  COUNT(CASE WHEN result = 'failure' THEN 1 END) as failure_count,
  array_agg(DISTINCT insight_generated) FILTER (WHERE insight_generated IS NOT NULL) as insights,
  date_trunc('week', created_at) as week_start
FROM cognitive_feedback
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY module_name, operator_action, pattern_category, date_trunc('week', created_at);
