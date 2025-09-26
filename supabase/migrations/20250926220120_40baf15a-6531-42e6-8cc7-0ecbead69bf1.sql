-- Primeiro, vamos criar dados de demonstração sem dependência de usuário específico

-- Criar uma organização de demonstração com dados completos
INSERT INTO organizations (id, name, slug, status, plan_type, max_users, max_vessels, max_storage_gb, features)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Nautilus Demo', 'nautilus-demo', 'active', 'enterprise', 100, 50, 5, '{"peotram": true, "fleet_management": true, "analytics": true, "ai_analysis": true}')
ON CONFLICT (id) DO UPDATE SET
  features = EXCLUDED.features,
  max_users = EXCLUDED.max_users,
  max_vessels = EXCLUDED.max_vessels,
  max_storage_gb = EXCLUDED.max_storage_gb;

-- Inserir branding padrão da organização demo
INSERT INTO organization_branding (
  organization_id, 
  company_name, 
  primary_color, 
  secondary_color, 
  accent_color, 
  theme_mode, 
  default_language, 
  default_currency, 
  timezone,
  enabled_modules,
  module_settings
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Nautilus Demo',
  '#2563eb',
  '#64748b', 
  '#7c3aed',
  'light',
  'pt-BR',
  'BRL',
  'America/Sao_Paulo',
  '{"peotram": true, "fleet_management": true, "analytics": true, "hr": true}',
  '{"peotram": {"templates_enabled": true, "ai_analysis": true, "permissions_matrix": true}}'
)
ON CONFLICT (organization_id) DO UPDATE SET
  enabled_modules = EXCLUDED.enabled_modules,
  module_settings = EXCLUDED.module_settings;

-- Criar alguns navios de exemplo
INSERT INTO vessels (id, name, imo_number, vessel_type, flag_state, organization_id, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'MV Nautilus', '9876543', 'Container Ship', 'Brazil', '550e8400-e29b-41d4-a716-446655440000', 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', 'MV Atlantic', '9876544', 'Bulk Carrier', 'Brazil', '550e8400-e29b-41d4-a716-446655440000', 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'MV Pacific', '9876545', 'Oil Tanker', 'Brazil', '550e8400-e29b-41d4-a716-446655440000', 'active')
ON CONFLICT (id) DO UPDATE SET
  organization_id = EXCLUDED.organization_id,
  status = EXCLUDED.status;