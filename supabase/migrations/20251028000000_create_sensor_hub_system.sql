-- PATCH 405: Sensor Hub System
-- Database schema for IoT sensor management and monitoring
-- Tables: sensors, sensor_data, sensor_logs, sensor_alerts
-- Functions: record_sensor_reading, check_sensor_alerts, update_sensor_status

-- Create enum types for sensor status and types
CREATE TYPE sensor_status AS ENUM ('active', 'offline', 'error', 'maintenance');
CREATE TYPE sensor_type AS ENUM ('temperature', 'humidity', 'pressure', 'motion', 'light', 'sound', 'vibration', 'proximity', 'gas', 'other');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Main sensors table
CREATE TABLE IF NOT EXISTS sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sensor_type sensor_type NOT NULL,
    location VARCHAR(255),
    description TEXT,
    status sensor_status DEFAULT 'active',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Threshold configuration for alerts
    min_threshold NUMERIC,
    max_threshold NUMERIC,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_reading_at TIMESTAMPTZ,
    
    -- User tracking
    created_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT valid_thresholds CHECK (min_threshold IS NULL OR max_threshold IS NULL OR min_threshold < max_threshold)
);

-- Sensor data readings table
CREATE TABLE IF NOT EXISTS sensor_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
    
    -- Reading data
    reading JSONB NOT NULL,
    reading_value NUMERIC NOT NULL, -- Normalized numeric value for comparisons
    unit VARCHAR(50),
    
    -- Timestamp
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexing for performance
    CONSTRAINT sensor_data_sensor_id_fkey FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE
);

-- Sensor event logs table
CREATE TABLE IF NOT EXISTS sensor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
    
    -- Event details
    event_type VARCHAR(100) NOT NULL, -- 'status_change', 'threshold_exceeded', 'error', 'maintenance'
    message TEXT NOT NULL,
    severity alert_severity DEFAULT 'low',
    
    -- Event data
    event_data JSONB DEFAULT '{}',
    
    -- Timestamp
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- User tracking (optional, for manual events)
    logged_by UUID REFERENCES auth.users(id)
);

