-- PATCHES 396-400: Mission Control, Document Templates, Crew Consolidation, Satellite Tracker, Navigation Copilot
-- Created: 2025-10-28

-- ============================================================================
-- PATCH 396: Mission Control - Tactical Operations & Integration
-- ============================================================================

-- Missions table with comprehensive tracking
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inspection', 'maintenance', 'emergency', 'training', 'transport', 'surveillance', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'planned', 'active', 'paused', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_name TEXT,
  assigned_vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  assigned_crew JSONB DEFAULT '[]'::jsonb, -- Array of crew member IDs and roles
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  estimated_duration INTERVAL,
  actual_duration INTERVAL,
  weather_status TEXT, -- Integration with weather module
  weather_alerts JSONB DEFAULT '[]'::jsonb,
  fleet_status TEXT, -- Integration with fleet manager
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  objectives JSONB DEFAULT '[]'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mission alerts table
CREATE TABLE IF NOT EXISTS public.mission_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT, -- e.g., 'weather', 'fleet', 'crew', 'system'
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mission control logs - comprehensive telemetry
CREATE TABLE IF NOT EXISTS public.mission_control_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  message TEXT,
  source_module TEXT, -- e.g., 'fleet', 'weather', 'crew', 'satellite'
  telemetry_data JSONB DEFAULT '{}'::jsonb, -- Technical metrics and sensor data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mission status sync table for WebSocket synchronization
CREATE TABLE IF NOT EXISTS public.mission_status_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  instance_id TEXT NOT NULL, -- Client instance identifier
  sync_status TEXT NOT NULL CHECK (sync_status IN ('synced', 'pending', 'conflict')),
  last_sync_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sync_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for mission control
CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_priority ON public.missions(priority);
CREATE INDEX IF NOT EXISTS idx_missions_vessel ON public.missions(assigned_vessel_id);
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON public.missions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mission_alerts_mission ON public.mission_alerts(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_alerts_severity ON public.mission_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_mission_logs_mission ON public.mission_control_logs(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_logs_created_at ON public.mission_control_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mission_sync_mission ON public.mission_status_sync(mission_id);

-- ============================================================================
-- PATCH 397: Document Templates - Dynamic Generation & PDF Export
-- ============================================================================

-- Document templates with drag & drop support
CREATE TABLE IF NOT EXISTS public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('report', 'certificate', 'contract', 'form', 'letter', 'other')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb, -- Rich editor content with placeholders
  placeholders JSONB DEFAULT '[]'::jsonb, -- Available placeholders like {{name}}, {{date}}
  styles JSONB DEFAULT '{}'::jsonb, -- CSS/styling information
  layout JSONB DEFAULT '{}'::jsonb, -- Drag & drop layout configuration
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{}'::jsonb, -- Role-based access control
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document template versions for history tracking
CREATE TABLE IF NOT EXISTS public.document_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  placeholders JSONB DEFAULT '[]'::jsonb,
  styles JSONB DEFAULT '{}'::jsonb,
  layout JSONB DEFAULT '{}'::jsonb,
  change_summary TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id, version_number)
);

-- Generated documents from templates
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  generated_content JSONB NOT NULL,
  pdf_url TEXT, -- Supabase Storage URL
  pdf_generated_at TIMESTAMPTZ,
  data_context JSONB DEFAULT '{}'::jsonb, -- Data used to fill placeholders
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'approved', 'archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for document templates
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON public.document_templates(category);
CREATE INDEX IF NOT EXISTS idx_document_templates_active ON public.document_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_document_template_versions_template ON public.document_template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_template ON public.generated_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_status ON public.generated_documents(status);

-- ============================================================================
-- PATCH 399: Satellite Tracker - Real Data Integration
-- ============================================================================

-- Satellite tracking logs
CREATE TABLE IF NOT EXISTS public.satellite_tracking_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL, -- NORAD ID or satellite identifier
  satellite_name TEXT NOT NULL,
  position_lat DECIMAL(10, 8) NOT NULL,
  position_lng DECIMAL(11, 8) NOT NULL,
  altitude_km DECIMAL(10, 2) NOT NULL,
  velocity_kmh DECIMAL(10, 2),
  azimuth DECIMAL(5, 2),
  elevation DECIMAL(5, 2),
  orbit_type TEXT, -- e.g., 'LEO', 'MEO', 'GEO'
  visibility TEXT CHECK (visibility IN ('visible', 'eclipsed', 'unknown')),
  signal_strength INTEGER,
  coverage_area JSONB DEFAULT '{}'::jsonb, -- Geospatial coverage polygon
  tle_line1 TEXT, -- TLE (Two-Line Element) data
  tle_line2 TEXT,
  api_source TEXT, -- e.g., 'N2YO', 'Space-Track'
  metadata JSONB DEFAULT '{}'::jsonb,
  tracked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Satellite status monitoring
CREATE TABLE IF NOT EXISTS public.satellite_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL UNIQUE,
  satellite_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('operational', 'degraded', 'offline', 'decommissioned')),
  last_contact TIMESTAMPTZ,
  next_pass TIMESTAMPTZ,
  pass_duration INTERVAL,
  current_region TEXT,
  coverage_regions JSONB DEFAULT '[]'::jsonb,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  active_connections INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for satellite tracking
