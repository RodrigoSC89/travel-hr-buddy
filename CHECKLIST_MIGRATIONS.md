# ✅ CHECKLIST: APLICAR MIGRATIONS NO SUPABASE

## 🎯 PREPARAÇÃO

- [ ] Abri o VS Code com o projeto
- [ ] Abri o Supabase Dashboard: https://supabase.com/dashboard
- [ ] Fiz login no Supabase
- [ ] Selecionei o projeto: **vnbptmixvwropvanyhdb**
- [ ] Cliquei em **SQL Editor** no menu lateral

---

## 📝 MIGRATION 1: RLS POLICIES (Segurança Crítica)

**Arquivo:** `supabase/migrations/20250107_emergency_rls_fix.sql`

- [ ] Abri o arquivo no VS Code
- [ ] Selecionei tudo (Ctrl+A)
- [ ] Copiei (Ctrl+C)
- [ ] Cliquei em **+ New Query** no Supabase
- [ ] Colei (Ctrl+V)
- [ ] Cliquei em **RUN**
- [ ] Vi ✅ "Success"

**Notas:** _______________________________________________

---

## 📝 MIGRATION 2: SQL FUNCTIONS FIX

**Arquivo:** `supabase/migrations/20250107_fix_sql_functions_search_path.sql`

- [ ] Abri o arquivo no VS Code
- [ ] Selecionei tudo (Ctrl+A)
- [ ] Copiei (Ctrl+C)
- [ ] Cliquei em **+ New Query** no Supabase
- [ ] Colei (Ctrl+V)
- [ ] Cliquei em **RUN**
- [ ] Vi ✅ "Success"

**Notas:** _______________________________________________

---

## 📝 MIGRATION 3: TRAINING TABLES

**Arquivo:** `supabase/migrations/20250109_create_training_tables.sql`

- [ ] Abri o arquivo no VS Code
- [ ] Selecionei tudo (Ctrl+A)
- [ ] Copiei (Ctrl+C)
- [ ] Cliquei em **+ New Query** no Supabase
- [ ] Colei (Ctrl+V)
- [ ] Cliquei em **RUN**
- [ ] Vi ✅ "Success"

**Notas:** _______________________________________________

---

## 📝 MIGRATION 4: STARFIX & TERRASTAR

**Arquivo:** `supabase/migrations/20250109_create_starfix_terrastar_tables.sql`

- [ ] Abri o arquivo no VS Code
- [ ] Selecionei tudo (Ctrl+A)
- [ ] Copiei (Ctrl+C)
- [ ] Cliquei em **+ New Query** no Supabase
- [ ] Colei (Ctrl+V)
- [ ] Cliquei em **RUN**
- [ ] Vi ✅ "Success"

**Notas:** _______________________________________________

---

## 📝 MIGRATION 5: SMART DRILLS

**Arquivo:** `supabase/migrations/20250109_create_smart_drills_tables.sql`

- [ ] Abri o arquivo no VS Code
- [ ] Selecionei tudo (Ctrl+A)
- [ ] Copiei (Ctrl+C)
- [ ] Cliquei em **+ New Query** no Supabase
- [ ] Colei (Ctrl+V)
- [ ] Cliquei em **RUN**
- [ ] Vi ✅ "Success"

**Notas:** _______________________________________________

---

## 📝 MIGRATION 6: AI TRAINING

**Arquivo:** `supabase/migrations/20250109_create_ai_training_tables.sql`

- [ ] Abri o arquivo no VS Code
- [ ] Selecionei tudo (Ctrl+A)
- [ ] Copiei (Ctrl+C)
- [ ] Cliquei em **+ New Query** no Supabase
- [ ] Colei (Ctrl+V)
- [ ] Cliquei em **RUN**
- [ ] Vi ✅ "Success"

**Notas:** _______________________________________________

---

## 📝 MIGRATION 7: SCHEDULED TASKS

