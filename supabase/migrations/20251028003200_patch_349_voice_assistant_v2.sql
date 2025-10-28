-- PATCH 349: Voice Assistant v2 - Multi-Platform
-- Objective: Multi-platform voice assistant with offline support and command history

-- Voice Sessions Table
CREATE TABLE IF NOT EXISTS voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  platform TEXT NOT NULL, -- 'web', 'mobile_ios', 'mobile_android', 'desktop'
  mode TEXT NOT NULL DEFAULT 'online', -- 'online', 'offline', 'hybrid'
  language TEXT DEFAULT 'pt-BR',
  voice_engine TEXT, -- 'web_speech_api', 'native', 'fallback'
  commands_count INTEGER DEFAULT 0,
  successful_commands INTEGER DEFAULT 0,
  failed_commands INTEGER DEFAULT 0,
  avg_recognition_confidence NUMERIC,
  device_info JSONB,
  location JSONB,
  metadata JSONB
);

-- Voice Commands Table
CREATE TABLE IF NOT EXISTS voice_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES voice_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  command_text TEXT NOT NULL, -- Transcribed text
  command_type TEXT, -- 'navigation', 'query', 'action', 'unknown'
  intent TEXT, -- Detected intent: 'fleet_status', 'create_mission', etc.
  entities JSONB, -- Extracted entities from command
  confidence_score NUMERIC, -- Recognition confidence 0-1
  status TEXT NOT NULL DEFAULT 'processing', -- 'processing', 'executed', 'failed', 'rejected'
  audio_duration_ms INTEGER,
  processing_time_ms INTEGER,
  response_text TEXT, -- Response given to user
  response_audio_url TEXT, -- URL to generated audio response
  executed_action TEXT, -- Action that was executed
  execution_result JSONB,
  error_message TEXT,
  is_offline BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ, -- When offline command was synced
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Voice Command Templates Table (for offline mode)
CREATE TABLE IF NOT EXISTS voice_command_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  command_pattern TEXT NOT NULL, -- Pattern matching template
  intent TEXT NOT NULL,
  description TEXT,
  response_template TEXT NOT NULL,
  action TEXT, -- Action to execute
  requires_online BOOLEAN DEFAULT false,
  popularity_score INTEGER DEFAULT 0, -- Track usage for caching
  language TEXT DEFAULT 'pt-BR',
  parameters JSONB, -- Parameter extraction rules
  examples TEXT[], -- Example phrases
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice Personalities Table (Assistant personalities)
CREATE TABLE IF NOT EXISTS voice_personalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  voice_id TEXT, -- Voice synthesis ID
  language TEXT DEFAULT 'pt-BR',
  tone TEXT DEFAULT 'professional', -- 'professional', 'friendly', 'casual'
  response_style JSONB, -- Response generation parameters
  avatar_url TEXT,
  is_default BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice Command Cache Table (for offline mode)
CREATE TABLE IF NOT EXISTS voice_command_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  command_pattern TEXT NOT NULL,
  intent TEXT NOT NULL,
  cached_response TEXT NOT NULL,
  cached_data JSONB, -- Cached data for offline use
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, command_pattern)
);

