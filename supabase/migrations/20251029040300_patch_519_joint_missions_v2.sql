-- PATCH 519: Protocolo de Missões Conjuntas v2
-- Enhanced joint mission system with external entities and real-time sync

-- External entities participating in missions
CREATE TABLE IF NOT EXISTS external_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('vessel', 'aircraft', 'ground_station', 'satellite', 'uav', 'other')),
  organization TEXT,
  contact_info JSONB DEFAULT '{}'::jsonb,
  capabilities JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline', 'maintenance')),
  location JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Joint missions
CREATE TABLE IF NOT EXISTS joint_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_name TEXT NOT NULL,
  mission_type TEXT NOT NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  objectives JSONB DEFAULT '[]'::jsonb,
  area_of_operation JSONB,
  lead_entity UUID REFERENCES external_entities(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mission participants (many-to-many)
CREATE TABLE IF NOT EXISTS mission_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES joint_missions(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES external_entities(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'active', 'standby', 'withdrawn')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_update TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mission_id, entity_id)
);

-- Mission status updates
CREATE TABLE IF NOT EXISTS mission_status_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES joint_missions(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES external_entities(id),
  update_type TEXT NOT NULL CHECK (update_type IN ('status_change', 'position_update', 'alert', 'milestone', 'communication')),
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Mission chat/communication
CREATE TABLE IF NOT EXISTS mission_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES joint_missions(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES external_entities(id),
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'alert', 'command', 'status')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read_by JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Mission activity log
CREATE TABLE IF NOT EXISTS mission_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES joint_missions(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES external_entities(id),
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_external_entities_status ON external_entities(status);
CREATE INDEX IF NOT EXISTS idx_external_entities_entity_type ON external_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_joint_missions_status ON joint_missions(status);
CREATE INDEX IF NOT EXISTS idx_joint_missions_priority ON joint_missions(priority);
CREATE INDEX IF NOT EXISTS idx_mission_participants_mission_id ON mission_participants(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_participants_entity_id ON mission_participants(entity_id);
CREATE INDEX IF NOT EXISTS idx_mission_status_updates_mission_id ON mission_status_updates(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_status_updates_timestamp ON mission_status_updates(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mission_chat_mission_id ON mission_chat(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_chat_timestamp ON mission_chat(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mission_activity_log_mission_id ON mission_activity_log(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_activity_log_timestamp ON mission_activity_log(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE external_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE joint_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to external_entities" ON external_entities FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage external_entities" ON external_entities FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to joint_missions" ON joint_missions FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage joint_missions" ON joint_missions FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to mission_participants" ON mission_participants FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage mission_participants" ON mission_participants FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to mission_status_updates" ON mission_status_updates FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert mission_status_updates" ON mission_status_updates FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to mission_chat" ON mission_chat FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage mission_chat" ON mission_chat FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to mission_activity_log" ON mission_activity_log FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert mission_activity_log" ON mission_activity_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Triggers for updated_at
CREATE TRIGGER external_entities_updated_at
  BEFORE UPDATE ON external_entities
  FOR EACH ROW
  EXECUTE FUNCTION update_sensor_config_updated_at();

CREATE TRIGGER joint_missions_updated_at
  BEFORE UPDATE ON joint_missions
  FOR EACH ROW
  EXECUTE FUNCTION update_sensor_config_updated_at();

CREATE TRIGGER mission_participants_updated_at
  BEFORE UPDATE ON mission_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_sensor_config_updated_at();
