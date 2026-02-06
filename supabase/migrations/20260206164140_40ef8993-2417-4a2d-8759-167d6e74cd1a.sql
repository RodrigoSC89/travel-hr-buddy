
-- BATCH 2A: Core tables (sem suppliers)
INSERT INTO emissions_records (vessel_id, recorded_date, co2_tonnes, nox_kg, sox_kg, pm_kg, fuel_consumed_mt, fuel_type, distance_nm, cargo_carried_mt, carbon_intensity) VALUES
('550e8400-e29b-41d4-a716-446655440001', '2026-01-31', 1023.0, 4200, 850, 120, 330.0, 'VLSFO', 2850, 18500, 19.4),
('550e8400-e29b-41d4-a716-446655440002', '2026-01-31', 1456.0, 5800, 1100, 180, 470.0, 'VLSFO', 3200, 42000, 10.8),
('550e8400-e29b-41d4-a716-446655440003', '2026-01-31', 2480.0, 9500, 2200, 350, 800.0, 'VLSFO', 4100, 85000, 7.1),
('a29cc6a3-18a8-4747-af89-59a9166bb864', '2026-01-31', 868.0, 3500, 700, 95, 280.0, 'VLSFO', 2100, 22000, 18.8),
('f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', '2026-01-31', 2635.0, 10200, 2500, 400, 850.0, 'VLSFO', 3800, 95000, 7.3),
('495ab434-1a6d-43de-b18a-4eee388cee2c', '2026-01-31', 1333.0, 5200, 980, 155, 430.0, 'VLSFO', 2900, 38000, 12.1),
('4009089e-ba7f-40bf-a5bb-dd547be25c0f', '2026-01-31', 620.0, 2500, 500, 70, 200.0, 'VLSFO', 1800, 12000, 28.7),
('e6aed606-b458-4e1a-aeeb-d5909ae75486', '2026-01-31', 527.0, 1800, 150, 30, 170.0, 'MGO', 1500, 0, 0),
('70d081f7-177c-43ff-a918-fb089f98bba3', '2026-01-31', 2170.0, 8500, 1900, 300, 700.0, 'VLSFO', 3500, 75000, 8.3);

INSERT INTO non_conformities (vessel_id, nc_number, title, description, category, severity, source, standard_reference, status, priority, due_date, root_cause, corrective_action) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'NC-2026-001', 'Fire Extinguisher Expired', 'CO2 extinguisher past service date', 'safety', 'major', 'PSC Inspection', 'SOLAS III/3.1', 'open', 'high', '2026-02-15', 'Schedule oversight', 'Replace extinguishers'),
('550e8400-e29b-41d4-a716-446655440001', 'NC-2026-002', 'Crew Rest Hours Violation', 'Crew exceeded max working hours', 'crew', 'major', 'Internal Audit', 'MLC 2006 A2.3', 'in_progress', 'high', '2026-02-10', 'Poor rotation', 'Auto rest tracking'),
('550e8400-e29b-41d4-a716-446655440002', 'NC-2026-003', 'Oil Record Book Discrepancy', 'ORB not matching fuel records', 'environmental', 'minor', 'Internal Audit', 'MARPOL I/17', 'closed', 'medium', '2026-01-30', 'Data entry error', 'Digital ORB'),
('550e8400-e29b-41d4-a716-446655440003', 'NC-2026-004', 'IGS O2 Content High', 'O2 above 5% threshold', 'safety', 'critical', 'Vessel Report', 'SOLAS II-2/4.5', 'open', 'critical', '2026-02-08', 'Scrubber degradation', 'Overhaul IGS'),
('a29cc6a3-18a8-4747-af89-59a9166bb864', 'NC-2026-005', 'ISPS Drill Missed', 'Quarterly drill not conducted', 'security', 'minor', 'DPA Review', 'ISPS A/13', 'closed', 'medium', '2026-01-25', 'Scheduling conflict', 'Conduct drill'),
('f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', 'NC-2026-006', 'Tank Coating Damage', 'Epoxy damage cargo tank #3', 'structural', 'major', 'Class Survey', 'DNV Pt.4', 'in_progress', 'high', '2026-03-01', 'Corrosion', 'Repair at drydock'),
('495ab434-1a6d-43de-b18a-4eee388cee2c', 'NC-2026-007', 'ECDIS Overdue', 'Charts not updated', 'navigation', 'minor', 'Bridge Inspection', 'SOLAS V/19.2', 'open', 'medium', '2026-02-20', 'IT delay', 'Update ECDIS'),
('70d081f7-177c-43ff-a918-fb089f98bba3', 'NC-2026-008', 'Bilge Water 18ppm', 'OWS above 15ppm limit', 'environmental', 'critical', 'PSC Inspection', 'MARPOL I/15', 'in_progress', 'critical', '2026-02-06', 'Sensor drift', 'Recalibrate OWS');

