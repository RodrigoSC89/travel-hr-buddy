-- Create voyage_routes table for route history
CREATE TABLE public.voyage_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id TEXT,
  origin JSONB NOT NULL,
  destination JSONB NOT NULL,
  route_data JSONB NOT NULL,
  recommended_route_id TEXT NOT NULL,
  alternatives_count INTEGER NOT NULL DEFAULT 0,
  hazards_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.voyage_routes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all routes
CREATE POLICY "Users can view all voyage routes"
ON public.voyage_routes
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert routes
CREATE POLICY "Users can create voyage routes"
ON public.voyage_routes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to delete their routes
CREATE POLICY "Users can delete voyage routes"
ON public.voyage_routes
FOR DELETE
TO authenticated
USING (true);

-- Create index for faster queries
CREATE INDEX idx_voyage_routes_created_at ON public.voyage_routes(created_at DESC);
CREATE INDEX idx_voyage_routes_vessel_id ON public.voyage_routes(vessel_id);