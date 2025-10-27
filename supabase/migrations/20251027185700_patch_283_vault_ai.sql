-- PATCH 283: Vault AI - Semantic Document Search with pgvector
-- Advanced document search using vector embeddings and similarity search

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- Vault Documents Table with Vector Embeddings
-- ============================================
CREATE TABLE IF NOT EXISTS vault_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  document_type text CHECK (document_type IN ('policy', 'procedure', 'manual', 'report', 'contract', 'specification', 'other')),
  file_url text,
  file_size integer,
  file_type text,
  embedding vector(1536), -- OpenAI ada-002 embeddings dimension
  chunk_count integer DEFAULT 0,
  category text,
  tags text[] DEFAULT ARRAY[]::text[],
  author_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  version integer DEFAULT 1,
  parent_document_id uuid REFERENCES vault_documents(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  indexed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vault_documents_type ON vault_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_vault_documents_category ON vault_documents(category);
CREATE INDEX IF NOT EXISTS idx_vault_documents_status ON vault_documents(status);
CREATE INDEX IF NOT EXISTS idx_vault_documents_author ON vault_documents(author_id);
CREATE INDEX IF NOT EXISTS idx_vault_documents_tags ON vault_documents USING GIN(tags);

-- Create IVFFlat index for vector similarity search
-- IVFFlat provides fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_vault_documents_embedding 
  ON vault_documents 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- Vault Document Chunks Table
-- ============================================
CREATE TABLE IF NOT EXISTS vault_document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES vault_documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  token_count integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vault_document_chunks_document ON vault_document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_vault_document_chunks_index ON vault_document_chunks(chunk_index);

-- Create IVFFlat index for chunk embeddings
CREATE INDEX IF NOT EXISTS idx_vault_document_chunks_embedding 
  ON vault_document_chunks 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- Vault Search Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS vault_search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  query text NOT NULL,
  query_embedding vector(1536),
  results_count integer,
  top_result_id uuid REFERENCES vault_documents(id) ON DELETE SET NULL,
  top_similarity_score numeric,
  search_duration_ms numeric,
  used_llm boolean DEFAULT false,
  llm_response text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vault_search_logs_user ON vault_search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_search_logs_date ON vault_search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vault_search_logs_llm ON vault_search_logs(used_llm);

-- ============================================
-- Function: Search Vault Documents by Similarity
-- ============================================
CREATE OR REPLACE FUNCTION search_vault_documents(
  query_embedding vector(1536),
  match_threshold numeric DEFAULT 0.7,
  match_count integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  document_type text,
  category text,
  similarity numeric,
  metadata jsonb,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.content,
    d.document_type,
    d.category,
    1 - (d.embedding <=> query_embedding) AS similarity,
    d.metadata,
    d.created_at
  FROM vault_documents d
  WHERE d.embedding IS NOT NULL
    AND d.status = 'active'
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Function: Search Vault Document Chunks by Similarity
-- ============================================
CREATE OR REPLACE FUNCTION search_vault_chunks(
  query_embedding vector(1536),
  match_threshold numeric DEFAULT 0.7,
  match_count integer DEFAULT 20
)
RETURNS TABLE (
  chunk_id uuid,
  document_id uuid,
  document_title text,
  chunk_content text,
  chunk_index integer,
  similarity numeric,
  metadata jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS chunk_id,
    c.document_id,
    d.title AS document_title,
    c.content AS chunk_content,
    c.chunk_index,
    1 - (c.embedding <=> query_embedding) AS similarity,
    c.metadata
  FROM vault_document_chunks c
  JOIN vault_documents d ON d.id = c.document_id
  WHERE c.embedding IS NOT NULL
    AND d.status = 'active'
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Function: Update Document Embedding
-- ============================================
CREATE OR REPLACE FUNCTION update_document_embedding()
RETURNS TRIGGER AS $$
BEGIN
  -- Update indexed_at timestamp when embedding is set
  IF NEW.embedding IS NOT NULL AND (OLD.embedding IS NULL OR OLD.embedding <> NEW.embedding) THEN
    NEW.indexed_at := now();
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_document_embedding
  BEFORE UPDATE ON vault_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_document_embedding();

-- ============================================
-- Function: Update Chunk Count
-- ============================================
CREATE OR REPLACE FUNCTION update_document_chunk_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vault_documents
  SET chunk_count = (
    SELECT COUNT(*)
    FROM vault_document_chunks
    WHERE document_id = COALESCE(NEW.document_id, OLD.document_id)
  )
  WHERE id = COALESCE(NEW.document_id, OLD.document_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chunk_count_insert
  AFTER INSERT ON vault_document_chunks
  FOR EACH ROW
  EXECUTE FUNCTION update_document_chunk_count();

CREATE TRIGGER trigger_update_chunk_count_delete
  AFTER DELETE ON vault_document_chunks
  FOR EACH ROW
  EXECUTE FUNCTION update_document_chunk_count();

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_search_logs ENABLE ROW LEVEL SECURITY;

-- Vault documents policies
CREATE POLICY "Users can view active documents"
  ON vault_documents FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Users can manage their own documents"
  ON vault_documents FOR ALL
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Admins can manage all documents"
  ON vault_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Vault document chunks policies
CREATE POLICY "Users can view chunks of active documents"
  ON vault_document_chunks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vault_documents
      WHERE id = vault_document_chunks.document_id
      AND status = 'active'
    )
  );

CREATE POLICY "Users can manage chunks of their documents"
  ON vault_document_chunks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vault_documents
      WHERE id = vault_document_chunks.document_id
      AND author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vault_documents
      WHERE id = vault_document_chunks.document_id
      AND author_id = auth.uid()
    )
  );

-- Vault search logs policies
CREATE POLICY "Users can view their own search logs"
  ON vault_search_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create search logs"
  ON vault_search_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON vault_documents TO authenticated;
GRANT ALL ON vault_document_chunks TO authenticated;
GRANT ALL ON vault_search_logs TO authenticated;
GRANT EXECUTE ON FUNCTION search_vault_documents TO authenticated;
GRANT EXECUTE ON FUNCTION search_vault_chunks TO authenticated;

COMMENT ON TABLE vault_documents IS 'PATCH 283: Document storage with vector embeddings for semantic search';
COMMENT ON TABLE vault_document_chunks IS 'PATCH 283: Document chunks for granular semantic search';
COMMENT ON TABLE vault_search_logs IS 'PATCH 283: Search query logs and analytics';
COMMENT ON FUNCTION search_vault_documents IS 'PATCH 283: Semantic search using cosine similarity on document embeddings';
COMMENT ON FUNCTION search_vault_chunks IS 'PATCH 283: Semantic search on document chunks for granular results';
