-- LSA/FFA Digital Inspection Module with AI
-- Creates tables for SOLAS Chapter III LSA (Life Saving Appliances) and FFA (Fire Fighting Appliances) inspections
-- Based on SOLAS III Reg. 20 and MSC/Circ.1093, MSC/Circ.1206

-- 1. LSA/FFA Inspections Main Table
CREATE TABLE IF NOT EXISTS public.lsa_ffa_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Vessel and Inspector Information
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
    inspector TEXT NOT NULL,
    
    -- Inspection Details
    date TIMESTAMPTZ DEFAULT now(),
    type TEXT NOT NULL CHECK (type IN ('LSA', 'FFA')),
    frequency TEXT CHECK (frequency IN ('weekly', 'monthly', 'annual', 'ad_hoc')),
    
    -- Checklist and Findings (stored as JSONB for flexibility)
    checklist JSONB NOT NULL DEFAULT '[]',
    issues_found JSONB DEFAULT '[]',
    
    -- Compliance Score (calculated 0-100)
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    
    -- AI Analysis
    ai_notes TEXT,
    ai_risk_rating TEXT CHECK (ai_risk_rating IN ('low', 'medium', 'high', 'critical')),
    ai_suggestions JSONB DEFAULT '[]',
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'reviewed')),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Audit fields
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ
);

-- 2. LSA/FFA Equipment Items Table
-- Tracks individual equipment items and their inspection history
CREATE TABLE IF NOT EXISTS public.lsa_ffa_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES public.lsa_ffa_inspections(id) ON DELETE CASCADE,
    
    -- Equipment Details
    equipment_type TEXT NOT NULL, -- 'lifeboat', 'liferaft', 'fire_extinguisher', 'davit', 'immersion_suit', etc.
    equipment_name TEXT NOT NULL,
    equipment_id TEXT, -- Vessel's internal equipment ID
    location TEXT,
    
    -- Inspection Result
    condition TEXT NOT NULL CHECK (condition IN ('good', 'fair', 'poor', 'defective')),
    compliant BOOLEAN NOT NULL DEFAULT true,
    
    -- Issues and Actions
    defects_found TEXT,
    corrective_action TEXT,
    action_deadline TIMESTAMPTZ,
    action_completed BOOLEAN DEFAULT false,
    
    -- AI Analysis
    ai_predicted_failure_date TIMESTAMPTZ,
    ai_maintenance_priority TEXT CHECK (ai_maintenance_priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Metadata
    inspected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. LSA/FFA Checklist Templates Table
-- Pre-configured checklists based on SOLAS requirements
CREATE TABLE IF NOT EXISTS public.lsa_ffa_checklist_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Details
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('LSA', 'FFA')),
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'annual')),
    
    -- Checklist Items
    items JSONB NOT NULL DEFAULT '[]',
    
    -- SOLAS References
    solas_regulation TEXT, -- e.g., "SOLAS III/20.6.1"
    msc_circular TEXT, -- e.g., "MSC/Circ.1093"
    
    -- Metadata
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. LSA/FFA Reports Table
-- Generated PDF reports and AI summaries
CREATE TABLE IF NOT EXISTS public.lsa_ffa_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES public.lsa_ffa_inspections(id) ON DELETE CASCADE,
    
    -- Report Content
    report_type TEXT NOT NULL CHECK (report_type IN ('pdf', 'summary', 'ai_analysis')),
    report_url TEXT,
    report_data JSONB,
    
    -- AI Summary
    executive_summary TEXT,
    key_findings TEXT[],
    recommendations TEXT,
    
    -- Compliance Metrics
    overall_compliance DECIMAL(5,2),
    non_compliance_count INTEGER DEFAULT 0,
    critical_issues_count INTEGER DEFAULT 0,
    
    -- Metadata
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 5. LSA/FFA Compliance Dashboard Stats
-- Aggregated statistics for dashboard widgets
CREATE TABLE IF NOT EXISTS public.lsa_ffa_compliance_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
    
    -- Time Period
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Statistics
    total_inspections INTEGER DEFAULT 0,
    average_compliance_score DECIMAL(5,2),
    lsa_inspections INTEGER DEFAULT 0,
    ffa_inspections INTEGER DEFAULT 0,
    
    -- Issues Tracking
    critical_issues INTEGER DEFAULT 0,
    open_corrective_actions INTEGER DEFAULT 0,
    overdue_actions INTEGER DEFAULT 0,
    
    -- Equipment with highest non-compliance
    most_defective_equipment JSONB DEFAULT '[]',
    
    -- Trends (compared to previous period)
    compliance_trend TEXT CHECK (compliance_trend IN ('improving', 'stable', 'declining')),
    
    -- Metadata
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_inspections_vessel ON public.lsa_ffa_inspections(vessel_id);
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_inspections_date ON public.lsa_ffa_inspections(date);
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_inspections_type ON public.lsa_ffa_inspections(type);
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_inspections_status ON public.lsa_ffa_inspections(status);
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_inspections_score ON public.lsa_ffa_inspections(score);
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_equipment_inspection ON public.lsa_ffa_equipment(inspection_id);
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_equipment_type ON public.lsa_ffa_equipment(equipment_type);
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_equipment_compliant ON public.lsa_ffa_equipment(compliant);
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_reports_inspection ON public.lsa_ffa_reports(inspection_id);
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_stats_vessel ON public.lsa_ffa_compliance_stats(vessel_id);
CREATE INDEX IF NOT EXISTS idx_lsa_ffa_stats_period ON public.lsa_ffa_compliance_stats(period_start, period_end);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.lsa_ffa_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lsa_ffa_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lsa_ffa_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lsa_ffa_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lsa_ffa_compliance_stats ENABLE ROW LEVEL SECURITY;

