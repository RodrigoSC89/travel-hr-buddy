-- PATCH 571-573: Sistema de Tradução Multilíngue
-- Tabelas para cache de traduções e logs multilíngues

-- 1. Tabela de cache de traduções
CREATE TABLE IF NOT EXISTS translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  lang TEXT NOT NULL CHECK (lang IN ('pt', 'en', 'es', 'fr', 'de')),
  value TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('json', 'ai', 'fallback')),
  confidence DECIMAL(3, 2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(key, lang)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_translation_cache_lang ON translation_cache(lang);
CREATE INDEX IF NOT EXISTS idx_translation_cache_key ON translation_cache(key);
CREATE INDEX IF NOT EXISTS idx_translation_cache_created ON translation_cache(created_at);

-- 2. Adicionar campo de idioma nas tabelas de logs existentes
ALTER TABLE IF EXISTS access_logs 
  ADD COLUMN IF NOT EXISTS user_language TEXT DEFAULT 'en' CHECK (user_language IN ('pt', 'en', 'es', 'fr', 'de'));

ALTER TABLE IF EXISTS ai_feedback 
  ADD COLUMN IF NOT EXISTS feedback_language TEXT DEFAULT 'en' CHECK (feedback_language IN ('pt', 'en', 'es', 'fr', 'de'));

-- 3. Tabela de logs de tradução (auditoria)
CREATE TABLE IF NOT EXISTS translation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  source_lang TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  key TEXT NOT NULL,
  translation TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('json', 'ai', 'fallback')),
  confidence DECIMAL(3, 2),
  response_time_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para logs de tradução
CREATE INDEX IF NOT EXISTS idx_translation_logs_user ON translation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_translation_logs_target_lang ON translation_logs(target_lang);
CREATE INDEX IF NOT EXISTS idx_translation_logs_created ON translation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_translation_logs_success ON translation_logs(success);

-- 4. Tabela de estatísticas de uso de idiomas
CREATE TABLE IF NOT EXISTS language_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language TEXT NOT NULL CHECK (language IN ('pt', 'en', 'es', 'fr', 'de')),
  region TEXT,
  user_count INTEGER DEFAULT 0,
  translation_count INTEGER DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(language, date, region)
);

-- Índices para estatísticas
CREATE INDEX IF NOT EXISTS idx_language_usage_stats_lang ON language_usage_stats(language);
CREATE INDEX IF NOT EXISTS idx_language_usage_stats_date ON language_usage_stats(date);

-- 5. Tabela de feedback de tradução
CREATE TABLE IF NOT EXISTS translation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  translation_id UUID REFERENCES translation_logs(id),
  original_translation TEXT NOT NULL,
  suggested_translation TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Índices para feedback
CREATE INDEX IF NOT EXISTS idx_translation_feedback_user ON translation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_translation_feedback_status ON translation_feedback(status);
CREATE INDEX IF NOT EXISTS idx_translation_feedback_created ON translation_feedback(created_at);

-- 6. RLS Policies
ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_feedback ENABLE ROW LEVEL SECURITY;

-- Policies para translation_cache (leitura pública, escrita restrita)
CREATE POLICY "Public can read translation cache" ON translation_cache
  FOR SELECT USING (true);

CREATE POLICY "System can write translation cache" ON translation_cache
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update translation cache" ON translation_cache
  FOR UPDATE USING (true);

-- Policies para translation_logs (usuários podem ver seus próprios logs)
CREATE POLICY "Users can read own translation logs" ON translation_logs
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "System can insert translation logs" ON translation_logs
  FOR INSERT WITH CHECK (true);

-- Policies para language_usage_stats (leitura pública)
CREATE POLICY "Public can read language stats" ON language_usage_stats
  FOR SELECT USING (true);

CREATE POLICY "System can write language stats" ON language_usage_stats
  FOR ALL USING (true);

-- Policies para translation_feedback
CREATE POLICY "Users can read own feedback" ON translation_feedback
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Users can create feedback" ON translation_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update feedback" ON translation_feedback
  FOR UPDATE USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- 7. Função para atualizar estatísticas de uso
CREATE OR REPLACE FUNCTION update_language_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO language_usage_stats (language, date, translation_count)
  VALUES (NEW.target_lang, CURRENT_DATE, 1)
  ON CONFLICT (language, date, region)
  DO UPDATE SET
    translation_count = language_usage_stats.translation_count + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estatísticas automaticamente
CREATE TRIGGER update_language_stats_trigger
AFTER INSERT ON translation_logs
FOR EACH ROW
EXECUTE FUNCTION update_language_usage_stats();

-- 8. Função para limpar cache antigo (> 7 dias)
CREATE OR REPLACE FUNCTION cleanup_old_translation_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM translation_cache
  WHERE created_at < NOW() - INTERVAL '7 days'
  AND source = 'ai';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE translation_cache IS 'Cache de traduções com suporte a AI fallback';
COMMENT ON TABLE translation_logs IS 'Logs de auditoria de todas as traduções realizadas';
COMMENT ON TABLE language_usage_stats IS 'Estatísticas agregadas de uso por idioma';
COMMENT ON TABLE translation_feedback IS 'Feedback dos usuários sobre traduções';
COMMENT ON FUNCTION update_language_usage_stats() IS 'Atualiza estatísticas de uso de idiomas automaticamente';
COMMENT ON FUNCTION cleanup_old_translation_cache() IS 'Remove traduções AI do cache após 7 dias';
