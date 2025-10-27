-- PATCH 309: AI Documents v1 - OCR and NLP Analysis
-- Create tables for AI-powered document analysis with OCR and keyword extraction

-- 1. AI Documents Table
CREATE TABLE IF NOT EXISTS public.ai_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('pdf', 'image', 'word', 'excel', 'other')),
  file_size_bytes BIGINT,
  
  -- OCR and Analysis
  ocr_text TEXT,
  ocr_status TEXT DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
  ocr_completed_at TIMESTAMPTZ,
  
  -- NLP Analysis
  extracted_keywords JSONB DEFAULT '[]'::jsonb,
  entities JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  language TEXT DEFAULT 'pt',
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Classification
  category TEXT,
  tags TEXT[],
  
  -- Metadata
  uploaded_by UUID REFERENCES auth.users(id),
  vessel_id UUID REFERENCES vessels(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Document Analysis Logs Table
CREATE TABLE IF NOT EXISTS public.document_analysis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.ai_documents(id) ON DELETE CASCADE,
  
  -- Analysis Details
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('ocr', 'nlp', 'classification', 'entity_extraction', 'summarization')),
  analysis_status TEXT NOT NULL CHECK (analysis_status IN ('started', 'in_progress', 'completed', 'failed')),
  
  -- Results
  results JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  processing_time_ms INT,
  
  -- AI Model Info
  model_used TEXT,
  model_version TEXT,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Audit
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Document Keywords Table (for better search)
CREATE TABLE IF NOT EXISTS public.document_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.ai_documents(id) ON DELETE CASCADE,
  
  keyword TEXT NOT NULL,
  relevance_score NUMERIC CHECK (relevance_score >= 0 AND relevance_score <= 100),
  category TEXT,
  position_in_text INT,
  context_snippet TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(document_id, keyword)
);

-- Enable RLS
ALTER TABLE public.ai_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_keywords ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_documents
CREATE POLICY "Users can view ai_documents"
  ON public.ai_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upload ai_documents"
  ON public.ai_documents FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update their own ai_documents"
  ON public.ai_documents FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- RLS Policies for document_analysis_logs
CREATE POLICY "Users can view analysis logs"
  ON public.document_analysis_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert analysis logs"
  ON public.document_analysis_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for document_keywords
CREATE POLICY "Users can view keywords"
  ON public.document_keywords FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage keywords"
  ON public.document_keywords FOR ALL
  TO authenticated
  USING (true);

-- Indexes
CREATE INDEX idx_ai_documents_status ON public.ai_documents(ocr_status);
CREATE INDEX idx_ai_documents_category ON public.ai_documents(category);
CREATE INDEX idx_ai_documents_vessel ON public.ai_documents(vessel_id);
CREATE INDEX idx_ai_documents_uploaded_by ON public.ai_documents(uploaded_by);
CREATE INDEX idx_ai_documents_created_at ON public.ai_documents(created_at DESC);

CREATE INDEX idx_analysis_logs_document ON public.document_analysis_logs(document_id);
CREATE INDEX idx_analysis_logs_type ON public.document_analysis_logs(analysis_type);
CREATE INDEX idx_analysis_logs_status ON public.document_analysis_logs(analysis_status);

CREATE INDEX idx_keywords_document ON public.document_keywords(document_id);
CREATE INDEX idx_keywords_keyword ON public.document_keywords(keyword);
CREATE INDEX idx_keywords_relevance ON public.document_keywords(relevance_score DESC);

-- Update trigger
CREATE TRIGGER update_ai_documents_updated_at
  BEFORE UPDATE ON public.ai_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to extract and store keywords
CREATE OR REPLACE FUNCTION extract_document_keywords(
  p_document_id UUID,
  p_text TEXT
)
RETURNS INT AS $$
DECLARE
  v_keywords TEXT[];
  v_keyword TEXT;
  v_count INT := 0;
BEGIN
  -- Simple keyword extraction (in production, use proper NLP)
  -- This extracts common important words
  v_keywords := regexp_split_to_array(
    regexp_replace(lower(p_text), '[^a-záàâãéèêíïóôõöúçñ\s]', '', 'g'),
    '\s+'
  );
  
  -- Store top keywords (simplified)
  FOREACH v_keyword IN ARRAY v_keywords
  LOOP
    IF length(v_keyword) > 4 THEN
      INSERT INTO public.document_keywords (document_id, keyword, relevance_score)
      VALUES (p_document_id, v_keyword, 50.0)
      ON CONFLICT (document_id, keyword) DO NOTHING;
      v_count := v_count + 1;
    END IF;
    
    -- Limit to prevent too many keywords
    EXIT WHEN v_count >= 50;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to log analysis
CREATE OR REPLACE FUNCTION log_document_analysis(
  p_document_id UUID,
  p_analysis_type TEXT,
  p_status TEXT,
  p_results JSONB DEFAULT '{}'::jsonb,
  p_error TEXT DEFAULT NULL,
  p_processing_time INT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.document_analysis_logs (
    document_id,
    analysis_type,
    analysis_status,
    results,
    error_message,
    processing_time_ms,
    performed_by
  )
  VALUES (
    p_document_id,
    p_analysis_type,
    p_status,
    p_results,
    p_error,
    p_processing_time,
    auth.uid()
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE public.ai_documents IS 'Documents processed with AI OCR and NLP analysis';
COMMENT ON TABLE public.document_analysis_logs IS 'Audit log of all document analysis operations';
COMMENT ON TABLE public.document_keywords IS 'Extracted keywords from documents for search and categorization';
