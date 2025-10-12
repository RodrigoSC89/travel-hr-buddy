-- Add explicit foreign key constraint from ai_generated_documents.generated_by to profiles.id
-- This allows for explicit foreign key relationship queries in Supabase using the ! operator
-- Changes the reference from auth.users(id) to profiles.id for better join semantics

DO $$ 
BEGIN
  -- First, drop any existing foreign key constraint on generated_by
  -- The table was created with an inline REFERENCES which creates an unnamed constraint
  EXECUTE (
    SELECT 'ALTER TABLE public.ai_generated_documents DROP CONSTRAINT ' || constraint_name || ';'
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'ai_generated_documents'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%generated_by%'
    LIMIT 1
  );
  
  RAISE NOTICE 'Dropped existing foreign key constraint on generated_by';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'No existing constraint to drop or error occurred: %', SQLERRM;
END $$;

-- Add the explicit named foreign key constraint
-- This references profiles.id instead of auth.users(id)
-- Since profiles.id is a foreign key to auth.users(id), data integrity is maintained
ALTER TABLE public.ai_generated_documents
ADD CONSTRAINT ai_generated_documents_generated_by_fkey
FOREIGN KEY (generated_by) 
REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- Verify the constraint was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'ai_generated_documents_generated_by_fkey'
  ) THEN
    RAISE NOTICE 'Successfully created foreign key constraint ai_generated_documents_generated_by_fkey';
  END IF;
END $$;
