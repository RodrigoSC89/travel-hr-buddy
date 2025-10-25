-- PATCH 105.0: Weather Station Module
-- Create weather_data table for maritime weather monitoring

create table if not exists weather_data (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz default now(),
  vessel_id uuid references vessels(id) on delete cascade,
  location jsonb not null, -- {lat, lng}
  location_name text,
  forecast jsonb, -- Complete weather forecast data
  current_conditions jsonb, -- Current weather conditions
  alerts jsonb, -- Weather alerts and warnings
  severity text check (severity in ('none', 'low', 'moderate', 'high', 'severe')),
  alert_sent boolean default false,
  created_at timestamptz default now()
);

-- Create indexes for faster queries
create index if not exists idx_weather_data_timestamp on weather_data(timestamp);
create index if not exists idx_weather_data_vessel_id on weather_data(vessel_id);
create index if not exists idx_weather_data_severity on weather_data(severity);
create index if not exists idx_weather_data_alert_sent on weather_data(alert_sent);

-- Enable Row Level Security
alter table weather_data enable row level security;

-- Create policies for authenticated users
create policy "Allow authenticated users to read weather_data"
  on weather_data for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert weather_data"
  on weather_data for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update weather_data"
  on weather_data for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete weather_data"
  on weather_data for delete
  to authenticated
  using (true);

-- Create weather alerts table
create table if not exists weather_alerts (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid references vessels(id) on delete cascade,
  alert_type text not null,
  severity text not null check (severity in ('low', 'moderate', 'high', 'severe')),
  title text not null,
  description text not null,
  location jsonb,
  start_time timestamptz,
  end_time timestamptz,
  acknowledged boolean default false,
  acknowledged_at timestamptz,
  acknowledged_by text,
  created_at timestamptz default now()
);

-- Create indexes for weather alerts
create index if not exists idx_weather_alerts_vessel_id on weather_alerts(vessel_id);
create index if not exists idx_weather_alerts_severity on weather_alerts(severity);
create index if not exists idx_weather_alerts_acknowledged on weather_alerts(acknowledged);
create index if not exists idx_weather_alerts_created_at on weather_alerts(created_at);

-- Enable Row Level Security for weather alerts
alter table weather_alerts enable row level security;

-- Create policies for weather alerts
create policy "Allow authenticated users to read weather_alerts"
  on weather_alerts for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert weather_alerts"
  on weather_alerts for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update weather_alerts"
  on weather_alerts for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete weather_alerts"
  on weather_alerts for delete
  to authenticated
  using (true);

-- Insert sample weather data for testing
insert into weather_data (vessel_id, location, location_name, current_conditions, severity)
select 
  v.id,
  v.last_known_position,
  'Atlantic Ocean',
  jsonb_build_object(
    'temperature', 24.5,
    'wind_speed', 12.3,
    'wind_direction', 180,
    'humidity', 75,
    'visibility', 10,
    'description', 'Clear skies'
  ),
  'none'
from vessels v
where v.name = 'MV Atlantic Explorer'
limit 1
on conflict do nothing;

-- Insert sample weather alert
insert into weather_alerts (vessel_id, alert_type, severity, title, description, location, start_time)
select 
  v.id,
  'tropical_storm',
  'moderate',
  'Tropical Storm Watch',
  'A tropical storm is expected to develop in the area within the next 48 hours. Monitor conditions closely and be prepared to alter course if necessary.',
  jsonb_build_object('lat', -10.0, 'lng', -35.0),
  now() + interval '24 hours'
from vessels v
where v.name = 'SS Pacific Navigator'
limit 1
on conflict do nothing;
