-- PATCH 336-345: Enhanced Module Completions
-- This migration adds missing columns and tables for complete module functionality

-- Add parent_task_id for task hierarchy (up to 3 levels)
ALTER TABLE public.project_tasks 
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES public.project_tasks(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_project_tasks_parent_id ON public.project_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON public.project_tasks(project_id);

-- Ensure travel_reservations table exists for PATCH 340
CREATE TABLE IF NOT EXISTS public.travel_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES auth.users(id),
  trip_type TEXT NOT NULL CHECK (trip_type IN ('flight', 'hotel', 'car', 'train', 'package')),
  origin TEXT,
  destination TEXT,
  departure_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  booking_reference TEXT,
  itinerary JSONB,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.travel_reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policy for travel_reservations
CREATE POLICY "Users can view their organization's reservations"
  ON public.travel_reservations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create reservations"
  ON public.travel_reservations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update their organization's reservations"
  ON public.travel_reservations FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Ensure fuel_optimization_results table exists for PATCH 339
CREATE TABLE IF NOT EXISTS public.fuel_optimization_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID,
  vessel_name TEXT,
  route_origin TEXT,
  route_destination TEXT,
  vessel_type TEXT,
  cargo_weight DECIMAL(10, 2),
  current_speed DECIMAL(5, 2),
  optimal_speed DECIMAL(5, 2),
  fuel_savings_percentage DECIMAL(5, 2),
  estimated_savings_usd DECIMAL(10, 2),
  weather_conditions JSONB,
  alternative_routes JSONB,
  recommendations TEXT,
  calculation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fuel_optimization_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's fuel optimizations"
  ON public.fuel_optimization_results FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create fuel optimizations"
  ON public.fuel_optimization_results FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Ensure ai_documents table exists for PATCH 338
CREATE TABLE IF NOT EXISTS public.ai_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  file_size_bytes INTEGER,
  ocr_text TEXT,
  summary TEXT,
  topics JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  key_insights JSONB DEFAULT '[]',
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error TEXT,
  processing_time_ms INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's AI documents"
  ON public.ai_documents FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create AI documents"
  ON public.ai_documents FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update their organization's AI documents"
  ON public.ai_documents FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_travel_reservations_updated_at 
  BEFORE UPDATE ON public.travel_reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_documents_updated_at 
  BEFORE UPDATE ON public.ai_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_travel_reservations_org ON public.travel_reservations(organization_id);
CREATE INDEX IF NOT EXISTS idx_travel_reservations_crew ON public.travel_reservations(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_fuel_optimization_org ON public.fuel_optimization_results(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_documents_org ON public.ai_documents(organization_id);
