-- PATCH 40.0 - Nautilus LLM Core
-- Tabela para armazenar logs e contexto da IA embarcada

CREATE TABLE IF NOT EXISTS public.ia_context_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  module_id TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  execution_time_ms INTEGER,
  model_used TEXT DEFAULT 'gpt-4o-mini',
  context_snapshot JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar snapshots de contexto do sistema
CREATE TABLE IF NOT EXISTS public.system_context_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id TEXT NOT NULL UNIQUE,
  summary TEXT,
  system_status JSONB,
  active_modules JSONB,
  recent_events JSONB,
  performance_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para cache de respostas (fallback)
CREATE TABLE IF NOT EXISTS public.ia_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash TEXT NOT NULL,
  cached_response TEXT NOT NULL,
  model_used TEXT,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ia_context_log_session ON public.ia_context_log(session_id);
CREATE INDEX IF NOT EXISTS idx_ia_context_log_user ON public.ia_context_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ia_context_log_created ON public.ia_context_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_context_snapshots_id ON public.system_context_snapshots(context_id);
CREATE INDEX IF NOT EXISTS idx_response_cache_hash ON public.ia_response_cache(prompt_hash);

-- RLS Policies
ALTER TABLE public.ia_context_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_context_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ia_response_cache ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios logs
CREATE POLICY "Users can view their own IA logs"
  ON public.ia_context_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários autenticados podem inserir logs
CREATE POLICY "Authenticated users can insert IA logs"
  ON public.ia_context_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Todos podem ler snapshots de contexto
CREATE POLICY "Authenticated users can view context snapshots"
  ON public.system_context_snapshots
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Apenas admins podem criar/atualizar snapshots
CREATE POLICY "Admins can manage context snapshots"
  ON public.system_context_snapshots
  FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Cache de respostas acessível por todos autenticados
CREATE POLICY "Authenticated users can view response cache"
  ON public.ia_response_cache
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_context_snapshot_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_context_snapshot_updated_at
  BEFORE UPDATE ON public.system_context_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_context_snapshot_timestamp();