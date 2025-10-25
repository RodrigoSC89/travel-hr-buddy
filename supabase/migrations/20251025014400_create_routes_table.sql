-- PATCH 104.0: Route Optimizer Module
-- Create routes table for maritime route planning with AI recommendations

create table if not exists routes (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid references vessels(id) on delete cascade,
  origin text not null,
  origin_coordinates jsonb,
  destination text not null,
  destination_coordinates jsonb,
  planned_departure timestamptz,
  estimated_arrival timestamptz,
  actual_arrival timestamptz,
  status text default 'planned' check (status in ('planned', 'active', 'completed', 'cancelled', 'delayed')),
  distance_nm numeric, -- Distance in nautical miles
  fuel_estimate numeric, -- Estimated fuel consumption in tons
  fuel_actual numeric, -- Actual fuel consumption
  weather_forecast jsonb, -- Weather data along route
  route_geometry jsonb, -- GeoJSON LineString for the route
  ai_recommendation text, -- AI-generated route recommendations
  ai_metadata jsonb, -- Additional AI analysis data
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for faster queries
create index if not exists idx_routes_vessel_id on routes(vessel_id);
create index if not exists idx_routes_status on routes(status);
create index if not exists idx_routes_departure on routes(planned_departure);
create index if not exists idx_routes_arrival on routes(estimated_arrival);

-- Enable Row Level Security
alter table routes enable row level security;

-- Create policies for authenticated users
create policy "Allow authenticated users to read routes"
  on routes for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert routes"
  on routes for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update routes"
  on routes for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete routes"
  on routes for delete
  to authenticated
  using (true);

-- Create function to update updated_at timestamp
create or replace function update_routes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for automatic timestamp update
create trigger routes_updated_at
  before update on routes
  for each row
  execute function update_routes_updated_at();

-- Insert sample routes for testing (using vessels from previous migration)
insert into routes (vessel_id, origin, origin_coordinates, destination, destination_coordinates, planned_departure, estimated_arrival, status, distance_nm, fuel_estimate, ai_recommendation)
select 
  v.id,
  'Port of Rio de Janeiro',
  '{"lat": -22.9068, "lng": -43.1729}'::jsonb,
  'Port of Rotterdam',
  '{"lat": 51.9244, "lng": 4.4777}'::jsonb,
  now() + interval '2 days',
  now() + interval '14 days',
  'planned',
  5800,
  320,
  'Recommended route: South Atlantic crossing via Equator. Expected favorable weather conditions. Suggest maintaining speed at 15 knots for optimal fuel efficiency. Monitor tropical storm activity near West Africa coast.'
from vessels v
where v.name = 'MV Atlantic Explorer'
limit 1
on conflict do nothing;
