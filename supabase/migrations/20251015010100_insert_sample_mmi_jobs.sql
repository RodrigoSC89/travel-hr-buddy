-- Insert sample MMI jobs for testing the similarity API
-- Note: Embeddings will be generated via the API when similarity searches are performed

INSERT INTO public.mmi_jobs (id, title, description, status, metadata) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Engine Overheating Issue',
    'Main engine temperature rising above normal operating range. Coolant levels adequate. Requires immediate inspection of cooling system and thermostats.',
    'active',
    '{"severity": "high", "category": "engine", "vessel": "MV Ocean Star"}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Hydraulic System Leak',
    'Detected hydraulic fluid leak in starboard crane system. Pressure drop observed during lifting operations. Seals may need replacement.',
    'active',
    '{"severity": "medium", "category": "hydraulics", "vessel": "MV Sea Pioneer"}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Engine Cooling System Failure',
    'Cooling system malfunction causing engine temperature spikes. Water pump suspected. Emergency shutdown protocols activated.',
    'resolved',
    '{"severity": "critical", "category": "engine", "vessel": "MV Atlantic Wave", "resolution": "Water pump replaced"}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'Navigation System Calibration',
    'GPS and compass showing drift. Requires recalibration and verification with backup navigation systems.',
    'active',
    '{"severity": "medium", "category": "navigation", "vessel": "MV Ocean Star"}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'Electrical Panel Short Circuit',
    'Circuit breaker tripping in main electrical panel. Possible short in lighting circuit. Investigating potential water ingress.',
    'active',
    '{"severity": "high", "category": "electrical", "vessel": "MV Pacific Trader"}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440006',
    'Crane Hydraulic Pressure Drop',
    'Port side crane experiencing hydraulic pressure issues during heavy lift operations. Checking hoses and connections for leaks.',
    'active',
    '{"severity": "medium", "category": "hydraulics", "vessel": "MV Cargo Master"}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440007',
    'Generator Temperature Anomaly',
    'Auxiliary generator running hot. Cooling fan operational but inefficient. May need cleaning or replacement.',
    'active',
    '{"severity": "medium", "category": "engine", "vessel": "MV Sea Pioneer"}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440008',
    'Radio Communication Interference',
    'VHF radio experiencing static and interference. Antenna connection verified. May require equipment replacement.',
    'active',
    '{"severity": "low", "category": "navigation", "vessel": "MV Atlantic Wave"}'::jsonb
  );

-- Add comment
COMMENT ON TABLE public.mmi_jobs IS 'Sample MMI (Maritime Maintenance Inspection) jobs for testing similarity search functionality';
