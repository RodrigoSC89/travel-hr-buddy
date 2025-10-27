-- PATCH 245: Document Templates and Variables
-- Create tables for document template generation with variable support

-- template_variables: Store reusable template variables
CREATE TABLE IF NOT EXISTS public.template_variables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variable_name text NOT NULL UNIQUE,
  variable_key text NOT NULL UNIQUE,
  description text,
  variable_type text DEFAULT 'text' CHECK (variable_type IN ('text', 'number', 'date', 'email', 'phone', 'url', 'boolean')),
  default_value text,
  is_system boolean DEFAULT false,
  category text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- document_templates: Extended document templates with variable support
CREATE TABLE IF NOT EXISTS public.document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  template_type text NOT NULL CHECK (template_type IN ('contract', 'report', 'invoice', 'letter', 'form', 'certificate', 'other')),
  description text,
  content_html text NOT NULL,
  content_json jsonb,
  variables_used text[] DEFAULT ARRAY[]::text[],
  category text,
  tags text[],
  is_active boolean DEFAULT true,
  is_public boolean DEFAULT false,
  version integer DEFAULT 1,
  parent_template_id uuid REFERENCES public.document_templates(id),
  created_by uuid REFERENCES auth.users(id),
  organization_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_template_variables_key ON public.template_variables(variable_key);
CREATE INDEX IF NOT EXISTS idx_template_variables_type ON public.template_variables(variable_type);
CREATE INDEX IF NOT EXISTS idx_template_variables_category ON public.template_variables(category);

CREATE INDEX IF NOT EXISTS idx_document_templates_type ON public.document_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON public.document_templates(category);
CREATE INDEX IF NOT EXISTS idx_document_templates_active ON public.document_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_document_templates_creator ON public.document_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_document_templates_org ON public.document_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_variables ON public.document_templates USING gin(variables_used);

-- Enable RLS
ALTER TABLE public.template_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_variables
CREATE POLICY "Anyone can view template variables"
  ON public.template_variables FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage template variables"
  ON public.template_variables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- RLS Policies for document_templates
CREATE POLICY "Users can view public or own templates"
  ON public.document_templates FOR SELECT
  USING (
    is_public = true OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can create their own templates"
  ON public.document_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates"
  ON public.document_templates FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Triggers
CREATE TRIGGER update_template_variables_updated_at_trigger
  BEFORE UPDATE ON public.template_variables
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_conversations_updated_at(); -- Reuse existing function

CREATE TRIGGER update_document_templates_updated_at_trigger
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_conversations_updated_at(); -- Reuse existing function

-- Insert default template variables
INSERT INTO public.template_variables (variable_name, variable_key, description, variable_type, is_system) VALUES
  ('User Full Name', 'user.name', 'Full name of the current user', 'text', true),
  ('User Email', 'user.email', 'Email address of the current user', 'email', true),
  ('User Phone', 'user.phone', 'Phone number of the current user', 'phone', true),
  ('Company Name', 'company.name', 'Name of the organization', 'text', true),
  ('Company Address', 'company.address', 'Physical address of the organization', 'text', true),
  ('Current Date', 'date.today', 'Current date', 'date', true),
  ('Current Year', 'date.year', 'Current year', 'number', true),
  ('Document Title', 'document.title', 'Title of the document', 'text', true),
  ('Document Reference', 'document.reference', 'Reference number of the document', 'text', true)
ON CONFLICT (variable_key) DO NOTHING;