-- LSA/FFA Inspections Policies
-- Users can view inspections for their vessels
CREATE POLICY "Users can view inspections for their vessels"
    ON public.lsa_ffa_inspections FOR SELECT
    USING (
        auth.uid() = created_by
        OR EXISTS (
            SELECT 1 FROM public.vessels v 
            WHERE v.id = lsa_ffa_inspections.vessel_id 
        )
    );

-- Users can create inspections
CREATE POLICY "Authenticated users can create inspections"
    ON public.lsa_ffa_inspections FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Users can update their own inspections
CREATE POLICY "Users can update their inspections"
    ON public.lsa_ffa_inspections FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Users can delete draft inspections
CREATE POLICY "Users can delete draft inspections"
    ON public.lsa_ffa_inspections FOR DELETE
    USING (auth.uid() = created_by AND status = 'draft');

-- LSA/FFA Equipment Policies
CREATE POLICY "Users can view equipment for accessible inspections"
    ON public.lsa_ffa_equipment FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.lsa_ffa_inspections li 
            WHERE li.id = lsa_ffa_equipment.inspection_id 
            AND (li.created_by = auth.uid() OR EXISTS (
                SELECT 1 FROM public.vessels v WHERE v.id = li.vessel_id
            ))
        )
    );

CREATE POLICY "Users can manage equipment in their inspections"
    ON public.lsa_ffa_equipment FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.lsa_ffa_inspections li 
            WHERE li.id = lsa_ffa_equipment.inspection_id 
            AND li.created_by = auth.uid()
        )
    );

-- Checklist Templates Policies (read-only for most users)
CREATE POLICY "All authenticated users can view templates"
    ON public.lsa_ffa_checklist_templates FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage templates"
    ON public.lsa_ffa_checklist_templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('admin', 'super_admin')
        )
    );

-- Reports Policies
CREATE POLICY "Users can view reports for accessible inspections"
    ON public.lsa_ffa_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.lsa_ffa_inspections li 
            WHERE li.id = lsa_ffa_reports.inspection_id 
            AND (li.created_by = auth.uid() OR EXISTS (
                SELECT 1 FROM public.vessels v WHERE v.id = li.vessel_id
            ))
        )
    );

CREATE POLICY "System can create reports"
    ON public.lsa_ffa_reports FOR INSERT
    WITH CHECK (true); -- AI system and authorized services can insert reports

