
-- =====================================================
-- SEED DATA BATCH 1: Maintenance + Fuel Records
-- =====================================================

-- MAINTENANCE RECORDS (15 records)
INSERT INTO maintenance_records (vessel_id, maintenance_type, priority, status, title, description, scheduled_date, completed_date, estimated_duration, actual_duration, cost_estimate, actual_cost, assigned_technician, location) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'preventive', 'high', 'completed', 'Main Engine Overhaul', 'Complete overhaul of main engine MAN B&W 6S50MC-C', '2026-01-15 08:00:00+00', '2026-01-18 16:00:00+00', 72, 80, 45000, 52000, 'Chief Engineer Silva', 'Engine Room'),
('550e8400-e29b-41d4-a716-446655440001', 'corrective', 'critical', 'completed', 'Ballast Pump Repair', 'Emergency repair of #2 ballast pump - bearing failure', '2026-01-20 06:00:00+00', '2026-01-20 18:00:00+00', 12, 12, 8000, 7500, 'Engineer Costa', 'Pump Room'),
('550e8400-e29b-41d4-a716-446655440002', 'preventive', 'medium', 'in_progress', 'Hull Coating Inspection', 'Underwater hull inspection and anti-fouling assessment', '2026-02-05 08:00:00+00', NULL, 24, NULL, 15000, NULL, 'Marine Surveyor Santos', 'Hull External'),
('550e8400-e29b-41d4-a716-446655440002', 'preventive', 'low', 'scheduled', 'HVAC System Service', 'Quarterly HVAC system maintenance and filter replacement', '2026-02-20 08:00:00+00', NULL, 8, NULL, 3500, NULL, 'Technician Lima', 'Accommodation'),
('550e8400-e29b-41d4-a716-446655440003', 'corrective', 'high', 'completed', 'Cargo Pump Seal Replacement', 'Replace mechanical seals on #1 and #3 cargo pumps', '2026-01-10 08:00:00+00', '2026-01-12 14:00:00+00', 48, 54, 22000, 25000, 'Chief Engineer Oliveira', 'Cargo Pump Room'),
('550e8400-e29b-41d4-a716-446655440003', 'preventive', 'medium', 'scheduled', 'Inert Gas System Inspection', 'Annual IGS inspection per SOLAS requirements', '2026-03-01 08:00:00+00', NULL, 16, NULL, 5000, NULL, 'Safety Officer Dias', 'IGS Room'),
('a29cc6a3-18a8-4747-af89-59a9166bb864', 'preventive', 'high', 'completed', 'Crane Annual Survey', 'Annual load test and certification of deck cranes #1-#4', '2026-01-25 08:00:00+00', '2026-01-27 16:00:00+00', 40, 44, 18000, 19500, 'Crane Inspector Mendes', 'Main Deck'),
('a29cc6a3-18a8-4747-af89-59a9166bb864', 'corrective', 'medium', 'in_progress', 'Navigation Radar Calibration', 'X-band radar showing intermittent signal loss', '2026-02-03 08:00:00+00', NULL, 8, NULL, 4000, NULL, 'Electronics Officer Rocha', 'Bridge'),
('f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', 'preventive', 'medium', 'completed', 'Lifeboat Davit Inspection', 'Biannual inspection of lifeboat launching appliances', '2026-01-22 08:00:00+00', '2026-01-22 16:00:00+00', 8, 8, 3000, 2800, 'Safety Inspector Alves', 'Boat Deck'),
('f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', 'preventive', 'high', 'scheduled', 'Main Engine 10000hr Service', '10,000 running hours scheduled maintenance', '2026-03-15 08:00:00+00', NULL, 96, NULL, 65000, NULL, 'Chief Engineer Ferreira', 'Engine Room'),
('495ab434-1a6d-43de-b18a-4eee388cee2c', 'corrective', 'critical', 'completed', 'Steering Gear Emergency Repair', 'Hydraulic leak in steering gear system', '2026-01-28 02:00:00+00', '2026-01-28 14:00:00+00', 12, 12, 12000, 11000, 'Chief Engineer Barros', 'Steering Gear Room'),
('495ab434-1a6d-43de-b18a-4eee388cee2c', 'preventive', 'low', 'scheduled', 'Fire Detection System Test', 'Quarterly test of fire detection and alarm system', '2026-02-25 08:00:00+00', NULL, 4, NULL, 1500, NULL, 'Safety Officer Nunes', 'Throughout Vessel'),
('4009089e-ba7f-40bf-a5bb-dd547be25c0f', 'preventive', 'medium', 'completed', 'Anchor Windlass Overhaul', 'Complete overhaul of anchor windlass and chain locker inspection', '2026-01-08 08:00:00+00', '2026-01-10 16:00:00+00', 48, 56, 20000, 23000, 'Bosun Carvalho', 'Forecastle'),
('e6aed606-b458-4e1a-aeeb-d5909ae75486', 'preventive', 'high', 'in_progress', 'Passenger Safety Equipment Check', 'Inspection of all passenger life-saving appliances', '2026-02-04 08:00:00+00', NULL, 16, NULL, 8000, NULL, 'Safety Officer Pinto', 'All Decks'),
('70d081f7-177c-43ff-a918-fb089f98bba3', 'corrective', 'high', 'completed', 'Oil-Water Separator Repair', 'OWS malfunction - bilge alarm activated', '2026-01-30 04:00:00+00', '2026-01-30 20:00:00+00', 16, 16, 9000, 8500, 'Engineer Gomes', 'Engine Room');

