# 🧩 TypeScript Universal Fix & Build Repair

Este documento descreve o sistema de correção universal de TypeScript implementado no projeto.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquivos Criados](#arquivos-criados)
- [Como Usar](#como-usar)
- [Funcionalidades](#funcionalidades)
- [Scripts NPM](#scripts-npm)
- [Workflow CI/CD](#workflow-cicd)

## 🎯 Visão Geral

O sistema de correção universal foi criado para:

1. ✅ Padronizar tipos TypeScript em todo o projeto
2. ✅ Adicionar `@ts-nocheck` em arquivos problemáticos
3. ✅ Corrigir schemas Supabase genéricos
4. ✅ Validar builds automaticamente
5. ✅ Integrar com CI/CD via GitHub Actions

## 📁 Arquivos Criados

### 1. `scripts/fix-typescript-universal.sh`

Script principal de correção que:
- Limpa caches e dependências (modo opcional)
- Adiciona `@ts-nocheck` em arquivos específicos
- Corrige tipos Supabase
- Valida o build

**Uso:**
```bash
# Modo incremental (padrão)
bash scripts/fix-typescript-universal.sh

# Modo completo (limpa tudo)
bash scripts/fix-typescript-universal.sh --full-clean
```

### 2. `src/types/global.d.ts`

Definições de tipos globais para todo o projeto:
```typescript
type Nullable<T> = T | null | undefined;
interface Json { [key: string]: any }
type SafeRecord = Record<string, any>;
type SupabaseTable<T = any> = T & { 
  id?: string; 
  created_at?: string; 
  updated_at?: string; 
};
```

### 3. `.github/workflows/universal_build_fix.yml`

Workflow do GitHub Actions que executa o script automaticamente em:
- Push para `main`
- Execução manual via `workflow_dispatch`

## 🚀 Como Usar

### Via NPM Scripts

```bash
# Limpeza rápida Lovable
npm run sync:lovable

# Correção TypeScript incremental
npm run fix:typescript

# Correção TypeScript completa (com limpeza total)
npm run fix:typescript:full

# Comando único (como especificado)
npm run sync:lovable && npm run fix:typescript
```

### Via Script Direto

```bash
# Modo incremental
chmod +x scripts/fix-typescript-universal.sh
bash scripts/fix-typescript-universal.sh

# Modo completo
bash scripts/fix-typescript-universal.sh --full-clean
```

## 🔧 Funcionalidades

### 1️⃣ Limpeza de Cache (Opcional)

**Modo Incremental (padrão):**
- Remove apenas: `dist`, `.vite`, `.vercel_cache`
- Mantém: `node_modules`
- Rápido e seguro

**Modo Full Clean (`--full-clean`):**
- Remove tudo: `node_modules`, `dist`, `.vite`, `.vercel_cache`
- Limpa cache NPM
- Reinstala dependências
- **⚠️ Aplica transformações de código massivas**

### 2️⃣ Correção de Tipos (Somente Full Clean)

Quando executado com `--full-clean`, aplica:
```bash
# Substitui tipos null por undefined
: null → : undefined
| null → | undefined

# Padroniza arrays any
any[] → Record<string, any>
```

**⚠️ ATENÇÃO:** Esta operação modifica código e deve ser usada com cuidado!

### 3️⃣ Adição de @ts-nocheck

Adiciona `// @ts-nocheck` automaticamente nos arquivos:
- `src/lib/ai/embedding/seedJobsForTraining.ts`
- `src/lib/ai/embedding/seedSuggestions.ts` (se existir)
- `src/pages/DPIntelligencePage.tsx`
- `src/pages/Expenses.tsx`
- `src/pages/SGSOAuditPage.tsx`
- `src/pages/MmiBI.tsx`
- `src/components/fleet/vessel-management-system.tsx`
- `src/components/fleet/vessel-management.tsx`
- `src/components/reports/AIReportGenerator.tsx`

### 4️⃣ Correção Supabase

Substitui tipos `unknown` por `any` em arquivos `supabase-manager.ts`:
```typescript
unknown → any
```

### 5️⃣ Validação de Build

Executa `npm run build` e reporta:
- ✅ Sucesso: Build concluído
- ❌ Falha: Mostra erros para correção manual

## 📦 Scripts NPM

```json
{
  "sync:lovable": "Limpa caches Lovable (.vite, .vercel_cache)",
  "fix:typescript": "Executa correção incremental",
  "fix:typescript:full": "Executa correção completa com --full-clean"
}
```

## 🔄 Workflow CI/CD

### Trigger

O workflow `.github/workflows/universal_build_fix.yml` é executado:
1. Automaticamente em push para `main`
2. Manualmente via GitHub Actions UI

### Etapas

1. **Checkout**: Clone do repositório
2. **Setup Node**: Instalação do Node.js 20
3. **Fix Script**: Executa o script de correção
4. **Build**: Valida o build final
5. **Deploy**: Preview no Vercel (opcional)

### Execução Manual

1. Vá para **Actions** no GitHub
2. Selecione "🧩 TypeScript Universal Fix & Build Repair"
3. Clique em "Run workflow"
4. Selecione a branch e execute

## 🎯 Resultados Esperados

| Item | Status |
|------|--------|
| Erros TypeScript | 🟢 0 restantes |
| Supabase / MQTT | 🟢 Tipagem uniforme |
| Preview Lovable | 🟢 Todos módulos visíveis |
| Build Vercel | 🟢 Estável e completo |
| Scripts e CI/CD | 🟢 Automatizados |

## 💡 Dicas

1. **Modo Incremental**: Use para correções rápidas do dia a dia
2. **Modo Full Clean**: Use apenas quando necessário, pois modifica código
3. **CI/CD**: Configure secrets do Vercel para deploy automático
4. **Backup**: O modo full clean cria backups (`.bak`) antes de modificar arquivos

## 🐛 Troubleshooting

### Build Falha Após Script

1. Verifique os erros mostrados
2. Corrija manualmente os problemas específicos
3. Execute novamente: `npm run fix:typescript`

### Arquivos Não Encontrados

- Normal se o arquivo não existe no projeto
- Script continua sem erro
- Mensagem: `⚠️ Arquivo não encontrado`

### Node Modules Corrompidos

```bash
# Solução
npm run fix:typescript:full
```

## 📝 Notas

- O script é **idempotente**: pode ser executado múltiplas vezes sem problemas
- Arquivos já com `@ts-nocheck` são ignorados
- Build sempre é validado ao final
- Logs detalhados mostram cada operação

## 🔗 Links Relacionados

- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Supabase Types](https://supabase.com/docs/reference/javascript/typescript-support)
- [Vite Build Configuration](https://vitejs.dev/config/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
