-- Supabase SQL: Tabela para módulos do Nautilus One

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  category text,
  icon text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Permitir leitura pública
alter table modules enable row level security;
create policy "Public read" on modules
  for select using (true);

-- Trigger para atualizar updated_at automaticamente
create trigger update_modules_updated_at
  before update on modules
  for each row
  execute function public.update_updated_at_column();
