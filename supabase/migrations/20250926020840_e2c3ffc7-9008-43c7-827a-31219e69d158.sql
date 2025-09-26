-- Criar tabelas para a Central de Ajuda Inteligente e Assistente Virtual

-- Tabela para base de conhecimento
CREATE TABLE public.knowledge_base (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('tutorial', 'faq', 'guide', 'video')),
  module text NOT NULL,
  tags text[] DEFAULT '{}',
  difficulty text NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  steps jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  views integer DEFAULT 0,
  rating numeric DEFAULT 0,
  helpful_votes integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para conversas do copiloto
CREATE TABLE public.copilot_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  context_data jsonb DEFAULT '{}',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  message_count integer DEFAULT 0
);

-- Tabela para mensagens do copiloto
CREATE TABLE public.copilot_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.copilot_conversations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('user', 'assistant')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  actions jsonb DEFAULT '[]',
  suggestions jsonb DEFAULT '[]',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para analytics da central de ajuda
CREATE TABLE public.help_center_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_item_id uuid REFERENCES public.knowledge_base(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (action_type IN ('view', 'search', 'helpful', 'not_helpful', 'export')),
  session_data jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para configurações do sistema de ajuda
CREATE TABLE public.help_system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_center_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies para knowledge_base
CREATE POLICY "Everyone can view published knowledge base items"
ON public.knowledge_base
FOR SELECT
USING (status = 'published');

CREATE POLICY "Authors can manage their own knowledge base items"
ON public.knowledge_base
FOR ALL
USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all knowledge base items"
ON public.knowledge_base
FOR ALL
USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'hr_manager'::user_role]));

-- RLS Policies para copilot_conversations
CREATE POLICY "Users can manage their own copilot conversations"
ON public.copilot_conversations
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies para copilot_messages
CREATE POLICY "Users can view messages from their conversations"
ON public.copilot_messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.copilot_conversations 
  WHERE id = copilot_messages.conversation_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can insert messages to their conversations"
ON public.copilot_messages
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.copilot_conversations 
  WHERE id = copilot_messages.conversation_id 
  AND user_id = auth.uid()
));

-- RLS Policies para help_center_analytics
CREATE POLICY "Users can insert their own analytics"
ON public.help_center_analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all analytics"
ON public.help_center_analytics
FOR SELECT
USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'hr_manager'::user_role]));

-- RLS Policies para help_system_settings
CREATE POLICY "Admins can manage help system settings"
ON public.help_system_settings
FOR ALL
USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'hr_manager'::user_role]));

CREATE POLICY "Everyone can view help system settings"
ON public.help_system_settings
FOR SELECT
USING (true);

-- Triggers para updated_at
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_help_system_settings_updated_at
  BEFORE UPDATE ON public.help_system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO public.knowledge_base (title, content, type, module, tags, difficulty, status, author_id, steps, views, rating) VALUES
(
  'Como criar uma escala de tripulação',
  'Tutorial completo para criação e gestão de escalas de tripulação no sistema marítimo. Este guia aborda desde o acesso ao módulo até a finalização da escala.',
  'tutorial',
  'maritime',
  ARRAY['escala', 'tripulação', 'gestão', 'marítimo'],
  'beginner',
  'published',
  NULL,
  '[
    {"step": 1, "title": "Acesse o módulo Marítimo", "description": "Navegue até Sistema Marítimo > Gestão de Tripulação", "image": null},
    {"step": 2, "title": "Clique em Nova Escala", "description": "Localize o botão no canto superior direito da tela", "image": null},
    {"step": 3, "title": "Preencha os dados básicos", "description": "Defina a embarcação, período de vigência e tipo de escala", "image": null},
    {"step": 4, "title": "Selecione os tripulantes", "description": "Escolha os membros da tripulação e suas funções", "image": null},
    {"step": 5, "title": "Revise e confirme", "description": "Verifique todas as informações antes de salvar", "image": null}
  ]'::jsonb,
  150,
  4.8
),
(
  'Configurando alertas de preço',
  'Como configurar e gerenciar alertas de preço para monitoramento automático de produtos e serviços. Aprenda a otimizar suas compras com notificações inteligentes.',
  'guide',
  'price-alerts',
  ARRAY['preços', 'alertas', 'notificações', 'monitoramento'],
  'intermediate',
  'published',
  NULL,
  '[]'::jsonb,
  89,
  4.6
),
(
  'Como alterar o status de uma reserva?',
  'Para alterar o status de uma reserva, vá até o módulo Reservas, localize a reserva desejada e clique no menu de ações (três pontos). Selecione "Alterar Status" e escolha o novo status. Os status disponíveis são: Confirmada, Pendente, Cancelada, Em Andamento e Concluída.',
  'faq',
  'reservations',
  ARRAY['reserva', 'status', 'alteração'],
  'beginner',
  'published',
  NULL,
  '[]'::jsonb,
  156,
  4.2
),
(
  'Gerenciamento de certificados de tripulação',
  'Tutorial sobre como gerenciar certificados de tripulação, incluindo upload, validação de datas de vencimento e configuração de alertas automáticos.',
  'tutorial',
  'hr',
  ARRAY['certificados', 'tripulação', 'RH', 'documentos'],
  'intermediate',
  'published',
  NULL,
  '[
    {"step": 1, "title": "Acesse o módulo de RH", "description": "Navegue até Recursos Humanos > Certificações", "image": null},
    {"step": 2, "title": "Selecione o funcionário", "description": "Busque e selecione o tripulante desejado", "image": null},
    {"step": 3, "title": "Adicione o certificado", "description": "Clique em Adicionar Certificado e preencha os dados", "image": null},
    {"step": 4, "title": "Configure alertas", "description": "Defina quando ser notificado sobre vencimentos", "image": null}
  ]'::jsonb,
  203,
  4.7
),
(
  'Posso exportar relatórios de viagens?',
  'Sim! No módulo Viagens, clique em "Relatórios" no menu superior e selecione o período desejado. Você pode exportar em PDF, Excel ou CSV. Os relatórios incluem dados de itinerário, custos, tripulação e performance.',
  'faq',
  'travel',
  ARRAY['relatórios', 'exportar', 'viagens', 'dados'],
  'beginner',
  'published',
  NULL,
  '[]'::jsonb,
  98,
  4.4
);

-- Inserir configurações padrão do sistema
INSERT INTO public.help_system_settings (setting_key, setting_value) VALUES
('auto_publish', '{"enabled": false, "approval_required": true}'),
('notifications', '{"email_enabled": true, "push_enabled": true, "frequency": "immediate"}'),
('search_suggestions', '{"enabled": true, "max_suggestions": 5}'),
('analytics_tracking', '{"enabled": true, "anonymous": false}'),
('voice_features', '{"speech_recognition": true, "text_to_speech": true, "language": "pt-BR"}');