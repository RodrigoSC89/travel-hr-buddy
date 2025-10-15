-- File: supabase/migrations/20251015014110_create_workflow_ai_extension.sql
-- Extensão do módulo de Workflows com inteligência adaptativa

-- Create workflow_ai_suggestions table for AI-generated suggestions
CREATE TABLE IF NOT EXISTS public.workflow_ai_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.smart_workflows(id) ON DELETE CASCADE,
    etapa TEXT,
    tipo_sugestao TEXT,
    conteudo TEXT,
    gerada_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
    gerada_por TEXT DEFAULT 'IA',
    criticidade TEXT,
    responsavel_sugerido TEXT,
    origem TEXT -- exemplo: 'MMI', 'Logs', 'Checklists', etc.
);

-- Add comments to document the table structure
COMMENT ON TABLE public.workflow_ai_suggestions IS 'Armazena sugestões da IA para workflows';
COMMENT ON COLUMN public.workflow_ai_suggestions.workflow_id IS 'Referência ao workflow relacionado';
COMMENT ON COLUMN public.workflow_ai_suggestions.etapa IS 'Etapa do workflow onde a sugestão se aplica';
COMMENT ON COLUMN public.workflow_ai_suggestions.tipo_sugestao IS 'Tipo de sugestão: Criar tarefa, Ajustar prazo, Trocar responsável, etc.';
COMMENT ON COLUMN public.workflow_ai_suggestions.conteudo IS 'Conteúdo detalhado da sugestão';
COMMENT ON COLUMN public.workflow_ai_suggestions.gerada_em IS 'Data e hora quando a sugestão foi gerada';
COMMENT ON COLUMN public.workflow_ai_suggestions.gerada_por IS 'Identificador de quem/o que gerou a sugestão';
COMMENT ON COLUMN public.workflow_ai_suggestions.criticidade IS 'Nível de criticidade da sugestão';
COMMENT ON COLUMN public.workflow_ai_suggestions.responsavel_sugerido IS 'Responsável sugerido pela IA';
COMMENT ON COLUMN public.workflow_ai_suggestions.origem IS 'Origem da sugestão: Checklists, Audit Logs, Relatório MMI, Manual, etc.';

-- Create indexes for better query performance
CREATE INDEX idx_workflow_ai_suggestions_workflow_id ON public.workflow_ai_suggestions(workflow_id);
CREATE INDEX idx_workflow_ai_suggestions_gerada_em ON public.workflow_ai_suggestions(gerada_em DESC);
CREATE INDEX idx_workflow_ai_suggestions_tipo_sugestao ON public.workflow_ai_suggestions(tipo_sugestao);
CREATE INDEX idx_workflow_ai_suggestions_criticidade ON public.workflow_ai_suggestions(criticidade);
CREATE INDEX idx_workflow_ai_suggestions_origem ON public.workflow_ai_suggestions(origem);

-- Enable Row Level Security
ALTER TABLE public.workflow_ai_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated users to view suggestions
CREATE POLICY "Users can view workflow AI suggestions"
    ON public.workflow_ai_suggestions
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policies: Allow authenticated users to create suggestions
CREATE POLICY "Users can create workflow AI suggestions"
    ON public.workflow_ai_suggestions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policies: Allow authenticated users to update suggestions
CREATE POLICY "Users can update workflow AI suggestions"
    ON public.workflow_ai_suggestions
    FOR UPDATE
    TO authenticated
    USING (true);

-- RLS Policies: Allow authenticated users to delete suggestions
CREATE POLICY "Users can delete workflow AI suggestions"
    ON public.workflow_ai_suggestions
    FOR DELETE
    TO authenticated
    USING (true);

-- Create view for recent AI suggestions (last 30 days)
CREATE OR REPLACE VIEW public.workflow_ai_recent AS
SELECT 
    id,
    workflow_id,
    etapa,
    tipo_sugestao,
    conteudo,
    gerada_em,
    gerada_por,
    criticidade,
    responsavel_sugerido,
    origem
FROM public.workflow_ai_suggestions
WHERE gerada_em > now() - INTERVAL '30 days'
ORDER BY gerada_em DESC;

-- Add comment to the view
COMMENT ON VIEW public.workflow_ai_recent IS 'View com sugestões de IA dos últimos 30 dias';
