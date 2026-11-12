# MB Maritime · Operations Control Tower

Sistema web para administrar contratos, entregáveis, tarefas, agenda e oportunidades
comerciais da MB Maritime. Substitui a planilha `MB_Maritime_Control_Tower_Gestao_Integrada_v2.xlsx`
sem reproduzir as 21 abas: são **6 telas**.

| Tela | O que reúne da planilha |
|---|---|
| **Dashboard** | 00_INICIO, 01_PAINEL: indicadores, "minha fila", carga da equipe, contratos, agenda de 30 dias |
| **Contratos** | 02_CONTRATOS, 18_DOCUMENTOS (instrumentos anexados ao contrato) |
| **Entregáveis** | 04_ENTREGAVEIS, 17_ACEITES (lotes com double check e aceite externo) |
| **Tarefas** | 03_TAREFAS, 16_KANBAN, 20_PLANO_12S (Kanban arrastável + lista) |
| **Agenda** | 14_AGENDA, 15_CALENDARIO, 09_REUNIOES (campo de ata/resultado) |
| **Comercial** | 07_COMERCIAL (pipeline com gate de capacidade) |

Endereço: **`/control-tower`** (atalho `/ct`). O layout é próprio, separado do restante do app.

## Regras aplicadas no banco (não apenas na tela)

- **Double check obrigatório.** Só o executor envia uma tarefa para double check, e só com evidência
  (texto ou arquivo). Só o revisor designado aprova, e precisa ser uma pessoa diferente de quem enviou.
  Quem executou, quem revisou e as datas são preenchidos pelo banco e não podem ser editados à mão.
- **O aceite externo não é substituído pela revisão interna.** Uma tarefa não é concluída com o
  aceite do cliente em "A confirmar", "Pendente" ou "Recusado".
- **A quantidade de um entregável só conta lotes aprovados** (e aceitos pelo cliente, quando exigido).
- **Contato não é contrato.** Uma oportunidade não passa para "Proposta enviada", "Negociação" ou
  "Ganha" sem a capacidade checada.
- **A agenda só aceita "Confirmado" com data e hora.**
- **Trilha de auditoria.** Todas as mudanças de status ficam no histórico da tarefa. Tarefas em
  double check ou concluídas e lotes aprovados não podem ser excluídos.
- **Acesso.** Só membros do Control Tower veem os dados (RLS). As evidências ficam no bucket privado
  `ct-evidences` e abrem por link temporário.

## Implantação

1. Aplique as migrações no Supabase do projeto (pelo Lovable, pela CLI `supabase db push` ou colando
   no SQL Editor, nesta ordem):
   - `supabase/migrations/20261112120000_mb_control_tower_schema.sql`
   - `supabase/migrations/20261112120100_mb_control_tower_seed.sql` (carga inicial da planilha:
     3 contratos, 18 entregáveis, 21 tarefas, 4 compromissos, 12 oportunidades)
2. *(Recomendado)* Reserve cada perfil para o e-mail certo antes do primeiro acesso:
   ```sql
   update public.ct_members set email = '<email-do-rodrigo>' where short_name = 'Rodrigo';
   update public.ct_members set email = '<email-do-marcelo>' where short_name = 'Marcelo';
   ```
   Sem isso, o primeiro usuário logado que escolher um perfil livre fica com ele.
3. Rodrigo e Marcelo entram em `/control-tower` com o login do app e escolhem o próprio perfil
   ("Primeiro acesso"). Cada perfil só pode ser vinculado a um login.

## Exportação e contingência

- **Excel completo:** uma aba por módulo (Contratos, Entregáveis, Aceites, Tarefas, Agenda, Comercial),
  incluindo os campos de double check.
- **Relatório PDF de situação:** indicadores e tabelas resumidas.
- **Agenda .ics:** importa no Google Calendar, Outlook / Microsoft 365 ou Apple Calendar.

## Roteiro

- **Etapa 1, entregue:** login, contratos, entregáveis com lotes de aceite, tarefas com divisão de
  responsabilidades, Kanban, aprovação cruzada, evidências, histórico, agenda interna, comercial e exportações.
- **Etapa 2:** lembretes por e-mail/push de prazos e revisões pendentes (Edge Function + cron),
  registro de horas (12_LOG_HORAS), capacidade semanal (05_CAPACIDADE), sincronização com Google
  Calendar / Microsoft 365, mudanças de escopo (19_MUDANCAS) e riscos (08_RISCOS).
- **Etapa 3:** financeiro (06_FINANCEIRO: BM, NF, recebimentos), produtividade, previsão de
  capacidade e indicadores de crescimento.

## Código

`src/modules/control-tower/`: `ControlTowerApp.tsx` (layout, rotas, primeiro acesso), `api.ts`
(React Query + Supabase), `pages/*`, `components/*` (fluxo de double check em `TaskWorkflow.tsx`),
`lib/export.ts` (Excel/PDF) e `lib/ics.ts`.
