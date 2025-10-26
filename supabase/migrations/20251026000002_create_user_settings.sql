-- PATCH 203.0: User Settings for Globalization
-- Store user preferences for locale, timezone, and unit system

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Localization preferences
  locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'pt', 'es')),
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'yyyy-MM-dd',
  time_format TEXT DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
  
  -- Unit system preferences
  unit_system TEXT DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  distance_unit TEXT DEFAULT 'km' CHECK (distance_unit IN ('km', 'mi', 'nm')),
  temperature_unit TEXT DEFAULT 'C' CHECK (temperature_unit IN ('C', 'F')),
  volume_unit TEXT DEFAULT 'L' CHECK (volume_unit IN ('L', 'gal_us', 'gal_uk')),
  speed_unit TEXT DEFAULT 'knots' CHECK (speed_unit IN ('knots', 'kmh', 'mph')),
  
  -- Additional preferences
  first_day_of_week INTEGER DEFAULT 0 CHECK (first_day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  currency TEXT DEFAULT 'USD',
  number_format TEXT DEFAULT 'decimal', -- decimal, comma
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_user_settings_locale ON user_settings(locale);
CREATE INDEX idx_user_settings_timezone ON user_settings(timezone);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- Function to create default settings for new users
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create settings for new users
CREATE TRIGGER create_user_settings_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();