-- Voice Settings Table (User preferences)
CREATE TABLE IF NOT EXISTS voice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'pt-BR',
  personality_id UUID REFERENCES voice_personalities(id),
  offline_mode_enabled BOOLEAN DEFAULT true,
  auto_sync BOOLEAN DEFAULT true,
  voice_speed NUMERIC DEFAULT 1.0,
  voice_pitch NUMERIC DEFAULT 1.0,
  wake_word TEXT DEFAULT 'Nautilus',
  wake_word_enabled BOOLEAN DEFAULT false,
  notification_sounds BOOLEAN DEFAULT true,
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user_id ON voice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_started_at ON voice_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_platform ON voice_sessions(platform);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_session_id ON voice_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_voice_commands_session_id ON voice_commands(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_commands_user_id ON voice_commands(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_commands_created_at ON voice_commands(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_commands_intent ON voice_commands(intent);
CREATE INDEX IF NOT EXISTS idx_voice_commands_status ON voice_commands(status);
CREATE INDEX IF NOT EXISTS idx_voice_commands_is_offline ON voice_commands(is_offline);

CREATE INDEX IF NOT EXISTS idx_voice_command_templates_intent ON voice_command_templates(intent);
CREATE INDEX IF NOT EXISTS idx_voice_command_templates_is_enabled ON voice_command_templates(is_enabled);
CREATE INDEX IF NOT EXISTS idx_voice_command_templates_popularity ON voice_command_templates(popularity_score DESC);

CREATE INDEX IF NOT EXISTS idx_voice_command_cache_user_id ON voice_command_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_command_cache_last_used ON voice_command_cache(last_used_at DESC);

-- Enable RLS
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_command_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_personalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_command_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own sessions"
  ON voice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON voice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON voice_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own commands"
  ON voice_commands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own commands"
  ON voice_commands FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view enabled templates"
  ON voice_command_templates FOR SELECT
  USING (is_enabled = true);

CREATE POLICY "Anyone can view enabled personalities"
  ON voice_personalities FOR SELECT
  USING (is_enabled = true);

CREATE POLICY "Users can manage their own cache"
  ON voice_command_cache FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings"
  ON voice_settings FOR ALL
  USING (auth.uid() = user_id);

-- Function to process voice command
CREATE OR REPLACE FUNCTION process_voice_command(
  p_session_id UUID,
  p_command_text TEXT,
  p_confidence_score NUMERIC DEFAULT 0.0
)
RETURNS UUID AS $$
DECLARE
  v_command_id UUID;
  v_user_id UUID;
  v_template RECORD;
  v_intent TEXT;
  v_response TEXT;
BEGIN
  v_user_id := auth.uid();
  
  -- Try to match command with template
  SELECT * INTO v_template
  FROM voice_command_templates
  WHERE is_enabled = true
    AND p_command_text ILIKE '%' || command_pattern || '%'
  ORDER BY popularity_score DESC
  LIMIT 1;
  
  IF v_template IS NOT NULL THEN
    v_intent := v_template.intent;
    v_response := v_template.response_template;
    
    -- Update template popularity
    UPDATE voice_command_templates
    SET popularity_score = popularity_score + 1
    WHERE id = v_template.id;
  ELSE
    v_intent := 'unknown';
    v_response := 'Desculpe, não entendi o comando.';
  END IF;
  
  -- Insert command
  INSERT INTO voice_commands (
    session_id, user_id, command_text, intent,
    confidence_score, status, response_text
  ) VALUES (
    p_session_id, v_user_id, p_command_text, v_intent,
    p_confidence_score, 
    CASE WHEN v_template IS NOT NULL THEN 'executed' ELSE 'failed' END,
    v_response
  ) RETURNING id INTO v_command_id;
  
  -- Update session
  UPDATE voice_sessions
  SET commands_count = commands_count + 1,
      successful_commands = successful_commands + CASE WHEN v_template IS NOT NULL THEN 1 ELSE 0 END,
      failed_commands = failed_commands + CASE WHEN v_template IS NULL THEN 1 ELSE 0 END
  WHERE id = p_session_id;
  
  RETURN v_command_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get popular commands for caching
CREATE OR REPLACE FUNCTION get_popular_commands_for_cache(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  command_pattern TEXT,
  intent TEXT,
  response_template TEXT,
  usage_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vct.command_pattern,
    vct.intent,
    vct.response_template,
    COUNT(vc.id) as usage_count
  FROM voice_command_templates vct
  LEFT JOIN voice_commands vc ON vc.intent = vct.intent
    AND vc.user_id = p_user_id
  WHERE vct.is_enabled = true
    AND vct.requires_online = false
  GROUP BY vct.id, vct.command_pattern, vct.intent, vct.response_template
  ORDER BY usage_count DESC, vct.popularity_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default voice personality
INSERT INTO voice_personalities (name, display_name, description, tone, is_default, is_enabled) VALUES
  ('nautilus-professional', 'Nautilus Professional', 'Professional maritime assistant', 'professional', true, true),
  ('nautilus-friendly', 'Nautilus Amigável', 'Friendly conversational assistant', 'friendly', false, true)
ON CONFLICT DO NOTHING;

-- Insert default command templates
INSERT INTO voice_command_templates (command_pattern, intent, description, response_template, requires_online, examples) VALUES
  ('status da frota', 'fleet_status', 'Check fleet status', 'A frota está operando normalmente. Todos os navios estão em rota.', false, ARRAY['status da frota', 'como está a frota']),
  ('criar missão', 'create_mission', 'Create new mission', 'Iniciando criação de nova missão. Por favor, forneça os detalhes.', true, ARRAY['criar missão', 'nova missão']),
  ('alertas', 'check_alerts', 'Check active alerts', 'Verificando alertas ativos...', true, ARRAY['verificar alertas', 'quais são os alertas']),
  ('navegação', 'navigate', 'Navigate to page', 'Navegando para a página solicitada.', false, ARRAY['ir para', 'abrir', 'navegar para']),
  ('ajuda', 'help', 'Get help', 'Como posso ajudar? Você pode pedir status da frota, criar missões, verificar alertas e mais.', false, ARRAY['ajuda', 'o que você pode fazer'])
ON CONFLICT DO NOTHING;

COMMENT ON TABLE voice_sessions IS 'PATCH 349: Voice assistant sessions tracking';
COMMENT ON TABLE voice_commands IS 'PATCH 349: Voice commands history with transcription';
COMMENT ON TABLE voice_command_templates IS 'PATCH 349: Command templates for offline mode';
COMMENT ON TABLE voice_personalities IS 'PATCH 349: Available voice assistant personalities';
COMMENT ON TABLE voice_command_cache IS 'PATCH 349: Offline command cache per user';
COMMENT ON TABLE voice_settings IS 'PATCH 349: User voice assistant preferences';
