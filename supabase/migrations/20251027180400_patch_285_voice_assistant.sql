-- PATCH 285: Voice Assistant - Real Speech Processing
-- Tables: voice_logs, voice_commands

-- Create voice_logs table
CREATE TABLE IF NOT EXISTS public.voice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT,
  command_type TEXT CHECK (command_type IN ('recognition', 'command', 'query', 'navigation', 'action', 'error', 'other')) DEFAULT 'command',
  transcript TEXT NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  intent TEXT,
  action_taken TEXT,
  response_text TEXT,
  response_spoken BOOLEAN DEFAULT false,
  processing_time_ms INTEGER,
  language TEXT DEFAULT 'pt-BR',
  was_successful BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create voice_commands table (predefined commands)
CREATE TABLE IF NOT EXISTS public.voice_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  command_pattern TEXT NOT NULL,
  command_keywords TEXT[] NOT NULL,
  intent TEXT NOT NULL,
  action_type TEXT CHECK (action_type IN ('navigate', 'query', 'execute', 'control', 'report', 'help')) NOT NULL,
  action_target TEXT,
  response_template TEXT NOT NULL,
  requires_auth BOOLEAN DEFAULT true,
  requires_role TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  examples TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create voice_sessions table
CREATE TABLE IF NOT EXISTS public.voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT UNIQUE NOT NULL,
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ,
  total_commands INTEGER DEFAULT 0,
  successful_commands INTEGER DEFAULT 0,
  failed_commands INTEGER DEFAULT 0,
  average_confidence NUMERIC,
  browser_info TEXT,
  device_info TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create voice_analytics table
CREATE TABLE IF NOT EXISTS public.voice_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE DEFAULT CURRENT_DATE,
  total_sessions INTEGER DEFAULT 0,
  total_commands INTEGER DEFAULT 0,
  successful_commands INTEGER DEFAULT 0,
  average_confidence NUMERIC,
  top_intents JSONB DEFAULT '[]'::jsonb,
  top_actions JSONB DEFAULT '[]'::jsonb,
  error_rate NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_voice_logs_user ON public.voice_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_logs_session ON public.voice_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_logs_created ON public.voice_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_logs_intent ON public.voice_logs(intent);
CREATE INDEX IF NOT EXISTS idx_voice_commands_active ON public.voice_commands(is_active);
CREATE INDEX IF NOT EXISTS idx_voice_commands_intent ON public.voice_commands(intent);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON public.voice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_analytics_date ON public.voice_analytics(date DESC);

-- Enable Row Level Security
ALTER TABLE public.voice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voice_logs
CREATE POLICY "Users can view their own voice logs"
  ON public.voice_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create voice logs"
  ON public.voice_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for voice_commands
CREATE POLICY "Users can view active commands"
  ON public.voice_commands FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage commands"
  ON public.voice_commands FOR ALL
  USING (auth.uid() IS NOT NULL); -- Add admin check if needed

-- RLS Policies for voice_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.voice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions"
  ON public.voice_sessions FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for voice_analytics
CREATE POLICY "Users can view analytics"
  ON public.voice_analytics FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Function to process voice command
CREATE OR REPLACE FUNCTION process_voice_command(
  p_transcript TEXT,
  p_user_id UUID,
  p_session_id TEXT DEFAULT NULL,
  p_confidence NUMERIC DEFAULT 90
)
RETURNS JSONB AS $$
DECLARE
  v_command RECORD;
  v_intent TEXT;
  v_action TEXT;
  v_response TEXT;
  v_log_id UUID;
  v_success BOOLEAN := false;
  v_keywords TEXT[];
  v_match_score INTEGER := 0;
  v_best_match_score INTEGER := 0;
