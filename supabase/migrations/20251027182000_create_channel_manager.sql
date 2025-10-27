-- Create communication_channels table
CREATE TABLE IF NOT EXISTS communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  channel_type TEXT DEFAULT 'group', -- 'group', 'direct', 'announcement'
  is_active BOOLEAN DEFAULT true,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create channel_messages table
CREATE TABLE IF NOT EXISTS channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES communication_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'file', 'image', 'system'
  metadata JSONB DEFAULT '{}'::jsonb,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create channel_members table for access control
CREATE TABLE IF NOT EXISTS channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES communication_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'member', -- 'admin', 'moderator', 'member'
  is_muted BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- Create communication_logs table for System Watchdog integration
CREATE TABLE IF NOT EXISTS communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES communication_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL, -- 'message_sent', 'channel_created', 'member_added', 'member_removed'
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_channels_active ON communication_channels(is_active);
CREATE INDEX IF NOT EXISTS idx_channels_created_by ON communication_channels(created_by);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON channel_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_user ON channel_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON channel_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_members_channel ON channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_comm_logs_channel ON communication_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_comm_logs_event ON communication_logs(event_type);

-- Enable RLS
ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communication_channels
CREATE POLICY "Users can view public channels"
  ON communication_channels FOR SELECT
  USING (NOT is_private OR id IN (
    SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create channels"
  ON communication_channels FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Channel creators can update their channels"
  ON communication_channels FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Channel creators can delete their channels"
  ON communication_channels FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for channel_messages
CREATE POLICY "Members can view channel messages"
  ON channel_messages FOR SELECT
  USING (
    channel_id IN (
      SELECT id FROM communication_channels WHERE NOT is_private
    ) OR
    channel_id IN (
      SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send messages"
  ON channel_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
      channel_id IN (
        SELECT id FROM communication_channels WHERE NOT is_private
      ) OR
      channel_id IN (
        SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own messages"
  ON channel_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON channel_messages FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for channel_members
CREATE POLICY "Members can view channel membership"
  ON channel_members FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Channel admins can add members"
  ON channel_members FOR INSERT
  WITH CHECK (
    channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    ) OR
    channel_id IN (
      SELECT id FROM communication_channels WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own membership"
  ON channel_members FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for communication_logs
CREATE POLICY "Users can view logs for their channels"
  ON communication_logs FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
    ) OR
    channel_id IN (
      SELECT id FROM communication_channels WHERE created_by = auth.uid()
    )
  );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_communication_channels_updated_at
  BEFORE UPDATE ON communication_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_channels_updated_at();

-- Function to log channel events
CREATE OR REPLACE FUNCTION log_channel_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO communication_logs (channel_id, user_id, event_type, event_data)
    VALUES (
      NEW.channel_id,
      NEW.user_id,
      CASE
        WHEN TG_TABLE_NAME = 'channel_messages' THEN 'message_sent'
        WHEN TG_TABLE_NAME = 'channel_members' THEN 'member_added'
        ELSE 'unknown'
      END,
      jsonb_build_object('record_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_message_sent
  AFTER INSERT ON channel_messages
  FOR EACH ROW
  EXECUTE FUNCTION log_channel_event();

CREATE TRIGGER log_member_added
  AFTER INSERT ON channel_members
  FOR EACH ROW
  EXECUTE FUNCTION log_channel_event();

-- Function to auto-add creator as admin member
CREATE OR REPLACE FUNCTION add_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO channel_members (channel_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_channel_creator_as_admin
  AFTER INSERT ON communication_channels
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_admin();