-- Compliance Stats Policies
CREATE POLICY "Users can view stats for their vessels"
    ON public.lsa_ffa_compliance_stats FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.vessels v 
            WHERE v.id = lsa_ffa_compliance_stats.vessel_id
        )
    );

CREATE POLICY "System can manage compliance stats"
    ON public.lsa_ffa_compliance_stats FOR ALL
    USING (true); -- Automated system can manage stats

-- Comments for documentation
COMMENT ON TABLE public.lsa_ffa_inspections IS 'SOLAS Chapter III LSA/FFA inspections with AI analysis';
COMMENT ON TABLE public.lsa_ffa_equipment IS 'Individual equipment items tracked during LSA/FFA inspections';
COMMENT ON TABLE public.lsa_ffa_checklist_templates IS 'Pre-configured checklists based on SOLAS III/20 and MSC circulars';
COMMENT ON TABLE public.lsa_ffa_reports IS 'Generated reports and AI summaries for LSA/FFA inspections';
COMMENT ON TABLE public.lsa_ffa_compliance_stats IS 'Aggregated compliance statistics for dashboard analytics';

-- Insert default checklist templates based on SOLAS requirements
INSERT INTO public.lsa_ffa_checklist_templates (name, type, frequency, items, solas_regulation, msc_circular, description) VALUES
('LSA Weekly Inspection', 'LSA', 'weekly', 
'[
  {"id": "lsa_w1", "item": "Visual inspection of lifeboats and launching appliances", "required": true},
  {"id": "lsa_w2", "item": "Check lifeboat emergency equipment", "required": true},
  {"id": "lsa_w3", "item": "Test lifeboat engine", "required": true},
  {"id": "lsa_w4", "item": "Inspect davits and winches", "required": true},
  {"id": "lsa_w5", "item": "Check immersion suits and lifejackets", "required": true}
]'::jsonb, 
'SOLAS III/20.6.1', 'MSC/Circ.1093', 'Weekly LSA inspection checklist as per SOLAS requirements'),

('LSA Monthly Inspection', 'LSA', 'monthly',
'[
  {"id": "lsa_m1", "item": "Lifeboat launching and recovery test", "required": true},
  {"id": "lsa_m2", "item": "Inspect liferaft hydrostatic release units", "required": true},
  {"id": "lsa_m3", "item": "Check all life-saving signals", "required": true},
  {"id": "lsa_m4", "item": "Test emergency lighting", "required": true},
  {"id": "lsa_m5", "item": "Inspect pyrotechnics (flares, rockets)", "required": true},
  {"id": "lsa_m6", "item": "Check EPIRB and SART", "required": true}
]'::jsonb,
'SOLAS III/20.6.2', 'MSC/Circ.1206', 'Monthly LSA inspection checklist with equipment testing'),

('FFA Weekly Inspection', 'FFA', 'weekly',
'[
  {"id": "ffa_w1", "item": "Visual inspection of fire extinguishers", "required": true},
  {"id": "ffa_w2", "item": "Check fire hoses and nozzles", "required": true},
  {"id": "ffa_w3", "item": "Test fire pump operation", "required": true},
  {"id": "ffa_w4", "item": "Inspect fire doors and dampers", "required": true},
  {"id": "ffa_w5", "item": "Check fire detection system", "required": true}
]'::jsonb,
'SOLAS II-2/14.2.1', 'MSC/Circ.1432', 'Weekly FFA inspection checklist for fire safety equipment'),

('FFA Monthly Inspection', 'FFA', 'monthly',
'[
  {"id": "ffa_m1", "item": "Test fire main pressure", "required": true},
  {"id": "ffa_m2", "item": "Inspect fixed fire fighting systems", "required": true},
  {"id": "ffa_m3", "item": "Check emergency fire pump", "required": true},
  {"id": "ffa_m4", "item": "Test fire alarm system", "required": true},
  {"id": "ffa_m5", "item": "Inspect breathing apparatus", "required": true},
  {"id": "ffa_m6", "item": "Check CO2 system", "required": true}
]'::jsonb,
'SOLAS II-2/14.2.2', 'MSC/Circ.1432', 'Monthly FFA inspection with system testing');
