-- ============================================
-- PATCH 102.0 - Workspace Tables
-- Criar tabelas necessárias para workspace completo
-- ============================================

-- 1. Workspace Files (para upload e compartilhamento)
CREATE TABLE IF NOT EXISTS public.workspace_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.workspace_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_workspace_files_channel ON public.workspace_files(channel_id);
CREATE INDEX IF NOT EXISTS idx_workspace_files_user ON public.workspace_files(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_files_uploaded ON public.workspace_files(uploaded_at DESC);

-- RLS para workspace_files
ALTER TABLE public.workspace_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files in their channels"
ON public.workspace_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.channel_id = workspace_files.channel_id
    AND workspace_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload files to their channels"
ON public.workspace_files FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.channel_id = workspace_files.channel_id
    AND workspace_members.user_id = auth.uid()
  )
  AND user_id = auth.uid()
);

CREATE POLICY "Users can delete their own files"
ON public.workspace_files FOR DELETE
USING (user_id = auth.uid());

-- 2. Workspace Events (para calendário e agendamento)
CREATE TABLE IF NOT EXISTS public.workspace_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.workspace_channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  event_type TEXT DEFAULT 'meeting',
  color TEXT DEFAULT '#3b82f6',
  is_all_day BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_workspace_events_channel ON public.workspace_events(channel_id);
CREATE INDEX IF NOT EXISTS idx_workspace_events_time ON public.workspace_events(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_workspace_events_creator ON public.workspace_events(created_by);

-- RLS para workspace_events
ALTER TABLE public.workspace_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events in their channels"
ON public.workspace_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.channel_id = workspace_events.channel_id
    AND workspace_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create events in their channels"
ON public.workspace_events FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.channel_id = workspace_events.channel_id
    AND workspace_members.user_id = auth.uid()
  )
  AND created_by = auth.uid()
);

CREATE POLICY "Users can update events they created"
ON public.workspace_events FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Users can delete events they created"
ON public.workspace_events FOR DELETE
USING (created_by = auth.uid());

-- 3. Workspace Documents (para collaborative editing com Yjs)
CREATE TABLE IF NOT EXISTS public.workspace_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.workspace_channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content JSONB DEFAULT '{}',
  yjs_state BYTEA,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_workspace_documents_channel ON public.workspace_documents(channel_id);
CREATE INDEX IF NOT EXISTS idx_workspace_documents_updated ON public.workspace_documents(updated_at DESC);

-- RLS para workspace_documents
ALTER TABLE public.workspace_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents in their channels"
ON public.workspace_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.channel_id = workspace_documents.channel_id
    AND workspace_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create documents in their channels"
ON public.workspace_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.channel_id = workspace_documents.channel_id
    AND workspace_members.user_id = auth.uid()
  )
  AND created_by = auth.uid()
);

CREATE POLICY "Users can update documents in their channels"
ON public.workspace_documents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.channel_id = workspace_documents.channel_id
    AND workspace_members.user_id = auth.uid()
  )
);

-- 4. Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_workspace_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workspace_files_updated_at
BEFORE UPDATE ON public.workspace_files
FOR EACH ROW
EXECUTE FUNCTION public.update_workspace_tables_updated_at();

CREATE TRIGGER update_workspace_events_updated_at
BEFORE UPDATE ON public.workspace_events
FOR EACH ROW
EXECUTE FUNCTION public.update_workspace_tables_updated_at();

CREATE TRIGGER update_workspace_documents_updated_at
BEFORE UPDATE ON public.workspace_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_workspace_tables_updated_at();

-- 5. Storage bucket para workspace files
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace_files', 'workspace_files', false)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage policies para workspace_files bucket
CREATE POLICY "Users can view files in their channels"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'workspace_files'
  AND auth.uid() IN (
    SELECT wm.user_id 
    FROM public.workspace_members wm
    JOIN public.workspace_files wf ON wf.channel_id = wm.channel_id
    WHERE wf.storage_path = name
  )
);

CREATE POLICY "Users can upload files to their channels"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'workspace_files'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'workspace_files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'workspace_files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);