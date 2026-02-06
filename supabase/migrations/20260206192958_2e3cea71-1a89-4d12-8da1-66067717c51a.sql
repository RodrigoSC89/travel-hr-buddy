
-- WASTE_RECORDS com constraints corretos
INSERT INTO public.waste_records (vessel_id, waste_type, quantity, unit, disposal_method, disposal_date, port_code, marpol_annex, certificate_number)
VALUES
  ('a29cc6a3-18a8-4747-af89-59a9166bb864', 'oily', 2.5, 'm3', 'port_reception', '2026-01-25 10:00:00+00', 'NLRTM', 'Annex I', 'WDR-2026-RTM-0451'),
  ('a29cc6a3-18a8-4747-af89-59a9166bb864', 'garbage', 0.8, 'm3', 'port_reception', '2026-01-25 10:00:00+00', 'NLRTM', 'Annex V', 'WDR-2026-RTM-0452'),
  ('f9bec2ca-8052-46b3-8ac6-2a7b8b2adb46', 'oily', 4.2, 'm3', 'port_reception', '2026-01-19 14:00:00+00', 'BRARG', 'Annex I', 'WDR-2026-ARG-0188'),
  ('495ab434-1a6d-43de-b18a-4eee388cee2c', 'garbage', 1.2, 'm3', 'discharge', '2026-01-20 06:00:00+00', NULL, 'Annex V', NULL),
  ('550e8400-e29b-41d4-a716-446655440001', 'sewage', 8.0, 'm3', 'port_reception', '2026-02-01 08:00:00+00', 'BRPNG', 'Annex IV', 'WDR-2026-PNG-0095'),
  ('550e8400-e29b-41d4-a716-446655440003', 'oily', 3.8, 'm3', 'treatment', '2026-01-28 12:00:00+00', NULL, 'Annex I', NULL),
  ('e6aed606-b458-4e1a-aeeb-d5909ae75486', 'garbage', 2.0, 'm3', 'port_reception', '2026-02-04 16:00:00+00', 'BRSSA', 'Annex V', 'WDR-2026-SSA-0322'),
  ('4009089e-ba7f-40bf-a5bb-dd547be25c0f', 'garbage', 0.5, 'm3', 'discharge', '2026-01-30 08:00:00+00', NULL, 'Annex V', NULL);

-- Suppliers faltantes (verificar duplicatas)
INSERT INTO public.suppliers (company_name, trading_name, category, services, contact_name, contact_email, contact_phone, website, city, country, rating, total_orders, total_value, payment_terms, lead_time_days)
SELECT * FROM (VALUES
  ('Furuno Electric Co.', 'Furuno', ARRAY['electronics', 'navigation'], ARRAY['Radar', 'ECDIS', 'AIS'], 'Takeshi Yamamoto', 'marine@furuno.com', '+81 798 65-2111', 'https://furuno.com', 'Nishinomiya', 'Japão', 4.6::numeric, 15, 680000.00::numeric, 'Net 45', 14),
  ('Amazônia Combustíveis Ltda.', 'Amazônia Comb.', ARRAY['fuel'], ARRAY['MGO', 'MDO'], 'Roberto Souza', 'operacoes@amazcomb.com.br', '+55 92 3622-4455', NULL::text, 'Manaus', 'Brasil', 3.8::numeric, 8, 165000.00::numeric, 'Net 15', 2)
) AS v(company_name, trading_name, category, services, contact_name, contact_email, contact_phone, website, city, country, rating, total_orders, total_value, payment_terms, lead_time_days)
WHERE NOT EXISTS (SELECT 1 FROM public.suppliers s WHERE s.company_name = v.company_name);