INSERT INTO voyage_plans (vessel_id, voyage_number, origin_port, destination_port, departure_date, arrival_date, status, cargo_type, cargo_quantity, estimated_fuel_consumption, distance_nm) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'VYG-001', 'Santos, BR', 'Rotterdam, NL', '2026-01-05 14:00+00', '2026-01-25 08:00+00', 'completed', 'Containers', 4200, 330, 5850),
('550e8400-e29b-41d4-a716-446655440001', 'VYG-002', 'Rotterdam, NL', 'Jebel Ali, AE', '2026-01-28 06:00+00', '2026-02-15 18:00+00', 'in_transit', 'Containers', 3800, 420, 6200),
('550e8400-e29b-41d4-a716-446655440002', 'VYG-003', 'Paranaguá, BR', 'Shanghai, CN', '2026-01-08 10:00+00', '2026-02-10 06:00+00', 'in_transit', 'Soybeans', 62000, 470, 10800),
('550e8400-e29b-41d4-a716-446655440003', 'VYG-004', 'Angra dos Reis, BR', 'Houston, US', '2026-01-03 20:00+00', '2026-01-18 12:00+00', 'completed', 'Crude Oil', 150000, 800, 4900),
('a29cc6a3-18a8-4747-af89-59a9166bb864', 'VYG-005', 'Suape, BR', 'Antwerp, BE', '2026-01-10 16:00+00', '2026-01-30 10:00+00', 'completed', 'Containers', 2800, 280, 5100),
('f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', 'VYG-006', 'Itaguaí, BR', 'Fujairah, AE', '2026-01-06 08:00+00', '2026-02-01 14:00+00', 'in_transit', 'Crude Oil', 280000, 850, 7200),
('495ab434-1a6d-43de-b18a-4eee388cee2c', 'VYG-007', 'Rio Grande, BR', 'Barcelona, ES', '2026-01-12 12:00+00', '2026-01-29 06:00+00', 'completed', 'Iron Ore', 55000, 430, 5400),
('70d081f7-177c-43ff-a918-fb089f98bba3', 'VYG-008', 'Macaé, BR', 'Singapore, SG', '2026-01-07 18:00+00', '2026-02-08 10:00+00', 'in_transit', 'Crude Oil', 120000, 700, 9100);

