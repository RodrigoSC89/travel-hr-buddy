
-- Drop the old permissive policies (the new ones already exist from previous migration)
DROP POLICY IF EXISTS "Authenticated create quotation requests" ON public.travel_quotation_requests;
DROP POLICY IF EXISTS "Authenticated create quotation responses" ON public.travel_quotation_responses;
