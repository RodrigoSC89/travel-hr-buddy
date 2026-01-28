-- Fix last remaining permissive policy
DROP POLICY IF EXISTS "System can insert blockchain audit entries" ON public.ai_blockchain_audit;
CREATE POLICY "Authenticated can insert blockchain audit"
ON public.ai_blockchain_audit
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);