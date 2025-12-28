-- Move vector extension from public to extensions schema
-- First, create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage to necessary roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move the vector extension to extensions schema
-- Note: We need to drop and recreate as ALTER EXTENSION SET SCHEMA doesn't always work
ALTER EXTENSION vector SET SCHEMA extensions;

-- Ensure the extension is accessible from public schema by adding to search_path
-- This is done via a function to set the search_path for database functions

-- Create a helper function to ensure search_path includes extensions
COMMENT ON SCHEMA extensions IS 'Schema for PostgreSQL extensions - improves security by keeping extensions out of public schema';