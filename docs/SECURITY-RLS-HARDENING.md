# Security RLS Hardening - Nautilus One v3.2.0

## Status: ✅ Implementado

Data: 2026-01-04

---

## Resumo das Correções

### 1. Tabela `profiles` - Dados Pessoais Protegidos
**Antes:** Qualquer usuário autenticado da organização podia ver todos os perfis.
**Depois:** Usuários veem apenas próprio perfil. Admin/HR veem todos.

```sql
CREATE POLICY "profiles_secure_select" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id 
  OR public.is_admin_or_hr(auth.uid())
);
```

### 2. Tabela `crew_payroll` - Dados Financeiros Restritos
**Antes:** Políticas permissivas permitiam acesso amplo.
**Depois:** Apenas próprios registros + Finance/HR.

```sql
CREATE POLICY "crew_payroll_secure_select" ON public.crew_payroll
FOR SELECT TO authenticated
USING (
  crew_member_id::text = auth.uid()::text
  OR public.has_finance_access(auth.uid())
);
```

### 3. Tabela `ai_audit_logs` - Logs de IA Restritos
**Antes:** Membros da organização podiam ver logs de IA.
**Depois:** Apenas Admin/HR podem acessar.

```sql
CREATE POLICY "ai_audit_logs_admin_only" ON public.ai_audit_logs
FOR SELECT TO authenticated
USING (public.is_admin_or_hr(auth.uid()));
```

---

## Funções de Segurança (Security Definer)

### `is_admin_or_hr(_user_id uuid)` → boolean
Verifica se usuário tem role `admin`, `hr_manager`, ou `hr_analyst`.

### `has_finance_access(_user_id uuid)` → boolean
Verifica se usuário tem role `admin`, `hr_manager`, `manager`, ou `department_manager`.

### `has_role(_user_id uuid, _role user_role)` → boolean
Verifica se usuário possui um role específico.

---

## Roles Disponíveis (enum `user_role`)

| Role | Descrição |
|------|-----------|
| `admin` | Administrador total |
| `hr_manager` | Gerente de RH |
| `hr_analyst` | Analista de RH |
| `manager` | Gerente |
| `department_manager` | Gerente de Departamento |
| `supervisor` | Supervisor |
| `coordinator` | Coordenador |
| `auditor` | Auditor |
| `employee` | Funcionário padrão |

---

## Tabela `user_roles`

```sql
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  role user_role NOT NULL,
  department text,
  created_at timestamptz,
  updated_at timestamptz,
  UNIQUE (user_id, role)
);
```

**Políticas RLS:**
- Usuários veem próprios roles
- Admins gerenciam todos os roles

---

## Avisos Restantes

### ⚠️ Leaked Password Protection (WARN)
**Ação Requerida:** Habilitar no Supabase Dashboard
1. Acesse: Authentication → Settings
2. Ative "Leaked Password Protection"
3. Link: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/auth/providers

---

## Validação

```sql
-- Verificar políticas ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('profiles', 'crew_payroll', 'ai_audit_logs', 'user_roles')
ORDER BY tablename, policyname;

-- Verificar funções de segurança
SELECT proname, prosecdef, proconfig
FROM pg_proc
WHERE proname IN ('is_admin_or_hr', 'has_finance_access', 'has_role')
AND pronamespace = 'public'::regnamespace;
```

---

## Changelog

| Data | Alteração |
|------|-----------|
| 2026-01-04 | Implementação inicial de RLS hardening |
| 2026-01-04 | Criação de funções `is_admin_or_hr`, `has_finance_access`, `has_role` |
| 2026-01-04 | Atualização de políticas em profiles, crew_payroll, ai_audit_logs |
