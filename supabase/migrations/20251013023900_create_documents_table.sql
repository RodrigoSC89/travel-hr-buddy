-- Create documents table for collaborative editing
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view all documents
CREATE POLICY "Allow authenticated users to view documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to create documents
CREATE POLICY "Allow authenticated users to create documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update documents
CREATE POLICY "Allow authenticated users to update documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete documents
CREATE POLICY "Allow authenticated users to delete documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index on updated_at for performance
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);

-- Create index on updated_by for performance
CREATE INDEX IF NOT EXISTS idx_documents_updated_by ON documents(updated_by);
