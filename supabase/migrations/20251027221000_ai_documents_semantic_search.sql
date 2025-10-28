-- PATCH 330: Add semantic search support for AI Documents
-- Create extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to ai_generated_documents
ALTER TABLE IF EXISTS ai_generated_documents 
ADD COLUMN IF NOT EXISTS content_embedding vector(1536);

-- Create index for faster similarity search
CREATE INDEX IF NOT EXISTS ai_documents_embedding_idx 
ON ai_generated_documents USING ivfflat (content_embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to perform semantic search
CREATE OR REPLACE FUNCTION search_documents_by_similarity(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  extracted_text text,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ai_generated_documents.id,
    ai_generated_documents.title,
    ai_generated_documents.extracted_text,
    1 - (ai_generated_documents.content_embedding <=> query_embedding) AS similarity
  FROM ai_generated_documents
  WHERE ai_generated_documents.content_embedding IS NOT NULL
    AND 1 - (ai_generated_documents.content_embedding <=> query_embedding) > match_threshold
  ORDER BY ai_generated_documents.content_embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get document recommendations
CREATE OR REPLACE FUNCTION get_similar_documents(
  document_id uuid,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  similarity float
) AS $$
DECLARE
  query_embedding vector(1536);
BEGIN
  -- Get the embedding of the source document
  SELECT content_embedding INTO query_embedding
  FROM ai_generated_documents
  WHERE ai_generated_documents.id = document_id;

  IF query_embedding IS NULL THEN
    RETURN;
  END IF;

  -- Find similar documents
  RETURN QUERY
  SELECT
    ai_generated_documents.id,
    ai_generated_documents.title,
    1 - (ai_generated_documents.content_embedding <=> query_embedding) AS similarity
  FROM ai_generated_documents
  WHERE ai_generated_documents.id != document_id
    AND ai_generated_documents.content_embedding IS NOT NULL
  ORDER BY ai_generated_documents.content_embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Add metadata for document classification
ALTER TABLE IF EXISTS ai_generated_documents
ADD COLUMN IF NOT EXISTS document_category text,
ADD COLUMN IF NOT EXISTS document_tags text[],
ADD COLUMN IF NOT EXISTS classification_confidence numeric;

-- Create index for category and tags
CREATE INDEX IF NOT EXISTS idx_ai_documents_category ON ai_generated_documents(document_category);
CREATE INDEX IF NOT EXISTS idx_ai_documents_tags ON ai_generated_documents USING GIN(document_tags);

-- Function to auto-classify documents based on content
CREATE OR REPLACE FUNCTION classify_document()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple keyword-based classification
  IF NEW.extracted_text IS NOT NULL THEN
    -- Safety & Compliance
    IF NEW.extracted_text ~* 'safety|incident|accident|hazard|risk|sgso|ism' THEN
      NEW.document_category = 'safety_compliance';
      NEW.classification_confidence = 0.8;
    -- Operations
    ELSIF NEW.extracted_text ~* 'voyage|navigation|route|fuel|cargo|port' THEN
      NEW.document_category = 'operations';
      NEW.classification_confidence = 0.75;
    -- Maintenance
    ELSIF NEW.extracted_text ~* 'maintenance|repair|equipment|engine|system|inspection' THEN
      NEW.document_category = 'maintenance';
      NEW.classification_confidence = 0.75;
    -- Administration
    ELSIF NEW.extracted_text ~* 'contract|invoice|payment|administration|personnel' THEN
      NEW.document_category = 'administration';
      NEW.classification_confidence = 0.7;
    -- Training
    ELSIF NEW.extracted_text ~* 'training|course|certification|qualification' THEN
      NEW.document_category = 'training';
      NEW.classification_confidence = 0.8;
    ELSE
      NEW.document_category = 'general';
      NEW.classification_confidence = 0.5;
    END IF;
    
    -- Extract potential tags (simple keyword extraction)
    NEW.document_tags = ARRAY(
      SELECT DISTINCT unnest(regexp_matches(NEW.extracted_text, 
        '\b(vessel|safety|maintenance|fuel|cargo|crew|port|navigation|engine|inspection)\b', 'gi'))
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-classification
DROP TRIGGER IF EXISTS auto_classify_document ON ai_generated_documents;
CREATE TRIGGER auto_classify_document
  BEFORE INSERT OR UPDATE OF extracted_text
  ON ai_generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION classify_document();

COMMENT ON FUNCTION search_documents_by_similarity IS 'Semantic search for documents using vector similarity';
COMMENT ON FUNCTION get_similar_documents IS 'Get documents similar to a given document';
COMMENT ON FUNCTION classify_document IS 'Automatically classify documents based on content';
