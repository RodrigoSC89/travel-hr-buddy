
-- Insert test sensor data with critical anomalies for IoT History
INSERT INTO equipment_sensors (
  equipment_id, equipment_name, sensor_type, value, unit, 
  min_threshold, max_threshold, is_anomaly, vessel_id, 
  sensor_status, location, recorded_at
) VALUES 
  -- Normal readings
  ('EQ001', 'Main Engine', 'temperature', 85, '°C', 60, 95, false, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'online', 'Engine Room', NOW() - INTERVAL '6 hours'),
  ('EQ001', 'Main Engine', 'temperature', 88, '°C', 60, 95, false, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'online', 'Engine Room', NOW() - INTERVAL '5 hours'),
  ('EQ001', 'Main Engine', 'temperature', 92, '°C', 60, 95, false, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'online', 'Engine Room', NOW() - INTERVAL '4 hours'),
  -- CRITICAL ANOMALY - Temperature spike
  ('EQ001', 'Main Engine', 'temperature', 105, '°C', 60, 95, true, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'warning', 'Engine Room', NOW() - INTERVAL '3 hours'),
  ('EQ001', 'Main Engine', 'temperature', 112, '°C', 60, 95, true, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'critical', 'Engine Room', NOW() - INTERVAL '2 hours'),
  -- Vibration readings
  ('EQ001', 'Main Engine', 'vibration', 2.5, 'mm/s', 0, 4.0, false, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'online', 'Engine Room', NOW() - INTERVAL '6 hours'),
  ('EQ001', 'Main Engine', 'vibration', 3.2, 'mm/s', 0, 4.0, false, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'online', 'Engine Room', NOW() - INTERVAL '5 hours'),
  ('EQ001', 'Main Engine', 'vibration', 3.8, 'mm/s', 0, 4.0, false, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'online', 'Engine Room', NOW() - INTERVAL '4 hours'),
  -- CRITICAL ANOMALY - Vibration spike
  ('EQ001', 'Main Engine', 'vibration', 5.5, 'mm/s', 0, 4.0, true, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'warning', 'Engine Room', NOW() - INTERVAL '3 hours'),
  ('EQ001', 'Main Engine', 'vibration', 7.2, 'mm/s', 0, 4.0, true, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'critical', 'Engine Room', NOW() - INTERVAL '2 hours'),
  -- Auxiliary Generator
  ('EQ002', 'Aux Generator', 'temperature', 72, '°C', 50, 80, false, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'online', 'Generator Room', NOW() - INTERVAL '4 hours'),
  ('EQ002', 'Aux Generator', 'temperature', 78, '°C', 50, 80, false, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'online', 'Generator Room', NOW() - INTERVAL '3 hours'),
  ('EQ002', 'Aux Generator', 'temperature', 85, '°C', 50, 80, true, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'warning', 'Generator Room', NOW() - INTERVAL '2 hours'),
  -- Fuel Pump pressure
  ('EQ003', 'Fuel Pump', 'pressure', 4.2, 'bar', 3.5, 5.0, false, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'online', 'Engine Room', NOW() - INTERVAL '5 hours'),
  ('EQ003', 'Fuel Pump', 'pressure', 3.8, 'bar', 3.5, 5.0, false, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'online', 'Engine Room', NOW() - INTERVAL '4 hours'),
  ('EQ003', 'Fuel Pump', 'pressure', 3.2, 'bar', 3.5, 5.0, true, 'a29cc6a3-18a8-4747-af89-59a9166bb864', 'warning', 'Engine Room', NOW() - INTERVAL '3 hours');
