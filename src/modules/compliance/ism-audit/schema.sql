/**
 * ISM Audit Intelligence Module - Database Schema
 * PATCH 633
 * SQL Schema for Supabase PostgreSQL
 */

-- ISM Audits Table
CREATE TABLE IF NOT EXISTS ism_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  vessel_name TEXT NOT NULL,
  audit_date DATE NOT NULL,
  auditor_name TEXT NOT NULL,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('internal', 'external', 'certification', 'surveillance')),
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  overall_score INTEGER DEFAULT 0,
  section_scores JSONB DEFAULT '{}',
  evidence_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  CONSTRAINT valid_score CHECK (overall_score >= 0 AND overall_score <= 100)
);

-- ISM Checklist Responses Table
CREATE TABLE IF NOT EXISTS ism_checklist_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES ism_audits(id) ON DELETE CASCADE,
  checklist_item_id TEXT NOT NULL,
  section TEXT NOT NULL,
  requirement TEXT NOT NULL,
  description TEXT NOT NULL,
  imo_reference TEXT NOT NULL,
  compliance_status TEXT NOT NULL CHECK (
    compliance_status IN ('compliant', 'observation', 'non_conformity', 'major_non_conformity', 'not_verified')
  ),
  notes TEXT,
  evidence_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ISM Findings Table
CREATE TABLE IF NOT EXISTS ism_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES ism_audits(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('observation', 'non_conformity', 'major_non_conformity')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  imo_reference TEXT NOT NULL,
  corrective_action TEXT,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'verified')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ISM Evidence Table
