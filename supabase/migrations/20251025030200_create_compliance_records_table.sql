-- PATCH 113.0: Compliance Checklist & Auto-Auditor
-- Create compliance_records table for regulatory compliance tracking (ISM, ISPS, IMCA)

create table if not exists compliance_records (
  id uuid primary key default gen_random_uuid(),
  checklist_name text not null,
  checklist_type text default 'ISM' check (checklist_type in ('ISM', 'ISPS', 'IMCA', 'NORMAM', 'Custom')),
  filled_by uuid references auth.users(id),
  vessel_id uuid references vessels(id) on delete set null,
  answers jsonb not null default '{}'::jsonb,
  completion_status text default 'in_progress' check (completion_status in ('in_progress', 'completed', 'pending_review', 'approved')),
  analyzed_by_ai boolean default false,
  ai_result text,
  ai_confidence numeric,
  compliance_score numeric,
  risk_level text check (risk_level in ('compliant', 'minor_risk', 'major_risk', 'non_compliant')),
  findings jsonb default '[]'::jsonb,
  recommendations jsonb default '[]'::jsonb,
  inspector_notes text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for faster queries
create index if not exists idx_compliance_records_checklist_type on compliance_records(checklist_type);
create index if not exists idx_compliance_records_completion_status on compliance_records(completion_status);
create index if not exists idx_compliance_records_risk_level on compliance_records(risk_level);
create index if not exists idx_compliance_records_vessel_id on compliance_records(vessel_id);
create index if not exists idx_compliance_records_filled_by on compliance_records(filled_by);
create index if not exists idx_compliance_records_analyzed_by_ai on compliance_records(analyzed_by_ai);

-- Enable Row Level Security
alter table compliance_records enable row level security;

-- Create policies for authenticated users
create policy "Allow authenticated users to read compliance records"
  on compliance_records for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert compliance records"
  on compliance_records for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update compliance records"
  on compliance_records for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete compliance records"
  on compliance_records for delete
  to authenticated
  using (true);

-- Create function to update updated_at timestamp
create or replace function update_compliance_records_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  
  -- Auto-update completion timestamp
  if new.completion_status = 'completed' and old.completion_status != 'completed' then
    new.completed_at = now();
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Create trigger for automatic timestamp update
create trigger compliance_records_updated_at
  before update on compliance_records
  for each row
  execute function update_compliance_records_updated_at();

-- Insert sample compliance checklists
insert into compliance_records (
  checklist_name,
  checklist_type,
  vessel_id,
  answers,
  completion_status,
  analyzed_by_ai,
  ai_result,
  compliance_score,
  risk_level,
  findings
)
select
  'ISM Code Safety Management Audit',
  'ISM',
  v.id,
  '{
    "safety_policy": "compliant",
    "risk_assessment": "compliant",
    "emergency_procedures": "compliant",
    "maintenance_system": "minor_issue",
    "training_records": "compliant",
    "accident_reporting": "compliant",
    "safety_meetings": "minor_issue"
  }'::jsonb,
  'completed',
  true,
  'Sistema de gestão de segurança operacional. 2 itens requerem atenção.',
  85.7,
  'minor_risk',
  '[
    {"item": "Maintenance System", "issue": "Preventive maintenance schedule needs updating", "severity": "minor"},
    {"item": "Safety Meetings", "issue": "Monthly safety meeting minutes incomplete for Q1", "severity": "minor"}
  ]'::jsonb
from vessels v
where v.imo_code = 'IMO9234567'
limit 1
on conflict do nothing;

insert into compliance_records (
  checklist_name,
  checklist_type,
  vessel_id,
  answers,
  completion_status,
  analyzed_by_ai,
  ai_result,
  compliance_score,
  risk_level,
  findings,
  recommendations
)
select
  'ISPS Security Assessment',
  'ISPS',
  v.id,
  '{
    "access_control": "compliant",
    "security_plan": "compliant",
    "security_drills": "compliant",
    "crew_identification": "compliant",
    "restricted_areas": "compliant",
    "surveillance_systems": "compliant"
  }'::jsonb,
  'completed',
  true,
  'Avaliação de segurança portuária conforme ISPS. Sistema 100% conforme.',
  100.0,
  'compliant',
  '[]'::jsonb,
  '[
    {"recommendation": "Continue monitoring access control logs weekly"},
    {"recommendation": "Schedule next security drill within 90 days"}
  ]'::jsonb
from vessels v
where v.imo_code = 'IMO9234567'
limit 1
on conflict do nothing;

