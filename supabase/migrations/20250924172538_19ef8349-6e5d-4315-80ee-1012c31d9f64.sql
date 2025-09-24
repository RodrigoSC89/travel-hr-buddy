-- Criar tabelas para o sistema de voz

-- Tabela para conversas de voz
CREATE TABLE public.voice_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  session_id TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_messages INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- em segundos
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para mensagens de voz
CREATE TABLE public.voice_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  audio_url TEXT,
  transcript TEXT,
  action_type TEXT, -- 'navigation', 'query', 'command', etc.
  action_data JSONB DEFAULT '{}',
  duration INTEGER, -- em milissegundos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (conversation_id) REFERENCES voice_conversations(id) ON DELETE CASCADE
);

-- Tabela para configurações de voz do usuário
CREATE TABLE public.voice_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  voice_id TEXT DEFAULT 'alloy',
  language TEXT DEFAULT 'pt-BR',
  auto_listen BOOLEAN DEFAULT true,
  volume NUMERIC DEFAULT 0.8,
  microphone_sensitivity NUMERIC DEFAULT 0.5,
  tone TEXT DEFAULT 'friendly',
  response_length TEXT DEFAULT 'balanced',
  expertise TEXT[] DEFAULT '{}',
  custom_instructions TEXT,
  context_awareness BOOLEAN DEFAULT true,
  proactive_help BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para comandos de voz e ações
CREATE TABLE public.voice_commands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  command_text TEXT NOT NULL,
  intent TEXT NOT NULL,
  module_target TEXT,
  action_executed TEXT,
  success BOOLEAN DEFAULT true,
  response_time INTEGER, -- em milissegundos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para métricas de performance do sistema de voz
CREATE TABLE public.voice_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT,
  metric_type TEXT NOT NULL, -- 'response_time', 'accuracy', 'connection_quality'
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.voice_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para voice_conversations
CREATE POLICY "Users can view their own voice conversations"
ON public.voice_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice conversations"
ON public.voice_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice conversations"
ON public.voice_conversations
FOR UPDATE
USING (auth.uid() = user_id);

-- Políticas RLS para voice_messages
CREATE POLICY "Users can view their own voice messages"
ON public.voice_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice messages"
ON public.voice_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para voice_settings
CREATE POLICY "Users can view their own voice settings"
ON public.voice_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice settings"
ON public.voice_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice settings"
ON public.voice_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Políticas RLS para voice_commands
CREATE POLICY "Users can view their own voice commands"
ON public.voice_commands
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice commands"
ON public.voice_commands
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para voice_metrics
CREATE POLICY "Users can view their own voice metrics"
ON public.voice_metrics
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can create voice metrics"
ON public.voice_metrics
FOR INSERT
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_voice_conversations_updated_at
BEFORE UPDATE ON public.voice_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voice_settings_updated_at
BEFORE UPDATE ON public.voice_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();