-- MLC Digital Inspection Module with AI
-- Creates tables for MLC 2006 maritime labour compliance inspections

-- 1. MLC Inspections Table
CREATE TABLE IF NOT EXISTS public.mlc_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Vessel and Inspector Information
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
    inspector_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    inspector_name TEXT NOT NULL,
    
    -- Inspection Details
    inspection_date TIMESTAMPTZ DEFAULT now(),
    inspection_type TEXT CHECK (inspection_type IN ('initial', 'renewal', 'intermediate', 'port_state_control', 'flag_state')),
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'submitted', 'reviewed', 'approved')),
    
    -- Compliance Score (calculated)
    compliance_score DECIMAL(5,2) CHECK (compliance_score BETWEEN 0 AND 100),
    
    -- General Notes
    notes TEXT,
    recommendations TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Audit fields
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ
);

-- 2. MLC Findings Table (checklist items)
CREATE TABLE IF NOT EXISTS public.mlc_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES public.mlc_inspections(id) ON DELETE CASCADE,
    
    -- MLC Reference
    mlc_title TEXT NOT NULL, -- Title 1-5 of MLC 2006
    mlc_regulation TEXT NOT NULL, -- e.g., "1.1", "2.3", "3.1"
    mlc_standard TEXT, -- e.g., "A1.1", "B2.3"
    
    -- Finding Details
    category TEXT NOT NULL, -- e.g., "Minimum Age", "Medical Certification", "Food and Catering"
    description TEXT NOT NULL,
    
    -- Compliance Assessment
    compliance BOOLEAN NOT NULL,
    severity TEXT CHECK (severity IN ('critical', 'major', 'minor', 'observation')),
    
    -- Actions and Explanations
    corrective_action TEXT,
    ai_explanation TEXT, -- AI-generated explanation and recommendations
    
    -- Evidence References
    evidence_attached BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. MLC Evidences Table (documents, photos, etc.)
CREATE TABLE IF NOT EXISTS public.mlc_evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES public.mlc_inspections(id) ON DELETE CASCADE,
    finding_id UUID REFERENCES public.mlc_findings(id) ON DELETE CASCADE,
    
    -- File Information
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'image', 'pdf', 'document', 'video'
    file_url TEXT NOT NULL,
    file_size INTEGER, -- in bytes
    
    -- OCR and AI Analysis
    ocr_text TEXT, -- extracted text from OCR
    ai_analysis TEXT, -- AI analysis of the evidence
    
    -- Metadata
    description TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. MLC AI Reports Table
CREATE TABLE IF NOT EXISTS public.mlc_ai_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES public.mlc_inspections(id) ON DELETE CASCADE,
    
    -- Report Content
    summary TEXT NOT NULL,
    key_findings TEXT[],
    suggestions TEXT,
    risk_assessment TEXT,
    
    -- AI Model Info
    model_used TEXT,
    confidence_score DECIMAL(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
    
    -- Metadata
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mlc_inspections_vessel ON public.mlc_inspections(vessel_id);
CREATE INDEX IF NOT EXISTS idx_mlc_inspections_inspector ON public.mlc_inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_mlc_inspections_date ON public.mlc_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_mlc_inspections_status ON public.mlc_inspections(status);
CREATE INDEX IF NOT EXISTS idx_mlc_findings_inspection ON public.mlc_findings(inspection_id);
CREATE INDEX IF NOT EXISTS idx_mlc_findings_compliance ON public.mlc_findings(compliance);
CREATE INDEX IF NOT EXISTS idx_mlc_evidences_inspection ON public.mlc_evidences(inspection_id);
CREATE INDEX IF NOT EXISTS idx_mlc_evidences_finding ON public.mlc_evidences(finding_id);
CREATE INDEX IF NOT EXISTS idx_mlc_ai_reports_inspection ON public.mlc_ai_reports(inspection_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.mlc_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlc_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlc_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlc_ai_reports ENABLE ROW LEVEL SECURITY;

-- MLC Inspections Policies
-- Users can view inspections for their vessels or if they are the inspector
CREATE POLICY "Users can view their related inspections"
    ON public.mlc_inspections FOR SELECT
    USING (
        auth.uid() = inspector_id 
        OR auth.uid() = created_by
        OR EXISTS (
            SELECT 1 FROM public.vessels v 
            WHERE v.id = mlc_inspections.vessel_id 
            AND v.organization_id IN (
                SELECT organization_id FROM public.profiles WHERE id = auth.uid()
            )
        )
    );

-- Users can insert inspections
CREATE POLICY "Users can create inspections"
    ON public.mlc_inspections FOR INSERT
    WITH CHECK (auth.uid() = inspector_id OR auth.uid() = created_by);

-- Users can update their own inspections (before submission)
CREATE POLICY "Users can update their inspections"
    ON public.mlc_inspections FOR UPDATE
    USING (auth.uid() = inspector_id OR auth.uid() = created_by)
    WITH CHECK (auth.uid() = inspector_id OR auth.uid() = created_by);

-- Users can delete draft inspections
CREATE POLICY "Users can delete draft inspections"
    ON public.mlc_inspections FOR DELETE
    USING (auth.uid() = inspector_id AND status = 'draft');

-- MLC Findings Policies
CREATE POLICY "Users can view findings for accessible inspections"
    ON public.mlc_findings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.mlc_inspections mi 
            WHERE mi.id = mlc_findings.inspection_id 
            AND (
                mi.inspector_id = auth.uid() 
                OR mi.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.vessels v 
                    WHERE v.id = mi.vessel_id 
                    AND v.organization_id IN (
                        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Users can manage findings in their inspections"
    ON public.mlc_findings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.mlc_inspections mi 
            WHERE mi.id = mlc_findings.inspection_id 
            AND (mi.inspector_id = auth.uid() OR mi.created_by = auth.uid())
        )
    );

-- MLC Evidences Policies
CREATE POLICY "Users can view evidences for accessible inspections"
    ON public.mlc_evidences FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.mlc_inspections mi 
            WHERE mi.id = mlc_evidences.inspection_id 
            AND (
                mi.inspector_id = auth.uid() 
                OR mi.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.vessels v 
                    WHERE v.id = mi.vessel_id 
                    AND v.organization_id IN (
                        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Users can manage evidences in their inspections"
    ON public.mlc_evidences FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.mlc_inspections mi 
            WHERE mi.id = mlc_evidences.inspection_id 
            AND (mi.inspector_id = auth.uid() OR mi.created_by = auth.uid())
        )
    );

-- MLC AI Reports Policies
CREATE POLICY "Users can view AI reports for accessible inspections"
    ON public.mlc_ai_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.mlc_inspections mi 
            WHERE mi.id = mlc_ai_reports.inspection_id 
            AND (
                mi.inspector_id = auth.uid() 
                OR mi.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.vessels v 
                    WHERE v.id = mi.vessel_id 
                    AND v.organization_id IN (
                        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "System can create AI reports"
    ON public.mlc_ai_reports FOR INSERT
    WITH CHECK (true); -- AI system can insert reports

-- Comments
COMMENT ON TABLE public.mlc_inspections IS 'MLC 2006 maritime labour compliance inspections';
COMMENT ON TABLE public.mlc_findings IS 'Individual checklist items and findings from MLC inspections';
COMMENT ON TABLE public.mlc_evidences IS 'Evidence files (photos, documents) attached to inspections';
COMMENT ON TABLE public.mlc_ai_reports IS 'AI-generated analysis and recommendations for inspections';
