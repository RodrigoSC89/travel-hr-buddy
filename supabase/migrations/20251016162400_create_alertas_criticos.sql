-- ===========================
-- ALERTAS CRÍTICOS - Critical Alerts System
-- Tables for storing critical alerts from audit comments
-- ===========================

-- Create comentarios_auditoria table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.comentarios_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comentario TEXT NOT NULL,
  tipo TEXT DEFAULT 'normal' CHECK (tipo IN ('normal', 'critico', 'info', 'warning')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create alertas_criticos table
CREATE TABLE IF NOT EXISTS public.alertas_criticos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  comentario_id UUID REFERENCES public.comentarios_auditoria(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  nivel TEXT DEFAULT 'critico' CHECK (nivel IN ('critico', 'alto', 'medio', 'baixo')),
  resolvido BOOLEAN DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolvido_em TIMESTAMP WITH TIME ZONE,
  resolvido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE public.comentarios_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_criticos ENABLE ROW LEVEL SECURITY;

-- Policies for comentarios_auditoria
CREATE POLICY "Users can view comments from their audits"
  ON public.comentarios_auditoria
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca
      WHERE auditorias_imca.id = comentarios_auditoria.auditoria_id
      AND auditorias_imca.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all comments"
  ON public.comentarios_auditoria
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert comments on their audits"
  ON public.comentarios_auditoria
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auditorias_imca
      WHERE auditorias_imca.id = comentarios_auditoria.auditoria_id
      AND auditorias_imca.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert any comments"
  ON public.comentarios_auditoria
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies for alertas_criticos
CREATE POLICY "Admins can view all alerts"
  ON public.alertas_criticos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert alerts"
  ON public.alertas_criticos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update alerts"
  ON public.alertas_criticos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete alerts"
  ON public.alertas_criticos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comentarios_auditoria_auditoria_id ON public.comentarios_auditoria(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_auditoria_user_id ON public.comentarios_auditoria(user_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_auditoria_criado_em ON public.comentarios_auditoria(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_comentarios_auditoria_tipo ON public.comentarios_auditoria(tipo);

CREATE INDEX IF NOT EXISTS idx_alertas_criticos_auditoria_id ON public.alertas_criticos(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_alertas_criticos_comentario_id ON public.alertas_criticos(comentario_id);
CREATE INDEX IF NOT EXISTS idx_alertas_criticos_criado_em ON public.alertas_criticos(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_alertas_criticos_nivel ON public.alertas_criticos(nivel);
CREATE INDEX IF NOT EXISTS idx_alertas_criticos_resolvido ON public.alertas_criticos(resolvido);

-- Create trigger for updating atualizado_em timestamp
CREATE OR REPLACE FUNCTION update_comentarios_auditoria_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comentarios_auditoria_atualizado_em
  BEFORE UPDATE ON public.comentarios_auditoria
  FOR EACH ROW
  EXECUTE FUNCTION update_comentarios_auditoria_atualizado_em();

-- Add table and column comments
COMMENT ON TABLE public.comentarios_auditoria IS 'Comments associated with audits';
COMMENT ON TABLE public.alertas_criticos IS 'Critical alerts generated from audit comments and findings';

COMMENT ON COLUMN public.alertas_criticos.id IS 'Unique identifier for the alert';
COMMENT ON COLUMN public.alertas_criticos.auditoria_id IS 'Reference to the audit';
COMMENT ON COLUMN public.alertas_criticos.comentario_id IS 'Reference to the comment that triggered the alert';
COMMENT ON COLUMN public.alertas_criticos.descricao IS 'Description of the critical alert';
COMMENT ON COLUMN public.alertas_criticos.nivel IS 'Severity level of the alert';
COMMENT ON COLUMN public.alertas_criticos.resolvido IS 'Whether the alert has been resolved';
COMMENT ON COLUMN public.alertas_criticos.criado_em IS 'Timestamp when alert was created';
COMMENT ON COLUMN public.alertas_criticos.resolvido_em IS 'Timestamp when alert was resolved';
COMMENT ON COLUMN public.alertas_criticos.resolvido_por IS 'User who resolved the alert';

-- Insert sample data for testing
DO $$
DECLARE
  sample_user_id UUID;
  sample_auditoria_id UUID;
  sample_comentario_id UUID;
BEGIN
  -- Try to get an existing user or use a placeholder
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  IF sample_user_id IS NULL THEN
    -- If no users exist, we'll skip sample data insertion
    RAISE NOTICE 'No users found, skipping sample data insertion';
    RETURN;
  END IF;

  -- Create a sample audit
  INSERT INTO public.auditorias_imca (user_id, title, description, status, score)
  VALUES (
    sample_user_id,
    'Auditoria de Segurança Crítica',
    'Auditoria identificou problemas críticos de segurança',
    'in_progress',
    45
  )
  RETURNING id INTO sample_auditoria_id;

  -- Create sample comments
  INSERT INTO public.comentarios_auditoria (auditoria_id, user_id, comentario, tipo)
  VALUES 
    (sample_auditoria_id, sample_user_id, 'Identificado vazamento de informações sensíveis', 'critico'),
    (sample_auditoria_id, sample_user_id, 'Falta de controle de acesso em área crítica', 'critico'),
    (sample_auditoria_id, sample_user_id, 'Documentação incompleta', 'warning')
  RETURNING id INTO sample_comentario_id;

  -- Create sample alerts
  INSERT INTO public.alertas_criticos (auditoria_id, comentario_id, descricao, nivel, resolvido)
  VALUES 
    (
      sample_auditoria_id,
      sample_comentario_id,
      'CRÍTICO: Vazamento de informações sensíveis detectado durante auditoria.' || E'\n' ||
      'Ação imediata necessária para corrigir vulnerabilidades de segurança.' || E'\n' ||
      'Recomenda-se revisão completa dos controles de acesso.',
      'critico',
      false
    ),
    (
      sample_auditoria_id,
      NULL,
      'CRÍTICO: Áreas de acesso restrito sem controles adequados.' || E'\n' ||
      'Implementar controles de acesso imediatamente.' || E'\n' ||
      'Risco: Alto - Acesso não autorizado a áreas críticas.',
      'critico',
      false
    );

  RAISE NOTICE 'Sample data inserted successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting sample data: %', SQLERRM;
END $$;
