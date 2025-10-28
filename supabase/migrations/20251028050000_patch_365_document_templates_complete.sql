-- =====================================================
-- PATCH 365 - Document Templates Dynamic Generation
-- Objetivo: Sistema completo de templates com variáveis dinâmicas
-- =====================================================

-- =====================================================
-- Document Templates System
-- =====================================================

-- Create document_templates table
CREATE TABLE IF NOT EXISTS public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  content TEXT NOT NULL, -- Template content with {{variables}}
  variables JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of variable definitions
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  required_role TEXT, -- Minimum role required to use template
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, version)
);

-- Create template_versions table for version control
CREATE TABLE IF NOT EXISTS public.template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  change_summary TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, version)
);

-- Create generated_documents table
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE SET NULL,
  template_version INTEGER,
  name TEXT NOT NULL,
  content TEXT NOT NULL, -- Generated content with filled variables
  variable_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  format TEXT NOT NULL CHECK (format IN ('html', 'pdf', 'docx', 'markdown')),
  file_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'generated', 'exported', 'archived')) DEFAULT 'draft',
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create template_permissions table for role-based access
CREATE TABLE IF NOT EXISTS public.template_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  can_view BOOLEAN DEFAULT true,
  can_use BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_manage BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, role)
);

-- Create template_categories table
CREATE TABLE IF NOT EXISTS public.template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create template_tags table
CREATE TABLE IF NOT EXISTS public.template_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, tag)
);

-- Create template_usage_logs table
CREATE TABLE IF NOT EXISTS public.template_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'use', 'edit', 'export', 'share')),
  document_id UUID REFERENCES public.generated_documents(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON public.document_templates(category);
CREATE INDEX IF NOT EXISTS idx_document_templates_is_active ON public.document_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_document_templates_created_by ON public.document_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_template_versions_template_id ON public.template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_template_id ON public.generated_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_generated_by ON public.generated_documents(generated_by);
CREATE INDEX IF NOT EXISTS idx_generated_documents_status ON public.generated_documents(status);
CREATE INDEX IF NOT EXISTS idx_template_permissions_template_id ON public.template_permissions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_tags_template_id ON public.template_tags(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_logs_template_id ON public.template_usage_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_logs_user_id ON public.template_usage_logs(user_id);

-- Enable RLS
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view templates based on permissions"
  ON public.document_templates
  FOR SELECT
  USING (
    is_active = true AND (
      is_public = true OR
      created_by = auth.uid() OR
      get_user_role() IN ('admin', 'hr_manager') OR
      EXISTS (
        SELECT 1 FROM public.template_permissions tp
        WHERE tp.template_id = id
        AND tp.role = get_user_role()::TEXT
        AND tp.can_view = true
      )
    )
  );

CREATE POLICY "Admins and creators can manage templates"
  ON public.document_templates
  FOR ALL
  USING (
    get_user_role() IN ('admin', 'hr_manager') OR
    created_by = auth.uid()
  );

CREATE POLICY "Users can view template versions"
  ON public.template_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.document_templates dt
      WHERE dt.id = template_id
      AND (
        dt.is_public = true OR
        dt.created_by = auth.uid() OR
        get_user_role() IN ('admin', 'hr_manager')
      )
    )
  );

CREATE POLICY "System can create template versions"
  ON public.template_versions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can manage their generated documents"
  ON public.generated_documents
  FOR ALL
  USING (
    generated_by = auth.uid() OR
    get_user_role() IN ('admin', 'hr_manager')
  );

CREATE POLICY "Users can view template permissions"
  ON public.template_permissions
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage template permissions"
  ON public.template_permissions
  FOR ALL
  USING (get_user_role() IN ('admin', 'hr_manager'));

CREATE POLICY "Everyone can view active categories"
  ON public.template_categories
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.template_categories
  FOR ALL
  USING (get_user_role() IN ('admin', 'hr_manager'));

CREATE POLICY "Users can view tags"
  ON public.template_tags
  FOR SELECT
  USING (true);

CREATE POLICY "Template creators can manage tags"
  ON public.template_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.document_templates dt
      WHERE dt.id = template_id
      AND (dt.created_by = auth.uid() OR get_user_role() IN ('admin', 'hr_manager'))
    )
  );

CREATE POLICY "Users can view their usage logs"
  ON public.template_usage_logs
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    get_user_role() IN ('admin', 'auditor')
  );

CREATE POLICY "System can insert usage logs"
  ON public.template_usage_logs
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- Functions for Template Management
-- =====================================================

