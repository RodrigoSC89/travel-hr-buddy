-- Create auditorias_imca table for IMCA technical audits
CREATE TABLE IF NOT EXISTS auditorias_imca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_navio TEXT NOT NULL,
  contexto TEXT NOT NULL,
  relatorio TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE auditorias_imca ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own audits
CREATE POLICY "Users can view their own audits"
  ON auditorias_imca
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own audits
CREATE POLICY "Users can insert their own audits"
  ON auditorias_imca
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own audits
CREATE POLICY "Users can update their own audits"
  ON auditorias_imca
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own audits
CREATE POLICY "Users can delete their own audits"
  ON auditorias_imca
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_auditorias_imca_user_id ON auditorias_imca(user_id);
CREATE INDEX idx_auditorias_imca_created_at ON auditorias_imca(created_at DESC);
CREATE INDEX idx_auditorias_imca_nome_navio ON auditorias_imca(nome_navio);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_auditorias_imca_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_auditorias_imca_updated_at
  BEFORE UPDATE ON auditorias_imca
  FOR EACH ROW
  EXECUTE FUNCTION update_auditorias_imca_updated_at();
