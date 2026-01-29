
-- =====================================================
-- PARTE 1: Adicionar novos roles ao enum
-- =====================================================
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'legal';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'finance';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'purchasing';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operations';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'crew_member';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'captain';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'officer';
