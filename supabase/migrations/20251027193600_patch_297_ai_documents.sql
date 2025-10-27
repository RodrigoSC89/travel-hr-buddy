-- PATCH 297: AI Documents
-- OCR-powered document analysis with entity extraction and classification

-- ============================================
-- AI Document Insights Table
-- ============================================
CREATE TABLE IF NOT EXISTS ai_document_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  extracted_text text,
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1),
  classification text, -- e.g., 'invoice', 'contract', 'report', 'certificate'
  entities jsonb DEFAULT '[]'::jsonb, -- Array of {type, value, confidence} - emails, phones, amounts, etc.
  dates jsonb DEFAULT '[]'::jsonb, -- Array of {date, format, context}
  tables jsonb DEFAULT '[]'::jsonb, -- Array of detected table structures
  highlights jsonb DEFAULT '[]'::jsonb, -- Array of {text, position, relevance}
  keywords jsonb DEFAULT '[]'::jsonb, -- Array of important keywords
  summary text,
  language text,
  processing_time_ms integer,
  ocr_engine text DEFAULT 'tesseract',
  model_version text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_document_insights_document ON ai_document_insights(document_id);
CREATE INDEX IF NOT EXISTS idx_ai_document_insights_classification ON ai_document_insights(classification);
CREATE INDEX IF NOT EXISTS idx_ai_document_insights_created ON ai_document_insights(created_at DESC);

-- GIN index for full-text search on extracted text
CREATE INDEX IF NOT EXISTS idx_ai_document_insights_text_search 
  ON ai_document_insights USING gin(to_tsvector('english', extracted_text));

-- ============================================
-- Document Processing Queue Table
-- ============================================
CREATE TABLE IF NOT EXISTS document_processing_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  status text DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'retry')),
  priority integer DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_processing_queue_status ON document_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_document_processing_queue_priority ON document_processing_queue(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_document_processing_queue_document ON document_processing_queue(document_id);

-- Function to queue document for analysis
CREATE OR REPLACE FUNCTION queue_document_for_analysis(
  p_document_id uuid,
  p_priority integer DEFAULT 5
)
RETURNS uuid AS $$
DECLARE
  queue_id uuid;
BEGIN
  INSERT INTO document_processing_queue (
    document_id,
    priority,
    status
  ) VALUES (
    p_document_id,
    p_priority,
    'queued'
  )
  RETURNING id INTO queue_id;
  
  RETURN queue_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically queue new documents
CREATE OR REPLACE FUNCTION auto_queue_document()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue documents that support OCR
  IF NEW.mime_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') THEN
    PERFORM queue_document_for_analysis(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_queue_document
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION auto_queue_document();

-- ============================================
-- Document Search Cache Table
-- ============================================
CREATE TABLE IF NOT EXISTS document_search_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query text NOT NULL,
  search_hash text UNIQUE NOT NULL, -- Hash of the search query for quick lookup
  results jsonb DEFAULT '[]'::jsonb, -- Array of document IDs and scores
  result_count integer DEFAULT 0,
  search_filters jsonb DEFAULT '{}'::jsonb,
  expires_at timestamptz DEFAULT (now() + interval '1 hour'),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_search_cache_hash ON document_search_cache(search_hash);
CREATE INDEX IF NOT EXISTS idx_document_search_cache_expires ON document_search_cache(expires_at);

-- Function to search documents by content
CREATE OR REPLACE FUNCTION search_documents_by_content(
  p_search_query text,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  document_id uuid,
  document_name text,
  extracted_text text,
  relevance real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as document_id,
    d.name as document_name,
    adi.extracted_text,
    ts_rank(
      to_tsvector('english', adi.extracted_text),
      plainto_tsquery('english', p_search_query)
    ) as relevance
  FROM documents d
  INNER JOIN ai_document_insights adi ON d.id = adi.document_id
  WHERE to_tsvector('english', adi.extracted_text) @@ plainto_tsquery('english', p_search_query)
  ORDER BY relevance DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_search_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM document_search_cache
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE ai_document_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_search_cache ENABLE ROW LEVEL SECURITY;

-- AI document insights policies
CREATE POLICY "Users can view document insights"
  ON ai_document_insights FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage document insights"
  ON ai_document_insights FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Document processing queue policies
CREATE POLICY "Users can view processing queue"
  ON document_processing_queue FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage processing queue"
  ON document_processing_queue FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Document search cache policies
CREATE POLICY "Users can view search cache"
  ON document_search_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage search cache"
  ON document_search_cache FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON ai_document_insights TO authenticated;
GRANT ALL ON document_processing_queue TO authenticated;
GRANT ALL ON document_search_cache TO authenticated;

COMMENT ON TABLE ai_document_insights IS 'PATCH 297: OCR results and AI-powered document analysis';
COMMENT ON TABLE document_processing_queue IS 'PATCH 297: Async document processing queue with retry logic';
COMMENT ON TABLE document_search_cache IS 'PATCH 297: Full-text search cache with GIN indexes';
