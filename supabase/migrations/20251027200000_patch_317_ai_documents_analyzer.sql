-- PATCH 317: AI Documents Analyzer with OCR
-- Objective: Complete AI-powered document analysis with OCR capabilities

-- ============================================
-- AI Documents Table
-- ============================================
CREATE TABLE IF NOT EXISTS ai_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_name text NOT NULL,
  file_path text,
  file_url text,
  file_type text NOT NULL CHECK (file_type IN ('pdf', 'image', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff')),
  file_size numeric CHECK (file_size >= 0),
  
  -- OCR Processing
  ocr_status text DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  ocr_started_at timestamptz,
  ocr_completed_at timestamptz,
  ocr_error text,
  extracted_text text,
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Document Classification
  document_category text CHECK (document_category IN ('invoice', 'receipt', 'contract', 'certificate', 'report', 'form', 'letter', 'other')),
  ai_classification jsonb DEFAULT '{}'::jsonb,
  
  -- Metadata
  page_count integer CHECK (page_count >= 0),
  language text DEFAULT 'en',
  upload_source text DEFAULT 'manual' CHECK (upload_source IN ('manual', 'email', 'api', 'scanner', 'mobile')),
  
  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  is_processed boolean DEFAULT false,
  processing_duration_ms numeric,
  
  -- Audit
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  metadata jsonb DEFAULT '{}'::jsonb
);

-- ============================================
-- Document Entities Table (Extracted Information)
-- ============================================
CREATE TABLE IF NOT EXISTS document_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES ai_documents(id) ON DELETE CASCADE,
  
  -- Entity Information
  entity_type text NOT NULL CHECK (entity_type IN (
    'name', 'date', 'amount', 'email', 'phone', 'address', 
    'company', 'tax_id', 'invoice_number', 'po_number', 
    'account_number', 'vessel_name', 'imo_number', 'custom'
  )),
  entity_value text NOT NULL,
  entity_label text, -- Human-readable label
  
  -- Location in Document
  page_number integer,
  position_x numeric,
  position_y numeric,
  bounding_box jsonb, -- {x, y, width, height}
  
  -- Confidence
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 100),
  extraction_method text CHECK (extraction_method IN ('ocr', 'ai', 'pattern', 'manual')),
  
  -- Validation
  is_validated boolean DEFAULT false,
  validated_by uuid REFERENCES auth.users(id),
  validated_at timestamptz,
  validation_notes text,
  
  -- Context
  context_before text, -- Text before the entity
  context_after text, -- Text after the entity
  
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- ============================================
-- AI Extractions Table (Structured Data)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_extractions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES ai_documents(id) ON DELETE CASCADE,
  
  -- Extraction Details
  extraction_type text NOT NULL CHECK (extraction_type IN (
    'invoice_data', 'contact_info', 'financial_data', 
    'vessel_info', 'crew_data', 'compliance_data', 'custom'
  )),
  
  -- Extracted structured data
  structured_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- AI Analysis
  ai_model text DEFAULT 'gpt-4',
  ai_prompt text,
  ai_response jsonb,
  processing_time_ms numeric,
  
  -- Quality Metrics
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 100),
  data_quality_score numeric CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
  completeness_percentage numeric CHECK (completeness_percentage >= 0 AND completeness_percentage <= 100),
  
  -- Status
  status text DEFAULT 'extracted' CHECK (status IN ('extracted', 'validated', 'rejected', 'revised')),
  validation_status text CHECK (validation_status IN ('pending', 'approved', 'rejected')),
  
  -- Audit
  extracted_by uuid REFERENCES auth.users(id),
  validated_by uuid REFERENCES auth.users(id),
  extracted_at timestamptz DEFAULT now(),
  validated_at timestamptz,
  
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- Document Search Index Table
-- ============================================
CREATE TABLE IF NOT EXISTS document_search_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES ai_documents(id) ON DELETE CASCADE,
  
  -- Searchable Content
  searchable_text text NOT NULL,
  search_vector tsvector,
  
  -- Metadata for search
  keywords text[],
  tags text[],
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================

-- AI Documents indexes
CREATE INDEX IF NOT EXISTS idx_ai_documents_status ON ai_documents(ocr_status);
CREATE INDEX IF NOT EXISTS idx_ai_documents_type ON ai_documents(file_type);
CREATE INDEX IF NOT EXISTS idx_ai_documents_category ON ai_documents(document_category);
CREATE INDEX IF NOT EXISTS idx_ai_documents_uploaded_by ON ai_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_ai_documents_created_at ON ai_documents(created_at DESC);

-- Document Entities indexes
CREATE INDEX IF NOT EXISTS idx_document_entities_document ON document_entities(document_id);
CREATE INDEX IF NOT EXISTS idx_document_entities_type ON document_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_document_entities_value ON document_entities(entity_value);

