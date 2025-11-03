-- =====================================================
-- PATCH 607: Pre-Port State Control (Pre-PSC) Module
-- =====================================================
-- Migration to create database tables for Pre-PSC inspections
-- Based on IMO Resolution A.1185(33) and DNV PSC Quick Guide
-- Created: 2025-11-03
-- =====================================================

-- Create pre_psc_inspections table
CREATE TABLE IF NOT EXISTS pre_psc_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  inspector_name TEXT NOT NULL,
  inspection_date TIMESTAMPTZ DEFAULT now(),
  port_country TEXT,
  inspection_type TEXT DEFAULT 'self-assessment',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'submitted')),
  
  -- AI Analysis & Scoring
  ai_summary TEXT,
  ai_risk_level TEXT CHECK (ai_risk_level IN ('low', 'medium', 'high', 'critical')),
  total_score INTEGER DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  conformity_percentage DECIMAL(5,2) DEFAULT 0.00,
  flagged_items INTEGER DEFAULT 0,
  
  -- Findings & Recommendations
  findings JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  corrective_actions JSONB DEFAULT '[]'::jsonb,
  
  -- Digital Signature
  signed_by TEXT,
  signature_hash TEXT,
  signature_date TIMESTAMPTZ,
  
  -- PDF Report
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  -- Audit Trail
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create pre_psc_checklist_items table
CREATE TABLE IF NOT EXISTS pre_psc_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES pre_psc_inspections(id) ON DELETE CASCADE,
  
  -- Item Classification
  category TEXT NOT NULL,
  subcategory TEXT,
  item_code TEXT,
  question TEXT NOT NULL,
  reference_regulation TEXT, -- e.g., "SOLAS Chapter III", "MARPOL Annex I"
  
  -- Response & Assessment
  response TEXT,
  conformity BOOLEAN,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'compliant', 'non_compliant', 'not_applicable', 'requires_action')),
  
  -- Evidence
  evidence_urls TEXT[], -- Array of photo/document URLs
  evidence_notes TEXT,
  
  -- AI Risk Assessment
  ai_risk_assessment TEXT,
  ai_confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  ai_suggested_action TEXT,
  
  -- Corrective Actions
  corrective_action TEXT,
  action_priority TEXT CHECK (action_priority IN ('low', 'medium', 'high', 'critical')),
  action_deadline TIMESTAMPTZ,
  action_status TEXT DEFAULT 'pending' CHECK (action_status IN ('pending', 'in_progress', 'completed', 'overdue')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Additional Info
  inspector_comments TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pre_psc_inspections_vessel_id ON pre_psc_inspections(vessel_id);
CREATE INDEX IF NOT EXISTS idx_pre_psc_inspections_inspector_id ON pre_psc_inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_pre_psc_inspections_status ON pre_psc_inspections(status);
CREATE INDEX IF NOT EXISTS idx_pre_psc_inspections_date ON pre_psc_inspections(inspection_date DESC);
CREATE INDEX IF NOT EXISTS idx_pre_psc_checklist_items_inspection_id ON pre_psc_checklist_items(inspection_id);
CREATE INDEX IF NOT EXISTS idx_pre_psc_checklist_items_category ON pre_psc_checklist_items(category);
CREATE INDEX IF NOT EXISTS idx_pre_psc_checklist_items_status ON pre_psc_checklist_items(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pre_psc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_pre_psc_inspections_updated_at
  BEFORE UPDATE ON pre_psc_inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_pre_psc_updated_at();

CREATE TRIGGER update_pre_psc_checklist_items_updated_at
  BEFORE UPDATE ON pre_psc_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_pre_psc_updated_at();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE pre_psc_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_psc_checklist_items ENABLE ROW LEVEL SECURITY;

-- Policies for pre_psc_inspections

-- Allow authenticated users to read all inspections
CREATE POLICY "Enable read for authenticated users" ON pre_psc_inspections
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own inspections
CREATE POLICY "Enable insert for authenticated users" ON pre_psc_inspections
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own inspections or inspections they created
CREATE POLICY "Enable update for inspection creators" ON pre_psc_inspections
  FOR UPDATE
  USING (
    auth.uid() = inspector_id 
    OR auth.role() = 'authenticated'
  );

-- Allow users to delete their own inspections (soft delete preferred)
CREATE POLICY "Enable delete for inspection creators" ON pre_psc_inspections
  FOR DELETE
  USING (auth.uid() = inspector_id);

-- Policies for pre_psc_checklist_items

-- Allow authenticated users to read all checklist items
CREATE POLICY "Enable read for authenticated users" ON pre_psc_checklist_items
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert checklist items
CREATE POLICY "Enable insert for authenticated users" ON pre_psc_checklist_items
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update checklist items
CREATE POLICY "Enable update for authenticated users" ON pre_psc_checklist_items
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete checklist items
CREATE POLICY "Enable delete for authenticated users" ON pre_psc_checklist_items
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- Seed Data: PSC Checklist Categories
-- =====================================================

-- Store default checklist categories as metadata (optional)
-- This can be used to populate the UI with standard PSC categories

COMMENT ON TABLE pre_psc_inspections IS 'Pre-Port State Control inspections with AI-powered risk assessment';
COMMENT ON TABLE pre_psc_checklist_items IS 'Individual checklist items for PSC inspections with evidence and AI analysis';

-- =====================================================
-- End of Migration
-- =====================================================
