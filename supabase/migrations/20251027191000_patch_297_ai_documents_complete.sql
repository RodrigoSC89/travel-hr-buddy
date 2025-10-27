-- PATCH 297: AI Documents v1 - Complete Implementation
-- Objective: Complete OCR and NLP document analysis system

-- ============================================
-- AI Document Insights Table
-- ============================================
CREATE TABLE IF NOT EXISTS ai_document_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  analysis_type text NOT NULL CHECK (analysis_type IN ('ocr', 'classification', 'entity_extraction', 'table_extraction', 'date_extraction', 'summary', 'sentiment')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- OCR Results
  extracted_text text,
  ocr_confidence numeric CHECK (ocr_confidence >= 0 AND ocr_confidence <= 1),
  language_detected text,
  
  -- Classification
  document_category text, -- invoice, contract, report, certificate, etc.
  classification_confidence numeric CHECK (classification_confidence >= 0 AND classification_confidence <= 1),
  
  -- Extracted Entities
  entities jsonb DEFAULT '[]'::jsonb, -- Array of {type, value, confidence, position}
  dates jsonb DEFAULT '[]'::jsonb, -- Array of {date, format, confidence, context}
  amounts jsonb DEFAULT '[]'::jsonb, -- Array of {amount, currency, confidence, context}
  
  -- Tables Extracted
  tables jsonb DEFAULT '[]'::jsonb, -- Array of {headers, rows, position, confidence}
  
  -- Document Structure
  structure_data jsonb DEFAULT '{}'::jsonb, -- Page count, sections, headers, etc.
  
  -- Text Highlights
  highlights jsonb DEFAULT '[]'::jsonb, -- Array of {text, page, position, type, confidence}
  
  -- Summary and Keywords
  summary text,
  keywords text[] DEFAULT '{}',
  key_phrases jsonb DEFAULT '[]'::jsonb,
  
  -- Sentiment Analysis
  sentiment text CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
  sentiment_score numeric,
  
  -- Processing Info
  processing_started_at timestamptz,
  processing_completed_at timestamptz,
  processing_duration_ms integer,
  error_message text,
  
  -- AI Model Info
  model_used text,
  model_version text,
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- AI document insights indexes
CREATE INDEX IF NOT EXISTS idx_ai_document_insights_document ON ai_document_insights(document_id);
CREATE INDEX IF NOT EXISTS idx_ai_document_insights_type ON ai_document_insights(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_document_insights_status ON ai_document_insights(status);
CREATE INDEX IF NOT EXISTS idx_ai_document_insights_category ON ai_document_insights(document_category);
CREATE INDEX IF NOT EXISTS idx_ai_document_insights_created ON ai_document_insights(created_at DESC);

-- Full text search on extracted text
CREATE INDEX IF NOT EXISTS idx_ai_document_insights_text_search 
  ON ai_document_insights USING gin(to_tsvector('english', extracted_text));

-- GIN index for JSONB fields
CREATE INDEX IF NOT EXISTS idx_ai_document_insights_entities ON ai_document_insights USING gin(entities);
CREATE INDEX IF NOT EXISTS idx_ai_document_insights_dates ON ai_document_insights USING gin(dates);
CREATE INDEX IF NOT EXISTS idx_ai_document_insights_highlights ON ai_document_insights USING gin(highlights);

-- ============================================
-- Document Processing Queue
-- ============================================
CREATE TABLE IF NOT EXISTS document_processing_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  analysis_types text[] NOT NULL, -- Array of analysis types to perform
  priority integer DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  status text DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  last_attempt_at timestamptz,
  error_message text,
  scheduled_for timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Document processing queue indexes
CREATE INDEX IF NOT EXISTS idx_document_queue_document ON document_processing_queue(document_id);
CREATE INDEX IF NOT EXISTS idx_document_queue_status ON document_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_document_queue_priority ON document_processing_queue(priority DESC, scheduled_for ASC);
CREATE INDEX IF NOT EXISTS idx_document_queue_scheduled ON document_processing_queue(scheduled_for);

-- ============================================
-- Document Search Cache
-- ============================================
CREATE TABLE IF NOT EXISTS document_search_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  searchable_content text NOT NULL,
  content_hash text,
  last_indexed_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(document_id)
);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_document_search_content 
  ON document_search_cache USING gin(to_tsvector('english', searchable_content));

CREATE INDEX IF NOT EXISTS idx_document_search_indexed ON document_search_cache(last_indexed_at DESC);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE ai_document_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_search_cache ENABLE ROW LEVEL SECURITY;

-- AI document insights policies
CREATE POLICY "Allow authenticated users to read AI insights"
  ON ai_document_insights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert AI insights"
  ON ai_document_insights FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update AI insights"
  ON ai_document_insights FOR UPDATE TO authenticated USING (true);

-- Document processing queue policies
CREATE POLICY "Allow authenticated users to read processing queue"
  ON document_processing_queue FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert to queue"
  ON document_processing_queue FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update queue"
  ON document_processing_queue FOR UPDATE TO authenticated USING (true);

-- Document search cache policies
CREATE POLICY "Allow authenticated users to read search cache"
  ON document_search_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert search cache"
  ON document_search_cache FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update search cache"
  ON document_search_cache FOR UPDATE TO authenticated USING (true);

-- ============================================
-- Update Triggers
-- ============================================

CREATE TRIGGER update_ai_document_insights_updated_at BEFORE UPDATE ON ai_document_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Functions
-- ============================================

-- Function to queue document for processing
CREATE OR REPLACE FUNCTION queue_document_for_analysis(
  p_document_id uuid,
  p_analysis_types text[],
  p_priority integer DEFAULT 5
)
RETURNS uuid AS $$
DECLARE
  queue_id uuid;
BEGIN
  INSERT INTO document_processing_queue (
    document_id,
    analysis_types,
    priority,
    status
  ) VALUES (
    p_document_id,
    p_analysis_types,
    p_priority,
    'queued'
  )
  RETURNING id INTO queue_id;
  
  RETURN queue_id;
END;
$$ LANGUAGE plpgsql;

-- Function to search documents by content
CREATE OR REPLACE FUNCTION search_documents_by_content(
  p_search_query text,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  document_id uuid,
  title text,
  rank real,
  highlight text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as document_id,
    d.title,
    ts_rank(to_tsvector('english', dsc.searchable_content), plainto_tsquery('english', p_search_query)) as rank,
    ts_headline('english', dsc.searchable_content, plainto_tsquery('english', p_search_query), 
      'MaxWords=50, MinWords=25, MaxFragments=1') as highlight
  FROM documents d
  INNER JOIN document_search_cache dsc ON d.id = dsc.document_id
  WHERE to_tsvector('english', dsc.searchable_content) @@ plainto_tsquery('english', p_search_query)
  ORDER BY rank DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to update search cache
CREATE OR REPLACE FUNCTION update_document_search_cache(
  p_document_id uuid
)
RETURNS void AS $$
DECLARE
  v_content text;
BEGIN
  -- Combine document title and extracted text from insights
  SELECT 
    d.title || ' ' || COALESCE(string_agg(adi.extracted_text, ' '), '')
  INTO v_content
  FROM documents d
  LEFT JOIN ai_document_insights adi ON d.id = adi.document_id
  WHERE d.id = p_document_id
  GROUP BY d.id, d.title;

  INSERT INTO document_search_cache (document_id, searchable_content, last_indexed_at)
  VALUES (p_document_id, v_content, now())
  ON CONFLICT (document_id) 
  DO UPDATE SET 
    searchable_content = EXCLUDED.searchable_content,
    last_indexed_at = now();
END;
$$ LANGUAGE plpgsql;

-- Function to get document insights summary
CREATE OR REPLACE FUNCTION get_document_insights_summary(p_document_id uuid)
RETURNS jsonb AS $$
DECLARE
  insights jsonb;
BEGIN
  SELECT jsonb_build_object(
    'document_id', p_document_id,
    'has_ocr', EXISTS(SELECT 1 FROM ai_document_insights WHERE document_id = p_document_id AND analysis_type = 'ocr'),
    'has_classification', EXISTS(SELECT 1 FROM ai_document_insights WHERE document_id = p_document_id AND analysis_type = 'classification'),
    'category', (SELECT document_category FROM ai_document_insights WHERE document_id = p_document_id AND analysis_type = 'classification' LIMIT 1),
    'entity_count', (SELECT COUNT(*) FROM ai_document_insights WHERE document_id = p_document_id AND jsonb_array_length(entities) > 0),
    'table_count', (SELECT SUM(jsonb_array_length(tables)) FROM ai_document_insights WHERE document_id = p_document_id),
    'keywords', (SELECT array_agg(DISTINCT k) FROM ai_document_insights, unnest(keywords) k WHERE document_id = p_document_id),
    'processing_status', (
      SELECT jsonb_object_agg(analysis_type, status)
      FROM ai_document_insights
      WHERE document_id = p_document_id
    )
  ) INTO insights;
  
  RETURN insights;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Views
-- ============================================

-- View for document analysis status
CREATE OR REPLACE VIEW v_document_analysis_status AS
SELECT 
  d.id as document_id,
  d.title,
  d.file_type,
  d.created_at as uploaded_at,
  COUNT(DISTINCT adi.id) as insight_count,
  jsonb_object_agg(
    COALESCE(adi.analysis_type, 'none'),
    COALESCE(adi.status, 'not_started')
  ) FILTER (WHERE adi.analysis_type IS NOT NULL) as analysis_status,
  MAX(adi.created_at) as last_analysis_at,
  BOOL_OR(dpq.status = 'queued') as has_pending_analysis
FROM documents d
LEFT JOIN ai_document_insights adi ON d.id = adi.document_id
LEFT JOIN document_processing_queue dpq ON d.id = dpq.document_id AND dpq.status IN ('queued', 'processing')
GROUP BY d.id, d.title, d.file_type, d.created_at;

-- View for searchable documents
CREATE OR REPLACE VIEW v_searchable_documents AS
SELECT 
  d.id,
  d.title,
  d.file_type,
  d.file_size,
  adi.extracted_text,
  adi.document_category,
  adi.keywords,
  adi.summary,
  adi.entities,
  adi.dates,
  d.created_at,
  d.created_by
FROM documents d
INNER JOIN ai_document_insights adi ON d.id = adi.document_id
WHERE adi.status = 'completed' AND adi.extracted_text IS NOT NULL;

-- ============================================
-- Sample Data
-- ============================================

-- Note: Sample data will be created when documents are uploaded

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE ai_document_insights IS 'AI-powered document analysis results including OCR, classification, and entity extraction';
COMMENT ON TABLE document_processing_queue IS 'Queue for document processing tasks';
COMMENT ON TABLE document_search_cache IS 'Cached searchable content for fast full-text search';
COMMENT ON FUNCTION queue_document_for_analysis IS 'Add a document to the processing queue';
COMMENT ON FUNCTION search_documents_by_content IS 'Search documents by their content with ranking';
COMMENT ON VIEW v_document_analysis_status IS 'Overview of document analysis status';
COMMENT ON VIEW v_searchable_documents IS 'Documents with completed AI analysis for searching';
