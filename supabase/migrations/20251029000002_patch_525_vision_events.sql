-- PATCH 525: AI Visual Recognition Core - vision_events table
-- Stores image recognition results and object detection events

CREATE TABLE IF NOT EXISTS vision_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  
  -- Image information
  image_name TEXT NOT NULL,
  image_size INTEGER,
  image_width INTEGER,
  image_height INTEGER,
  image_format TEXT,
  
  -- Processing metadata
  processed_at TIMESTAMPTZ DEFAULT now(),
  processing_time_ms INTEGER,
  
  -- AI model information
  ai_model TEXT DEFAULT 'yolo-v5-onnx',
  model_version TEXT,
  
  -- Detection results
  objects_detected JSONB, -- Array of detected objects with bounding boxes
  total_objects INTEGER DEFAULT 0,
  
  -- Classification results
  scene_classification JSONB, -- Scene type and confidence
  image_quality_score NUMERIC,
  
  -- Object details
  -- Each object: { class, confidence, bbox: {x, y, width, height}, label }
  high_confidence_objects INTEGER DEFAULT 0, -- Objects with confidence > 0.7
  
  -- Context information
  location JSONB, -- { lat, lon } if available
  vessel_id UUID, -- If taken from vessel
  mission_id UUID, -- If part of mission
  
  -- Additional metadata
  tags TEXT[],
  metadata JSONB,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vision_events_user_id ON vision_events(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_events_session_id ON vision_events(session_id);
CREATE INDEX IF NOT EXISTS idx_vision_events_processed_at ON vision_events(processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_vision_events_total_objects ON vision_events(total_objects);
CREATE INDEX IF NOT EXISTS idx_vision_events_vessel_id ON vision_events(vessel_id) WHERE vessel_id IS NOT NULL;

-- RLS policies
ALTER TABLE vision_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own vision events
CREATE POLICY "Users can view own vision events"
  ON vision_events FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own vision events
CREATE POLICY "Users can insert own vision events"
  ON vision_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own vision events
CREATE POLICY "Users can update own vision events"
  ON vision_events FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own vision events
CREATE POLICY "Users can delete own vision events"
  ON vision_events FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vision_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_vision_events_timestamp
  BEFORE UPDATE ON vision_events
  FOR EACH ROW
  EXECUTE FUNCTION update_vision_events_updated_at();

-- View for recent high-confidence detections
CREATE OR REPLACE VIEW recent_high_confidence_detections AS
SELECT 
  id,
  user_id,
  image_name,
  total_objects,
  high_confidence_objects,
  objects_detected,
  processed_at
FROM vision_events
WHERE high_confidence_objects > 0
ORDER BY processed_at DESC
LIMIT 100;