CREATE TABLE IF NOT EXISTS ism_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES ism_audits(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ISM LLM Analysis Table
CREATE TABLE IF NOT EXISTS ism_llm_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES ism_audits(id) ON DELETE CASCADE UNIQUE,
  overall_assessment TEXT NOT NULL,
  section_insights JSONB DEFAULT '{}',
  critical_gaps TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  confidence_score DECIMAL(3,2) DEFAULT 0.00,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ism_audits_vessel ON ism_audits(vessel_id);
CREATE INDEX IF NOT EXISTS idx_ism_audits_date ON ism_audits(audit_date DESC);
CREATE INDEX IF NOT EXISTS idx_ism_audits_status ON ism_audits(status);
CREATE INDEX IF NOT EXISTS idx_ism_audits_created_by ON ism_audits(created_by);

CREATE INDEX IF NOT EXISTS idx_ism_checklist_audit ON ism_checklist_responses(audit_id);
CREATE INDEX IF NOT EXISTS idx_ism_checklist_section ON ism_checklist_responses(section);

CREATE INDEX IF NOT EXISTS idx_ism_findings_audit ON ism_findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_ism_findings_status ON ism_findings(status);
CREATE INDEX IF NOT EXISTS idx_ism_findings_type ON ism_findings(type);

CREATE INDEX IF NOT EXISTS idx_ism_evidence_audit ON ism_evidence(audit_id);

CREATE INDEX IF NOT EXISTS idx_ism_llm_audit ON ism_llm_analysis(audit_id);

-- Row Level Security (RLS)
ALTER TABLE ism_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ism_checklist_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ism_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ism_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE ism_llm_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ism_audits
CREATE POLICY "Users can view audits for their vessels" ON ism_audits
  FOR SELECT USING (
    auth.uid() = created_by OR
    vessel_id IN (SELECT id FROM vessels WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can create audits for their vessels" ON ism_audits
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    vessel_id IN (SELECT id FROM vessels WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update their own audits" ON ism_audits
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own audits" ON ism_audits
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for ism_checklist_responses
CREATE POLICY "Users can view checklist responses for their audits" ON ism_checklist_responses
  FOR SELECT USING (
    audit_id IN (SELECT id FROM ism_audits WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can create checklist responses" ON ism_checklist_responses
  FOR INSERT WITH CHECK (
    audit_id IN (SELECT id FROM ism_audits WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can update checklist responses" ON ism_checklist_responses
  FOR UPDATE USING (
    audit_id IN (SELECT id FROM ism_audits WHERE created_by = auth.uid())
  );

-- RLS Policies for ism_findings
CREATE POLICY "Users can view findings for their audits" ON ism_findings
  FOR SELECT USING (
    audit_id IN (SELECT id FROM ism_audits WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can create findings" ON ism_findings
  FOR INSERT WITH CHECK (
    audit_id IN (SELECT id FROM ism_audits WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can update findings" ON ism_findings
  FOR UPDATE USING (
    audit_id IN (SELECT id FROM ism_audits WHERE created_by = auth.uid())
  );

-- RLS Policies for ism_evidence
CREATE POLICY "Users can view evidence for their audits" ON ism_evidence
  FOR SELECT USING (
    audit_id IN (SELECT id FROM ism_audits WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can upload evidence" ON ism_evidence
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by AND
    audit_id IN (SELECT id FROM ism_audits WHERE created_by = auth.uid())
  );

-- RLS Policies for ism_llm_analysis
CREATE POLICY "Users can view LLM analysis for their audits" ON ism_llm_analysis
  FOR SELECT USING (
    audit_id IN (SELECT id FROM ism_audits WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can create LLM analysis" ON ism_llm_analysis
  FOR INSERT WITH CHECK (
    audit_id IN (SELECT id FROM ism_audits WHERE created_by = auth.uid())
  );

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_ism_audits_updated_at
  BEFORE UPDATE ON ism_audits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ism_checklist_responses_updated_at
  BEFORE UPDATE ON ism_checklist_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ism_findings_updated_at
  BEFORE UPDATE ON ism_findings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate section scores
CREATE OR REPLACE FUNCTION calculate_ism_section_scores(audit_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  section_scores JSONB := '{}';
  section_record RECORD;
BEGIN
  FOR section_record IN
    SELECT
      section,
      ROUND(
        AVG(
          CASE compliance_status
            WHEN 'compliant' THEN 100
            WHEN 'observation' THEN 75
            WHEN 'non_conformity' THEN 25
            WHEN 'major_non_conformity' THEN 0
            ELSE 0
          END
        )
      ) AS score
    FROM ism_checklist_responses
    WHERE audit_id = audit_uuid
    GROUP BY section
  LOOP
    section_scores := jsonb_set(
      section_scores,
      ARRAY[section_record.section],
      to_jsonb(section_record.score)
    );
  END LOOP;

  RETURN section_scores;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate overall audit score
CREATE OR REPLACE FUNCTION calculate_ism_overall_score(audit_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  overall_score INTEGER;
BEGIN
  SELECT ROUND(
    AVG(
      CASE compliance_status
        WHEN 'compliant' THEN 100
        WHEN 'observation' THEN 75
        WHEN 'non_conformity' THEN 25
        WHEN 'major_non_conformity' THEN 0
        ELSE 0
      END
    )
  )
  INTO overall_score
  FROM ism_checklist_responses
  WHERE audit_id = audit_uuid;

  RETURN COALESCE(overall_score, 0);
END;
$$ LANGUAGE plpgsql;

-- View for audit summary
CREATE OR REPLACE VIEW ism_audit_summary AS
SELECT
  a.id,
  a.vessel_id,
  a.vessel_name,
  a.audit_date,
  a.auditor_name,
  a.audit_type,
  a.status,
  a.overall_score,
  COUNT(DISTINCT f.id) FILTER (WHERE f.type = 'major_non_conformity') AS major_findings,
  COUNT(DISTINCT f.id) FILTER (WHERE f.type = 'non_conformity') AS non_conformities,
  COUNT(DISTINCT f.id) FILTER (WHERE f.type = 'observation') AS observations,
  COUNT(DISTINCT e.id) AS evidence_count,
  a.created_at,
  a.updated_at
FROM ism_audits a
LEFT JOIN ism_findings f ON f.audit_id = a.id
LEFT JOIN ism_evidence e ON e.audit_id = a.id
GROUP BY a.id;

COMMENT ON TABLE ism_audits IS 'PATCH 633 - ISM Audit Intelligence Module - Main audits table';
COMMENT ON TABLE ism_checklist_responses IS 'PATCH 633 - ISM checklist item responses';
COMMENT ON TABLE ism_findings IS 'PATCH 633 - ISM audit findings and non-conformities';
COMMENT ON TABLE ism_evidence IS 'PATCH 633 - ISM audit evidence files';
COMMENT ON TABLE ism_llm_analysis IS 'PATCH 633 - AI-generated ISM audit analysis';
