-- PATCH 427: Drone Commander Database Schema

-- drones table
CREATE TABLE IF NOT EXISTS drones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('idle', 'flying', 'hovering', 'landing', 'takeoff', 'emergency', 'offline')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  altitude DECIMAL(8, 2),
  heading DECIMAL(5, 2),
  battery INTEGER DEFAULT 100 CHECK (battery >= 0 AND battery <= 100),
  signal INTEGER DEFAULT 100 CHECK (signal >= 0 AND signal <= 100),
  speed DECIMAL(6, 2) DEFAULT 0,
  connected_since TIMESTAMP DEFAULT NOW(),
  last_update TIMESTAMP DEFAULT NOW(),
  active_flight_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- drone_flights table
CREATE TABLE IF NOT EXISTS drone_flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drone_id UUID NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-flight', 'completed', 'cancelled')),
  scheduled_start TIMESTAMP NOT NULL,
  scheduled_end TIMESTAMP,
  actual_start TIMESTAMP,
  actual_end TIMESTAMP,
  waypoints JSONB DEFAULT '[]',
  trajectory JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- drone_tasks table
CREATE TABLE IF NOT EXISTS drone_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drone_id UUID NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
  flight_id UUID REFERENCES drone_flights(id) ON DELETE SET NULL,
  type VARCHAR(50) CHECK (type IN ('patrol', 'survey', 'inspection', 'delivery', 'emergency')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'failed')),
  assigned_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  result JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- drone_commands table
CREATE TABLE IF NOT EXISTS drone_commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drone_id UUID NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('takeoff', 'land', 'goto', 'hover', 'return_home', 'emergency_stop', 'follow_route')),
  timestamp TIMESTAMP NOT NULL,
  parameters JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_drones_status ON drones(status);
CREATE INDEX IF NOT EXISTS idx_drone_flights_drone_id ON drone_flights(drone_id);
CREATE INDEX IF NOT EXISTS idx_drone_flights_status ON drone_flights(status);
CREATE INDEX IF NOT EXISTS idx_drone_flights_scheduled_start ON drone_flights(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_drone_tasks_drone_id ON drone_tasks(drone_id);
CREATE INDEX IF NOT EXISTS idx_drone_tasks_status ON drone_tasks(status);
CREATE INDEX IF NOT EXISTS idx_drone_commands_drone_id ON drone_commands(drone_id);

-- Row Level Security
ALTER TABLE drones ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_commands ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view drones" ON drones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view flights" ON drone_flights
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create flights" ON drone_flights
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view tasks" ON drone_tasks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create tasks" ON drone_tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view commands" ON drone_commands
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create commands" ON drone_commands
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Sample drones for testing
INSERT INTO drones (id, name, status, latitude, longitude, altitude, heading, battery, signal) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Alpha-01', 'idle', -23.550520, -46.633308, 0, 0, 95, 100),
  ('d1000000-0000-0000-0000-000000000002', 'Bravo-02', 'idle', -23.551520, -46.634308, 0, 0, 87, 98),
  ('d1000000-0000-0000-0000-000000000003', 'Charlie-03', 'idle', -23.552520, -46.635308, 0, 0, 92, 95)
ON CONFLICT (id) DO NOTHING;
