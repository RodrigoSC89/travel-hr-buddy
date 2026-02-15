
-- ============================================
-- RODADA FINAL: Tabelas para módulos revolucionários
-- ============================================

-- 1) PEO-DP Emergency Drills (Anexo O-1)
CREATE TABLE IF NOT EXISTS public.peodp_emergency_drills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id TEXT NOT NULL,
  scenario TEXT NOT NULL,
  description TEXT,
  time_minutes INTEGER DEFAULT 90,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','failed','cancelled')),
  evaluation TEXT DEFAULT 'pending' CHECK (evaluation IN ('satisfactory','needs_improvement','unsatisfactory','pending')),
  drill_date DATE,
  participants TEXT,
  vessel_id UUID REFERENCES public.vessels(id),
  vessel_name TEXT,
  dp_class TEXT DEFAULT 'DP2',
  pre_discussion TEXT,
  observations TEXT,
  results TEXT,
  human_factors TEXT,
  conclusion TEXT,
  corrective_actions TEXT,
  timer_seconds INTEGER DEFAULT 0,
  conducted_by TEXT,
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.peodp_emergency_drills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view drills" ON public.peodp_emergency_drills FOR SELECT USING (true);
CREATE POLICY "Auth users can insert drills" ON public.peodp_emergency_drills FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update drills" ON public.peodp_emergency_drills FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_peodp_drills_vessel ON public.peodp_emergency_drills(vessel_id);
CREATE INDEX idx_peodp_drills_status ON public.peodp_emergency_drills(status);

-- 2) MLC Grievance Procedures (Reg 5.1.5)
CREATE TABLE IF NOT EXISTS public.mlc_grievances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grievance_number TEXT NOT NULL,
  title TEXT NOT NULL,
  complainant TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'filed' CHECK (status IN ('filed','level_1','level_2','level_3','flag_state','resolved','closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  filed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_update DATE DEFAULT CURRENT_DATE,
  description TEXT,
  resolution TEXT,
  days_open INTEGER DEFAULT 0,
  vessel_id UUID REFERENCES public.vessels(id),
  vessel_name TEXT,
  assigned_officer TEXT,
  escalation_history JSONB DEFAULT '[]',
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mlc_grievances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view grievances" ON public.mlc_grievances FOR SELECT USING (true);
CREATE POLICY "Auth users can insert grievances" ON public.mlc_grievances FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update grievances" ON public.mlc_grievances FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_mlc_grievances_status ON public.mlc_grievances(status);

-- 3) PEOTRAM MOC Tracker (Elemento 9)
CREATE TABLE IF NOT EXISTS public.peotram_moc_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moc_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  element TEXT,
  change_type TEXT NOT NULL DEFAULT 'permanent' CHECK (change_type IN ('permanent','temporary','emergency')),
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low','medium','high','critical')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','risk_assessment','approval','implementation','verification','closed')),
  requested_by TEXT,
  request_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  days_open INTEGER DEFAULT 0,
  impact_areas TEXT[] DEFAULT '{}',
  approvals JSONB DEFAULT '[]',
  risk_assessment TEXT,
  implementation_notes TEXT,
  verification_notes TEXT,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.peotram_moc_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view MOCs" ON public.peotram_moc_requests FOR SELECT USING (true);
CREATE POLICY "Auth users can insert MOCs" ON public.peotram_moc_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update MOCs" ON public.peotram_moc_requests FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_peotram_moc_status ON public.peotram_moc_requests(status);

-- 4) PEOTRAM Benchmarking (scores reais por embarcação)
CREATE TABLE IF NOT EXISTS public.peotram_vessel_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  vessel_name TEXT NOT NULL,
  vessel_type TEXT,
  overall_score NUMERIC(5,2) DEFAULT 0,
  element_scores JSONB DEFAULT '{}',
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('up','down','stable')),
  trend_value NUMERIC(5,2) DEFAULT 0,
  last_audit_date DATE,
  ranking INTEGER,
  audit_cycle TEXT,
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.peotram_vessel_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view scores" ON public.peotram_vessel_scores FOR SELECT USING (true);
CREATE POLICY "Auth users can insert scores" ON public.peotram_vessel_scores FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update scores" ON public.peotram_vessel_scores FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_peotram_scores_vessel ON public.peotram_vessel_scores(vessel_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_peodp_drills_updated_at BEFORE UPDATE ON public.peodp_emergency_drills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mlc_grievances_updated_at BEFORE UPDATE ON public.mlc_grievances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_peotram_moc_updated_at BEFORE UPDATE ON public.peotram_moc_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_peotram_scores_updated_at BEFORE UPDATE ON public.peotram_vessel_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
