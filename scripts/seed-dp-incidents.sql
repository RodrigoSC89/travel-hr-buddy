-- Seed script to insert test DP incidents into the database
-- Run this in Supabase SQL editor to populate test data

-- Insert sample incidents if they don't exist
INSERT INTO public.dp_incidents (
  id,
  title,
  date,
  incident_date,
  vessel,
  location,
  root_cause,
  class_dp,
  source,
  link,
  summary,
  description,
  tags,
  severity,
  status
) VALUES 
(
  'imca-2025-014',
  'Loss of Position Due to Gyro Drift',
  '2025-09-12',
  '2025-09-12',
  'DP Shuttle Tanker X',
  'Campos Basin',
  'Sensor drift not compensated',
  'DP Class 2',
  'IMCA Safety Flash 42/25',
  'https://www.imca-int.com/safety-events/42-25/',
  'The vessel experienced a gradual loss of position due to undetected gyro drift during tandem loading ops.',
  'The vessel experienced a gradual loss of position due to undetected gyro drift during tandem loading operations. Thrusters responded late to positional errors. Operator initiated manual correction but system had exceeded excursion limits.',
  ARRAY['gyro', 'drive off', 'sensor', 'position loss'],
  'critical',
  'pending'
),
(
  'imca-2025-009',
  'Thruster Control Software Failure During ROV Ops',
  '2025-08-05',
  '2025-08-05',
  'DP DSV Subsea Alpha',
  'North Sea',
  'Unexpected software reboot',
  'DP Class 3',
  'IMCA SF 37/25',
  'https://www.imca-int.com/safety-events/37-25/',
  'During critical ROV launch, the vessel experienced a momentary loss of thruster control.',
  'During critical ROV launch, the vessel experienced a momentary loss of thruster control due to unexpected software reboot. Position held, but manual override was required.',
  ARRAY['thruster', 'software', 'rov', 'reboot'],
  'high',
  'pending'
),
(
  'imca-2025-006',
  'Reference System Failure in Heavy Weather',
  '2025-07-18',
  '2025-07-18',
  'DP Drillship Beta',
  'Gulf of Mexico',
  'Multiple DGPS reference loss',
  'DP Class 3',
  'IMCA SF 31/25',
  'https://www.imca-int.com/safety-events/31-25/',
  'During heavy weather operations, the vessel lost multiple DGPS references simultaneously.',
  'During heavy weather operations, the vessel lost multiple DGPS references simultaneously. Redundant system switched to acoustic positioning, but with degraded accuracy. Operations were suspended until conditions improved.',
  ARRAY['dgps', 'reference system', 'weather', 'acoustic'],
  'high',
  'pending'
),
(
  'imca-2024-089',
  'Power Management System Malfunction',
  '2024-12-03',
  '2024-12-03',
  'DP Construction Vessel Gamma',
  'Santos Basin',
  'PMS configuration error',
  'DP Class 2',
  'IMCA SF 89/24',
  'https://www.imca-int.com/safety-events/89-24/',
  'The Power Management System experienced a configuration error that resulted in unnecessary load shedding.',
  'The Power Management System experienced a configuration error that resulted in unnecessary load shedding. While DP was maintained, several non-critical systems were powered down temporarily causing operational delays.',
  ARRAY['pms', 'power', 'load shedding', 'configuration'],
  'medium',
  'pending'
)
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT id, title, vessel, severity, status 
FROM public.dp_incidents 
ORDER BY incident_date DESC;
