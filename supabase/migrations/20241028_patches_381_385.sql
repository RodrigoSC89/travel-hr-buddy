-- PATCH 381-385: Database Schema for New Features
-- This migration creates all necessary tables for Voice Assistant, Satellite Tracker,
-- Mission Control, Finance Hub, and Integrations Hub

-- ============================================================================
-- PATCH 381: Voice Assistant - Interaction Logs
-- ============================================================================

CREATE TABLE IF NOT EXISTS voice_interaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_voice_interaction_logs_session ON voice_interaction_logs(session_id);
CREATE INDEX idx_voice_interaction_logs_timestamp ON voice_interaction_logs(timestamp DESC);
CREATE INDEX idx_voice_interaction_logs_event_type ON voice_interaction_logs(event_type);

-- Add RLS policies
ALTER TABLE voice_interaction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interaction logs" 
  ON voice_interaction_logs FOR SELECT 
  USING (
    session_id IN (
      SELECT session_id FROM voice_sessions 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- PATCH 382: Satellite Tracker - Orbital Events
-- ============================================================================

CREATE TABLE IF NOT EXISTS satellite_orbital_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_satellite_orbital_events_satellite ON satellite_orbital_events(satellite_id);
CREATE INDEX idx_satellite_orbital_events_timestamp ON satellite_orbital_events(timestamp DESC);
CREATE INDEX idx_satellite_orbital_events_type ON satellite_orbital_events(event_type);

-- Add TLE fields to satellites table if not exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'satellites') THEN
    ALTER TABLE satellites ADD COLUMN IF NOT EXISTS tle_line1 TEXT;
    ALTER TABLE satellites ADD COLUMN IF NOT EXISTS tle_line2 TEXT;
  END IF;
END $$;

-- Add RLS policies
ALTER TABLE satellite_orbital_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view orbital events" 
  ON satellite_orbital_events FOR SELECT 
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- PATCH 383: Mission Control - Tactical Planning
-- ============================================================================

CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  mission_type TEXT NOT NULL DEFAULT 'tactical',
  status TEXT NOT NULL DEFAULT 'planning',
  priority TEXT NOT NULL DEFAULT 'normal',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  estimated_duration_hours NUMERIC,
  actual_duration_hours NUMERIC,
  assigned_agents TEXT[] DEFAULT '{}',
  assigned_systems TEXT[] DEFAULT '{}',
  resources JSONB DEFAULT '[]',
  objectives JSONB DEFAULT '[]',
  progress_percentage INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  
  CONSTRAINT valid_mission_type CHECK (mission_type IN ('tactical', 'strategic', 'emergency', 'training')),
  CONSTRAINT valid_status CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  CONSTRAINT valid_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

CREATE INDEX idx_missions_mission_id ON missions(mission_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_priority ON missions(priority);
CREATE INDEX idx_missions_created_at ON missions(created_at DESC);

CREATE TABLE IF NOT EXISTS mission_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT UNIQUE NOT NULL,
  agent_name TEXT NOT NULL,
  agent_type TEXT NOT NULL DEFAULT 'human',
  role TEXT,
  capabilities TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available',
  current_mission_id TEXT,
  performance_rating NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_agent_type CHECK (agent_type IN ('human', 'ai', 'autonomous_system', 'hybrid')),
  CONSTRAINT valid_agent_status CHECK (status IN ('available', 'assigned', 'busy', 'offline'))
);

CREATE INDEX idx_mission_agents_agent_id ON mission_agents(agent_id);
CREATE INDEX idx_mission_agents_status ON mission_agents(status);
CREATE INDEX idx_mission_agents_current_mission ON mission_agents(current_mission_id);

CREATE TABLE IF NOT EXISTS mission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id TEXT NOT NULL,
  log_type TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  source TEXT,
  agent_id TEXT,
  data JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_log_type CHECK (log_type IN ('info', 'warning', 'error', 'critical', 'success'))
);

CREATE INDEX idx_mission_logs_mission_id ON mission_logs(mission_id);
CREATE INDEX idx_mission_logs_timestamp ON mission_logs(timestamp DESC);
CREATE INDEX idx_mission_logs_type ON mission_logs(log_type);

