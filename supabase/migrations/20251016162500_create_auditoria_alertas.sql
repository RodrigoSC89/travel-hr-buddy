-- ===========================
-- AUDITORIA ALERTAS - Critical Alerts System
-- Automated alert system for AI-detected critical failures
-- ===========================

-- Create auditoria_comentarios table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.auditoria_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  comentario TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for auditoria_comentarios
CREATE INDEX IF NOT EXISTS idx_auditoria_comentarios_auditoria_id ON public.auditoria_comentarios(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_comentarios_user_id ON public.auditoria_comentarios(user_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_comentarios_created_at ON public.auditoria_comentarios(created_at DESC);

-- Enable Row Level Security for auditoria_comentarios
ALTER TABLE public.auditoria_comentarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auditoria_comentarios
-- Users can view comments on audits they have access to
CREATE POLICY "Users can view comments on accessible audits"
  ON public.auditoria_comentarios
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca
      WHERE auditorias_imca.id = auditoria_comentarios.auditoria_id
      AND (
        auditorias_imca.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
    )
  );

-- Users can insert comments on their own audits
CREATE POLICY "Users can insert comments on their audits"
  ON public.auditoria_comentarios
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca
      WHERE auditorias_imca.id = auditoria_comentarios.auditoria_id
      AND auditorias_imca.user_id = auth.uid()
    )
  );

-- Admins can insert comments on any audit
CREATE POLICY "Admins can insert comments on any audit"
  ON public.auditoria_comentarios
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- System can insert AI comments (for automated responses)
CREATE POLICY "System can insert AI comments"
  ON public.auditoria_comentarios
  FOR INSERT
  WITH CHECK (user_id = 'ia-auto-responder');

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON public.auditoria_comentarios
  FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.auditoria_comentarios
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- 🔔 Create auditoria_alertas table for critical alerts
CREATE TABLE IF NOT EXISTS public.auditoria_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  comentario_id UUID NOT NULL REFERENCES public.auditoria_comentarios(id) ON DELETE CASCADE,
  tipo TEXT DEFAULT 'Falha Crítica',
  descricao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for auditoria_alertas
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_auditoria_id ON public.auditoria_alertas(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_comentario_id ON public.auditoria_alertas(comentario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_criado_em ON public.auditoria_alertas(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_alertas_tipo ON public.auditoria_alertas(tipo);

-- Enable Row Level Security for auditoria_alertas
ALTER TABLE public.auditoria_alertas ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can view all alerts
CREATE POLICY "Admins podem ver todos os alertas"
  ON public.auditoria_alertas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policy: Users can view alerts on their own audits
CREATE POLICY "Users can view alerts on their audits"
  ON public.auditoria_alertas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca
      WHERE auditorias_imca.id = auditoria_alertas.auditoria_id
      AND auditorias_imca.user_id = auth.uid()
    )
  );

-- RLS Policy: System can insert alerts automatically
CREATE POLICY "Sistema pode inserir alertas"
  ON public.auditoria_alertas
  FOR INSERT
  WITH CHECK (true);

-- 🤖 Create trigger function to detect critical failures from AI comments
CREATE OR REPLACE FUNCTION public.inserir_alerta_critico()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if comment is from AI and contains critical failure warning
  IF NEW.user_id = 'ia-auto-responder' AND NEW.comentario LIKE '⚠️ Atenção:%' THEN
    INSERT INTO public.auditoria_alertas (auditoria_id, comentario_id, descricao)
    VALUES (NEW.auditoria_id, NEW.id, NEW.comentario);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create alerts
CREATE TRIGGER trigger_alerta_ia
  AFTER INSERT ON public.auditoria_comentarios
  FOR EACH ROW
  EXECUTE FUNCTION public.inserir_alerta_critico();

-- Add table and column comments
COMMENT ON TABLE public.auditoria_comentarios IS 'Tabela de comentários para auditorias IMCA';
COMMENT ON COLUMN public.auditoria_comentarios.id IS 'Identificador único do comentário';
COMMENT ON COLUMN public.auditoria_comentarios.auditoria_id IS 'ID da auditoria relacionada';
COMMENT ON COLUMN public.auditoria_comentarios.user_id IS 'ID do usuário ou "ia-auto-responder" para IA';
COMMENT ON COLUMN public.auditoria_comentarios.comentario IS 'Texto do comentário';
COMMENT ON COLUMN public.auditoria_comentarios.created_at IS 'Data/hora de criação';

COMMENT ON TABLE public.auditoria_alertas IS 'Tabela de alertas críticos detectados por IA em auditorias';
COMMENT ON COLUMN public.auditoria_alertas.id IS 'Identificador único do alerta';
COMMENT ON COLUMN public.auditoria_alertas.auditoria_id IS 'ID da auditoria relacionada';
COMMENT ON COLUMN public.auditoria_alertas.comentario_id IS 'ID do comentário que gerou o alerta';
COMMENT ON COLUMN public.auditoria_alertas.tipo IS 'Tipo do alerta (padrão: Falha Crítica)';
COMMENT ON COLUMN public.auditoria_alertas.descricao IS 'Descrição completa do alerta';
COMMENT ON COLUMN public.auditoria_alertas.criado_em IS 'Data/hora de criação do alerta';
