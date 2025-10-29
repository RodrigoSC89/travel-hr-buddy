-- PATCH 521: Sonar AI Processor - Acoustic Data Storage
-- Stores processed acoustic patterns and object detections from WAV files

-- Sonar Patterns Table
CREATE TABLE IF NOT EXISTS public.sonar_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  -- WAV File Information
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT,
  sample_rate_hz INTEGER,
  duration_seconds DECIMAL(10,2),
  channels INTEGER,
  bit_depth INTEGER,
  
  -- Acoustic Analysis Results
  frequency_spectrum JSONB DEFAULT '{}', -- FFT results
  dominant_frequency_hz DECIMAL(10,2),
  amplitude_db DECIMAL(6,2),
  signal_to_noise_ratio DECIMAL(6,2),
  
  -- Pattern Detection
  patterns_detected JSONB DEFAULT '[]', -- Array of detected patterns
  pattern_types TEXT[], -- submarine, wreck, rock, fish_school, etc.
  pattern_count INTEGER DEFAULT 0,
  
  -- Object Detection from Acoustic Signatures
  objects_detected JSONB DEFAULT '[]', -- Detailed object information
  object_types TEXT[], -- Specific object classifications
  object_count INTEGER DEFAULT 0,
  
  -- AI Model Information
  ai_model_version TEXT DEFAULT 'tensorflow-js-v1',
  processing_method TEXT DEFAULT 'fft-spectrogram',
  confidence_scores JSONB DEFAULT '{}',
  
  -- Metadata
  session_id UUID,
  processing_time_ms INTEGER,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sonar_patterns_vessel_id ON public.sonar_patterns(vessel_id);
CREATE INDEX idx_sonar_patterns_user_id ON public.sonar_patterns(user_id);
CREATE INDEX idx_sonar_patterns_session_id ON public.sonar_patterns(session_id);
CREATE INDEX idx_sonar_patterns_processed_at ON public.sonar_patterns(processed_at DESC);
CREATE INDEX idx_sonar_patterns_pattern_types ON public.sonar_patterns USING gin(pattern_types);
CREATE INDEX idx_sonar_patterns_object_types ON public.sonar_patterns USING gin(object_types);

-- RLS Policies
ALTER TABLE public.sonar_patterns ENABLE ROW LEVEL SECURITY;

-- Users can view their own patterns
CREATE POLICY "Users can view own sonar patterns"
  ON public.sonar_patterns
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own patterns
CREATE POLICY "Users can insert own sonar patterns"
  ON public.sonar_patterns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own patterns
CREATE POLICY "Users can update own sonar patterns"
  ON public.sonar_patterns
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own patterns
CREATE POLICY "Users can delete own sonar patterns"
  ON public.sonar_patterns
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sonar_patterns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sonar_patterns_updated_at_trigger
  BEFORE UPDATE ON public.sonar_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_sonar_patterns_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sonar_patterns TO authenticated;