-- AI Extractions indexes
CREATE INDEX IF NOT EXISTS idx_ai_extractions_document ON ai_extractions(document_id);
CREATE INDEX IF NOT EXISTS idx_ai_extractions_type ON ai_extractions(extraction_type);
CREATE INDEX IF NOT EXISTS idx_ai_extractions_status ON ai_extractions(status);

-- Search indexes
CREATE INDEX IF NOT EXISTS idx_document_search_document ON document_search_index(document_id);
CREATE INDEX IF NOT EXISTS idx_document_search_vector ON document_search_index USING gin(search_vector);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE ai_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_search_index ENABLE ROW LEVEL SECURITY;

-- AI Documents policies
CREATE POLICY "Authenticated users can read ai_documents"
  ON ai_documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert ai_documents"
  ON ai_documents FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Authenticated users can update their ai_documents"
  ON ai_documents FOR UPDATE TO authenticated 
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Authenticated users can delete their ai_documents"
  ON ai_documents FOR DELETE TO authenticated 
  USING (auth.uid() = uploaded_by);

-- Document Entities policies
CREATE POLICY "Authenticated users can read document_entities"
  ON document_entities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert document_entities"
  ON document_entities FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update document_entities"
  ON document_entities FOR UPDATE TO authenticated USING (true);

-- AI Extractions policies
CREATE POLICY "Authenticated users can read ai_extractions"
  ON ai_extractions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert ai_extractions"
  ON ai_extractions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update ai_extractions"
  ON ai_extractions FOR UPDATE TO authenticated USING (true);

-- Document Search Index policies
CREATE POLICY "Authenticated users can read document_search_index"
  ON document_search_index FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert document_search_index"
  ON document_search_index FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- Triggers
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_documents_timestamp
  BEFORE UPDATE ON ai_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_documents_updated_at();

CREATE TRIGGER update_ai_extractions_timestamp
  BEFORE UPDATE ON ai_extractions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_documents_updated_at();

-- Auto-create search index when document is processed
CREATE OR REPLACE FUNCTION create_document_search_index()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.extracted_text IS NOT NULL AND NEW.is_processed = true THEN
    INSERT INTO document_search_index (document_id, searchable_text, search_vector)
    VALUES (
      NEW.id,
      COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.extracted_text, ''),
      to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.extracted_text, ''))
    )
    ON CONFLICT (document_id) DO UPDATE
    SET 
      searchable_text = EXCLUDED.searchable_text,
      search_vector = EXCLUDED.search_vector,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_search_index_on_process
  AFTER INSERT OR UPDATE ON ai_documents
  FOR EACH ROW
  EXECUTE FUNCTION create_document_search_index();

-- ============================================
-- Functions
-- ============================================

-- Function to search documents
CREATE OR REPLACE FUNCTION search_documents(
  p_query text,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  document_id uuid,
  title text,
  file_name text,
  relevance real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.file_name,
    ts_rank(s.search_vector, plainto_tsquery('english', p_query)) as relevance
  FROM ai_documents d
  INNER JOIN document_search_index s ON d.id = s.document_id
  WHERE s.search_vector @@ plainto_tsquery('english', p_query)
  ORDER BY relevance DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get document statistics
CREATE OR REPLACE FUNCTION get_document_statistics()
RETURNS TABLE (
  total_documents bigint,
  processed_documents bigint,
  pending_documents bigint,
  failed_documents bigint,
  total_entities_extracted bigint,
  avg_confidence_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_documents,
    COUNT(*) FILTER (WHERE ocr_status = 'completed')::bigint as processed_documents,
    COUNT(*) FILTER (WHERE ocr_status = 'pending')::bigint as pending_documents,
    COUNT(*) FILTER (WHERE ocr_status = 'failed')::bigint as failed_documents,
    (SELECT COUNT(*)::bigint FROM document_entities) as total_entities_extracted,
    AVG(confidence_score) as avg_confidence_score
  FROM ai_documents;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Views
-- ============================================

-- View for document overview with entity counts
CREATE OR REPLACE VIEW documents_with_entities AS
SELECT 
  d.id,
  d.title,
  d.file_name,
  d.file_type,
  d.ocr_status,
  d.document_category,
  d.confidence_score,
  d.created_at,
  COUNT(DISTINCT e.id) as entity_count,
  COUNT(DISTINCT ex.id) as extraction_count
FROM ai_documents d
LEFT JOIN document_entities e ON d.id = e.document_id
LEFT JOIN ai_extractions ex ON d.id = ex.document_id
WHERE d.status = 'active'
GROUP BY d.id, d.title, d.file_name, d.file_type, d.ocr_status, d.document_category, d.confidence_score, d.created_at;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE ai_documents IS 'AI-powered document storage with OCR capabilities';
COMMENT ON TABLE document_entities IS 'Extracted entities from documents (names, dates, amounts, etc.)';
COMMENT ON TABLE ai_extractions IS 'Structured data extractions from documents';
COMMENT ON TABLE document_search_index IS 'Full-text search index for documents';
