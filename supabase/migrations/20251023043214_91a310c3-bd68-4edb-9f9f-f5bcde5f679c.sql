-- ============================================
-- PATCH 51.0 - Real-Time Workspace Database
-- ============================================

-- Tabela de workspaces/canais
CREATE TABLE IF NOT EXISTS public.workspace_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  channel_type TEXT DEFAULT 'general' CHECK (channel_type IN ('general', 'project', 'emergency', 'operations')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de membros do workspace
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.workspace_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS public.workspace_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.workspace_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'status', 'system')),
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de presença online
CREATE TABLE IF NOT EXISTS public.workspace_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.workspace_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  current_activity TEXT,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_workspace_channels_org ON public.workspace_channels(organization_id);
CREATE INDEX IF NOT EXISTS idx_workspace_messages_channel ON public.workspace_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_presence_channel ON public.workspace_presence(channel_id, status);

-- Habilitar RLS
ALTER TABLE public.workspace_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies para workspace_channels
CREATE POLICY "Users can view channels in their org"
  ON public.workspace_channels FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Admins can create channels"
  ON public.workspace_channels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Channel owners can update"
  ON public.workspace_channels FOR UPDATE
  USING (created_by = auth.uid());

-- RLS Policies para workspace_members
CREATE POLICY "Users can view channel members"
  ON public.workspace_members FOR SELECT
  USING (
    channel_id IN (
      SELECT id FROM public.workspace_channels 
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can join public channels"
  ON public.workspace_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies para workspace_messages
CREATE POLICY "Members can view messages"
  ON public.workspace_messages FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send messages"
  ON public.workspace_messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    channel_id IN (
      SELECT channel_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.workspace_messages FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies para workspace_presence
CREATE POLICY "Users can view presence"
  ON public.workspace_presence FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own presence"
  ON public.workspace_presence FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own presence status"
  ON public.workspace_presence FOR UPDATE
  USING (user_id = auth.uid());

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_workspace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workspace_channels_updated_at
  BEFORE UPDATE ON public.workspace_channels
  FOR EACH ROW EXECUTE FUNCTION update_workspace_updated_at();

CREATE TRIGGER workspace_presence_updated_at
  BEFORE UPDATE ON public.workspace_presence
  FOR EACH ROW EXECUTE FUNCTION update_workspace_updated_at();

-- Função para atualizar last_seen_at automaticamente
CREATE OR REPLACE FUNCTION update_member_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.workspace_members
  SET last_seen_at = NOW()
  WHERE user_id = NEW.user_id AND channel_id = NEW.channel_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workspace_messages_update_last_seen
  AFTER INSERT ON public.workspace_messages
  FOR EACH ROW EXECUTE FUNCTION update_member_last_seen();

-- Habilitar Realtime para todas as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_presence;