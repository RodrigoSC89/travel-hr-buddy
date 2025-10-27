-- PATCH 281: Logistics Hub - Suppliers & Shipments Tables
CREATE TABLE IF NOT EXISTS public.logistics_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  supplier_name TEXT NOT NULL,
  supplier_code TEXT NOT NULL UNIQUE,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  country TEXT,
  rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  payment_terms TEXT,
  delivery_time_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.logistics_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  order_id UUID REFERENCES public.logistics_supply_orders(id),
  tracking_number TEXT NOT NULL UNIQUE,
  carrier TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  shipped_at TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'delayed', 'cancelled')),
  current_location TEXT,
  weight_kg NUMERIC,
  volume_m3 NUMERIC,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.logistics_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_shipments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for logistics_suppliers
CREATE POLICY "Users can view suppliers in their organization"
  ON public.logistics_suppliers FOR SELECT
  USING (user_belongs_to_organization(organization_id));

CREATE POLICY "Users can manage suppliers in their organization"
  ON public.logistics_suppliers FOR ALL
  USING (user_belongs_to_organization(organization_id));

-- RLS Policies for logistics_shipments
CREATE POLICY "Users can view shipments in their organization"
  ON public.logistics_shipments FOR SELECT
  USING (user_belongs_to_organization(organization_id));

CREATE POLICY "Users can manage shipments in their organization"
  ON public.logistics_shipments FOR ALL
  USING (user_belongs_to_organization(organization_id));

-- PATCH 283: Vault AI - Documents & Search Logs
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.vault_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  embedding vector(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  version INTEGER DEFAULT 1,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vault_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  query TEXT NOT NULL,
  search_type TEXT NOT NULL DEFAULT 'semantic' CHECK (search_type IN ('semantic', 'keyword', 'hybrid')),
  results_count INTEGER DEFAULT 0,
  results JSONB DEFAULT '[]'::jsonb,
  similarity_scores NUMERIC[] DEFAULT '{}',
  search_duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_search_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vault_documents
CREATE POLICY "Users can view documents in their organization"
  ON public.vault_documents FOR SELECT
  USING (user_belongs_to_organization(organization_id) OR user_id = auth.uid());

CREATE POLICY "Users can manage their own documents"
  ON public.vault_documents FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for vault_search_logs
CREATE POLICY "Users can view their own search logs"
  ON public.vault_search_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own search logs"
  ON public.vault_search_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS vault_documents_embedding_idx ON public.vault_documents 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- PATCH 284: Mission Control - Missions, Resources, Timeline
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  mission_name TEXT NOT NULL,
  mission_code TEXT NOT NULL UNIQUE,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('transport', 'survey', 'rescue', 'patrol', 'training', 'maintenance')),
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'ready', 'active', 'paused', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  progress_percent NUMERIC DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  objectives TEXT[],
  description TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mission_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('personnel', 'equipment', 'fuel', 'supplies', 'vehicle')),
  resource_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  allocated_at TIMESTAMPTZ DEFAULT now(),
  released_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'allocated' CHECK (status IN ('allocated', 'in_use', 'released', 'unavailable')),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mission_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  actual_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed', 'cancelled')),
  responsible_user_id UUID REFERENCES auth.users(id),
  notification_sent BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies for missions
CREATE POLICY "Users can view missions in their organization"
  ON public.missions FOR SELECT
  USING (user_belongs_to_organization(organization_id));

CREATE POLICY "Users can manage missions in their organization"
  ON public.missions FOR ALL
  USING (user_belongs_to_organization(organization_id));

-- RLS Policies for mission_resources
CREATE POLICY "Users can view mission resources"
  ON public.mission_resources FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.missions 
    WHERE missions.id = mission_resources.mission_id 
    AND user_belongs_to_organization(missions.organization_id)
  ));

CREATE POLICY "Users can manage mission resources"
  ON public.mission_resources FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.missions 
    WHERE missions.id = mission_resources.mission_id 
    AND user_belongs_to_organization(missions.organization_id)
  ));

-- RLS Policies for mission_timeline
CREATE POLICY "Users can view mission timeline"
  ON public.mission_timeline FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.missions 
    WHERE missions.id = mission_timeline.mission_id 
    AND user_belongs_to_organization(missions.organization_id)
  ));

CREATE POLICY "Users can manage mission timeline"
  ON public.mission_timeline FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.missions 
    WHERE missions.id = mission_timeline.mission_id 
    AND user_belongs_to_organization(missions.organization_id)
  ));

-- PATCH 285: Voice Assistant - Voice Logs
CREATE TABLE IF NOT EXISTS public.voice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  command_text TEXT NOT NULL,
  transcription_confidence NUMERIC,
  intent_detected TEXT,
  action_taken TEXT,
  response_text TEXT,
  audio_duration_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voice_logs
CREATE POLICY "Users can view their own voice logs"
  ON public.voice_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own voice logs"
  ON public.voice_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS logistics_suppliers_org_idx ON public.logistics_suppliers(organization_id);
CREATE INDEX IF NOT EXISTS logistics_shipments_org_idx ON public.logistics_shipments(organization_id);
CREATE INDEX IF NOT EXISTS logistics_shipments_tracking_idx ON public.logistics_shipments(tracking_number);
CREATE INDEX IF NOT EXISTS vault_documents_org_idx ON public.vault_documents(organization_id);
CREATE INDEX IF NOT EXISTS vault_documents_category_idx ON public.vault_documents(category);
CREATE INDEX IF NOT EXISTS vault_search_logs_user_idx ON public.vault_search_logs(user_id);
CREATE INDEX IF NOT EXISTS missions_org_idx ON public.missions(organization_id);
CREATE INDEX IF NOT EXISTS missions_status_idx ON public.missions(status);
CREATE INDEX IF NOT EXISTS mission_resources_mission_idx ON public.mission_resources(mission_id);
CREATE INDEX IF NOT EXISTS mission_timeline_mission_idx ON public.mission_timeline(mission_id);
CREATE INDEX IF NOT EXISTS voice_logs_user_idx ON public.voice_logs(user_id);