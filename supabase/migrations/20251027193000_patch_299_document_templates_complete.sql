-- PATCH 299: Document Templates v1 - Complete Implementation
-- Objective: Complete template system with dynamic variables, versioning, and export

-- ============================================
-- Template Versions Table
-- ============================================
CREATE TABLE IF NOT EXISTS template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content text NOT NULL,
  variables text[] DEFAULT ARRAY[]::text[],
  change_summary text,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(template_id, version_number)
);

-- Template versions indexes
CREATE INDEX IF NOT EXISTS idx_template_versions_template ON template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_number ON template_versions(template_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_template_versions_created ON template_versions(created_at DESC);

-- ============================================
-- Template Usage Log
-- ============================================
CREATE TABLE IF NOT EXISTS template_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
  version_id uuid REFERENCES template_versions(id) ON DELETE SET NULL,
  used_by uuid NOT NULL REFERENCES auth.users(id),
  export_type text CHECK (export_type IN ('pdf', 'docx', 'html', 'txt', 'preview')),
  variables_used jsonb DEFAULT '{}'::jsonb,
  generated_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  file_path text,
  file_name text,
  file_size_bytes bigint,
  generation_time_ms integer,
  status text DEFAULT 'success' CHECK (status IN ('success', 'failed', 'cancelled')),
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Template usage log indexes
CREATE INDEX IF NOT EXISTS idx_template_usage_template ON template_usage_log(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_user ON template_usage_log(used_by);
CREATE INDEX IF NOT EXISTS idx_template_usage_date ON template_usage_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_usage_type ON template_usage_log(export_type);

-- ============================================
-- Template Categories
-- ============================================
CREATE TABLE IF NOT EXISTS template_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  color text,
  parent_category_id uuid REFERENCES template_categories(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Template categories indexes
CREATE INDEX IF NOT EXISTS idx_template_categories_parent ON template_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_template_categories_active ON template_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_template_categories_order ON template_categories(display_order);

-- ============================================
-- Template Variables Dictionary
-- ============================================
CREATE TABLE IF NOT EXISTS template_variables_dictionary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variable_name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  variable_type text NOT NULL CHECK (variable_type IN ('text', 'number', 'date', 'boolean', 'list', 'reference')),
  default_value text,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  source_table text, -- For reference types
  source_column text,
  is_system_variable boolean DEFAULT false,
  examples text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Template variables dictionary indexes
CREATE INDEX IF NOT EXISTS idx_template_vars_type ON template_variables_dictionary(variable_type);
CREATE INDEX IF NOT EXISTS idx_template_vars_system ON template_variables_dictionary(is_system_variable);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_variables_dictionary ENABLE ROW LEVEL SECURITY;

-- Template versions policies
CREATE POLICY "Users can read versions of their templates"
  ON template_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM document_templates dt
      WHERE dt.id = template_versions.template_id
        AND dt.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions for their templates"
  ON template_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM document_templates dt
      WHERE dt.id = template_versions.template_id
        AND dt.user_id = auth.uid()
    )
  );

-- Template usage log policies
CREATE POLICY "Users can read their own usage logs"
  ON template_usage_log FOR SELECT
  USING (auth.uid() = used_by);

CREATE POLICY "Users can create usage logs"
  ON template_usage_log FOR INSERT
  WITH CHECK (auth.uid() = used_by);

-- Template categories policies (public read)
CREATE POLICY "Everyone can read template categories"
  ON template_categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create categories"
  ON template_categories FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Template variables dictionary policies (public read)
CREATE POLICY "Everyone can read template variables dictionary"
  ON template_variables_dictionary FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create variables"
  ON template_variables_dictionary FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- Functions
-- ============================================

-- Function to create template version automatically
CREATE OR REPLACE FUNCTION create_template_version()
RETURNS TRIGGER AS $$
DECLARE
  v_version_number integer;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
  FROM template_versions
  WHERE template_id = NEW.id;
  
  -- Create version record
  INSERT INTO template_versions (
    template_id,
    version_number,
    content,
    variables,
    changed_by
  ) VALUES (
    NEW.id,
    v_version_number,
    NEW.content,
    NEW.variables,
    NEW.user_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create version on template update
DROP TRIGGER IF EXISTS document_templates_create_version ON document_templates;
CREATE TRIGGER document_templates_create_version
  AFTER INSERT OR UPDATE OF content ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION create_template_version();

-- Function to substitute template variables
CREATE OR REPLACE FUNCTION substitute_template_variables(
  p_content text,
  p_variables jsonb
)
RETURNS text AS $$
DECLARE
  v_result text;
  v_key text;
  v_value text;
BEGIN
  v_result := p_content;
  
  -- Iterate through all variables and replace
  FOR v_key, v_value IN SELECT * FROM jsonb_each_text(p_variables)
  LOOP
    v_result := replace(v_result, '{{' || v_key || '}}', COALESCE(v_value, ''));
    v_result := replace(v_result, '{{ ' || v_key || ' }}', COALESCE(v_value, ''));
  END LOOP;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to extract variables from template content
CREATE OR REPLACE FUNCTION extract_template_variables(p_content text)
RETURNS text[] AS $$
DECLARE
  v_variables text[];
BEGIN
  -- Extract all {{variable}} patterns
  SELECT array_agg(DISTINCT matches[1])
  INTO v_variables
  FROM regexp_matches(p_content, '\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}', 'g') AS matches;
  
  RETURN COALESCE(v_variables, ARRAY[]::text[]);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-extract variables on template save
CREATE OR REPLACE FUNCTION auto_extract_variables()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variables := extract_template_variables(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS document_templates_extract_variables ON document_templates;
CREATE TRIGGER document_templates_extract_variables
  BEFORE INSERT OR UPDATE OF content ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION auto_extract_variables();

-- Function to get template statistics
CREATE OR REPLACE FUNCTION get_template_statistics(p_template_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'template_id', p_template_id,
    'total_uses', COUNT(*),
    'unique_users', COUNT(DISTINCT used_by),
    'last_used_at', MAX(created_at),
    'success_rate', 
      ROUND(
        (COUNT(*) FILTER (WHERE status = 'success')::numeric / NULLIF(COUNT(*), 0)) * 100,
        2
      ),
    'export_types', jsonb_object_agg(export_type, export_count)
  ) INTO v_stats
  FROM (
    SELECT 
      used_by,
      created_at,
      status,
      export_type,
      COUNT(*) OVER (PARTITION BY export_type) as export_count
    FROM template_usage_log
    WHERE template_id = p_template_id
  ) sub
  GROUP BY template_id;
  
  RETURN COALESCE(v_stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Function to log template usage
CREATE OR REPLACE FUNCTION log_template_usage(
  p_template_id uuid,
  p_export_type text,
  p_variables jsonb,
  p_file_name text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_usage_id uuid;
  v_version_id uuid;
BEGIN
  -- Get current version
  SELECT id INTO v_version_id
  FROM template_versions
  WHERE template_id = p_template_id
  ORDER BY version_number DESC
  LIMIT 1;
  
  -- Log usage
  INSERT INTO template_usage_log (
    template_id,
    version_id,
    used_by,
    export_type,
    variables_used,
    file_name,
    status
  ) VALUES (
    p_template_id,
    v_version_id,
    auth.uid(),
    p_export_type,
    p_variables,
    p_file_name,
    'success'
  )
  RETURNING id INTO v_usage_id;
  
  RETURN v_usage_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Views
-- ============================================

-- View for template library with statistics
CREATE OR REPLACE VIEW v_template_library AS
SELECT 
  dt.*,
  tc.name as category_name,
  tc.icon as category_icon,
  COUNT(DISTINCT tv.id) as version_count,
  MAX(tv.version_number) as current_version,
  COUNT(DISTINCT tul.id) as usage_count,
  COUNT(DISTINCT tul.used_by) as unique_users,
  MAX(tul.created_at) as last_used_at,
  u.raw_user_meta_data->>'full_name' as created_by_name
FROM document_templates dt
LEFT JOIN template_categories tc ON dt.category = tc.name
LEFT JOIN template_versions tv ON dt.id = tv.template_id
LEFT JOIN template_usage_log tul ON dt.id = tul.template_id
LEFT JOIN auth.users u ON dt.user_id = u.id
GROUP BY dt.id, tc.name, tc.icon, u.raw_user_meta_data
ORDER BY dt.created_at DESC;

-- View for popular templates
CREATE OR REPLACE VIEW v_popular_templates AS
SELECT 
  dt.id,
  dt.name,
  dt.description,
  dt.category,
  COUNT(tul.id) as usage_count,
  COUNT(DISTINCT tul.used_by) as unique_users,
  MAX(tul.created_at) as last_used_at
FROM document_templates dt
INNER JOIN template_usage_log tul ON dt.id = tul.template_id
WHERE dt.is_public = true
  AND tul.created_at > now() - interval '30 days'
GROUP BY dt.id
HAVING COUNT(tul.id) > 0
ORDER BY usage_count DESC
LIMIT 20;

-- ============================================
-- Sample Data
-- ============================================

-- Insert sample categories
INSERT INTO template_categories (name, description, icon, display_order)
VALUES
  ('Reports', 'Standard report templates', '📊', 1),
  ('Contracts', 'Legal and contract documents', '📜', 2),
  ('Certificates', 'Certification and compliance documents', '🏆', 3),
  ('Invoices', 'Financial and billing documents', '💰', 4),
  ('Correspondence', 'Letters and communications', '✉️', 5),
  ('Technical', 'Technical documentation', '🔧', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert sample system variables
INSERT INTO template_variables_dictionary (
  variable_name,
  display_name,
  description,
  variable_type,
  is_system_variable,
  examples
) VALUES
  ('vessel_name', 'Vessel Name', 'Name of the vessel', 'reference', true, ARRAY['Atlantic Explorer', 'Pacific Navigator']),
  ('vessel_imo', 'IMO Number', 'International Maritime Organization number', 'text', true, ARRAY['IMO9234567']),
  ('commander', 'Commander Name', 'Name of the vessel commander', 'text', true, ARRAY['Captain Smith']),
  ('crew_member', 'Crew Member', 'Name of crew member', 'text', true, ARRAY['John Doe']),
  ('date', 'Date', 'Current date', 'date', true, ARRAY['2025-01-01']),
  ('mission_name', 'Mission Name', 'Name of the mission', 'text', true, ARRAY['Operation Neptune']),
  ('company_name', 'Company Name', 'Name of the company', 'text', true, ARRAY['Maritime Solutions Inc.']),
  ('document_number', 'Document Number', 'Unique document identifier', 'text', true, ARRAY['DOC-2025-001'])
ON CONFLICT (variable_name) DO NOTHING;

-- Insert sample template
INSERT INTO document_templates (
  user_id,
  name,
  description,
  content,
  category,
  is_public,
  tags
)
SELECT
  u.id,
  'Vessel Inspection Report',
  'Standard template for vessel inspection reporting',
  E'# Vessel Inspection Report\n\n**Vessel Name:** {{vessel_name}}\n**IMO Number:** {{vessel_imo}}\n**Inspection Date:** {{date}}\n**Inspector:** {{commander}}\n\n## Inspection Summary\n\n[Inspection details here]\n\n## Findings\n\n1. Item 1\n2. Item 2\n\n**Signed:** {{commander}}\n**Date:** {{date}}',
  'Reports',
  true,
  ARRAY['inspection', 'vessel', 'compliance']
FROM auth.users u
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE template_versions IS 'Version history for document templates';
COMMENT ON TABLE template_usage_log IS 'Log of template usage and exports';
COMMENT ON TABLE template_categories IS 'Categories for organizing templates';
COMMENT ON TABLE template_variables_dictionary IS 'Dictionary of available template variables';
COMMENT ON FUNCTION substitute_template_variables IS 'Replace template variables with actual values';
COMMENT ON FUNCTION extract_template_variables IS 'Extract all variable placeholders from template content';
COMMENT ON VIEW v_template_library IS 'Template library with statistics and usage information';
COMMENT ON VIEW v_popular_templates IS 'Most frequently used templates in the last 30 days';