-- Add RLS policies
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view missions" 
  ON missions FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create missions" 
  ON missions FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view agents" 
  ON mission_agents FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view mission logs" 
  ON mission_logs FOR SELECT 
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- PATCH 384: Finance Hub - CRUD + Reports
-- ============================================================================

CREATE TABLE IF NOT EXISTS finance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parent_category_id UUID REFERENCES finance_categories(id),
  color TEXT,
  icon TEXT,
  budget_limit NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_category_type CHECK (type IN ('income', 'expense'))
);

CREATE INDEX idx_finance_categories_type ON finance_categories(type);
CREATE INDEX idx_finance_categories_active ON finance_categories(is_active);

CREATE TABLE IF NOT EXISTS finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  category_id UUID REFERENCES finance_categories(id),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  reference_number TEXT,
  vendor TEXT,
  project_id TEXT,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  
  CONSTRAINT valid_transaction_type CHECK (type IN ('income', 'expense', 'transfer')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'cancelled')),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_finance_transactions_transaction_id ON finance_transactions(transaction_id);
CREATE INDEX idx_finance_transactions_type ON finance_transactions(type);
CREATE INDEX idx_finance_transactions_category ON finance_transactions(category_id);
CREATE INDEX idx_finance_transactions_date ON finance_transactions(date DESC);
CREATE INDEX idx_finance_transactions_status ON finance_transactions(status);

CREATE TABLE IF NOT EXISTS finance_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES finance_categories(id),
  amount NUMERIC NOT NULL,
  spent NUMERIC DEFAULT 0,
  remaining NUMERIC,
  period TEXT NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  alert_threshold INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_period CHECK (period IN ('monthly', 'quarterly', 'yearly', 'custom')),
  CONSTRAINT valid_budget_status CHECK (status IN ('active', 'completed', 'exceeded')),
  CONSTRAINT positive_budget_amount CHECK (amount > 0),
  CONSTRAINT valid_threshold CHECK (alert_threshold IS NULL OR (alert_threshold >= 0 AND alert_threshold <= 100))
);

CREATE INDEX idx_finance_budgets_category ON finance_budgets(category_id);
CREATE INDEX idx_finance_budgets_period ON finance_budgets(start_date, end_date);
CREATE INDEX idx_finance_budgets_status ON finance_budgets(status);

-- Add RLS policies
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view categories" 
  ON finance_categories FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view transactions" 
  ON finance_transactions FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view budgets" 
  ON finance_budgets FOR SELECT 
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to update budget remaining
CREATE OR REPLACE FUNCTION update_budget_remaining()
RETURNS TRIGGER AS $$
BEGIN
  NEW.remaining := NEW.amount - COALESCE(NEW.spent, 0);
  
  IF NEW.remaining < 0 THEN
    NEW.status := 'exceeded';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_budget_remaining
  BEFORE UPDATE ON finance_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_remaining();

-- ============================================================================
-- Grants and Permissions
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT ON voice_interaction_logs TO authenticated;
GRANT SELECT ON satellite_orbital_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON missions TO authenticated;
GRANT SELECT ON mission_agents TO authenticated;
GRANT SELECT, INSERT ON mission_logs TO authenticated;
GRANT SELECT ON finance_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON finance_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON finance_budgets TO authenticated;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE voice_interaction_logs IS 'PATCH 381: Detailed logging of voice assistant interactions';
COMMENT ON TABLE satellite_orbital_events IS 'PATCH 382: Tracking of satellite orbital events and TLE updates';
COMMENT ON TABLE missions IS 'PATCH 383: Mission planning and tactical operations';
COMMENT ON TABLE mission_agents IS 'PATCH 383: Registry of agents (human, AI, autonomous) available for missions';
COMMENT ON TABLE mission_logs IS 'PATCH 383: Activity and event logging for missions';
COMMENT ON TABLE finance_categories IS 'PATCH 384: Financial transaction categories';
COMMENT ON TABLE finance_transactions IS 'PATCH 384: Financial transactions (income/expenses)';
COMMENT ON TABLE finance_budgets IS 'PATCH 384: Budget allocations and tracking';
