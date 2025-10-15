-- File: supabase/schema/workflow_ai_extension.sql
-- Extensão do módulo de Workflows com inteligência adaptativa

-- Create workflow_ai_suggestions table to store AI-generated suggestions
create table if not exists workflow_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references smart_workflows(id) on delete cascade,
  etapa text,
  tipo_sugestao text,
  conteudo text,
  gerada_em timestamp with time zone default now(),
  gerada_por text default 'IA',
  criticidade text,
  responsavel_sugerido text,
  origem text -- exemplo: 'MMI', 'Logs', 'Checklists', etc.
);

-- Create index for better query performance
create index if not exists idx_workflow_ai_suggestions_workflow_id 
  on workflow_ai_suggestions(workflow_id);
create index if not exists idx_workflow_ai_suggestions_gerada_em 
  on workflow_ai_suggestions(gerada_em desc);
create index if not exists idx_workflow_ai_suggestions_tipo 
  on workflow_ai_suggestions(tipo_sugestao);

-- Enable Row Level Security
alter table workflow_ai_suggestions enable row level security;

-- RLS Policies: authenticated users can view all suggestions
create policy "Users can view workflow_ai_suggestions"
  on workflow_ai_suggestions
  for select
  to authenticated
  using (true);

-- RLS Policy: authenticated users can insert suggestions
create policy "Users can create workflow_ai_suggestions"
  on workflow_ai_suggestions
  for insert
  to authenticated
  with check (true);

-- RLS Policy: authenticated users can update suggestions
create policy "Users can update workflow_ai_suggestions"
  on workflow_ai_suggestions
  for update
  to authenticated
  using (true);

-- RLS Policy: authenticated users can delete suggestions
create policy "Users can delete workflow_ai_suggestions"
  on workflow_ai_suggestions
  for delete
  to authenticated
  using (true);

-- Exemplo de sugestões geradas:
-- tipo_sugestao: 'Criar tarefa', 'Ajustar prazo', 'Trocar responsável'
-- origem: 'Checklists', 'Audit Logs', 'Relatório MMI', 'Manual'

-- Create view to show recent AI suggestions (last 30 days)
create or replace view workflow_ai_recent as
select * from workflow_ai_suggestions
where gerada_em > now() - interval '30 days';

-- Grant access to the view
grant select on workflow_ai_recent to authenticated;

-- Prompt IA para sugerir tarefas ou ajustes no Workflow
-- Exemplo de entrada para o Copilot IA:
--
-- Workflow: "Revisão mensal de DP"
-- Logs: "Checklist incompleto - zona de 500m"
-- Falhas recentes: "Gerador STBD apresentou falha semelhante em 3 navios"
-- Prazo vencido: "Etapa 'Verificação de sensores' 2 dias em atraso"
--
-- IA deve responder:
-- - Nova tarefa sugerida: "Verificar ASOG conforme item 3.2.1"
-- - Ajustar prazo da etapa X para mais 2 dias
-- - Responsável sugerido: "Oficial de Máquinas BB"
--
-- A resposta da IA será armazenada como sugestão no banco e apresentada no Kanban
--
-- Exemplo de inserção:
-- INSERT INTO workflow_ai_suggestions (
--   workflow_id,
--   etapa,
--   tipo_sugestao,
--   conteudo,
--   criticidade,
--   responsavel_sugerido,
--   origem
-- ) VALUES (
--   'workflow-uuid-aqui',
--   'Verificação de sensores',
--   'Criar tarefa',
--   'Verificar ASOG conforme item 3.2.1 devido a falhas similares em outros navios',
--   'alta',
--   'Oficial de Máquinas BB',
--   'Relatório MMI'
-- );
