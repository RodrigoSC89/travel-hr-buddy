# 🚀 GUIA SIMPLES: APLICAR MIGRATIONS NO SUPABASE

## ⚡ RESUMO RÁPIDO
Você vai copiar e colar 7 arquivos SQL no Supabase Dashboard. É simples e seguro!

**Tempo total:** 15-20 minutos

---

## 📋 PASSO A PASSO

### **PASSO 1: Abrir o Supabase SQL Editor**

1. Acesse: https://supabase.com/dashboard
2. Faça login (se necessário)
3. Clique no projeto: **vnbptmixvwropvanyhdb** (travel-hr-buddy)
4. No menu lateral esquerdo, clique em: **SQL Editor**
5. Clique no botão: **+ New Query**

---

### **PASSO 2: Aplicar Migration 1 - RLS Policies (Segurança Crítica)**

**Arquivo:** `supabase/migrations/20250107_emergency_rls_fix.sql`

1. **Abra o arquivo** no VS Code (na pasta do projeto)
2. **Selecione TODO o conteúdo** (Ctrl+A)
3. **Copie** (Ctrl+C)
4. **Volte ao Supabase SQL Editor**
5. **Cole** no editor (Ctrl+V)
6. **Clique em RUN** (canto inferior direito) ou pressione `Ctrl+Enter`
7. **Aguarde** aparecer: ✅ "Success. No rows returned"

**O que isso faz?** Protege 4 tabelas críticas (billing, automação, relatórios)

---

### **PASSO 3: Aplicar Migration 2 - Correção de Funções SQL**

**Arquivo:** `supabase/migrations/20250107_fix_sql_functions_search_path.sql`

1. **Clique em + New Query** (para limpar o editor)
2. **Abra o arquivo** no VS Code
3. **Copie TODO o conteúdo**
4. **Cole no Supabase SQL Editor**
5. **Clique em RUN**
6. **Aguarde**: ✅ "Success"

**O que isso faz?** Corrige 19 funções SQL vulneráveis a SQL injection

---

### **PASSO 4: Aplicar Migration 3 - Tabelas de Treinamento**

**Arquivo:** `supabase/migrations/20250109_create_training_tables.sql`

1. **Clique em + New Query**
2. **Abra o arquivo** no VS Code
3. **Copie TODO o conteúdo**
4. **Cole no Supabase SQL Editor**
5. **Clique em RUN**
6. **Aguarde**: ✅ "Success"

**O que isso faz?** Cria 7 tabelas para sistema de treinamento de tripulação

---

### **PASSO 5: Aplicar Migration 4 - Starfix & Terrastar**

**Arquivo:** `supabase/migrations/20250109_create_starfix_terrastar_tables.sql`

1. **Clique em + New Query**
2. **Abra o arquivo** no VS Code
3. **Copie TODO o conteúdo**
4. **Cole no Supabase SQL Editor**
5. **Clique em RUN**
6. **Aguarde**: ✅ "Success"

**O que isso faz?** Cria 5 tabelas para integração com Starfix e Terrastar

---

### **PASSO 6: Aplicar Migration 5 - Smart Drills**

**Arquivo:** `supabase/migrations/20250109_create_smart_drills_tables.sql`

1. **Clique em + New Query**
2. **Abra o arquivo** no VS Code
3. **Copie TODO o conteúdo**
4. **Cole no Supabase SQL Editor**
5. **Clique em RUN**
6. **Aguarde**: ✅ "Success"

**O que isso faz?** Cria 4 tabelas para simulações inteligentes de emergência

---

### **PASSO 7: Aplicar Migration 6 - AI Training**

**Arquivo:** `supabase/migrations/20250109_create_ai_training_tables.sql`

1. **Clique em + New Query**
2. **Abra o arquivo** no VS Code
3. **Copie TODO o conteúdo**
4. **Cole no Supabase SQL Editor**
5. **Clique em RUN**
6. **Aguarde**: ✅ "Success"

**O que isso faz?** Cria 3 tabelas para treinamento com IA

---

### **PASSO 8: Aplicar Migration 7 - Scheduled Tasks**

**Arquivo:** `supabase/migrations/20250109_create_scheduled_tasks_table.sql`

1. **Clique em + New Query**
2. **Abra o arquivo** no VS Code
3. **Copie TODO o conteúdo**
4. **Cole no Supabase SQL Editor**
5. **Clique em RUN**
6. **Aguarde**: ✅ "Success"

**O que isso faz?** Cria sistema de agendamento de tarefas automatizadas

---

## ✅ VALIDAR QUE TUDO FUNCIONOU