-- Sensor alerts table
CREATE TABLE IF NOT EXISTS sensor_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
    
    -- Alert details
    alert_type VARCHAR(100) NOT NULL, -- 'threshold_min', 'threshold_max', 'offline', 'error'
    message TEXT NOT NULL,
    severity alert_severity NOT NULL,
    
    -- Alert data
    reading_value NUMERIC,
    threshold_value NUMERIC,
    alert_data JSONB DEFAULT '{}',
    
    -- Alert status
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES auth.users(id),
    
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sensors_status ON sensors(status);
CREATE INDEX IF NOT EXISTS idx_sensors_type ON sensors(sensor_type);
CREATE INDEX IF NOT EXISTS idx_sensor_data_sensor_id ON sensor_data(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_recorded_at ON sensor_data(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_logs_sensor_id ON sensor_logs(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_logs_logged_at ON sensor_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_sensor_id ON sensor_alerts(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_acknowledged ON sensor_alerts(acknowledged) WHERE NOT acknowledged;
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_resolved ON sensor_alerts(resolved) WHERE NOT resolved;

-- Function to record a sensor reading and automatically check for alerts
CREATE OR REPLACE FUNCTION record_sensor_reading(
    p_sensor_id UUID,
    p_reading JSONB,
    p_reading_value NUMERIC,
    p_unit VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_data_id UUID;
    v_sensor sensors%ROWTYPE;
    v_alert_id UUID;
BEGIN
    -- Get sensor details
    SELECT * INTO v_sensor FROM sensors WHERE id = p_sensor_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sensor not found: %', p_sensor_id;
    END IF;
    
    -- Insert sensor reading
    INSERT INTO sensor_data (sensor_id, reading, reading_value, unit)
    VALUES (p_sensor_id, p_reading, p_reading_value, p_unit)
    RETURNING id INTO v_data_id;
    
    -- Update sensor last reading timestamp
    UPDATE sensors 
    SET last_reading_at = NOW(),
        updated_at = NOW()
    WHERE id = p_sensor_id;
    
    -- Check for threshold alerts
    IF v_sensor.min_threshold IS NOT NULL AND p_reading_value < v_sensor.min_threshold THEN
        INSERT INTO sensor_alerts (sensor_id, alert_type, message, severity, reading_value, threshold_value)
        VALUES (
            p_sensor_id,
            'threshold_min',
            format('Sensor %s reading below minimum threshold', v_sensor.name),
            'high',
            p_reading_value,
            v_sensor.min_threshold
        );
        
        INSERT INTO sensor_logs (sensor_id, event_type, message, severity)
        VALUES (
            p_sensor_id,
            'threshold_exceeded',
            format('Reading %s below minimum threshold %s', p_reading_value, v_sensor.min_threshold),
            'high'
        );
    END IF;
    
    IF v_sensor.max_threshold IS NOT NULL AND p_reading_value > v_sensor.max_threshold THEN
        INSERT INTO sensor_alerts (sensor_id, alert_type, message, severity, reading_value, threshold_value)
        VALUES (
            p_sensor_id,
            'threshold_max',
            format('Sensor %s reading above maximum threshold', v_sensor.name),
            'high',
            p_reading_value,
            v_sensor.max_threshold
        );
        
        INSERT INTO sensor_logs (sensor_id, event_type, message, severity)
        VALUES (
            p_sensor_id,
            'threshold_exceeded',
            format('Reading %s above maximum threshold %s', p_reading_value, v_sensor.max_threshold),
            'high'
        );
    END IF;
    
    RETURN v_data_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check for sensor alerts based on inactivity
CREATE OR REPLACE FUNCTION check_sensor_alerts()
RETURNS void AS $$
DECLARE
    v_sensor sensors%ROWTYPE;
    v_inactive_threshold INTERVAL := '1 hour';
BEGIN
    -- Check for sensors that haven't reported in a while
    FOR v_sensor IN 
        SELECT * FROM sensors 
        WHERE status = 'active' 
        AND (last_reading_at IS NULL OR last_reading_at < NOW() - v_inactive_threshold)
    LOOP
        -- Create offline alert if not already exists
        IF NOT EXISTS (
            SELECT 1 FROM sensor_alerts 
            WHERE sensor_id = v_sensor.id 
            AND alert_type = 'offline' 
            AND NOT resolved
        ) THEN
            INSERT INTO sensor_alerts (sensor_id, alert_type, message, severity)
            VALUES (
                v_sensor.id,
                'offline',
                format('Sensor %s has not reported data in over %s', v_sensor.name, v_inactive_threshold),
                'medium'
            );
            
            INSERT INTO sensor_logs (sensor_id, event_type, message, severity)
            VALUES (
                v_sensor.id,
                'status_change',
                'Sensor appears offline - no recent readings',
                'medium'
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update sensor status
CREATE OR REPLACE FUNCTION update_sensor_status(
    p_sensor_id UUID,
    p_status sensor_status,
    p_message TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    v_old_status sensor_status;
BEGIN
    -- Get current status
    SELECT status INTO v_old_status FROM sensors WHERE id = p_sensor_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sensor not found: %', p_sensor_id;
    END IF;
    
    -- Update status
    UPDATE sensors 
    SET status = p_status,
        updated_at = NOW()
    WHERE id = p_sensor_id;
    
    -- Log status change
    INSERT INTO sensor_logs (sensor_id, event_type, message, severity, logged_by)
    VALUES (
        p_sensor_id,
        'status_change',
        COALESCE(p_message, format('Status changed from %s to %s', v_old_status, p_status)),
        CASE 
            WHEN p_status = 'error' THEN 'high'
            WHEN p_status = 'offline' THEN 'medium'
            ELSE 'low'
        END,
        p_user_id
    );
    
    -- Auto-resolve offline alerts if sensor becomes active
    IF p_status = 'active' AND v_old_status != 'active' THEN
        UPDATE sensor_alerts
        SET resolved = TRUE,
            resolved_at = NOW(),
            resolved_by = p_user_id
        WHERE sensor_id = p_sensor_id
        AND alert_type = 'offline'
        AND NOT resolved;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sensors table
CREATE POLICY "Users can view all sensors"
    ON sensors FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create sensors"
    ON sensors FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update sensors they created"
    ON sensors FOR UPDATE
    USING (created_by = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete sensors"
    ON sensors FOR DELETE
    USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for sensor_data table
CREATE POLICY "Users can view all sensor data"
    ON sensor_data FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert sensor data"
    ON sensor_data FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for sensor_logs table
CREATE POLICY "Users can view all sensor logs"
    ON sensor_logs FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create logs"
    ON sensor_logs FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for sensor_alerts table
CREATE POLICY "Users can view all sensor alerts"
    ON sensor_alerts FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create alerts"
    ON sensor_alerts FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can acknowledge and resolve alerts"
    ON sensor_alerts FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Insert sample sensors for testing
INSERT INTO sensors (name, sensor_type, location, description, min_threshold, max_threshold) VALUES
    ('Temperature Sensor 1', 'temperature', 'Engine Room', 'Main engine temperature monitor', 0, 100),
    ('Humidity Sensor 1', 'humidity', 'Cargo Hold A', 'Humidity monitor for cargo area', 30, 70),
    ('Pressure Sensor 1', 'pressure', 'Hydraulic System', 'Hydraulic pressure monitor', 50, 150),
    ('Motion Detector 1', 'motion', 'Bridge', 'Motion detection for security', NULL, NULL);

-- Create a scheduled job to check for offline sensors (requires pg_cron extension)
-- Note: This is a comment for manual setup if pg_cron is available
-- SELECT cron.schedule('check-sensor-alerts', '*/5 * * * *', 'SELECT check_sensor_alerts()');
