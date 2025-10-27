-- PATCH 283: Vault AI with Vector Search
-- Enable pgvector and create vector search infrastructure

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vault_documents table with embeddings
CREATE TABLE IF NOT EXISTS public.vault_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT CHECK (document_type IN ('manual', 'procedure', 'regulation', 'report', 'technical', 'safety', 'other')),
  file_path TEXT,
  file_size INTEGER,
  mime_type TEXT,
  embedding vector(1536), -- OpenAI ada-002 embeddings size
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  version TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'published',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create vault_search_logs table
CREATE TABLE IF NOT EXISTS public.vault_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  query TEXT NOT NULL,
  query_embedding vector(1536),
  results_count INTEGER DEFAULT 0,
  top_result_id UUID REFERENCES public.vault_documents(id) ON DELETE SET NULL,
  top_result_score NUMERIC,
  search_type TEXT CHECK (search_type IN ('semantic', 'keyword', 'hybrid')) DEFAULT 'semantic',
  filters JSONB DEFAULT '{}'::jsonb,
  response_time_ms INTEGER,
  llm_used BOOLEAN DEFAULT false,
  llm_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create vault_document_chunks table for better retrieval
CREATE TABLE IF NOT EXISTS public.vault_document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.vault_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  token_count INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for vector similarity search
CREATE INDEX IF NOT EXISTS idx_vault_documents_embedding ON public.vault_documents 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_vault_document_chunks_embedding ON public.vault_document_chunks 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create regular indexes
CREATE INDEX IF NOT EXISTS idx_vault_documents_type ON public.vault_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_vault_documents_status ON public.vault_documents(status);
CREATE INDEX IF NOT EXISTS idx_vault_documents_category ON public.vault_documents(category);
CREATE INDEX IF NOT EXISTS idx_vault_documents_created ON public.vault_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vault_search_logs_user ON public.vault_search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_search_logs_created ON public.vault_search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vault_document_chunks_document ON public.vault_document_chunks(document_id);

-- Enable Row Level Security
ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_document_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vault_documents
CREATE POLICY "Users can view published documents"
  ON public.vault_documents FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'published');

CREATE POLICY "Users can manage their own documents"
  ON public.vault_documents FOR ALL
  USING (auth.uid() = created_by);

-- RLS Policies for vault_search_logs
CREATE POLICY "Users can view their own search logs"
  ON public.vault_search_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create search logs"
  ON public.vault_search_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for vault_document_chunks
CREATE POLICY "Users can view chunks of published documents"
  ON public.vault_document_chunks FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.vault_documents
      WHERE id = vault_document_chunks.document_id
      AND status = 'published'
    )
  );

-- Function for semantic similarity search
CREATE OR REPLACE FUNCTION search_vault_documents(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10,
  filter_type TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  document_type TEXT,
  category TEXT,
  similarity FLOAT,
  metadata JSONB
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
    d.metadata
  FROM public.vault_documents d
  WHERE 
    d.status = 'published'
    AND (filter_type IS NULL OR d.document_type = filter_type)
    AND (filter_category IS NULL OR d.category = filter_category)
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function for chunk-based semantic search (more granular)
CREATE OR REPLACE FUNCTION search_vault_chunks(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 20,
  filter_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  document_title TEXT,
  chunk_content TEXT,
  document_type TEXT,
  similarity FLOAT,
  chunk_index INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS chunk_id,
    c.document_id,
    d.title AS document_title,
    c.content AS chunk_content,
    d.document_type,
    1 - (c.embedding <=> query_embedding) AS similarity,
    c.chunk_index
  FROM public.vault_document_chunks c
  JOIN public.vault_documents d ON c.document_id = d.id
  WHERE 
    d.status = 'published'
    AND (filter_type IS NULL OR d.document_type = filter_type)
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get document recommendations based on similarity
CREATE OR REPLACE FUNCTION get_similar_documents(
  document_id UUID,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  document_type TEXT,
  similarity FLOAT
) AS $$
DECLARE
  doc_embedding vector(1536);
BEGIN
  -- Get the embedding of the source document
  SELECT embedding INTO doc_embedding
  FROM public.vault_documents
  WHERE public.vault_documents.id = document_id;
  
  IF doc_embedding IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.document_type,
    1 - (d.embedding <=> doc_embedding) AS similarity
  FROM public.vault_documents d
  WHERE 
    d.status = 'published'
    AND d.id != document_id
  ORDER BY d.embedding <=> doc_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate document statistics
CREATE OR REPLACE FUNCTION get_vault_statistics()
RETURNS JSONB AS $$
DECLARE
  total_documents INTEGER;
  total_searches INTEGER;
  avg_search_results NUMERIC;
  top_document_types JSONB;
  recent_searches INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_documents
  FROM public.vault_documents
  WHERE status = 'published';
  
  SELECT COUNT(*) INTO total_searches
  FROM public.vault_search_logs;
  
  SELECT AVG(results_count) INTO avg_search_results
  FROM public.vault_search_logs;
  
  SELECT COUNT(*) INTO recent_searches
  FROM public.vault_search_logs
  WHERE created_at >= now() - INTERVAL '7 days';
  
  SELECT jsonb_agg(
    jsonb_build_object(
      'type', document_type,
      'count', count
    )
  ) INTO top_document_types
  FROM (
    SELECT document_type, COUNT(*) as count
    FROM public.vault_documents
    WHERE status = 'published'
    GROUP BY document_type
    ORDER BY count DESC
    LIMIT 5
  ) t;
  
  RETURN jsonb_build_object(
    'total_documents', total_documents,
    'total_searches', total_searches,
    'avg_search_results', ROUND(avg_search_results, 2),
    'recent_searches_7d', recent_searches,
    'top_document_types', COALESCE(top_document_types, '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql;

-- Update timestamps trigger
DROP TRIGGER IF EXISTS set_vault_documents_updated_at ON public.vault_documents;
CREATE TRIGGER set_vault_documents_updated_at
  BEFORE UPDATE ON public.vault_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
