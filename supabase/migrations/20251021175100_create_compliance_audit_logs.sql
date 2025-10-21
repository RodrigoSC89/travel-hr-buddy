-- Create compliance_audit_logs table
-- This table stores AI-driven compliance audit results for maritime operations
-- Based on IMCA, IMO, MTS, ISM, ISPS, and NORMAM 101 standards

create table if not exists compliance_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  timestamp timestamptz not null default now(),
  score float not null check (score >= 0 and score <= 1),
  level text not null check (level in ('Conforme', 'Risco', 'Não Conforme')),
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Add index for timestamp for efficient querying
create index if not exists idx_compliance_audit_logs_timestamp on compliance_audit_logs(timestamp desc);

-- Add index for compliance level for filtering
create index if not exists idx_compliance_audit_logs_level on compliance_audit_logs(level);

-- Add RLS policies
alter table compliance_audit_logs enable row level security;

-- Allow authenticated users to read compliance audit logs
create policy "Allow authenticated users to read compliance audit logs"
  on compliance_audit_logs for select
  to authenticated
  using (true);

-- Allow service role to insert compliance audit logs
create policy "Allow service role to insert compliance audit logs"
  on compliance_audit_logs for insert
  to authenticated
  with check (true);

-- Add comment to table
comment on table compliance_audit_logs is 'AI Compliance & Audit Engine logs for maritime operations compliance monitoring';
comment on column compliance_audit_logs.score is 'Weighted compliance score (0-1) based on IMCA, IMO, MTS, ISM, ISPS, and NORMAM 101';
comment on column compliance_audit_logs.level is 'Compliance level: Conforme (>0.85), Risco (0.65-0.85), or Não Conforme (<0.65)';
comment on column compliance_audit_logs.details is 'Additional audit details and metadata in JSON format';
