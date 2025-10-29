-- PATCH 525: AI Visual Recognition Core - Visual Detection Events Storage
-- Stores object detection results from ONNX-based visual recognition

-- Vision Events Table
CREATE TABLE IF NOT EXISTS public.vision_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Image Information
  image_name TEXT,
  image_url TEXT,
  image_size_bytes BIGINT,
  image_width INTEGER,
  image_height INTEGER,
  image_format TEXT, -- jpg, png, webp, etc.
  
  -- Scene Analysis
  scene_classification TEXT,
  scene_confidence DECIMAL(5,2) CHECK (scene_confidence BETWEEN 0 AND 100),
  image_quality_score DECIMAL(5,2) CHECK (image_quality_score BETWEEN 0 AND 100),
  
  -- Object Detection Results (YOLO/COCO-SSD)
  objects_detected JSONB DEFAULT '[]', -- Array of detected objects with bbox, class, confidence
  object_count INTEGER DEFAULT 0,
  object_classes TEXT[], -- person, boat, container, etc. (80 COCO classes)
  
  -- Bounding Boxes (for visualization)
  bounding_boxes JSONB DEFAULT '[]', -- Array of {x, y, width, height} coordinates
  
  -- OCR Results (if text detected)
  extracted_text TEXT[],
  text_regions JSONB DEFAULT '[]',
  
  -- AI Model Information
  ai_model_name TEXT DEFAULT 'yolo-coco-ssd',
  ai_model_version TEXT DEFAULT 'v1.0',
  onnx_runtime_version TEXT,
  processing_backend TEXT DEFAULT 'webgl', -- webgl, wasm, cpu
  
  -- Detection Confidence
  average_confidence DECIMAL(5,2),
  high_confidence_count INTEGER DEFAULT 0, -- Objects with >80% confidence
  medium_confidence_count INTEGER DEFAULT 0, -- Objects with 60-80% confidence
  low_confidence_count INTEGER DEFAULT 0, -- Objects with <60% confidence
  
  -- Context and Location
  location_lat DECIMAL(10,6),
  location_lon DECIMAL(10,6),
  camera_source TEXT, -- drone, vessel_camera, upload, etc.
  
  -- Processing Metrics
  preprocessing_time_ms INTEGER,
  inference_time_ms INTEGER,
  postprocessing_time_ms INTEGER,
  total_processing_time_ms INTEGER,
  
  -- Metadata
  session_id UUID,
  mission_id UUID,
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  captured_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_vision_events_vessel_id ON public.vision_events(vessel_id);
CREATE INDEX idx_vision_events_user_id ON public.vision_events(user_id);
CREATE INDEX idx_vision_events_session_id ON public.vision_events(session_id);
CREATE INDEX idx_vision_events_mission_id ON public.vision_events(mission_id);
CREATE INDEX idx_vision_events_processed_at ON public.vision_events(processed_at DESC);
CREATE INDEX idx_vision_events_object_classes ON public.vision_events USING gin(object_classes);
CREATE INDEX idx_vision_events_tags ON public.vision_events USING gin(tags);
CREATE INDEX idx_vision_events_scene_classification ON public.vision_events(scene_classification);
CREATE INDEX idx_vision_events_location ON public.vision_events(location_lat, location_lon);

-- RLS Policies
ALTER TABLE public.vision_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own vision events
CREATE POLICY "Users can view own vision events"
  ON public.vision_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own vision events
CREATE POLICY "Users can insert own vision events"
  ON public.vision_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own vision events
CREATE POLICY "Users can update own vision events"
  ON public.vision_events
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own vision events
CREATE POLICY "Users can delete own vision events"
  ON public.vision_events
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vision_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vision_events_updated_at_trigger
  BEFORE UPDATE ON public.vision_events
  FOR EACH ROW
  EXECUTE FUNCTION update_vision_events_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vision_events TO authenticated;
GRANT USAGE ON SEQUENCE vision_events_id_seq TO authenticated;

-- Create a view for high-confidence detections
CREATE OR REPLACE VIEW public.high_confidence_detections AS
SELECT 
  ve.*,
  jsonb_array_length(ve.objects_detected) as total_objects,
  ve.high_confidence_count::float / NULLIF(ve.object_count, 0) as high_confidence_ratio
FROM public.vision_events ve
WHERE ve.high_confidence_count > 0
ORDER BY ve.processed_at DESC;

-- Grant view permissions
GRANT SELECT ON public.high_confidence_detections TO authenticated;