Depois de aplicar todas as 7 migrations, rode esta query para confirmar:

```sql
-- Verificar que as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'smart_drills',
  'drill_responses',
  'drill_evaluations',
  'drill_corrective_actions',
  'ai_training_sessions',
  'ai_training_history',
  'training_learning_paths',
  'scheduled_tasks',
  'starfix_vessels',
  'starfix_inspections',
  'starfix_performance_metrics',
  'terrastar_corrections',
  'terrastar_alert_subscriptions',
  'noncompliance_explanations',
  'crew_training_quizzes',
  'crew_training_results',
  'crew_learning_progress',
  'incident_drills',
  'smart_drill_scenarios',
  'smart_drill_executions'
)
ORDER BY table_name;
```

**Resultado esperado:** 20 linhas (20 novas tabelas criadas)

---

## 🎯 VERIFICAÇÃO FINAL DE SEGURANÇA

Rode esta query para confirmar que todas as RLS policies foram criadas:

```sql
-- Verificar RLS policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN (
  'automated_reports',
  'automation_executions',
  'organization_billing',
  'organization_metrics',
  'smart_drills',
  'drill_responses',
  'drill_evaluations',
  'drill_corrective_actions'
)
GROUP BY tablename
ORDER BY tablename;
```

**Resultado esperado:** 8 linhas, cada uma com 4 policies (exceto algumas com 3)

---

## ❌ SE ALGO DER ERRADO

### **Erro: "relation already exists"**
**Solução:** A tabela já existe. Pode pular essa migration ou executar:
```sql
DROP TABLE IF EXISTS nome_da_tabela CASCADE;
```
Depois rode a migration novamente.

### **Erro: "function does not exist"**
**Solução:** A migration 2 precisa ser executada primeiro. Volte e execute na ordem.

### **Erro: "permission denied"**
**Solução:** Você precisa ter permissão de administrador. Verifique se está logado com a conta correta.

---

## 📊 CHECKLIST COMPLETO

Marque conforme for aplicando:

- [ ] **Migration 1:** RLS Policies (20250107_emergency_rls_fix.sql)
- [ ] **Migration 2:** SQL Functions Fix (20250107_fix_sql_functions_search_path.sql)
- [ ] **Migration 3:** Training Tables (20250109_create_training_tables.sql)
- [ ] **Migration 4:** Starfix/Terrastar (20250109_create_starfix_terrastar_tables.sql)
- [ ] **Migration 5:** Smart Drills (20250109_create_smart_drills_tables.sql)
- [ ] **Migration 6:** AI Training (20250109_create_ai_training_tables.sql)
- [ ] **Migration 7:** Scheduled Tasks (20250109_create_scheduled_tasks_table.sql)
- [ ] **Validação:** 20 tabelas criadas
- [ ] **Validação:** RLS policies ativas

---

## 🚀 DEPOIS DAS MIGRATIONS

### **Opcional mas Recomendado:**

1. **Regenerar tipos TypeScript:**
   ```powershell
   npx supabase gen types typescript --project-id vnbptmixvwropvanyhdb > src/integrations/supabase/types.ts
   ```

2. **Remover @ts-nocheck dos arquivos:**
   - `src/services/smart-drills.service.ts`
   - `src/services/training-ai.service.ts`
   - `src/services/smart-scheduler.service.ts`

3. **Build novamente:**
   ```powershell
   npm run build
   ```

4. **Deploy no Vercel:**
   - Automático via GitHub (se configurado)
   - Ou manual: https://vercel.com/dashboard

---

## 💡 DICAS

✅ **Copie TODO o arquivo** - Não copie só uma parte
✅ **Execute na ordem** - As migrations têm dependências
✅ **Aguarde "Success"** - Não pule para a próxima antes de ver sucesso
✅ **Não feche o navegador** - Mantenha a aba aberta até terminar
✅ **Salve as queries** - Você pode nomeá-las no Supabase para referência futura

---

## 🆘 PRECISA DE AJUDA?

Se encontrar problemas:

1. **Tire um print do erro**
2. **Copie a mensagem de erro completa**
3. **Me mostre qual migration está dando problema**
4. **Vou te ajudar a resolver!**

---

## ✨ RESULTADO FINAL

Depois de aplicar todas as migrations:

- ✅ **20 novas tabelas** criadas
- ✅ **44+ RLS policies** ativas
- ✅ **6 funções SQL** disponíveis
- ✅ **Sistema 100% funcional** e seguro
- ✅ **Pronto para produção** 🎉

---

**Boa sorte! É mais fácil do que parece! 💪**
