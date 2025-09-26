-- Criar tabelas para Checklists Operacionais Inteligentes

-- Tabela principal de checklists
CREATE TABLE public.operational_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('dp_dpo', 'dp_maquinas', 'rotina_maquinas', 'rotina_nautica', 'outro')),
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_andamento', 'concluido', 'auditado')),
  compliance_score NUMERIC CHECK (compliance_score >= 0 AND compliance_score <= 100),
  ai_analysis JSONB DEFAULT '{}',
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'pdf', 'image', 'ocr')),
  source_file_url TEXT,
  offline_sync BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

-- Tabela de itens do checklist
CREATE TABLE public.checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.operational_checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  required BOOLEAN NOT NULL DEFAULT true,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID,
  notes TEXT,
  evidence_urls TEXT[],
  voice_note_url TEXT,
  criticality TEXT NOT NULL DEFAULT 'media' CHECK (criticality IN ('baixa', 'media', 'alta', 'critica')),
  order_index INTEGER NOT NULL DEFAULT 0,
  ai_validation_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de evidências (fotos, vídeos, documentos)
CREATE TABLE public.checklist_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document', 'audio')),
  file_size BIGINT,
  description TEXT,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Tabela de análises de IA dos checklists
CREATE TABLE public.checklist_ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.operational_checklists(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('compliance', 'quality', 'risk', 'completeness')),
  overall_score NUMERIC NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  issues_found INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  recommendations TEXT[],
  missing_fields TEXT[],
  inconsistencies TEXT[],
  confidence_level NUMERIC CHECK (confidence_level >= 0 AND confidence_level <= 1),
  analysis_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_ai_model TEXT NOT NULL DEFAULT 'gpt-4'
);

-- Criar tabelas para Módulo PEOTRAM

-- Tabela principal de auditorias PEOTRAM
CREATE TABLE public.peotram_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID,
  vessel_id UUID REFERENCES public.vessels(id),
  audit_period TEXT NOT NULL, -- Ex: "2024-Q1"
  audit_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'preparacao' CHECK (status IN ('preparacao', 'em_andamento', 'concluido', 'aprovado')),
  predicted_score NUMERIC CHECK (predicted_score >= 0 AND predicted_score <= 100),
  final_score NUMERIC CHECK (final_score >= 0 AND final_score <= 100),
  auditor_name TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Tabela de documentos PEOTRAM
CREATE TABLE public.peotram_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.peotram_audits(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- Ex: "seguranca", "qualidade", "ambiental"
  subcategory TEXT,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('pdf', 'image', 'spreadsheet', 'text')),
  file_url TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT true,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ai_analysis_result JSONB,
  compliance_status TEXT DEFAULT 'pendente' CHECK (compliance_status IN ('pendente', 'conforme', 'nao_conforme', 'parcialmente_conforme')),
  ai_confidence NUMERIC CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  manual_verification BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  issues_found TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de análises PEOTRAM por IA
CREATE TABLE public.peotram_ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.peotram_audits(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.peotram_documents(id),
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('document_compliance', 'overall_assessment', 'risk_analysis')),
  category_scores JSONB DEFAULT '{}', -- Scores por categoria
  overall_compliance NUMERIC CHECK (overall_compliance >= 0 AND overall_compliance <= 100),
  critical_findings TEXT[],
  recommendations TEXT[],
  risk_assessment JSONB,
  comparative_analysis JSONB, -- Comparação com auditorias anteriores
  ai_model_used TEXT NOT NULL DEFAULT 'gpt-4',
  confidence_level NUMERIC CHECK (confidence_level >= 0 AND confidence_level <= 1),
  analysis_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de score preditivo PEOTRAM
CREATE TABLE public.peotram_score_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.peotram_audits(id) ON DELETE CASCADE,
  predicted_score NUMERIC NOT NULL CHECK (predicted_score >= 0 AND predicted_score <= 100),
  prediction_confidence NUMERIC CHECK (prediction_confidence >= 0 AND prediction_confidence <= 1),
  score_breakdown JSONB NOT NULL DEFAULT '{}', -- Score por categoria
  improvement_scenarios JSONB DEFAULT '[]', -- "Se adicionar documento X, score melhora Y%"
  risk_factors TEXT[],
  recommended_actions TEXT[],
  based_on_documents INTEGER DEFAULT 0,
  prediction_model TEXT NOT NULL DEFAULT 'linear_regression',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.operational_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_score_predictions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Checklists