-- Function to create new template version
CREATE OR REPLACE FUNCTION public.create_template_version(
  p_template_id UUID,
  p_content TEXT,
  p_variables JSONB,
  p_change_summary TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_version INTEGER;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Check permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.document_templates
    WHERE id = p_template_id
    AND (created_by = current_user_id OR get_user_role() IN ('admin', 'hr_manager'))
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to update template';
  END IF;
  
  -- Get next version number
  SELECT COALESCE(MAX(version), 0) + 1 INTO new_version
  FROM public.template_versions
  WHERE template_id = p_template_id;
  
  -- Insert new version
  INSERT INTO public.template_versions (
    template_id,
    version,
    content,
    variables,
    change_summary,
    changed_by
  )
  VALUES (
    p_template_id,
    new_version,
    p_content,
    p_variables,
    p_change_summary,
    current_user_id
  );
  
  -- Update template
  UPDATE public.document_templates
  SET 
    content = p_content,
    variables = p_variables,
    version = new_version,
    updated_at = now()
  WHERE id = p_template_id;
  
  -- Log the action
  INSERT INTO public.template_usage_logs (
    template_id,
    user_id,
    action,
    metadata
  )
  VALUES (
    p_template_id,
    current_user_id,
    'edit',
    jsonb_build_object('new_version', new_version)
  );
  
  RETURN new_version;
END;
$$;

-- Function to rollback to previous version
CREATE OR REPLACE FUNCTION public.rollback_template_version(
  p_template_id UUID,
  p_version INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  version_content TEXT;
  version_variables JSONB;
BEGIN
  -- Check permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.document_templates
    WHERE id = p_template_id
    AND (created_by = auth.uid() OR get_user_role() IN ('admin', 'hr_manager'))
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to rollback template';
  END IF;
  
  -- Get version content
  SELECT content, variables INTO version_content, version_variables
  FROM public.template_versions
  WHERE template_id = p_template_id AND version = p_version;
  
  IF version_content IS NULL THEN
    RAISE EXCEPTION 'Version not found';
  END IF;
  
  -- Create new version with old content
  PERFORM public.create_template_version(
    p_template_id,
    version_content,
    version_variables,
    format('Rolled back to version %s', p_version)
  );
  
  RETURN true;
END;
$$;

-- Function to generate document from template
CREATE OR REPLACE FUNCTION public.generate_document_from_template(
  p_template_id UUID,
  p_name TEXT,
  p_variable_values JSONB,
  p_format TEXT DEFAULT 'html'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  template_content TEXT;
  template_version INTEGER;
  generated_content TEXT;
  document_id UUID;
  var_key TEXT;
  var_value TEXT;
BEGIN
  -- Get template
  SELECT content, version INTO template_content, template_version
  FROM public.document_templates
  WHERE id = p_template_id AND is_active = true;
  
  IF template_content IS NULL THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;
  
  -- Replace variables in content
  generated_content := template_content;
  FOR var_key, var_value IN SELECT * FROM jsonb_each_text(p_variable_values)
  LOOP
    generated_content := replace(generated_content, '{{' || var_key || '}}', var_value);
  END LOOP;
  
  -- Create generated document
  INSERT INTO public.generated_documents (
    template_id,
    template_version,
    name,
    content,
    variable_values,
    format,
    status,
    generated_by
  )
  VALUES (
    p_template_id,
    template_version,
    p_name,
    generated_content,
    p_variable_values,
    p_format,
    'generated',
    auth.uid()
  )
  RETURNING id INTO document_id;
  
  -- Log usage
  INSERT INTO public.template_usage_logs (
    template_id,
    user_id,
    action,
    document_id
  )
  VALUES (
    p_template_id,
    auth.uid(),
    'use',
    document_id
  );
  
  RETURN document_id;
END;
$$;

-- Function to export document
CREATE OR REPLACE FUNCTION public.export_document(
  p_document_id UUID,
  p_file_url TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.generated_documents
  SET 
    status = 'exported',
    file_url = p_file_url,
    exported_at = now(),
    updated_at = now()
  WHERE id = p_document_id AND generated_by = auth.uid();
  
  IF FOUND THEN
    -- Log export
    INSERT INTO public.template_usage_logs (
      template_id,
      user_id,
      action,
      document_id,
      metadata
    )
    SELECT 
      template_id,
      auth.uid(),
      'export',
      p_document_id,
      jsonb_build_object('file_url', p_file_url)
    FROM public.generated_documents
    WHERE id = p_document_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Function to extract variables from template content
CREATE OR REPLACE FUNCTION public.extract_template_variables(
  p_content TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  variables TEXT[];
  var TEXT;
  result JSONB := '[]'::jsonb;
BEGIN
  -- Extract all {{variable}} patterns
  variables := regexp_matches(p_content, '\{\{([a-zA-Z0-9_]+)\}\}', 'g');
  
  -- Build JSON array of unique variables
  FOR var IN SELECT DISTINCT unnest(variables)
  LOOP
    result := result || jsonb_build_object(
      'name', var,
      'type', 'text',
      'required', true
    );
  END LOOP;
  
  RETURN result;
END;
$$;

-- Function to validate template permissions
CREATE OR REPLACE FUNCTION public.user_can_use_template(
  p_template_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  template_record RECORD;
  user_current_role TEXT;
BEGIN
  -- Get template info
  SELECT * INTO template_record
  FROM public.document_templates
  WHERE id = p_template_id;
  
  IF template_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Public templates are available to all
  IF template_record.is_public THEN
    RETURN true;
  END IF;
  
  -- Creator can always use
  IF template_record.created_by = p_user_id THEN
    RETURN true;
  END IF;
  
  -- Get user role
  user_current_role := get_user_role()::TEXT;
  
  -- Admin and HR Manager have full access
  IF user_current_role IN ('admin', 'hr_manager') THEN
    RETURN true;
  END IF;
  
  -- Check specific permissions
  RETURN EXISTS (
    SELECT 1 FROM public.template_permissions
    WHERE template_id = p_template_id
    AND role = user_current_role
    AND can_use = true
  );
END;
$$;

-- =====================================================
-- Default Template Categories
-- =====================================================

-- Insert default template categories
INSERT INTO public.template_categories (name, description, display_order)
VALUES
  ('Contracts', 'Employment and legal contracts', 1),
  ('Reports', 'Business and analytical reports', 2),
  ('Letters', 'Formal correspondence and letters', 3),
  ('Certificates', 'Certificates and credentials', 4),
  ('Invoices', 'Billing and invoice documents', 5),
  ('Forms', 'Application and data collection forms', 6)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- Sample Templates
-- =====================================================

-- Insert sample templates
INSERT INTO public.document_templates (name, description, category, content, variables, is_public)
VALUES
  ('Employment Contract', 'Standard employment contract template', 'Contracts',
   'EMPLOYMENT CONTRACT

This Employment Contract is made on {{contract_date}} between {{company_name}} (the "Employer") and {{employee_name}} (the "Employee").

Position: {{position}}
Start Date: {{start_date}}
Salary: {{salary}}

The Employee agrees to perform the duties of {{position}} to the best of their ability.

Employer Signature: _________________
Employee Signature: _________________',
   '[{"name": "contract_date", "type": "date", "required": true}, {"name": "company_name", "type": "text", "required": true}, {"name": "employee_name", "type": "text", "required": true}, {"name": "position", "type": "text", "required": true}, {"name": "start_date", "type": "date", "required": true}, {"name": "salary", "type": "text", "required": true}]'::jsonb,
   true),
  
  ('Monthly Report', 'Standard monthly performance report', 'Reports',
   'MONTHLY REPORT - {{month}} {{year}}

Department: {{department}}
Prepared by: {{author}}

EXECUTIVE SUMMARY
{{executive_summary}}

KEY METRICS
- Metric 1: {{metric_1}}
- Metric 2: {{metric_2}}
- Metric 3: {{metric_3}}

RECOMMENDATIONS
{{recommendations}}',
   '[{"name": "month", "type": "text", "required": true}, {"name": "year", "type": "text", "required": true}, {"name": "department", "type": "text", "required": true}, {"name": "author", "type": "text", "required": true}, {"name": "executive_summary", "type": "textarea", "required": true}, {"name": "metric_1", "type": "text", "required": false}, {"name": "metric_2", "type": "text", "required": false}, {"name": "metric_3", "type": "text", "required": false}, {"name": "recommendations", "type": "textarea", "required": true}]'::jsonb,
   true)
ON CONFLICT (name, version) DO NOTHING;

-- =====================================================
-- Comments and Documentation
-- =====================================================

COMMENT ON TABLE public.document_templates IS 'Document templates with variable substitution support';
COMMENT ON TABLE public.template_versions IS 'Version history for document templates';
COMMENT ON TABLE public.generated_documents IS 'Documents generated from templates';
COMMENT ON TABLE public.template_permissions IS 'Role-based permissions for templates';
COMMENT ON TABLE public.template_categories IS 'Categories for organizing templates';
COMMENT ON FUNCTION public.create_template_version IS 'Creates a new version of a template';
COMMENT ON FUNCTION public.rollback_template_version IS 'Rolls back template to a previous version';
COMMENT ON FUNCTION public.generate_document_from_template IS 'Generates a document by filling template variables';
COMMENT ON FUNCTION public.export_document IS 'Marks a document as exported and stores file URL';
