-- PATCHES 446-450: Maritime Operations Enhancement
-- Created: 2025-10-28
-- Consolidates crew management and adds maritime intelligence tables

-- ============================================================================
-- PATCH 446: Crew Management Consolidation
-- ============================================================================

-- Add crew_assignments table for tracking crew assignments to vessels
create table if not exists crew_assignments (
  id uuid primary key default gen_random_uuid(),
  crew_member_id uuid references crew_members(id) on delete cascade,
  vessel_id uuid references vessels(id) on delete cascade,
  role text not null,
  start_date timestamptz not null,
  end_date timestamptz,
  status text default 'active' check (status in ('active', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_crew_assignments_crew_member on crew_assignments(crew_member_id);
create index if not exists idx_crew_assignments_vessel on crew_assignments(vessel_id);
create index if not exists idx_crew_assignments_status on crew_assignments(status);

-- Add crew_certifications table for detailed certification tracking
create table if not exists crew_certifications (
  id uuid primary key default gen_random_uuid(),
  crew_member_id uuid references crew_members(id) on delete cascade,
  certification_name text not null,
  certification_type text not null,
  issue_date date not null,
  expiry_date date not null,
  issuing_authority text,
  certificate_number text,
  status text default 'valid' check (status in ('valid', 'expiring', 'expired', 'suspended')),
  grade text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_crew_certifications_crew_member on crew_certifications(crew_member_id);
create index if not exists idx_crew_certifications_expiry on crew_certifications(expiry_date);
create index if not exists idx_crew_certifications_status on crew_certifications(status);

-- Add crew_performance table for performance reviews and tracking
create table if not exists crew_performance (
  id uuid primary key default gen_random_uuid(),
  crew_member_id uuid references crew_members(id) on delete cascade,
  vessel_id uuid references vessels(id) on delete set null,
  review_date timestamptz not null default now(),
  reviewer_id uuid references profiles(id) on delete set null,
  performance_score integer check (performance_score >= 1 and performance_score <= 5),
  technical_skills integer check (technical_skills >= 1 and technical_skills <= 5),
  leadership integer check (leadership >= 1 and leadership <= 5),
  teamwork integer check (teamwork >= 1 and teamwork <= 5),
  safety_compliance integer check (safety_compliance >= 1 and safety_compliance <= 5),
  comments text,
  achievements text[],
  areas_for_improvement text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_crew_performance_crew_member on crew_performance(crew_member_id);
create index if not exists idx_crew_performance_review_date on crew_performance(review_date);

-- ============================================================================
-- PATCH 447: Navigation Copilot - Route Suggestions
-- ============================================================================

create table if not exists route_suggestions (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid references vessels(id) on delete cascade,
  origin_lat numeric not null,
  origin_lng numeric not null,
  destination_lat numeric not null,
  destination_lng numeric not null,
  suggested_route jsonb not null, -- Array of waypoints with lat/lng
  distance_nm numeric,
  estimated_duration_hours numeric,
  eta timestamptz,
  weather_conditions jsonb, -- Weather data along route
  risk_score integer check (risk_score >= 0 and risk_score <= 100),
  fuel_efficiency_score integer,
  ai_confidence numeric,
  reasoning text, -- AI explanation for route suggestion
  alternatives jsonb, -- Alternative route options
  created_at timestamptz default now(),
  created_by uuid references profiles(id) on delete set null,
  status text default 'suggested' check (status in ('suggested', 'accepted', 'rejected', 'modified'))
);

create index if not exists idx_route_suggestions_vessel on route_suggestions(vessel_id);
create index if not exists idx_route_suggestions_created_at on route_suggestions(created_at);
create index if not exists idx_route_suggestions_status on route_suggestions(status);

-- ============================================================================
-- PATCH 448: Sonar AI - Results and Classifications
-- ============================================================================

create table if not exists sonar_ai_results (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid references vessels(id) on delete cascade,
  scan_timestamp timestamptz not null default now(),
  scan_depth numeric not null,
  scan_radius numeric not null,
  detected_objects jsonb, -- Array of detected objects with classifications
  hazards jsonb, -- Identified hazards
  safe_zones jsonb, -- Identified safe navigation zones
  patterns jsonb, -- Detected patterns (underwater features)
  quality_score numeric,
  coverage_percentage numeric,
  risk_assessment text,
  ai_model_version text,
  raw_data jsonb, -- Raw sonar data if needed
  created_at timestamptz default now()
);

create index if not exists idx_sonar_ai_results_vessel on sonar_ai_results(vessel_id);
create index if not exists idx_sonar_ai_results_timestamp on sonar_ai_results(scan_timestamp);

-- ============================================================================
-- PATCH 449: Route Planner v2 - Planned Routes
-- ============================================================================

create table if not exists planned_routes (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid references vessels(id) on delete cascade,
  route_name text not null,
  route_type text check (route_type in ('planned', 'alternative', 'actual')),
  origin jsonb not null, -- {lat, lng, name}
  destination jsonb not null, -- {lat, lng, name}
  waypoints jsonb not null, -- Array of waypoints
  distance_nm numeric,
  estimated_duration_hours numeric,
  average_speed_knots numeric,
  departure_time timestamptz,
  eta timestamptz,
  weather_integrated boolean default false,
  fuel_estimate numeric,
  route_color text,
  is_active boolean default false,
  metadata jsonb, -- Additional route metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references profiles(id) on delete set null
);

create index if not exists idx_planned_routes_vessel on planned_routes(vessel_id);
create index if not exists idx_planned_routes_is_active on planned_routes(is_active);
create index if not exists idx_planned_routes_created_at on planned_routes(created_at);

-- ============================================================================
-- PATCH 450: Underwater Drone Control
-- ============================================================================

create table if not exists drone_missions (
  id uuid primary key default gen_random_uuid(),
  mission_name text not null,
  vessel_id uuid references vessels(id) on delete cascade,
  drone_id text not null,
  mission_type text check (mission_type in ('inspection', 'survey', 'maintenance', 'rescue', 'training')),
  start_time timestamptz not null,
  end_time timestamptz,
  status text default 'planned' check (status in ('planned', 'active', 'completed', 'aborted', 'failed')),
  mission_plan jsonb, -- Planned waypoints and objectives
  actual_path jsonb, -- Actual path taken
  max_depth numeric,
  total_distance numeric,
  objectives text[],
  findings text,
  media_urls text[], -- URLs to captured images/videos
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references profiles(id) on delete set null
);

create index if not exists idx_drone_missions_vessel on drone_missions(vessel_id);
create index if not exists idx_drone_missions_status on drone_missions(status);
create index if not exists idx_drone_missions_start_time on drone_missions(start_time);

create table if not exists drone_telemetry (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references drone_missions(id) on delete cascade,
  timestamp timestamptz not null default now(),
  position_x numeric not null,
  position_y numeric not null,
  position_z numeric not null, -- Depth
  depth numeric not null,
  heading numeric, -- Degrees
  pitch numeric, -- Degrees
  roll numeric, -- Degrees
  speed numeric, -- m/s
  battery_level numeric, -- Percentage
  temperature numeric, -- Celsius
  pressure numeric, -- Bar
  camera_active boolean default false,
  lights_on boolean default false,
  status_flags jsonb, -- Additional status information
  created_at timestamptz default now()
);

create index if not exists idx_drone_telemetry_mission on drone_telemetry(mission_id);
create index if not exists idx_drone_telemetry_timestamp on drone_telemetry(timestamp);

-- ============================================================================
-- Enable Row Level Security for all new tables
-- ============================================================================

alter table crew_assignments enable row level security;
alter table crew_certifications enable row level security;
alter table crew_performance enable row level security;
alter table route_suggestions enable row level security;
alter table sonar_ai_results enable row level security;
alter table planned_routes enable row level security;
alter table drone_missions enable row level security;
alter table drone_telemetry enable row level security;

-- ============================================================================
-- Create RLS Policies (authenticated users have full access)
-- ============================================================================

-- Crew Assignments
create policy "Authenticated users can read crew assignments"
  on crew_assignments for select to authenticated using (true);
create policy "Authenticated users can insert crew assignments"
  on crew_assignments for insert to authenticated with check (true);
create policy "Authenticated users can update crew assignments"
  on crew_assignments for update to authenticated using (true);
create policy "Authenticated users can delete crew assignments"
  on crew_assignments for delete to authenticated using (true);

-- Crew Certifications
create policy "Authenticated users can read crew certifications"
  on crew_certifications for select to authenticated using (true);
create policy "Authenticated users can insert crew certifications"
  on crew_certifications for insert to authenticated with check (true);
create policy "Authenticated users can update crew certifications"
  on crew_certifications for update to authenticated using (true);
create policy "Authenticated users can delete crew certifications"
  on crew_certifications for delete to authenticated using (true);

-- Crew Performance
create policy "Authenticated users can read crew performance"
  on crew_performance for select to authenticated using (true);
create policy "Authenticated users can insert crew performance"
  on crew_performance for insert to authenticated with check (true);
create policy "Authenticated users can update crew performance"
  on crew_performance for update to authenticated using (true);
create policy "Authenticated users can delete crew performance"
  on crew_performance for delete to authenticated using (true);

-- Route Suggestions
create policy "Authenticated users can read route suggestions"
  on route_suggestions for select to authenticated using (true);
create policy "Authenticated users can insert route suggestions"
  on route_suggestions for insert to authenticated with check (true);
create policy "Authenticated users can update route suggestions"
  on route_suggestions for update to authenticated using (true);
create policy "Authenticated users can delete route suggestions"
  on route_suggestions for delete to authenticated using (true);

-- Sonar AI Results
create policy "Authenticated users can read sonar AI results"
  on sonar_ai_results for select to authenticated using (true);
create policy "Authenticated users can insert sonar AI results"
  on sonar_ai_results for insert to authenticated with check (true);
create policy "Authenticated users can update sonar AI results"
  on sonar_ai_results for update to authenticated using (true);
create policy "Authenticated users can delete sonar AI results"
  on sonar_ai_results for delete to authenticated using (true);

-- Planned Routes
create policy "Authenticated users can read planned routes"
  on planned_routes for select to authenticated using (true);
create policy "Authenticated users can insert planned routes"
  on planned_routes for insert to authenticated with check (true);
create policy "Authenticated users can update planned routes"
  on planned_routes for update to authenticated using (true);
create policy "Authenticated users can delete planned routes"
  on planned_routes for delete to authenticated using (true);

-- Drone Missions
create policy "Authenticated users can read drone missions"
  on drone_missions for select to authenticated using (true);
create policy "Authenticated users can insert drone missions"
  on drone_missions for insert to authenticated with check (true);
create policy "Authenticated users can update drone missions"
  on drone_missions for update to authenticated using (true);
create policy "Authenticated users can delete drone missions"
  on drone_missions for delete to authenticated using (true);

-- Drone Telemetry
create policy "Authenticated users can read drone telemetry"
  on drone_telemetry for select to authenticated using (true);
create policy "Authenticated users can insert drone telemetry"
  on drone_telemetry for insert to authenticated with check (true);
create policy "Authenticated users can update drone telemetry"
  on drone_telemetry for update to authenticated using (true);
create policy "Authenticated users can delete drone telemetry"
  on drone_telemetry for delete to authenticated using (true);

-- ============================================================================
-- Create updated_at triggers
-- ============================================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger crew_assignments_updated_at before update on crew_assignments
  for each row execute function update_updated_at_column();

create trigger crew_certifications_updated_at before update on crew_certifications
  for each row execute function update_updated_at_column();

create trigger crew_performance_updated_at before update on crew_performance
  for each row execute function update_updated_at_column();

create trigger planned_routes_updated_at before update on planned_routes
  for each row execute function update_updated_at_column();

create trigger drone_missions_updated_at before update on drone_missions
  for each row execute function update_updated_at_column();

-- ============================================================================
-- Create helper views
-- ============================================================================

-- View for crew with active assignments
create or replace view crew_with_assignments as
select 
  cm.*,
  ca.vessel_id as assigned_vessel_id,
  ca.role as assigned_role,
  ca.start_date as assignment_start,
  ca.end_date as assignment_end,
  v.name as vessel_name
from crew_members cm
left join crew_assignments ca on cm.id = ca.crew_member_id and ca.status = 'active'
left join vessels v on ca.vessel_id = v.id;

-- View for certifications expiring soon (within 90 days)
create or replace view expiring_certifications as
select 
  cc.*,
  cm.name as crew_member_name,
  cm.position,
  (cc.expiry_date - current_date) as days_until_expiry
from crew_certifications cc
join crew_members cm on cc.crew_member_id = cm.id
where cc.status = 'valid' 
  and cc.expiry_date <= current_date + interval '90 days'
  and cc.expiry_date > current_date
order by cc.expiry_date;

-- View for active drone missions with latest telemetry
create or replace view active_drone_missions_summary as
select 
  dm.*,
  v.name as vessel_name,
  (
    select row_to_json(t.*)
    from (
      select timestamp, position_x, position_y, position_z, depth, heading, battery_level, status_flags
      from drone_telemetry dt
      where dt.mission_id = dm.id
      order by dt.timestamp desc
      limit 1
    ) t
  ) as latest_telemetry
from drone_missions dm
left join vessels v on dm.vessel_id = v.id
where dm.status = 'active';
