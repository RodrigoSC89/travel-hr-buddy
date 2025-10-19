-- Add technician comment and executed_at fields to mmi_os table
-- These fields allow technicians to record actual execution date and operational comments

alter table mmi_os
add column if not exists executed_at timestamp with time zone,
add column if not exists technician_comment text;

-- Add index for faster filtering by executed_at
create index if not exists idx_mmi_os_executed_at on mmi_os(executed_at desc);

-- Add comment to document the new fields
comment on column mmi_os.executed_at is 'Data real de execução da ordem de serviço';
comment on column mmi_os.technician_comment is 'Comentário técnico ou operacional do técnico';