-- Checklists operacionais
CREATE POLICY "Users can view their organization checklists" ON public.operational_checklists
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Users can create checklists" ON public.operational_checklists
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their checklists" ON public.operational_checklists
  FOR UPDATE USING (created_by = auth.uid() OR get_user_role() IN ('admin', 'hr_manager'));

-- Itens de checklist
CREATE POLICY "Users can view checklist items" ON public.checklist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.operational_checklists oc
      WHERE oc.id = checklist_items.checklist_id 
      AND (oc.created_by = auth.uid() OR oc.organization_id IN (
        SELECT organization_id FROM public.organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
      ))
    )
  );

CREATE POLICY "Users can manage checklist items" ON public.checklist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.operational_checklists oc
      WHERE oc.id = checklist_items.checklist_id 
      AND (oc.created_by = auth.uid() OR get_user_role() IN ('admin', 'hr_manager'))
    )
  );

-- Evidências
CREATE POLICY "Users can view checklist evidence" ON public.checklist_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checklist_items ci
      JOIN public.operational_checklists oc ON oc.id = ci.checklist_id
      WHERE ci.id = checklist_evidence.checklist_item_id 
      AND (oc.created_by = auth.uid() OR oc.organization_id IN (
        SELECT organization_id FROM public.organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
      ))
    )
  );

CREATE POLICY "Users can manage checklist evidence" ON public.checklist_evidence
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.checklist_items ci
      JOIN public.operational_checklists oc ON oc.id = ci.checklist_id
      WHERE ci.id = checklist_evidence.checklist_item_id 
      AND (oc.created_by = auth.uid() OR get_user_role() IN ('admin', 'hr_manager'))
    )
  );

-- Análises de IA
CREATE POLICY "Users can view AI analysis" ON public.checklist_ai_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.operational_checklists oc
      WHERE oc.id = checklist_ai_analysis.checklist_id 
      AND (oc.created_by = auth.uid() OR oc.organization_id IN (
        SELECT organization_id FROM public.organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
      ))
    )
  );

CREATE POLICY "System can create AI analysis" ON public.checklist_ai_analysis
  FOR INSERT WITH CHECK (true);

-- Políticas RLS para PEOTRAM

-- Auditorias PEOTRAM
CREATE POLICY "Organization users can view PEOTRAM audits" ON public.peotram_audits
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Users can create PEOTRAM audits" ON public.peotram_audits
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update PEOTRAM audits" ON public.peotram_audits
  FOR UPDATE USING (created_by = auth.uid() OR get_user_role() IN ('admin', 'hr_manager'));

-- Documentos PEOTRAM
CREATE POLICY "Users can view PEOTRAM documents" ON public.peotram_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.peotram_audits pa
      WHERE pa.id = peotram_documents.audit_id 
      AND (pa.created_by = auth.uid() OR pa.organization_id IN (
        SELECT organization_id FROM public.organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
      ))
    )
  );

CREATE POLICY "Users can manage PEOTRAM documents" ON public.peotram_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.peotram_audits pa
      WHERE pa.id = peotram_documents.audit_id 
      AND (pa.created_by = auth.uid() OR get_user_role() IN ('admin', 'hr_manager'))
    )
  );

-- Análises PEOTRAM
CREATE POLICY "Users can view PEOTRAM AI analysis" ON public.peotram_ai_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.peotram_audits pa
      WHERE pa.id = peotram_ai_analysis.audit_id 
      AND (pa.created_by = auth.uid() OR pa.organization_id IN (
        SELECT organization_id FROM public.organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
      ))
    )
  );

CREATE POLICY "System can create PEOTRAM AI analysis" ON public.peotram_ai_analysis
  FOR INSERT WITH CHECK (true);

-- Predições de score
CREATE POLICY "Users can view PEOTRAM predictions" ON public.peotram_score_predictions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.peotram_audits pa
      WHERE pa.id = peotram_score_predictions.audit_id 
      AND (pa.created_by = auth.uid() OR pa.organization_id IN (
        SELECT organization_id FROM public.organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
      ))
    )
  );

CREATE POLICY "System can manage PEOTRAM predictions" ON public.peotram_score_predictions
  FOR ALL USING (true);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_operational_checklists_updated_at
  BEFORE UPDATE ON public.operational_checklists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at
  BEFORE UPDATE ON public.checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_peotram_audits_updated_at
  BEFORE UPDATE ON public.peotram_audits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_peotram_score_predictions_updated_at
  BEFORE UPDATE ON public.peotram_score_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();