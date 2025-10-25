-- PATCH 108.0: Security & Access Control
-- Create access_logs table for security monitoring and access control

create table if not exists access_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  module_accessed text not null,
  timestamp timestamptz default now(),
  action text not null,
  result text check (result in ('success', 'failure', 'denied', 'error')),
  ip_address inet,
  user_agent text,
  details jsonb default '{}'::jsonb,
  severity text default 'info' check (severity in ('info', 'warning', 'critical')),
  created_at timestamptz default now()
);

-- Create indexes for faster queries and analytics
create index if not exists idx_access_logs_user_id on access_logs(user_id);
create index if not exists idx_access_logs_module_accessed on access_logs(module_accessed);
create index if not exists idx_access_logs_timestamp on access_logs(timestamp);
create index if not exists idx_access_logs_result on access_logs(result);
create index if not exists idx_access_logs_severity on access_logs(severity);
create index if not exists idx_access_logs_action on access_logs(action);

-- Enable Row Level Security
alter table access_logs enable row level security;

-- Create policies - Only allow admins to view access logs
create policy "Allow authenticated users to read their own access logs"
  on access_logs for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow service role to read all access logs"
  on access_logs for select
  to service_role
  using (true);

create policy "Allow authenticated users to insert access logs"
  on access_logs for insert
  to authenticated
  with check (true);

-- Create user roles table for permission management
create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null,
  role text not null check (role in ('admin', 'operator', 'viewer', 'auditor')),
  permissions jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes
create index if not exists idx_user_roles_user_id on user_roles(user_id);
create index if not exists idx_user_roles_role on user_roles(role);

-- Enable RLS
alter table user_roles enable row level security;

-- Policies for user_roles
create policy "Allow users to read their own role"
  on user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow admins to manage user roles"
  on user_roles for all
  to authenticated
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
create or replace function update_user_roles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for automatic timestamp update
create trigger user_roles_updated_at
  before update on user_roles
  for each row
  execute function update_user_roles_updated_at();

-- Insert sample access logs
insert into access_logs (
  user_id,
  module_accessed,
  timestamp,
  action,
  result,
  ip_address,
  details,
  severity
)
values
  (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'crew-management',
    now() - interval '1 hour',
    'view_crew_list',
    'success',
    '192.168.1.100',
    '{"crew_count": 15, "filters_applied": ["position", "vessel"]}'::jsonb,
    'info'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'maintenance-engine',
    now() - interval '2 hours',
    'create_maintenance_record',
    'success',
    '192.168.1.101',
    '{"vessel_id": "test-vessel", "component": "Main Engine"}'::jsonb,
    'info'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'fleet-management',
    now() - interval '30 minutes',
    'view_vessel_details',
    'success',
    '192.168.1.102',
    '{"vessel_id": "IMO9234567"}'::jsonb,
    'info'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    'access-control',
    now() - interval '15 minutes',
    'modify_user_permissions',
    'denied',
    '192.168.1.103',
    '{"attempted_role": "admin", "reason": "insufficient_permissions"}'::jsonb,
    'warning'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'crew-management',
    now() - interval '5 minutes',
    'export_crew_report',
    'success',
    '192.168.1.100',
    '{"format": "pdf", "records_exported": 15}'::jsonb,
    'info'
  )
on conflict do nothing;

-- Insert sample user roles
insert into user_roles (user_id, role, permissions)
values
  (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'admin',
    '{
      "crew_management": ["read", "write", "delete"],
      "maintenance_engine": ["read", "write", "delete"],
      "fleet_management": ["read", "write", "delete"],
      "access_control": ["read", "write", "delete"]
    }'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'operator',
    '{
      "crew_management": ["read", "write"],
      "maintenance_engine": ["read", "write"],
      "fleet_management": ["read", "write"]
    }'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'viewer',
    '{
      "crew_management": ["read"],
      "maintenance_engine": ["read"],
      "fleet_management": ["read"]
    }'::jsonb
  )
on conflict (user_id) do nothing;

-- Create view for access analytics
create or replace view access_analytics as
select 
  module_accessed,
  action,
  result,
  count(*) as access_count,
  count(distinct user_id) as unique_users,
  count(*) filter (where result = 'failure' or result = 'denied') as failed_attempts,
  max(timestamp) as last_access,
  min(timestamp) as first_access
from access_logs
where timestamp > now() - interval '30 days'
group by module_accessed, action, result
order by access_count desc;

-- Create function for detecting suspicious access patterns
create or replace function detect_suspicious_access(time_window interval default interval '1 hour')
returns table (
  user_id uuid,
  module_accessed text,
  failed_attempts bigint,
  time_range tstzrange,
  severity text
) as $$
begin
  return query
  select 
    al.user_id,
    al.module_accessed,
    count(*) as failed_attempts,
    tstzrange(min(al.timestamp), max(al.timestamp)) as time_range,
    case 
      when count(*) >= 10 then 'critical'
      when count(*) >= 5 then 'warning'
      else 'info'
    end as severity
  from access_logs al
  where 
    al.timestamp > now() - time_window
    and (al.result = 'failure' or al.result = 'denied')
  group by al.user_id, al.module_accessed
  having count(*) >= 3
  order by failed_attempts desc;
end;
$$ language plpgsql;

-- Create function to log access attempts
create or replace function log_access(
  p_user_id uuid,
  p_module text,
  p_action text,
  p_result text,
  p_details jsonb default '{}'::jsonb
)
returns uuid as $$
declare
  v_log_id uuid;
begin
  insert into access_logs (user_id, module_accessed, action, result, details)
  values (p_user_id, p_module, p_action, p_result, p_details)
  returning id into v_log_id;
  
  return v_log_id;
end;
$$ language plpgsql security definer;
