-- PATCH 426-430: Mission Engine Database Schema
-- This file documents the required database tables for the mission engine

-- missions table
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('emergency', 'routine', 'training', 'tactical', 'recon')),
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled', 'paused')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_name VARCHAR(255),
  assigned_vessel_id UUID REFERENCES vessels(id),
  assigned_agents TEXT[],
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- mission_logs table
CREATE TABLE IF NOT EXISTS mission_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  log_type VARCHAR(20) NOT NULL CHECK (log_type IN ('info', 'warning', 'error', 'critical', 'success')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(100),
  source_module VARCHAR(100),
  event_timestamp TIMESTAMP NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- mission_alerts table
CREATE TABLE IF NOT EXISTS mission_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP,
  acknowledged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_type ON missions(type);
CREATE INDEX IF NOT EXISTS idx_missions_priority ON missions(priority);
CREATE INDEX IF NOT EXISTS idx_missions_start_time ON missions(start_time);
CREATE INDEX IF NOT EXISTS idx_mission_logs_mission_id ON mission_logs(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_logs_log_type ON mission_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_mission_logs_severity ON mission_logs(severity);
CREATE INDEX IF NOT EXISTS idx_mission_logs_event_timestamp ON mission_logs(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_mission_alerts_mission_id ON mission_alerts(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_alerts_acknowledged ON mission_alerts(acknowledged);

-- Row Level Security policies
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for missions
CREATE POLICY "Users can view missions" ON missions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authorized users can create missions" ON missions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Mission creators can update their missions" ON missions
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Mission creators can delete their missions" ON missions
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for mission_logs (read-only for most users)
CREATE POLICY "Users can view mission logs" ON mission_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can create mission logs" ON mission_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for mission_alerts
CREATE POLICY "Users can view mission alerts" ON mission_alerts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can create mission alerts" ON mission_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can acknowledge alerts" ON mission_alerts
  FOR UPDATE USING (auth.role() = 'authenticated');
