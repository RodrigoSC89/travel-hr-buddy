-- PATCH 299: Document Templates
-- Dynamic template generation with auto-versioning and variable substitution

-- ============================================
-- Document Templates Table
-- ============================================
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('contract', 'report', 'certificate', 'form', 'letter', 'invoice', 'other')),
  content text NOT NULL, -- Template content with {{variables}}
  format text DEFAULT 'html' CHECK (format IN ('html', 'markdown', 'plain')),
  current_version integer DEFAULT 1,
  status text DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_document_templates_category ON document_templates(category);
CREATE INDEX IF NOT EXISTS idx_document_templates_status ON document_templates(status);
CREATE INDEX IF NOT EXISTS idx_document_templates_code ON document_templates(template_code);

-- ============================================
-- Template Versions Table
-- ============================================
CREATE TABLE IF NOT EXISTS template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES document_templates(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content text NOT NULL,
  change_summary text,
  changed_by uuid REFERENCES auth.users(id),
  is_current boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(template_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_template_versions_template ON template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_current ON template_versions(template_id, is_current) WHERE is_current = true;

-- Function to auto-version templates on content change
CREATE OR REPLACE FUNCTION version_template_on_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If content changed, create new version
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    -- Mark all previous versions as not current
    UPDATE template_versions
    SET is_current = false
    WHERE template_id = NEW.id;
    
    -- Increment version number
    NEW.current_version := OLD.current_version + 1;
    
    -- Create new version record
    INSERT INTO template_versions (
      template_id,
      version_number,
      content,
      change_summary,
      changed_by,
      is_current
    ) VALUES (
      NEW.id,
      NEW.current_version,
      NEW.content,
      'Content updated',
      NEW.created_by,
      true
    );
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_version_template
  BEFORE UPDATE ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION version_template_on_update();

-- Trigger to create initial version on insert
CREATE OR REPLACE FUNCTION create_initial_template_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO template_versions (
    template_id,
    version_number,
    content,
    change_summary,
    changed_by,
    is_current
  ) VALUES (
    NEW.id,
    1,
    NEW.content,
    'Initial version',
    NEW.created_by,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_initial_version
  AFTER INSERT ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION create_initial_template_version();

-- ============================================
-- Template Usage Log Table
-- ============================================
CREATE TABLE IF NOT EXISTS template_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES document_templates(id) ON DELETE CASCADE,
  version_number integer,
  used_by uuid REFERENCES auth.users(id),
  output_format text CHECK (output_format IN ('pdf', 'docx', 'html', 'txt')),
  variables_used jsonb DEFAULT '{}'::jsonb,
  generation_time_ms integer,
  file_url text,
  success boolean DEFAULT true,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_template_usage_log_template ON template_usage_log(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_log_user ON template_usage_log(used_by);
CREATE INDEX IF NOT EXISTS idx_template_usage_log_created ON template_usage_log(created_at DESC);

-- ============================================
-- Template Variables Dictionary Table
-- ============================================
CREATE TABLE IF NOT EXISTS template_variables_dictionary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variable_name text UNIQUE NOT NULL,
  variable_type text NOT NULL CHECK (variable_type IN ('text', 'number', 'date', 'boolean', 'array', 'object')),
  description text,
  example_value text,
  source_table text, -- Which table provides this variable
  source_column text, -- Which column provides this variable
  is_system_variable boolean DEFAULT false, -- True for vessel_name, commander, etc.
  validation_rules jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_template_variables_name ON template_variables_dictionary(variable_name);
CREATE INDEX IF NOT EXISTS idx_template_variables_system ON template_variables_dictionary(is_system_variable);

-- Insert common system variables
INSERT INTO template_variables_dictionary (variable_name, variable_type, description, is_system_variable, example_value)
VALUES 
  ('vessel_name', 'text', 'Name of the vessel', true, 'HMS Explorer'),
  ('commander', 'text', 'Commander/Captain name', true, 'Capt. John Smith'),
  ('mission_name', 'text', 'Current mission name', true, 'Operation Deep Blue'),
  ('crew_member_name', 'text', 'Crew member full name', true, 'Jane Doe'),
  ('current_date', 'date', 'Current date', true, '2025-10-27'),
  ('organization_name', 'text', 'Organization name', true, 'Naval Operations'),
  ('document_number', 'text', 'Auto-generated document number', true, 'DOC-2025-001')
ON CONFLICT (variable_name) DO NOTHING;

-- Function to substitute template variables
CREATE OR REPLACE FUNCTION substitute_template_variables(
  p_template_content text,
  p_variables jsonb
)
RETURNS text AS $$
DECLARE
  result text;
  var_key text;
  var_value text;
BEGIN
  result := p_template_content;
  
  -- Iterate through provided variables and substitute
  FOR var_key, var_value IN SELECT * FROM jsonb_each_text(p_variables)
  LOOP
    result := replace(result, '{{' || var_key || '}}', var_value);
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to extract template variables from content
CREATE OR REPLACE FUNCTION extract_template_variables(
  p_template_content text
)
RETURNS text[] AS $$
DECLARE
  variables text[];
BEGIN
  -- Extract all {{variable}} patterns
  SELECT ARRAY_AGG(DISTINCT match[1])
  INTO variables
  FROM regexp_matches(p_template_content, '\{\{([^}]+)\}\}', 'g') AS match;
  
  RETURN COALESCE(variables, ARRAY[]::text[]);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_variables_dictionary ENABLE ROW LEVEL SECURITY;

-- Document templates policies
CREATE POLICY "Users can view templates"
  ON document_templates FOR SELECT
  TO authenticated
  USING (status = 'active' OR created_by = auth.uid());

CREATE POLICY "Users can create templates"
  ON document_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own templates"
  ON document_templates FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'manager')
  ))
  WITH CHECK (true);

-- Template versions policies
CREATE POLICY "Users can view template versions"
  ON template_versions FOR SELECT
  TO authenticated
  USING (true);

-- Template usage log policies
CREATE POLICY "Users can view own usage log"
  ON template_usage_log FOR SELECT
  TO authenticated
  USING (used_by = auth.uid() OR EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'manager')
  ));

CREATE POLICY "Users can create usage log entries"
  ON template_usage_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Template variables dictionary policies
CREATE POLICY "Users can view variables dictionary"
  ON template_variables_dictionary FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage variables dictionary"
  ON template_variables_dictionary FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  ))
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON document_templates TO authenticated;
GRANT ALL ON template_versions TO authenticated;
GRANT ALL ON template_usage_log TO authenticated;
GRANT ALL ON template_variables_dictionary TO authenticated;

COMMENT ON TABLE document_templates IS 'PATCH 299: Document template library with dynamic variable support';
COMMENT ON TABLE template_versions IS 'PATCH 299: Auto-versioning on content changes';
COMMENT ON TABLE template_usage_log IS 'PATCH 299: Analytics with generation time tracking';
COMMENT ON TABLE template_variables_dictionary IS 'PATCH 299: System variable registry for templates';
