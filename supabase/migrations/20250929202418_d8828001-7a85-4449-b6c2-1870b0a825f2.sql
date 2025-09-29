-- =====================================
-- MÓDULO DE COMUNICAÇÃO NAUTILUS ONE - Criar apenas o que falta
-- =====================================

-- Criar tabela de canais de comunicação se não existir
CREATE TABLE IF NOT EXISTS public.communication_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'group' CHECK (type IN ('group', 'department', 'broadcast', 'emergency')),
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE CASCADE,
  member_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de membros dos canais se não existir
CREATE TABLE IF NOT EXISTS public.channel_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notification_settings JSONB DEFAULT '{"enabled": true, "sound": true}'::jsonb,
  UNIQUE(channel_id, user_id)
);

-- Função para atualizar contadores de canais se não existir
CREATE OR REPLACE FUNCTION public.update_channel_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communication_channels 
    SET member_count = member_count + 1
    WHERE id = NEW.channel_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communication_channels 
    SET member_count = GREATEST(member_count - 1, 0)
    WHERE id = OLD.channel_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Habilitar RLS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'communication_channels') THEN
    ALTER TABLE public.communication_channels ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Criar políticas RLS para communication_channels se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view public channels and their channels' AND tablename = 'communication_channels') THEN
    CREATE POLICY "Users can view public channels and their channels"
    ON public.communication_channels FOR SELECT
    USING (
      is_public = true OR
      id IN (
        SELECT channel_id FROM public.channel_members 
        WHERE user_id = auth.uid()
      ) OR
      created_by = auth.uid()
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create channels' AND tablename = 'communication_channels') THEN
    CREATE POLICY "Users can create channels"
    ON public.communication_channels FOR INSERT
    WITH CHECK (created_by = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Channel admins can update channels' AND tablename = 'communication_channels') THEN
    CREATE POLICY "Channel admins can update channels"
    ON public.communication_channels FOR UPDATE
    USING (
      created_by = auth.uid() OR
      id IN (
        SELECT channel_id FROM public.channel_members 
        WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
      )
    );
  END IF;
END $$;

-- Criar políticas RLS para channel_members se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view channel members of their channels' AND tablename = 'channel_members') THEN
    CREATE POLICY "Users can view channel members of their channels"
    ON public.channel_members FOR SELECT
    USING (
      channel_id IN (
        SELECT channel_id FROM public.channel_members cm 
        WHERE cm.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can join channels' AND tablename = 'channel_members') THEN
    CREATE POLICY "Users can join channels"
    ON public.channel_members FOR INSERT
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Criar trigger apenas se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_channel_member_count') THEN
    CREATE TRIGGER update_channel_member_count
    AFTER INSERT OR DELETE ON public.channel_members
    FOR EACH ROW EXECUTE FUNCTION public.update_channel_stats();
  END IF;
END $$;

-- Adicionar tabelas ao realtime se ainda não foram adicionadas
DO $$
BEGIN
  -- Verifica se as tabelas já estão na publicação
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'communication_channels'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.communication_channels;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'channel_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_members;
  END IF;
END $$;

-- Configurar REPLICA IDENTITY
ALTER TABLE public.communication_channels REPLICA IDENTITY FULL;
ALTER TABLE public.channel_members REPLICA IDENTITY FULL;