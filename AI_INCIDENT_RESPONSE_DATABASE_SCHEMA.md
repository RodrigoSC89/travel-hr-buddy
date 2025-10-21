# AI Incident Response Database Schema

## Overview
This document describes the database schema required for the AI Incident Response & Resilience Integration (Patch 18).

## Required Tables

### 1. incident_reports

Stores AI-detected incidents with compliance scores and recommendations.

```sql
-- Create incident_reports table
create table incident_reports (
  id uuid primary key default uuid_generate_v4(),
  timestamp timestamptz not null default now(),
  type text not null,
  description text,
  level text check (level in ('Conforme', 'Risco', 'Não Conforme')),
  score float check (score >= 0 and score <= 1),
  recommendation text,
  created_at timestamptz default now()
);

-- Add index for timestamp-based queries
create index idx_incident_reports_timestamp on incident_reports(timestamp desc);

-- Add index for level-based filtering
create index idx_incident_reports_level on incident_reports(level);

-- Add index for type-based filtering
create index idx_incident_reports_type on incident_reports(type);
```

### 2. compliance_audit_logs

Stores compliance audit results (should already exist from Patch 17).

```sql
-- Verify compliance_audit_logs table exists
-- If not, create it:
create table if not exists compliance_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  timestamp timestamptz not null default now(),
  score float check (score >= 0 and score <= 1),
  level text check (level in ('Conforme', 'Risco', 'Não Conforme')),
  created_at timestamptz default now()
);

-- Add index for timestamp-based queries
create index if not exists idx_compliance_audit_logs_timestamp 
  on compliance_audit_logs(timestamp desc);
```

## Row Level Security (RLS)

Enable RLS and create policies for both tables:

```sql
-- Enable RLS on incident_reports
alter table incident_reports enable row level security;

-- Policy: Allow authenticated users to read incident reports
create policy "Allow authenticated users to read incident reports"
  on incident_reports
  for select
  to authenticated
  using (true);

-- Policy: Allow service role to insert incident reports
create policy "Allow service role to insert incident reports"
  on incident_reports
  for insert
  to service_role
  with check (true);

-- Policy: Allow authenticated users to insert incident reports (for testing)
create policy "Allow authenticated users to insert incident reports"
  on incident_reports
  for insert
  to authenticated
  with check (true);

-- Enable RLS on compliance_audit_logs
alter table compliance_audit_logs enable row level security;

-- Policy: Allow authenticated users to read audit logs
create policy "Allow authenticated users to read audit logs"
  on compliance_audit_logs
  for select
  to authenticated
  using (true);

-- Policy: Allow service role to insert audit logs
create policy "Allow service role to insert audit logs"
  on compliance_audit_logs
  for insert
  to service_role
  with check (true);

-- Policy: Allow authenticated users to insert audit logs (for testing)
create policy "Allow authenticated users to insert audit logs"
  on compliance_audit_logs
  for insert
  to authenticated
  with check (true);
```

## Realtime Subscriptions

Enable realtime for incident_reports table:

```sql
-- Enable realtime on incident_reports
alter publication supabase_realtime add table incident_reports;
```

## Environment Variables

Required environment variables in `.env`:

```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# MQTT Configuration (Optional - for incident alerting)
VITE_MQTT_URL=wss://broker.emqx.io:8084/mqtt
```

## Testing the Schema

After executing the SQL above, test with:

```sql
-- Insert a test incident
insert into incident_reports (type, description, level, score, recommendation)
values (
  'DP Loss',
  'Dynamic positioning system lost GPS reference',
  'Não Conforme',
  0.45,
  'Executar resposta imediata. Acionar protocolo ISM/ISPS e registrar no Control Hub.'
);

-- Verify the insert
select * from incident_reports order by timestamp desc limit 5;

-- Insert a test audit log
insert into compliance_audit_logs (score, level)
values (0.87, 'Conforme');

-- Verify the insert
select * from compliance_audit_logs order by timestamp desc limit 5;
```

## Migration Script

Complete migration script to run in Supabase SQL Editor:

```sql
-- Complete migration for AI Incident Response & Resilience Integration

-- 1. Create incident_reports table
create table if not exists incident_reports (
  id uuid primary key default uuid_generate_v4(),
  timestamp timestamptz not null default now(),
  type text not null,
  description text,
  level text check (level in ('Conforme', 'Risco', 'Não Conforme')),
  score float check (score >= 0 and score <= 1),
  recommendation text,
  created_at timestamptz default now()
);

-- 2. Create compliance_audit_logs if not exists
create table if not exists compliance_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  timestamp timestamptz not null default now(),
  score float check (score >= 0 and score <= 1),
  level text check (level in ('Conforme', 'Risco', 'Não Conforme')),
  created_at timestamptz default now()
);

-- 3. Add indexes
create index if not exists idx_incident_reports_timestamp on incident_reports(timestamp desc);
create index if not exists idx_incident_reports_level on incident_reports(level);
create index if not exists idx_incident_reports_type on incident_reports(type);
create index if not exists idx_compliance_audit_logs_timestamp on compliance_audit_logs(timestamp desc);

-- 4. Enable RLS
alter table incident_reports enable row level security;
alter table compliance_audit_logs enable row level security;

-- 5. Drop existing policies if they exist
drop policy if exists "Allow authenticated users to read incident reports" on incident_reports;
drop policy if exists "Allow service role to insert incident reports" on incident_reports;
drop policy if exists "Allow authenticated users to insert incident reports" on incident_reports;
drop policy if exists "Allow authenticated users to read audit logs" on compliance_audit_logs;
drop policy if exists "Allow service role to insert audit logs" on compliance_audit_logs;
drop policy if exists "Allow authenticated users to insert audit logs" on compliance_audit_logs;

-- 6. Create RLS policies
create policy "Allow authenticated users to read incident reports"
  on incident_reports for select to authenticated using (true);

create policy "Allow service role to insert incident reports"
  on incident_reports for insert to service_role with check (true);

create policy "Allow authenticated users to insert incident reports"
  on incident_reports for insert to authenticated with check (true);

create policy "Allow authenticated users to read audit logs"
  on compliance_audit_logs for select to authenticated using (true);

create policy "Allow service role to insert audit logs"
  on compliance_audit_logs for insert to service_role with check (true);

create policy "Allow authenticated users to insert audit logs"
  on compliance_audit_logs for insert to authenticated with check (true);

-- 7. Enable realtime
alter publication supabase_realtime add table incident_reports;

-- 8. Verify setup
select 'incident_reports' as table_name, count(*) as row_count from incident_reports
union all
select 'compliance_audit_logs', count(*) from compliance_audit_logs;
```

## Verification

After running the migration:

1. Check tables exist:
```sql
select table_name 
from information_schema.tables 
where table_schema = 'public' 
  and table_name in ('incident_reports', 'compliance_audit_logs');
```

2. Check RLS is enabled:
```sql
select tablename, rowsecurity 
from pg_tables 
where schemaname = 'public' 
  and tablename in ('incident_reports', 'compliance_audit_logs');
```

3. Check indexes:
```sql
select indexname, tablename 
from pg_indexes 
where schemaname = 'public' 
  and tablename in ('incident_reports', 'compliance_audit_logs');
```

## Troubleshooting

### Table already exists error
If you get "table already exists", check if it's from a previous installation:
```sql
select * from incident_reports limit 1;
```

### RLS blocking inserts
If inserts fail, verify policies:
```sql
select * from pg_policies 
where tablename in ('incident_reports', 'compliance_audit_logs');
```

### Realtime not working
Verify publication:
```sql
select * from pg_publication_tables where pubname = 'supabase_realtime';
```
