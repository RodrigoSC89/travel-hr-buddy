-- Seed data for inventory_items (using correct column names)
INSERT INTO inventory_items (vessel_id, item_code, name, description, category, quantity, min_quantity, unit, location, status, unit_cost, currency, is_critical) VALUES
('a29cc6a3-18a8-4747-af89-59a9166bb864', 'ENG-FILT-001', 'Filtro de óleo motor principal', 'Filtro para motor MAN 6L21/31', 'Engine Spares', 12, 4, 'unidade', 'Paiol de Máquinas Deck 2', 'in_stock', 450.00, 'BRL', true),
('a29cc6a3-18a8-4747-af89-59a9166bb864', 'ENG-JUNT-002', 'Junta de cabeçote cilindro', 'Junta de vedação cabeçote', 'Engine Spares', 3, 2, 'unidade', 'Paiol de Máquinas Deck 2', 'in_stock', 2200.00, 'BRL', true),
('a29cc6a3-18a8-4747-af89-59a9166bb864', 'LUB-HID-003', 'Óleo hidráulico ISO 46', 'Óleo hidráulico grau industrial', 'Lubricants', 200, 100, 'litros', 'Tanque Hidráulico', 'in_stock', 25.00, 'BRL', false),
('495ab434-1a6d-43de-b18a-4eee388cee2c', 'PMP-CENT-004', 'Bomba centrífuga de resfriamento', 'Bomba de água salgada SW cooling', 'Pumps', 2, 1, 'unidade', 'Sala de Máquinas', 'in_stock', 8500.00, 'BRL', true),
('495ab434-1a6d-43de-b18a-4eee388cee2c', 'VLV-BFLY-005', 'Válvula borboleta DN100', 'Válvula borboleta flangeada', 'Valves', 5, 3, 'unidade', 'Paiol Principal', 'in_stock', 1200.00, 'BRL', false),
('f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', 'DEC-BRK-006', 'Pastilha de freio guindaste', 'Pastilha de freio Liebherr', 'Deck Equipment', 8, 4, 'unidade', 'Convés Principal', 'in_stock', 950.00, 'BRL', true),
('f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', 'RIG-CBL-007', 'Cabo de aço 22mm', 'Cabo de aço galvanizado 6x19', 'Rigging', 500, 200, 'metros', 'Carretel Convés', 'in_stock', 35.00, 'BRL', false),
('4009089e-ba7f-40bf-a5bb-dd547be25c0f', 'INS-PT100-008', 'Sensor de pressão PT100', 'Sensor RTD de temperatura', 'Instrumentation', 6, 2, 'unidade', 'Sala de Controle', 'in_stock', 680.00, 'BRL', false),
('4009089e-ba7f-40bf-a5bb-dd547be25c0f', 'NAV-LED-009', 'Lâmpada LED navegação', 'LED masthead light USCG approved', 'Navigation', 10, 5, 'unidade', 'Ponte de Comando', 'in_stock', 320.00, 'BRL', true),
('70d081f7-177c-43ff-a918-fb089f98bba3', 'SAF-KIT-010', 'Kit reparo baleeira', 'Kit SOLAS para reparos', 'Safety Equipment', 2, 1, 'kit', 'Estação de Abandono', 'in_stock', 3500.00, 'BRL', true),
('70d081f7-177c-43ff-a918-fb089f98bba3', 'SAF-EXT-011', 'Extintor CO2 5kg', 'Extintor de CO2 aprovado SOLAS', 'Safety Equipment', 15, 10, 'unidade', 'Convés Principal', 'in_stock', 420.00, 'BRL', true),
('e6aed606-b458-4e1a-aeeb-d5909ae75486', 'SEL-ORING-012', 'Anel O-ring vedação', 'Kit O-ring NBR variados', 'Seals', 50, 20, 'unidade', 'Paiol Deck 1', 'in_stock', 15.00, 'BRL', false),
('550e8400-e29b-41d4-a716-446655440001', 'BRG-SKF-013', 'Rolamento SKF 6210', 'Rolamento de esferas 50x90x20', 'Bearings', 1, 2, 'unidade', 'Sala de Máquinas', 'low_stock', 580.00, 'BRL', true),
('550e8400-e29b-41d4-a716-446655440002', 'COT-AFI-014', 'Tinta anti-incrustante', 'Tinta Jotun SeaQuantum X200', 'Coatings', 40, 20, 'litros', 'Paiol de Tintas', 'in_stock', 180.00, 'BRL', false),
('550e8400-e29b-41d4-a716-446655440003', 'DRV-BLT-015', 'Correia transmissão A-68', 'Correia Gates industrial A-68', 'Drive Components', 3, 2, 'unidade', 'Sala de Máquinas', 'in_stock', 95.00, 'BRL', false);

