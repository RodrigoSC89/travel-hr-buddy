-- Create auditoria_comentarios table for audit comments with AI auto-responder
CREATE TABLE IF NOT EXISTS auditoria_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL,
  comentario TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries by auditoria_id
CREATE INDEX IF NOT EXISTS idx_auditoria_comentarios_auditoria_id ON auditoria_comentarios(auditoria_id);

-- Add index for created_at for ordering
CREATE INDEX IF NOT EXISTS idx_auditoria_comentarios_created_at ON auditoria_comentarios(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_auditoria_comentarios_updated_at BEFORE UPDATE ON auditoria_comentarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE auditoria_comentarios ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all comments
CREATE POLICY "Allow authenticated users to read comments" ON auditoria_comentarios
  FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Allow authenticated users to insert comments
CREATE POLICY "Allow authenticated users to insert comments" ON auditoria_comentarios
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR user_id = 'ia-auto-responder');

-- Allow service role to insert AI comments
CREATE POLICY "Allow service role to insert AI comments" ON auditoria_comentarios
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