INSERT INTO internal_audits (vessel_id, audit_number, department, audit_type, auditor_name, scheduled_date, completed_date, status, findings_count, score) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'AUD-001', 'Deck', 'ISM', 'Pereira', '2026-01-10 09:00+00', '2026-01-10 17:00+00', 'completed', 3, 85.5),
('550e8400-e29b-41d4-a716-446655440001', 'AUD-002', 'Engine', 'ISPS', 'Martins', '2026-01-20 09:00+00', '2026-01-20 16:00+00', 'completed', 1, 92.0),
('550e8400-e29b-41d4-a716-446655440002', 'AUD-003', 'Safety', 'MLC', 'Ribeiro', '2026-01-15 09:00+00', '2026-01-15 18:00+00', 'completed', 2, 88.0),
('550e8400-e29b-41d4-a716-446655440003', 'AUD-004', 'Environmental', 'MARPOL', 'Souza', '2026-02-01 09:00+00', NULL, 'in_progress', 0, NULL),
('a29cc6a3-18a8-4747-af89-59a9166bb864', 'AUD-005', 'Deck', 'SOLAS', 'Moreira', '2026-02-10 09:00+00', NULL, 'scheduled', 0, NULL),
('f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', 'AUD-006', 'Cargo', 'Pre-SIRE', 'Teixeira', '2026-01-25 09:00+00', '2026-01-26 17:00+00', 'completed', 4, 78.5);

INSERT INTO documents (title, document_type, content, vessel_id, expiry_date, status) VALUES
('Safety Management Certificate', 'certificate', 'SMC by DNV GL', '550e8400-e29b-41d4-a716-446655440001', '2027-06-15', 'active'),
('ISSC Certificate', 'certificate', 'ISSC renewal', '550e8400-e29b-41d4-a716-446655440001', '2027-03-20', 'active'),
('Document of Compliance', 'certificate', 'Fleet DOC', NULL, '2027-09-01', 'active'),
('CSSEC Certificate', 'certificate', 'CSSEC MV Atlantic', '550e8400-e29b-41d4-a716-446655440002', '2026-08-15', 'active'),
('IOPPC Certificate', 'certificate', 'IOPPC MV Pacific', '550e8400-e29b-41d4-a716-446655440003', '2027-01-10', 'active'),
('SEEMP Part III', 'plan', 'SEEMP for MV Pacific Explorer', 'f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', '2028-01-01', 'active'),
('Emergency Response Plan', 'plan', 'SOPEP', '550e8400-e29b-41d4-a716-446655440001', '2026-12-31', 'active'),
('Safety Manual v3.2', 'manual', 'Complete safety procedures', NULL, NULL, 'active'),
('ISM Audit Q1-2026', 'report', 'ISM compliance report', '550e8400-e29b-41d4-a716-446655440001', NULL, 'active'),
('MLC DMLC Certificate', 'certificate', 'DMLC Parts I and II', 'a29cc6a3-18a8-4747-af89-59a9166bb864', '2027-04-30', 'active');

INSERT INTO suppliers (id, company_name, category, contact_email, contact_phone, address, rating, is_active, payment_terms, notes) VALUES
(gen_random_uuid(), 'Petrobras Distribuidora', '{fuel}', 'marine@petrobras.com.br', '+55-21-3224-4477', 'Rio de Janeiro, BR', 4.5, true, 'Net 30', 'Major fuel supplier'),
(gen_random_uuid(), 'Shell Marine Products', '{fuel,lubricants}', 'shellmarine@shell.com', '+31-70-377-9111', 'The Hague, NL', 4.8, true, 'Net 45', 'Global marine fuel'),
(gen_random_uuid(), 'Alfa Laval Marine', '{equipment}', 'marine@alfalaval.com', '+46-46-36-65-00', 'Lund, SE', 4.6, true, 'Net 60', 'Marine equipment'),
(gen_random_uuid(), 'Wärtsilä Brasil', '{engine_parts}', 'service@wartsila.com', '+55-21-2122-9800', 'Niterói, BR', 4.7, true, 'Net 30', 'Engine parts'),
(gen_random_uuid(), 'Survitec Group', '{safety_equipment}', 'orders@survitec.com', '+44-151-649-0600', 'Birkenhead, UK', 4.3, true, 'Net 45', 'Safety equipment'),
(gen_random_uuid(), 'GAC Shipping Brasil', '{ship_agency}', 'brasil@gac.com', '+55-13-3219-1100', 'Santos, BR', 4.4, true, 'Net 15', 'Port agency');