-- Seed data for training_records (using correct column names)
INSERT INTO training_records (crew_member_id, training_type, training_name, training_provider, status, end_date, certificate_expiry_date, score, passed, is_mandatory, notes) VALUES
('f8b39045-bf63-49ee-ab2e-b317b7ad2280', 'mandatory', 'STCW Basic Safety Training', 'SENAI Maritime', 'completed', '2025-06-15', '2030-06-15', 95, true, true, 'Aprovado com distinção'),
('f8b39045-bf63-49ee-ab2e-b317b7ad2280', 'mandatory', 'Advanced Fire Fighting', 'Escola Naval', 'completed', '2025-03-10', '2030-03-10', 88, true, true, 'Passou todos módulos'),
('f8b39045-bf63-49ee-ab2e-b317b7ad2280', 'specialized', 'DP Unlimited Certificate', 'Nautical Institute', 'completed', '2024-11-20', '2029-11-20', 92, true, false, 'NI Certificate válido'),
('81e80932-3294-49c0-94e1-fcc81064b653', 'mandatory', 'STCW Basic Safety Training', 'SENAI Maritime', 'completed', '2025-05-20', '2030-05-20', 90, true, true, 'Concluído no prazo'),
('81e80932-3294-49c0-94e1-fcc81064b653', 'mandatory', 'Medical First Aid', 'Red Cross Maritime', 'completed', '2025-04-12', '2030-04-12', 85, true, true, 'Certificação válida'),
('81e80932-3294-49c0-94e1-fcc81064b653', 'specialized', 'GMDSS GOC', 'Escola Naval', 'completed', '2025-01-08', '2030-01-08', 91, true, false, 'General Operator Certificate'),
('ff73d5f5-2e22-4d3a-8f70-e370be001856', 'mandatory', 'STCW Basic Safety Training', 'CIAGA', 'completed', '2025-08-01', '2030-08-01', 82, true, true, 'Aprovado'),
('ff73d5f5-2e22-4d3a-8f70-e370be001856', 'mandatory', 'Survival Craft and Rescue Boats', 'SENAI Maritime', 'in_progress', NULL, NULL, NULL, false, true, 'Em andamento - Módulo 3/5'),
('ff73d5f5-2e22-4d3a-8f70-e370be001856', 'specialized', 'DP Limited Certificate', 'Nautical Institute', 'completed', '2025-09-15', '2030-09-15', 78, true, false, 'NI DP Limited'),
('db15ca58-3474-43e1-bd8d-41fb0aba08fb', 'mandatory', 'STCW Basic Safety Training', 'CIAGA', 'completed', '2025-07-10', '2030-07-10', 93, true, true, 'Excelente desempenho'),
('db15ca58-3474-43e1-bd8d-41fb0aba08fb', 'mandatory', 'Security Awareness ISPS', 'SENAI Maritime', 'completed', '2025-06-05', '2030-06-05', 87, true, true, 'Certificação ISPS'),
('db15ca58-3474-43e1-bd8d-41fb0aba08fb', 'specialized', 'Tanker Safety Oil Chemical', 'INMETRO Maritime', 'completed', '2025-02-28', '2030-02-28', 89, true, false, 'Tanker endorsement'),
('f8b39045-bf63-49ee-ab2e-b317b7ad2280', 'cpd', 'NI CPD Module Cyber Security Maritime', 'Nautical Institute Online', 'completed', '2025-10-15', '2028-10-15', 94, true, false, 'Módulo CPD 1/6'),
('f8b39045-bf63-49ee-ab2e-b317b7ad2280', 'cpd', 'NI CPD Module ECDIS Advanced', 'Nautical Institute Online', 'completed', '2025-12-01', '2028-12-01', 91, true, false, 'Módulo CPD 2/6'),
('81e80932-3294-49c0-94e1-fcc81064b653', 'cpd', 'NI CPD Module Leadership at Sea', 'Nautical Institute Online', 'completed', '2025-11-10', '2028-11-10', 88, true, false, 'Módulo CPD 1/6');
