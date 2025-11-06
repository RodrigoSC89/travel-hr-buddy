-- ===========================
-- SEED DP INCIDENTS - Initial Data Population
-- Insert sample IMCA incidents into dp_incidents table
-- ===========================

-- Insert demo incidents if table is empty
INSERT INTO public.dp_incidents (id, title, date, vessel, location, root_cause, class_dp, source, link, summary, tags)
VALUES
  (
    'imca-2025-014',
    'Loss of Position Due to Gyro Drift',
    '2025-09-12',
    'DP Shuttle Tanker X',
    'Campos Basin',
    'Sensor drift not compensated',
    'DP Class 2',
    'IMCA Safety Flash 42/25',
    'https://www.imca-int.com/safety-events/42-25/',
    'The vessel experienced a gradual loss of position due to undetected gyro drift during tandem loading ops. Thrusters responded late to positional errors. Operator initiated manual correction but system had exceeded excursion limits.',
    ARRAY['gyro', 'drive off', 'sensor', 'position loss']
  ),
  (
    'imca-2025-009',
    'Thruster Control Software Failure During ROV Ops',
    '2025-08-05',
    'DP DSV Subsea Alpha',
    'North Sea',
    'Unexpected software reboot',
    'DP Class 3',
    'IMCA SF 37/25',
    'https://www.imca-int.com/safety-events/37-25/',
    'During critical ROV launch, the vessel experienced a momentary loss of thruster control due to unexpected software reboot. Position held, but manual override was required.',
    ARRAY['thruster', 'software', 'rov', 'reboot']
  ),
  (
    'imca-2025-006',
    'Reference System Failure in Heavy Weather',
    '2025-07-18',
    'DP Drillship Beta',
    'Gulf of Mexico',
    'Multiple DGPS reference loss',
    'DP Class 3',
    'IMCA SF 31/25',
    'https://www.imca-int.com/safety-events/31-25/',
    'During heavy weather operations, the vessel lost multiple DGPS references simultaneously. Redundant system switched to acoustic positioning, but with degraded accuracy. Operations were suspended until conditions improved.',
    ARRAY['dgps', 'reference system', 'weather', 'acoustic']
  ),
  (
    'imca-2024-089',
    'Power Management System Malfunction',
    '2024-12-03',
    'DP Construction Vessel Gamma',
    'Santos Basin',
    'PMS configuration error',
    'DP Class 2',
    'IMCA SF 89/24',
    'https://www.imca-int.com/safety-events/89-24/',
    'The Power Management System experienced a configuration error that resulted in unnecessary load shedding. While DP was maintained, several non-critical systems were powered down temporarily causing operational delays.',
    ARRAY['pms', 'power', 'load shedding', 'configuration']
  ),
  (
    'imca-2024-076',
    'Wind Sensor Calibration Issue',
    '2024-10-22',
    'DP Pipelay Vessel Delta',
    'West Africa',
    'Incorrect wind sensor calibration',
    'DP Class 2',
    'IMCA SF 76/24',
    'https://www.imca-int.com/safety-events/76-24/',
    'During pipelaying operations, it was discovered that the wind sensor had been incorrectly calibrated after maintenance. This led to sub-optimal thruster allocation and increased fuel consumption before being detected.',
    ARRAY['wind sensor', 'calibration', 'thruster allocation']
  )
ON CONFLICT (id) DO NOTHING;

-- Add comment to indicate data has been seeded
COMMENT ON TABLE public.dp_incidents IS 'Tabela para armazenamento de incidentes de Dynamic Positioning (DP) obtidos via API/crawler de fontes como IMCA. Dados iniciais foram populados em 2025-10-16.';
