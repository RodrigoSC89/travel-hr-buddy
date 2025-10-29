-- PATCH 482: Finalizar Template Editor (Document Templates)
-- Enhance document templates system with PDF rendering and full functionality

-- Ensure document_templates has all necessary columns
DO $$
BEGIN
  -- Add pdf_settings column if it doesn't exist (for PDF rendering configuration)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'document_templates' 
    AND column_name = 'pdf_settings'
  ) THEN
    ALTER TABLE public.document_templates ADD COLUMN pdf_settings JSONB DEFAULT '{
      "pageSize": "A4",
      "orientation": "portrait",
      "margins": {"top": 20, "bottom": 20, "left": 20, "right": 20},
      "headerEnabled": true,
      "footerEnabled": true
    }'::jsonb;
  END IF;

  -- Add drag_drop_enabled column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'document_templates' 
    AND column_name = 'drag_drop_enabled'
  ) THEN
    ALTER TABLE public.document_templates ADD COLUMN drag_drop_enabled BOOLEAN DEFAULT true;
  END IF;

  -- Add intelligence_integration column if it doesn't exist (for documents-intelligence)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'document_templates' 
    AND column_name = 'intelligence_integration'
  ) THEN
    ALTER TABLE public.document_templates ADD COLUMN intelligence_integration JSONB DEFAULT '{
      "enabled": true,
      "auto_analyze": false,
      "extract_entities": true
    }'::jsonb;
  END IF;
END $$;

-- Create table for template placeholders if it doesn't exist
CREATE TABLE IF NOT EXISTS public.template_placeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE CASCADE,
  placeholder_key TEXT NOT NULL,
  placeholder_type TEXT NOT NULL CHECK (placeholder_type IN ('text', 'date', 'number', 'list', 'image', 'signature')),
  default_value TEXT,
  required BOOLEAN DEFAULT false,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, placeholder_key)
);

-- Create table for rendered documents if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rendered_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  format TEXT NOT NULL CHECK (format IN ('html', 'pdf', 'docx')),
  pdf_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  intelligence_results JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS idx_template_placeholders_template_id ON public.template_placeholders(template_id);
CREATE INDEX IF NOT EXISTS idx_rendered_documents_template_id ON public.rendered_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_rendered_documents_user_id ON public.rendered_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_rendered_documents_created_at ON public.rendered_documents(created_at);

-- Add comments
COMMENT ON TABLE public.template_placeholders IS 'PATCH 482: Dynamic placeholders for document templates';
COMMENT ON TABLE public.rendered_documents IS 'PATCH 482: Rendered documents with PDF export capability';
COMMENT ON COLUMN public.document_templates.pdf_settings IS 'PATCH 482: PDF rendering configuration';
COMMENT ON COLUMN public.document_templates.intelligence_integration IS 'PATCH 482: Integration with documents-intelligence module';

-- Grant permissions
GRANT ALL ON public.template_placeholders TO authenticated;
GRANT ALL ON public.rendered_documents TO authenticated;