**Arquivo:** `supabase/migrations/20250109_create_scheduled_tasks_table.sql`

- [ ] Abri o arquivo no VS Code
- [ ] Selecionei tudo (Ctrl+A)
- [ ] Copiei (Ctrl+C)
- [ ] Cliquei em **+ New Query** no Supabase
- [ ] Colei (Ctrl+V)
- [ ] Cliquei em **RUN**
- [ ] Vi ✅ "Success"

**Notas:** _______________________________________________

---

## ✅ VALIDAÇÃO

### **Verificar Tabelas Criadas**

Cole esta query no SQL Editor e execute:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'smart_drills', 'drill_responses', 'drill_evaluations', 'drill_corrective_actions',
  'ai_training_sessions', 'ai_training_history', 'training_learning_paths',
  'scheduled_tasks', 'starfix_vessels', 'starfix_inspections',
  'starfix_performance_metrics', 'terrastar_corrections', 'terrastar_alert_subscriptions',
  'noncompliance_explanations', 'crew_training_quizzes', 'crew_training_results',
  'crew_learning_progress', 'incident_drills', 'smart_drill_scenarios', 'smart_drill_executions'
)
ORDER BY table_name;
```

- [ ] Executei a query de validação
- [ ] Vi 20 linhas retornadas
- [ ] Todas as tabelas estão listadas

**Resultado:** ___ tabelas criadas (esperado: 20)

### **Verificar RLS Policies**

Cole esta query no SQL Editor e execute:

```sql
SELECT tablename, COUNT(*) as policies
FROM pg_policies 
WHERE tablename IN (
  'automated_reports', 'automation_executions', 'organization_billing', 'organization_metrics',
  'smart_drills', 'drill_responses', 'drill_evaluations', 'drill_corrective_actions',
  'ai_training_sessions', 'ai_training_history', 'training_learning_paths', 'scheduled_tasks'
)
GROUP BY tablename
ORDER BY tablename;
```

- [ ] Executei a query de validação de RLS
- [ ] Vi pelo menos 8-12 linhas
- [ ] Cada tabela tem 3-4 policies

**Resultado:** OK / Problemas: _______________

---

## 🎉 CONCLUSÃO

- [ ] Todas as 7 migrations foram aplicadas
- [ ] Validação de tabelas passou
- [ ] Validação de RLS passou
- [ ] Não há erros pendentes

**Data de conclusão:** ___/___/2025  
**Tempo total:** ___ minutos

---

## 📌 PRÓXIMOS PASSOS

Depois de marcar todos os itens acima:

- [ ] Regenerar tipos TypeScript (opcional):
  ```powershell
  npx supabase gen types typescript --project-id vnbptmixvwropvanyhdb > src/integrations/supabase/types.ts
  ```

- [ ] Deploy no Vercel:
  - [ ] Acessar: https://vercel.com/dashboard
  - [ ] Verificar se deployment automático iniciou
  - [ ] OU fazer deploy manual

- [ ] Testar sistema em produção:
  - [ ] Fazer login
  - [ ] Criar teste rápido
  - [ ] Verificar que tudo funciona

---

## 🆘 EM CASO DE PROBLEMAS

**Se alguma migration falhar:**

1. **Anotar a mensagem de erro completa**
2. **Anotar qual migration deu erro**
3. **NÃO continuar** para as próximas
4. **Me avisar** para te ajudar

**Erros comuns:**
- "already exists" → Tabela já foi criada (pode pular)
- "does not exist" → Executou fora de ordem (voltar e fazer na ordem)
- "permission denied" → Problema de permissão (verificar login)

---

## 📞 CONTATO/AJUDA

Se precisar de ajuda, me manda:
- Screenshot do erro
- Qual migration estava executando
- Mensagem de erro completa

**Boa sorte! Você consegue! 💪**

---

_Documento criado em: 09/01/2025_  
_Projeto: Nautilus One - Travel HR Buddy_  
_Versão: 1.0_
