-- Create AI interaction logging table
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('chat', 'checklist_generation', 'document_summary', 'other')),
  prompt TEXT NOT NULL,
  response TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  duration_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON ai_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON ai_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_success ON ai_interactions(success);

-- Enable Row Level Security
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own interactions
CREATE POLICY "Users can view their own AI interactions"
  ON ai_interactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own interactions
CREATE POLICY "Users can insert their own AI interactions"
  ON ai_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for admins to view all interactions
CREATE POLICY "Admins can view all AI interactions"
  ON ai_interactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add comment to table
COMMENT ON TABLE ai_interactions IS 'Logs all AI assistant interactions for analytics and debugging';
COMMENT ON COLUMN ai_interactions.interaction_type IS 'Type of AI interaction: chat, checklist_generation, document_summary, other';
COMMENT ON COLUMN ai_interactions.prompt IS 'User input or prompt sent to AI';
COMMENT ON COLUMN ai_interactions.response IS 'AI response or generated content';
COMMENT ON COLUMN ai_interactions.model_used IS 'AI model identifier (e.g., gpt-4o-mini, gpt-4)';
COMMENT ON COLUMN ai_interactions.tokens_used IS 'Number of tokens consumed by the API call';
COMMENT ON COLUMN ai_interactions.duration_ms IS 'Duration of the API call in milliseconds';
COMMENT ON COLUMN ai_interactions.metadata IS 'Additional context: module, context, conversation_id, etc.';