CREATE INDEX IF NOT EXISTS idx_satellite_logs_satellite ON public.satellite_tracking_logs(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_logs_tracked_at ON public.satellite_tracking_logs(tracked_at DESC);
CREATE INDEX IF NOT EXISTS idx_satellite_status_satellite ON public.satellite_status(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_status_status ON public.satellite_status(status);

-- ============================================================================
-- PATCH 400: Navigation Copilot - AI Assistant
-- ============================================================================

-- Navigation routes with AI suggestions
CREATE TABLE IF NOT EXISTS public.navigation_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  origin_lat DECIMAL(10, 8) NOT NULL,
  origin_lng DECIMAL(11, 8) NOT NULL,
  origin_name TEXT,
  destination_lat DECIMAL(10, 8) NOT NULL,
  destination_lng DECIMAL(11, 8) NOT NULL,
  destination_name TEXT,
  waypoints JSONB DEFAULT '[]'::jsonb,
  distance_nm DECIMAL(10, 2), -- Nautical miles
  estimated_duration INTERVAL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  ai_optimized BOOLEAN DEFAULT false,
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  weather_data JSONB DEFAULT '{}'::jsonb,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI navigation suggestions and explanations
CREATE TABLE IF NOT EXISTS public.navigation_ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.navigation_routes(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('route_optimization', 'weather_deviation', 'fuel_optimization', 'safety_alert', 'time_optimization')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  explanation TEXT, -- XAI - Explainable AI reasoning
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  impact_assessment JSONB DEFAULT '{}'::jsonb, -- Expected impact on time, fuel, safety
  ai_model TEXT, -- Model used for suggestion
  alternative_waypoints JSONB DEFAULT '[]'::jsonb,
  accepted BOOLEAN DEFAULT NULL,
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  feedback TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Navigation context for real-time AI processing
CREATE TABLE IF NOT EXISTS public.navigation_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.navigation_routes(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL,
  context_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  ai_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for navigation copilot
CREATE INDEX IF NOT EXISTS idx_navigation_routes_status ON public.navigation_routes(status);
CREATE INDEX IF NOT EXISTS idx_navigation_routes_vessel ON public.navigation_routes(vessel_id);
CREATE INDEX IF NOT EXISTS idx_navigation_ai_suggestions_route ON public.navigation_ai_suggestions(route_id);
CREATE INDEX IF NOT EXISTS idx_navigation_ai_suggestions_type ON public.navigation_ai_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_navigation_context_route ON public.navigation_context(route_id);
CREATE INDEX IF NOT EXISTS idx_navigation_context_processed ON public.navigation_context(processed);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_status_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_tracking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_context ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies (Basic - authenticated users can read/write)
-- ============================================================================

-- Missions policies
CREATE POLICY "Authenticated users can view missions" ON public.missions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create missions" ON public.missions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update missions" ON public.missions FOR UPDATE TO authenticated USING (true);

-- Mission alerts policies
CREATE POLICY "Authenticated users can view mission alerts" ON public.mission_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create mission alerts" ON public.mission_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update mission alerts" ON public.mission_alerts FOR UPDATE TO authenticated USING (true);

-- Mission logs policies
CREATE POLICY "Authenticated users can view mission logs" ON public.mission_control_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create mission logs" ON public.mission_control_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Mission sync policies
CREATE POLICY "Authenticated users can view mission sync" ON public.mission_status_sync FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage mission sync" ON public.mission_status_sync FOR ALL TO authenticated USING (true);

-- Document templates policies
CREATE POLICY "Authenticated users can view document templates" ON public.document_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create document templates" ON public.document_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update document templates" ON public.document_templates FOR UPDATE TO authenticated USING (true);

-- Document template versions policies
CREATE POLICY "Authenticated users can view template versions" ON public.document_template_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create template versions" ON public.document_template_versions FOR INSERT TO authenticated WITH CHECK (true);

-- Generated documents policies
CREATE POLICY "Authenticated users can view generated documents" ON public.generated_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create generated documents" ON public.generated_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update generated documents" ON public.generated_documents FOR UPDATE TO authenticated USING (true);

-- Satellite tracking policies
CREATE POLICY "Authenticated users can view satellite logs" ON public.satellite_tracking_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can create satellite logs" ON public.satellite_tracking_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Satellite status policies
CREATE POLICY "Authenticated users can view satellite status" ON public.satellite_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage satellite status" ON public.satellite_status FOR ALL TO authenticated USING (true);

-- Navigation routes policies
CREATE POLICY "Authenticated users can view navigation routes" ON public.navigation_routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create navigation routes" ON public.navigation_routes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update navigation routes" ON public.navigation_routes FOR UPDATE TO authenticated USING (true);

-- Navigation AI suggestions policies
CREATE POLICY "Authenticated users can view AI suggestions" ON public.navigation_ai_suggestions FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can create AI suggestions" ON public.navigation_ai_suggestions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update AI suggestions" ON public.navigation_ai_suggestions FOR UPDATE TO authenticated USING (true);

-- Navigation context policies
CREATE POLICY "Authenticated users can view navigation context" ON public.navigation_context FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage navigation context" ON public.navigation_context FOR ALL TO authenticated USING (true);

-- ============================================================================
-- Update triggers for updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON public.document_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_documents_updated_at BEFORE UPDATE ON public.generated_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_satellite_status_updated_at BEFORE UPDATE ON public.satellite_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_navigation_routes_updated_at BEFORE UPDATE ON public.navigation_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mission_status_sync_updated_at BEFORE UPDATE ON public.mission_status_sync
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
