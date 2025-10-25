-- PATCH 117.0: Weather Tables (Clima Operacional)
-- Create weather_forecast table for weather station module

create table if not exists weather_forecast (
  id uuid primary key default gen_random_uuid(),
  location jsonb,
  forecast jsonb,
  captured_at timestamptz default now()
);

-- Create indexes for faster queries
create index if not exists idx_weather_forecast_captured_at on weather_forecast(captured_at);

-- Enable Row Level Security
alter table weather_forecast enable row level security;

-- Create policies for authenticated users
create policy "Allow authenticated users to read weather_forecast"
  on weather_forecast for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert weather_forecast"
  on weather_forecast for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update weather_forecast"
  on weather_forecast for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete weather_forecast"
  on weather_forecast for delete
  to authenticated
  using (true);

-- Insert sample data for testing
insert into weather_forecast (location, forecast, captured_at)
values
  (
    '{"lat": -23.5505, "lng": -46.6333, "name": "São Paulo"}'::jsonb,
    '{
      "temperature": 22.5,
      "humidity": 65,
      "wind_speed": 8.5,
      "wind_direction": "NE",
      "conditions": "Partly Cloudy",
      "forecast_24h": {
        "max_temp": 26,
        "min_temp": 18,
        "precipitation_chance": 20
      }
    }'::jsonb,
    now()
  ),
  (
    '{"lat": -22.9068, "lng": -43.1729, "name": "Rio de Janeiro"}'::jsonb,
    '{
      "temperature": 28.0,
      "humidity": 75,
      "wind_speed": 12.0,
      "wind_direction": "SE",
      "conditions": "Clear",
      "forecast_24h": {
        "max_temp": 32,
        "min_temp": 22,
        "precipitation_chance": 10
      }
    }'::jsonb,
    now() - interval '1 hour'
  ),
  (
    '{"lat": -12.9714, "lng": -38.5014, "name": "Salvador"}'::jsonb,
    '{
      "temperature": 26.5,
      "humidity": 80,
      "wind_speed": 15.0,
      "wind_direction": "E",
      "conditions": "Scattered Showers",
      "forecast_24h": {
        "max_temp": 29,
        "min_temp": 24,
        "precipitation_chance": 60
      }
    }'::jsonb,
    now() - interval '2 hours'
  )
-- Note: ON CONFLICT DO NOTHING is defensive - prevents errors if migration runs multiple times
-- though conflicts are unlikely with auto-generated UUIDs
on conflict do nothing;

-- Note: weather_alerts table already exists in 20251025014500_create_weather_data_table.sql
-- This migration completes PATCH 117.0 by adding the weather_forecast table
