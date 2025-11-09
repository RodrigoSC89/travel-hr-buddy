# 🔴 CORREÇÃO EMERGENCIAL DE SEGURANÇA - INSTRUÇÕES

## ✅ ETAPA 1/5 COMPLETA: RLS Policies Criadas

### Arquivo criado:
- `supabase/migrations/20250107_emergency_rls_fix.sql`

### O que foi protegido:
1. ✅ **automated_reports** - 4 policies (SELECT, INSERT, UPDATE, DELETE)
2. ✅ **automation_executions** - 4 policies (SELECT, INSERT, UPDATE, DELETE)
3. ✅ **organization_billing** - 4 policies (CRÍTICO - dados financeiros)
4. ✅ **organization_metrics** - 4 policies (métricas organizacionais)

**Total: 16 políticas de segurança criadas**

---

## 🚀 COMO APLICAR AS CORREÇÕES

### Opção 1: Via Supabase Dashboard (RECOMENDADO)
1. Acesse: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/sql/new
2. Copie o conteúdo do arquivo: `supabase/migrations/20250107_emergency_rls_fix.sql`
3. Cole no SQL Editor
4. Clique em "Run"
5. Verifique se aparece: "✅ SUCCESS: All 4 critical tables now have RLS policies"

### Opção 2: Via Supabase CLI (se tiver instalado)
```bash
# No terminal do projeto
supabase db push

# Ou aplicar migration específica
supabase migration up
```

### Opção 3: Via Node.js Script (se npm/node estiver instalado)
```bash
npm install
npx supabase db push
```

---

## ✅ VALIDAÇÃO

Após aplicar, execute este SQL para validar:

```sql
-- Verificar que as 4 tabelas têm policies
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN (
    'automated_reports',
    'automation_executions',
    'organization_billing',
    'organization_metrics'
)
GROUP BY tablename;
```

**Resultado esperado:**
```
tablename                | policy_count
-------------------------|-------------
automated_reports        | 4
automation_executions    | 4
organization_billing     | 4
organization_metrics     | 4
```

---

## 📊 PRÓXIMAS ETAPAS

- [x] **ETAPA 1**: RLS Policies para 4 tabelas ✅ COMPLETO
- [ ] **ETAPA 2**: Configurar 6 Edge Functions
- [ ] **ETAPA 3**: Corrigir 19 Funções SQL
- [ ] **ETAPA 4**: Scripts de validação
- [ ] **ETAPA 5**: Organizar deploy completo

---

## ⚠️ IMPORTANTE

**organization_billing** é CRÍTICO! Contém dados financeiros. A policy garante que:
- ❌ Usuários comuns NÃO podem ver billing de outras organizações
- ✅ Apenas admins da própria organização podem ver seus dados
- ✅ Apenas super_admins podem modificar
- ✅ IMPOSSÍVEL deletar registros (auditoria)

---

## 🆘 PRECISA DE AJUDA?

Se não conseguir aplicar via Dashboard ou CLI, posso:
1. Criar um script alternativo
2. Dividir em queries menores
3. Fornecer instruções passo-a-passo detalhadas

**Próximo passo:** Após confirmar aplicação, vou para ETAPA 2 (Edge Functions)
