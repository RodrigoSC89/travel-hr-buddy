# 🗂️ TODAS AS MIGRATIONS SQL - COPIE NA ORDEM

Execute estas migrations no Supabase SQL Editor **NESTA ORDEM**:

---

## ✅ MIGRATION 0: organization_members (JÁ FORNECIDA ACIMA)

Copie do início desta conversa ou do arquivo:
`supabase/migrations/20250106_verify_organization_members.sql`

---

## ✅ MIGRATION 1: SQL Functions

**Arquivo:** `supabase/migrations/20250107_fix_sql_functions_search_path.sql`

**Ação:** Abra este arquivo no VS Code, selecione tudo (Ctrl+A), copie (Ctrl+C), cole no Supabase

---

## ✅ MIGRATION 2: Training Tables

**Arquivo:** `supabase/migrations/20250109_create_training_tables.sql`

**Ação:** Abra este arquivo no VS Code, selecione tudo (Ctrl+A), copie (Ctrl+C), cole no Supabase

---

## ✅ MIGRATION 3: Starfix & Terrastar

**Arquivo:** `supabase/migrations/20250109_create_starfix_terrastar_tables.sql`

**Ação:** Abra este arquivo no VS Code, selecione tudo (Ctrl+A), copie (Ctrl+C), cole no Supabase

---

## ✅ MIGRATION 4: Smart Drills

**Arquivo:** `supabase/migrations/20250109_create_smart_drills_tables.sql`

**Ação:** Abra este arquivo no VS Code, selecione tudo (Ctrl+A), copie (Ctrl+C), cole no Supabase

---

## ✅ MIGRATION 5: AI Training

**Arquivo:** `supabase/migrations/20250109_create_ai_training_tables.sql`

**Ação:** Abra este arquivo no VS Code, selecione tudo (Ctrl+C), cole no Supabase

---

## ✅ MIGRATION 6: Scheduled Tasks

**Arquivo:** `supabase/migrations/20250109_create_scheduled_tasks_table.sql`

**Ação:** Abra este arquivo no VS Code, selecione tudo (Ctrl+A), copie (Ctrl+C), cole no Supabase

---

## 📋 CHECKLIST DE EXECUÇÃO

Execute nesta ordem e marque ao concluir:

- [ ] Migration 0: organization_members ← **COMECE AQUI**
- [ ] Migration 1: SQL Functions
- [ ] Migration 2: Training Tables
- [ ] Migration 3: Starfix & Terrastar
- [ ] Migration 4: Smart Drills
- [ ] Migration 5: AI Training
- [ ] Migration 6: Scheduled Tasks

---

## ⚠️ SE TIVER ERROS

**Erro comum:** "relation already exists"
- **Solução:** A migration é idempotente, pode pular ou re-executar

**Erro comum:** "function does not exist"
- **Solução:** Normal, algumas funções são opcionais

**Erro comum:** "type does not exist"
- **Solução:** Normal, funções opcionais são puladas automaticamente

---

## ✅ APÓS CONCLUIR TODAS AS MIGRATIONS

Execute no terminal do VS Code:

```powershell
npm run build
```

Se build passar SEM ERROS, remova os `@ts-nocheck` dos arquivos:
- `src/services/smart-drills.service.ts` (linha 2)
- `src/services/training-ai.service.ts` (linha 1)  
- `src/services/smart-scheduler.service.ts` (linha 1)

---

## 🚀 DEPLOY FINAL

Após build limpo:

```powershell
git add .
git commit -m "chore: remover @ts-nocheck após migrations aplicadas"
git push origin main
```

Depois faça deploy no Vercel!

---

**📁 LOCALIZAÇÃO DOS ARQUIVOS:**

Todos os arquivos SQL estão em:
`c:\Users\Rodrigo e Lais\Downloads\travel-hr-buddy\supabase\migrations\`

Abra cada um no VS Code, copie TODO o conteúdo, cole no Supabase SQL Editor e clique RUN.

---

**🎯 ORDEM CORRETA:**

1. `20250106_verify_organization_members.sql` ← **PRIMEIRO**
2. `20250107_fix_sql_functions_search_path.sql`
3. `20250109_create_training_tables.sql`
4. `20250109_create_starfix_terrastar_tables.sql`
5. `20250109_create_smart_drills_tables.sql`
6. `20250109_create_ai_training_tables.sql`
7. `20250109_create_scheduled_tasks_table.sql` ← **ÚLTIMO**

**BOA SORTE! 🚀**