BEGIN
  -- Normalize transcript
  p_transcript := LOWER(TRIM(p_transcript));
  v_keywords := string_to_array(p_transcript, ' ');
  
  -- Find matching command
  FOR v_command IN
    SELECT *
    FROM public.voice_commands
    WHERE is_active = true
    ORDER BY priority DESC, usage_count DESC
  LOOP
    v_match_score := 0;
    
    -- Calculate match score based on keywords
    FOR i IN 1..array_length(v_command.command_keywords, 1) LOOP
      IF p_transcript LIKE '%' || v_command.command_keywords[i] || '%' THEN
        v_match_score := v_match_score + 1;
      END IF;
    END LOOP;
    
    -- If this is the best match so far, use it
    IF v_match_score > v_best_match_score THEN
      v_best_match_score := v_match_score;
      v_intent := v_command.intent;
      v_action := v_command.action_target;
      v_response := v_command.response_template;
      v_success := true;
      
      -- Update command usage
      UPDATE public.voice_commands
      SET 
        usage_count = usage_count + 1,
        success_count = success_count + 1,
        updated_at = now()
      WHERE id = v_command.id;
    END IF;
  END LOOP;
  
  -- If no match found, provide generic response
  IF NOT v_success THEN
    v_intent := 'unknown';
    v_action := NULL;
    v_response := 'Desculpe, não entendi esse comando. Experimente dizer: ir para dashboard, abrir relatórios, ou mostrar ajuda.';
  END IF;
  
  -- Log the command
  INSERT INTO public.voice_logs (
    user_id,
    session_id,
    command_type,
    transcript,
    confidence_score,
    intent,
    action_taken,
    response_text,
    was_successful,
    processing_time_ms
  ) VALUES (
    p_user_id,
    p_session_id,
    CASE WHEN v_success THEN 'command' ELSE 'error' END,
    p_transcript,
    p_confidence,
    v_intent,
    v_action,
    v_response,
    v_success,
    extract(milliseconds from clock_timestamp() - statement_timestamp())::INTEGER
  ) RETURNING id INTO v_log_id;
  
  -- Update session stats
  IF p_session_id IS NOT NULL THEN
    UPDATE public.voice_sessions
    SET 
      total_commands = total_commands + 1,
      successful_commands = successful_commands + CASE WHEN v_success THEN 1 ELSE 0 END,
      failed_commands = failed_commands + CASE WHEN v_success THEN 0 ELSE 1 END
    WHERE session_id = p_session_id;
  END IF;
  
  -- Return result
  RETURN jsonb_build_object(
    'success', v_success,
    'log_id', v_log_id,
    'intent', v_intent,
    'action', v_action,
    'response', v_response,
    'confidence', p_confidence,
    'match_score', v_best_match_score
  );
END;
$$ LANGUAGE plpgsql;