insert into compliance_records (
  checklist_name,
  checklist_type,
  vessel_id,
  answers,
  completion_status,
  analyzed_by_ai,
  ai_result,
  compliance_score,
  risk_level,
  findings,
  recommendations
)
select
  'IMCA M117 DP Operations Checklist',
  'IMCA',
  v.id,
  '{
    "dp_system_checks": "compliant",
    "redundancy_tests": "compliant",
    "power_management": "major_issue",
    "position_references": "compliant",
    "alarm_testing": "minor_issue",
    "annual_trials": "compliant",
    "operator_competence": "compliant"
  }'::jsonb,
  'pending_review',
  true,
  'Sistema de posicionamento dinâmico requer atenção. 1 item crítico detectado.',
  71.4,
  'major_risk',
  '[
    {"item": "Power Management", "issue": "UPS battery backup showing reduced capacity (65%)", "severity": "critical"},
    {"item": "Alarm Testing", "issue": "DPO alarm response time above 2 seconds", "severity": "minor"}
  ]'::jsonb,
  '[
    {"recommendation": "Replace UPS batteries immediately - critical for DP operations", "priority": "urgent"},
    {"recommendation": "Calibrate alarm system and verify response times", "priority": "high"},
    {"recommendation": "Schedule full DP FMEA review within 30 days", "priority": "medium"}
  ]'::jsonb
from vessels v
where v.imo_code = 'IMO9234567'
limit 1
on conflict do nothing;

insert into compliance_records (
  checklist_name,
  checklist_type,
  answers,
  completion_status
)
values
  (
    'NORMAM 101 Crew Documentation Review',
    'NORMAM',
    '{
      "crew_licenses": "pending",
      "medical_certificates": "pending",
      "training_certificates": "pending",
      "seaman_book": "pending"
    }'::jsonb,
    'in_progress'
  ),
  (
    'Custom Pre-Departure Safety Checklist',
    'Custom',
    '{
      "life_saving_equipment": "compliant",
      "fire_fighting_equipment": "compliant",
      "navigation_equipment": "compliant",
      "communication_equipment": "minor_issue"
    }'::jsonb,
    'in_progress'
  )
on conflict do nothing;

-- Create view for compliance dashboard
create or replace view compliance_dashboard as
select 
  cr.id,
  cr.checklist_name,
  cr.checklist_type,
  cr.completion_status,
  cr.risk_level,
  cr.compliance_score,
  cr.analyzed_by_ai,
  cr.completed_at,
  cr.created_at,
  v.name as vessel_name,
  v.imo_code,
  case 
    when cr.completion_status = 'completed' then extract(day from now() - cr.completed_at)
    else null
  end as days_since_completion,
  jsonb_array_length(cr.findings) as findings_count,
  jsonb_array_length(cr.recommendations) as recommendations_count
from compliance_records cr
left join vessels v on cr.vessel_id = v.id
order by 
  case cr.risk_level
    when 'non_compliant' then 1
    when 'major_risk' then 2
    when 'minor_risk' then 3
    when 'compliant' then 4
    else 5
  end,
  case cr.completion_status
    when 'pending_review' then 1
    when 'in_progress' then 2
    when 'completed' then 3
    when 'approved' then 4
    else 5
  end,
  cr.created_at desc;

-- Create function to calculate overall compliance rate
create or replace function get_vessel_compliance_rate(p_vessel_id uuid)
returns numeric as $$
declare
  v_compliance_rate numeric;
begin
  select 
    round(
      avg(compliance_score),
      2
    )
  into v_compliance_rate
  from compliance_records
  where vessel_id = p_vessel_id
    and completion_status = 'completed'
    and compliance_score is not null;
  
  return coalesce(v_compliance_rate, 0);
end;
$$ language plpgsql;

-- Create function to get compliance summary
create or replace function get_compliance_summary()
returns table (
  total_checklists bigint,
  completed_checklists bigint,
  pending_review bigint,
  compliant_checklists bigint,
  at_risk_checklists bigint,
  non_compliant_checklists bigint,
  avg_compliance_score numeric
) as $$
begin
  return query
  select
    count(*)::bigint as total_checklists,
    count(case when completion_status = 'completed' then 1 end)::bigint as completed_checklists,
    count(case when completion_status = 'pending_review' then 1 end)::bigint as pending_review,
    count(case when risk_level = 'compliant' then 1 end)::bigint as compliant_checklists,
    count(case when risk_level in ('minor_risk', 'major_risk') then 1 end)::bigint as at_risk_checklists,
    count(case when risk_level = 'non_compliant' then 1 end)::bigint as non_compliant_checklists,
    round(avg(compliance_score), 2) as avg_compliance_score
  from compliance_records
  where completion_status = 'completed';
end;
$$ language plpgsql;