-- FUEL RECORDS (20 records - using correct consumption_type values)
INSERT INTO fuel_records (vessel_id, record_date, fuel_type, quantity_mt, price_per_mt, total_cost, bunkering_port, supplier, sulfur_content, rob_before, rob_after, consumption_type) VALUES
('550e8400-e29b-41d4-a716-446655440001', '2026-01-05', 'VLSFO', 850.0, 620.00, 527000.00, 'Santos', 'Petrobras Distribuidora', 0.45, 200.0, 1050.0, 'bunkering'),
('550e8400-e29b-41d4-a716-446655440001', '2026-01-15', 'VLSFO', 330.0, 620.00, 204600.00, NULL, NULL, 0.45, 1050.0, 720.0, 'main_engine'),
('550e8400-e29b-41d4-a716-446655440001', '2026-01-25', 'MGO', 120.0, 890.00, 106800.00, 'Rio de Janeiro', 'Shell Marine', 0.08, 30.0, 150.0, 'bunkering'),
('550e8400-e29b-41d4-a716-446655440002', '2026-01-08', 'VLSFO', 1200.0, 615.00, 738000.00, 'Paranaguá', 'BP Marine', 0.42, 150.0, 1350.0, 'bunkering'),
('550e8400-e29b-41d4-a716-446655440002', '2026-01-20', 'VLSFO', 470.0, 615.00, 289050.00, NULL, NULL, 0.42, 1350.0, 880.0, 'main_engine'),
('550e8400-e29b-41d4-a716-446655440002', '2026-02-01', 'MGO', 80.0, 910.00, 72800.00, 'Santos', 'Petrobras Distribuidora', 0.07, 20.0, 100.0, 'bunkering'),
('550e8400-e29b-41d4-a716-446655440003', '2026-01-03', 'VLSFO', 2000.0, 625.00, 1250000.00, 'Angra dos Reis', 'TotalEnergies Marine', 0.48, 300.0, 2300.0, 'bunkering'),
('550e8400-e29b-41d4-a716-446655440003', '2026-01-18', 'VLSFO', 800.0, 625.00, 500000.00, NULL, NULL, 0.48, 2300.0, 1500.0, 'main_engine'),
('550e8400-e29b-41d4-a716-446655440003', '2026-02-02', 'HFO', 500.0, 480.00, 240000.00, 'São Sebastião', 'ExxonMobil Marine', 2.80, 100.0, 600.0, 'bunkering'),
('a29cc6a3-18a8-4747-af89-59a9166bb864', '2026-01-10', 'VLSFO', 600.0, 630.00, 378000.00, 'Suape', 'Petrobras Distribuidora', 0.44, 100.0, 700.0, 'bunkering'),
('a29cc6a3-18a8-4747-af89-59a9166bb864', '2026-01-28', 'VLSFO', 280.0, 630.00, 176400.00, NULL, NULL, 0.44, 700.0, 420.0, 'main_engine'),
('f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', '2026-01-06', 'VLSFO', 1800.0, 618.00, 1112400.00, 'Itaguaí', 'Shell Marine', 0.46, 250.0, 2050.0, 'bunkering'),
('f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', '2026-01-22', 'VLSFO', 850.0, 618.00, 525300.00, NULL, NULL, 0.46, 2050.0, 1200.0, 'main_engine'),
('f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', '2026-02-03', 'MGO', 150.0, 905.00, 135750.00, 'Santos', 'BP Marine', 0.09, 15.0, 165.0, 'auxiliary'),
('495ab434-1a6d-43de-b18a-4eee388cee2c', '2026-01-12', 'VLSFO', 900.0, 622.00, 559800.00, 'Rio Grande', 'Petrobras Distribuidora', 0.43, 180.0, 1080.0, 'bunkering'),
('495ab434-1a6d-43de-b18a-4eee388cee2c', '2026-01-30', 'VLSFO', 430.0, 622.00, 267460.00, NULL, NULL, 0.43, 1080.0, 650.0, 'main_engine'),
('4009089e-ba7f-40bf-a5bb-dd547be25c0f', '2026-01-14', 'VLSFO', 500.0, 628.00, 314000.00, 'Vitória', 'TotalEnergies Marine', 0.41, 120.0, 620.0, 'bunkering'),
('e6aed606-b458-4e1a-aeeb-d5909ae75486', '2026-01-09', 'MGO', 300.0, 895.00, 268500.00, 'Salvador', 'Shell Marine', 0.08, 50.0, 350.0, 'bunkering'),
('e6aed606-b458-4e1a-aeeb-d5909ae75486', '2026-01-25', 'MGO', 170.0, 895.00, 152150.00, NULL, NULL, 0.08, 350.0, 180.0, 'main_engine'),
('70d081f7-177c-43ff-a918-fb089f98bba3', '2026-01-07', 'VLSFO', 1500.0, 620.00, 930000.00, 'Macaé', 'Petrobras Distribuidora', 0.47, 200.0, 1700.0, 'bunkering');