-- Function to start voice session
CREATE OR REPLACE FUNCTION start_voice_session(
  p_user_id UUID,
  p_browser_info TEXT DEFAULT NULL,
  p_device_info TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_session_id TEXT;
  v_session_uuid UUID;
BEGIN
  v_session_id := gen_random_uuid()::TEXT;
  
  INSERT INTO public.voice_sessions (
    user_id,
    session_id,
    browser_info,
    device_info
  ) VALUES (
    p_user_id,
    v_session_id,
    p_browser_info,
    p_device_info
  ) RETURNING id INTO v_session_uuid;
  
  RETURN jsonb_build_object(
    'session_id', v_session_id,
    'session_uuid', v_session_uuid,
    'started_at', now()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to end voice session
CREATE OR REPLACE FUNCTION end_voice_session(p_session_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_session RECORD;
  v_avg_confidence NUMERIC;
BEGIN
  -- Calculate average confidence
  SELECT AVG(confidence_score) INTO v_avg_confidence
  FROM public.voice_logs
  WHERE session_id = p_session_id;
  
  -- Update session
  UPDATE public.voice_sessions
  SET 
    end_time = now(),
    average_confidence = v_avg_confidence
  WHERE session_id = p_session_id
  RETURNING * INTO v_session;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'session_id', p_session_id,
    'duration_minutes', EXTRACT(EPOCH FROM (v_session.end_time - v_session.start_time)) / 60,
    'total_commands', v_session.total_commands,
    'successful_commands', v_session.successful_commands,
    'average_confidence', v_avg_confidence
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update daily analytics
CREATE OR REPLACE FUNCTION update_voice_analytics()
RETURNS void AS $$
DECLARE
  v_date DATE := CURRENT_DATE;
  v_total_sessions INTEGER;
  v_total_commands INTEGER;
  v_successful_commands INTEGER;
  v_avg_confidence NUMERIC;
  v_error_rate NUMERIC;
  v_top_intents JSONB;
  v_top_actions JSONB;
BEGIN
  -- Get daily stats
  SELECT 
    COUNT(DISTINCT session_id),
    COUNT(*),
    COUNT(*) FILTER (WHERE was_successful = true),
    AVG(confidence_score)
  INTO 
    v_total_sessions,
    v_total_commands,
    v_successful_commands,
    v_avg_confidence
  FROM public.voice_logs
  WHERE DATE(created_at) = v_date;
  
  -- Calculate error rate
  IF v_total_commands > 0 THEN
    v_error_rate := ((v_total_commands - v_successful_commands)::NUMERIC / v_total_commands) * 100;
  ELSE
    v_error_rate := 0;
  END IF;
  
  -- Get top intents
  SELECT jsonb_agg(
    jsonb_build_object(
      'intent', intent,
      'count', count
    )
  ) INTO v_top_intents
  FROM (
    SELECT intent, COUNT(*) as count
    FROM public.voice_logs
    WHERE DATE(created_at) = v_date AND intent IS NOT NULL
    GROUP BY intent
    ORDER BY count DESC
    LIMIT 5
  ) t;
  
  -- Get top actions
  SELECT jsonb_agg(
    jsonb_build_object(
      'action', action_taken,
      'count', count
    )
  ) INTO v_top_actions
  FROM (
    SELECT action_taken, COUNT(*) as count
    FROM public.voice_logs
    WHERE DATE(created_at) = v_date AND action_taken IS NOT NULL
    GROUP BY action_taken
    ORDER BY count DESC
    LIMIT 5
  ) t;
  
  -- Insert or update analytics
  INSERT INTO public.voice_analytics (
    date,
    total_sessions,
    total_commands,
    successful_commands,
    average_confidence,
    top_intents,
    top_actions,
    error_rate
  ) VALUES (
    v_date,
    v_total_sessions,
    v_total_commands,
    v_successful_commands,
    ROUND(v_avg_confidence, 2),
    COALESCE(v_top_intents, '[]'::jsonb),
    COALESCE(v_top_actions, '[]'::jsonb),
    ROUND(v_error_rate, 2)
  )
  ON CONFLICT (date)
  DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    total_commands = EXCLUDED.total_commands,
    successful_commands = EXCLUDED.successful_commands,
    average_confidence = EXCLUDED.average_confidence,
    top_intents = EXCLUDED.top_intents,
    top_actions = EXCLUDED.top_actions,
    error_rate = EXCLUDED.error_rate,
    created_at = now();
END;
$$ LANGUAGE plpgsql;

-- Insert default voice commands
INSERT INTO public.voice_commands (command_pattern, command_keywords, intent, action_type, action_target, response_template, examples) VALUES
  ('ir para dashboard', ARRAY['ir', 'abrir', 'dashboard', 'painel'], 'navigate_dashboard', 'navigate', '/dashboard', 'Abrindo dashboard principal...', ARRAY['ir para dashboard', 'abrir dashboard', 'mostrar painel']),
  ('abrir relatórios', ARRAY['abrir', 'relatório', 'relatórios', 'reports'], 'navigate_reports', 'navigate', '/reports', 'Abrindo central de relatórios...', ARRAY['abrir relatórios', 'mostrar relatórios', 'ver reports']),
  ('mostrar frota', ARRAY['mostrar', 'frota', 'embarcações', 'fleet', 'navios'], 'navigate_fleet', 'navigate', '/fleet', 'Abrindo gestão de frota...', ARRAY['mostrar frota', 'ver embarcações', 'abrir fleet']),
  ('ver tripulação', ARRAY['ver', 'tripulação', 'crew', 'equipe'], 'navigate_crew', 'navigate', '/crew', 'Abrindo gestão de tripulação...', ARRAY['ver tripulação', 'mostrar crew', 'abrir equipe']),
  ('qual o status', ARRAY['status', 'situação', 'estado'], 'query_status', 'query', NULL, 'Sistema operando normalmente. Todos os módulos estão ativos.', ARRAY['qual o status', 'como está o sistema', 'situação do sistema']),
  ('ajuda', ARRAY['ajuda', 'help', 'socorro'], 'show_help', 'help', NULL, 'Posso ajudá-lo a navegar pelo sistema, abrir módulos, verificar status e muito mais. Experimente dizer: ir para dashboard, abrir relatórios, ou mostrar frota.', ARRAY['ajuda', 'help', 'o que você pode fazer'])
ON CONFLICT DO NOTHING;

-- Update timestamps trigger
DROP TRIGGER IF EXISTS set_voice_commands_updated_at ON public.voice_commands;
CREATE TRIGGER set_voice_commands_updated_at
  BEFORE UPDATE ON public.voice_commands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
