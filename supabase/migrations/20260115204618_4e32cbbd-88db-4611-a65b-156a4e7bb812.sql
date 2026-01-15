-- Create documents table (complete)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  title TEXT,
  document_type TEXT,
  content TEXT,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  vessel_id UUID,
  crew_member_id UUID,
  expiry_date DATE,
  status TEXT DEFAULT 'active',
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create voyage_charters table  
CREATE TABLE IF NOT EXISTS public.voyage_charters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  vessel_id UUID,
  charter_type TEXT DEFAULT 'voyage',
  charterer_name TEXT NOT NULL,
  cargo_type TEXT,
  loading_port TEXT,
  discharge_port TEXT,
  laycan_start DATE,
  laycan_end DATE,
  freight_rate DECIMAL(15,2),
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on both
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voyage_charters ENABLE ROW LEVEL SECURITY;

-- Documents RLS
CREATE POLICY "documents_org_select" ON public.documents
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "documents_org_insert" ON public.documents
FOR INSERT TO authenticated
WITH CHECK (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "documents_org_update" ON public.documents
FOR UPDATE TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- Voyage Charters RLS
CREATE POLICY "voyage_charters_org_select" ON public.voyage_charters
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "voyage_charters_org_insert" ON public.voyage_charters
FOR INSERT TO authenticated
WITH CHECK (public.user_belongs_to_org(auth.uid(), organization_id));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_org ON public.documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_vessel ON public.documents(vessel_id);
CREATE INDEX IF NOT EXISTS idx_documents_crew ON public.documents(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_voyage_charters_org ON public.voyage_charters(organization_id);
CREATE INDEX IF NOT EXISTS idx_voyage_charters_vessel ON public.voyage_charters(vessel_id);