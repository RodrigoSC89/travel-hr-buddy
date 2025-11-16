# 🔐 APLICAR CORREÇÕES DE SEGURANÇA

## STATUS
- ✅ Migrations criadas e prontas
- ⏳ **PENDENTE: Aplicar via Supabase Dashboard**

## INSTRUÇÕES RÁPIDAS (5-10 minutos)

### 1️⃣ RLS POLICIES (CRÍTICO - 16 policies)
**Arquivo**: `supabase/migrations/20250107_emergency_rls_fix.sql`

1. Acesse: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/sql/new
2. Copie TODO o conteúdo do arquivo `20250107_emergency_rls_fix.sql`
3. Cole no SQL Editor
4. Clique em **RUN**
5. ✅ Confirme: "Success. No rows returned"

**O que faz**:
- 4 policies para `automated_reports` (SELECT/INSERT/UPDATE/DELETE)
- 4 policies para `automation_executions` 
- 4 policies para `organization_billing` (DADOS CRÍTICOS!)
- 4 policies para `organization_metrics`

### 2️⃣ SQL FUNCTIONS SEARCH_PATH (19 funções)
**Arquivo**: `supabase/migrations/20250107_fix_sql_functions_search_path.sql`

1. Mesmo SQL Editor (https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/sql/new)
2. Copie TODO o conteúdo do arquivo `20250107_fix_sql_functions_search_path.sql`
3. Cole no SQL Editor
4. Clique em **RUN**
5. ✅ Confirme sucesso

**O que faz**:
- Adiciona `SET search_path = public` em 19 funções SQL
- Previne SQL injection via manipulação de search_path

### 3️⃣ LEAKED PASSWORD PROTECTION (30 segundos)
1. Acesse: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/auth/providers
2. Vá em **Authentication** → **Password Security**
3. Ative: **"Enable Leaked Password Protection"**
4. Salve

## VALIDAÇÃO

Após aplicar, rode no SQL Editor:

```sql
-- Verificar RLS policies criadas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('automated_reports', 'automation_executions', 
                    'organization_billing', 'organization_metrics')
ORDER BY tablename, policyname;
-- Deve retornar 16 rows

-- Verificar funções com search_path
SELECT proname, prosecdef, proconfig 
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
  AND proconfig IS NOT NULL
  AND 'search_path=public' = ANY(proconfig);
-- Deve retornar 19 funções
```

## IMPACTO
- ✅ **Segurança**: 22 vulnerabilidades corrigidas
- ✅ **Build**: Sem impacto (apenas database)
- ✅ **Performance**: Melhoria (search_path otimizado)
- ⚠️ **Downtime**: ZERO (aplicação online)

## PRÓXIMOS PASSOS (OPCIONAL)
- FASE 3: Remover @ts-nocheck de 134 arquivos (40-60h)
