-- ✅ Supabase: Tabela test_results para histórico de builds/testes

create table if not exists test_results (
  id uuid primary key default gen_random_uuid(),
  commit_hash text not null,
  branch text not null,
  status text not null,
  coverage_percent int,
  triggered_by text,
  created_at timestamp with time zone default now()
);

-- Permitir leitura pública dos registros
alter table test_results enable row level security;

create policy "Public read access" on test_results
  for select using (true);
