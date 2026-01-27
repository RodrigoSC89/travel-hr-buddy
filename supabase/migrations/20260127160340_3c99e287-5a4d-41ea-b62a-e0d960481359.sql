-- ============================================================================
-- PATCH 865: Schema Alignment Migration
-- Adds missing tables and columns required by frontend modules
-- This migration enables removal of @ts-nocheck from 163 files
-- ============================================================================

-- ============================================================================
-- 1. crew_rotation_logs - Required by CrewRotationManager.tsx
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crew_rotation_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rotation_id UUID REFERENCES public.crew_rotations(id) ON DELETE CASCADE,
    log_type TEXT NOT NULL DEFAULT 'status_change',
    description TEXT,
    previous_status TEXT,
    new_status TEXT,
    changed_by UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crew_rotation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "crew_rotation_logs_org_access" ON public.crew_rotation_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.crew_rotations cr 
            WHERE cr.id = rotation_id 
            AND cr.organization_id = public.get_current_organization_id()
        )
    );

-- Index
CREATE INDEX IF NOT EXISTS idx_crew_rotation_logs_rotation_id ON public.crew_rotation_logs(rotation_id);

-- ============================================================================
-- 2. coordination_mission_links - Required by coordinationAIService.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coordination_mission_links (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id UUID,
    coordination_task_id UUID REFERENCES public.coordination_tasks(id) ON DELETE CASCADE,
    integration_status TEXT NOT NULL DEFAULT 'linked',
    sync_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coordination_mission_links ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "coordination_mission_links_authenticated" ON public.coordination_mission_links
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- 3. satcom_logs - Required by SatcomTerminal.tsx, CommunicationHistory.tsx
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.satcom_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
    transmission_type TEXT NOT NULL DEFAULT 'send',
    message_type TEXT,
    content TEXT,
    frequency TEXT,
    signal_strength NUMERIC,
    status TEXT DEFAULT 'sent',
    sender TEXT,
    recipient TEXT,
    protocol TEXT,
    link_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.satcom_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "satcom_logs_vessel_access" ON public.satcom_logs
    FOR ALL USING (
        vessel_id IN (
            SELECT v.id FROM public.vessels v 
            WHERE v.organization_id = public.get_current_organization_id()
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_satcom_logs_vessel_id ON public.satcom_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_satcom_logs_created_at ON public.satcom_logs(created_at DESC);

-- ============================================================================
-- 4. satcom_links - Required by ping-service.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.satcom_links (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    endpoint TEXT,
    priority INTEGER DEFAULT 1,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    latency_ms INTEGER,
    bandwidth_kbps INTEGER,
    last_ping_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'unknown',
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.satcom_links ENABLE ROW LEVEL SECURITY;

-- RLS Policy  
CREATE POLICY "satcom_links_vessel_access" ON public.satcom_links
    FOR ALL USING (
        vessel_id IS NULL OR vessel_id IN (
            SELECT v.id FROM public.vessels v 
            WHERE v.organization_id = public.get_current_organization_id()
        )
    );

-- ============================================================================
-- 5. satcom_failover_logs - Required by failover-service.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.satcom_failover_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
    from_link_id UUID,
    to_link_id UUID,
    reason TEXT,
    success BOOLEAN DEFAULT true,
    failover_time_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.satcom_failover_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "satcom_failover_logs_vessel_access" ON public.satcom_failover_logs
    FOR ALL USING (
        vessel_id IN (
            SELECT v.id FROM public.vessels v 
            WHERE v.organization_id = public.get_current_organization_id()
        )
    );

-- ============================================================================
-- 6. satcom_connection_status - Required by failover-service.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.satcom_connection_status (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
    link_id UUID,
    is_connected BOOLEAN DEFAULT false,
    signal_quality NUMERIC,
    latency_ms INTEGER,
    bandwidth_available_kbps INTEGER,
    last_check_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.satcom_connection_status ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "satcom_connection_status_vessel_access" ON public.satcom_connection_status
    FOR ALL USING (
        vessel_id IN (
            SELECT v.id FROM public.vessels v 
            WHERE v.organization_id = public.get_current_organization_id()
        )
    );

-- ============================================================================
-- 7. satcom_communication_logs - Required by failover-service.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.satcom_communication_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
    direction TEXT NOT NULL DEFAULT 'outbound',
    message_type TEXT,
    payload_size_bytes INTEGER,
    duration_ms INTEGER,
    status TEXT DEFAULT 'completed',
    error_message TEXT,
    link_used UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.satcom_communication_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "satcom_communication_logs_vessel_access" ON public.satcom_communication_logs
    FOR ALL USING (
        vessel_id IN (
            SELECT v.id FROM public.vessels v 
            WHERE v.organization_id = public.get_current_organization_id()
        )
    );

-- ============================================================================
-- 8. Add missing columns to coordination_tasks
-- ============================================================================
DO $$
BEGIN
    -- Add required_capabilities column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coordination_tasks' AND column_name = 'required_capabilities') THEN
        ALTER TABLE public.coordination_tasks ADD COLUMN required_capabilities TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add payload column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coordination_tasks' AND column_name = 'payload') THEN
        ALTER TABLE public.coordination_tasks ADD COLUMN payload JSONB DEFAULT '{}';
    END IF;
    
    -- Add result column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coordination_tasks' AND column_name = 'result') THEN
        ALTER TABLE public.coordination_tasks ADD COLUMN result JSONB;
    END IF;
    
    -- Add timeout_seconds column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coordination_tasks' AND column_name = 'timeout_seconds') THEN
        ALTER TABLE public.coordination_tasks ADD COLUMN timeout_seconds INTEGER DEFAULT 300;
    END IF;
    
    -- Add created_by column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coordination_tasks' AND column_name = 'created_by') THEN
        ALTER TABLE public.coordination_tasks ADD COLUMN created_by UUID;
    END IF;
END $$;

-- ============================================================================
-- 9. Add missing columns to mmi_history for alignment with MMIHistory type
-- ============================================================================
DO $$
BEGIN
    -- Add executed_at column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mmi_history' AND column_name = 'executed_at') THEN
        ALTER TABLE public.mmi_history ADD COLUMN executed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add pdf_url column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mmi_history' AND column_name = 'pdf_url') THEN
        ALTER TABLE public.mmi_history ADD COLUMN pdf_url TEXT;
    END IF;
END $$;

-- ============================================================================
-- 10. Add missing columns to crew_rotations for CrewRotationManager.tsx
-- ============================================================================
DO $$
BEGIN
    -- Add rotation_type column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crew_rotations' AND column_name = 'rotation_type') THEN
        ALTER TABLE public.crew_rotations ADD COLUMN rotation_type TEXT DEFAULT 'embarkation';
    END IF;
    
    -- Add scheduled_date column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crew_rotations' AND column_name = 'scheduled_date') THEN
        ALTER TABLE public.crew_rotations ADD COLUMN scheduled_date DATE;
    END IF;
    
    -- Add actual_date column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crew_rotations' AND column_name = 'actual_date') THEN
        ALTER TABLE public.crew_rotations ADD COLUMN actual_date DATE;
    END IF;
    
    -- Add departure_port column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crew_rotations' AND column_name = 'departure_port') THEN
        ALTER TABLE public.crew_rotations ADD COLUMN departure_port TEXT;
    END IF;
    
    -- Add arrival_port column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crew_rotations' AND column_name = 'arrival_port') THEN
        ALTER TABLE public.crew_rotations ADD COLUMN arrival_port TEXT;
    END IF;
    
    -- Add transportation_method column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crew_rotations' AND column_name = 'transportation_method') THEN
        ALTER TABLE public.crew_rotations ADD COLUMN transportation_method TEXT;
    END IF;
    
    -- Add flight_details column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crew_rotations' AND column_name = 'flight_details') THEN
        ALTER TABLE public.crew_rotations ADD COLUMN flight_details JSONB;
    END IF;
    
    -- Add accommodation_details column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crew_rotations' AND column_name = 'accommodation_details') THEN
        ALTER TABLE public.crew_rotations ADD COLUMN accommodation_details JSONB;
    END IF;
    
    -- Add documentation_status column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crew_rotations' AND column_name = 'documentation_status') THEN
        ALTER TABLE public.crew_rotations ADD COLUMN documentation_status TEXT DEFAULT 'pending';
    END IF;
    
    -- Add medical_clearance column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crew_rotations' AND column_name = 'medical_clearance') THEN
        ALTER TABLE public.crew_rotations ADD COLUMN medical_clearance BOOLEAN DEFAULT false;
    END IF;
    
    -- Add visa_status column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crew_rotations' AND column_name = 'visa_status') THEN
        ALTER TABLE public.crew_rotations ADD COLUMN visa_status TEXT;
    END IF;
END $$;

-- ============================================================================
-- 11. Add timestamp column to coordination_decisions
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coordination_decisions' AND column_name = 'timestamp') THEN
        ALTER TABLE public.coordination_decisions ADD COLUMN timestamp TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;