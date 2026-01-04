# strictNullChecks Migration Plan

## Status: Fase 1 - Preparação

### Objetivo
Habilitar `strictNullChecks: true` no TypeScript para aumentar a segurança de tipos e capturar erros de null/undefined em tempo de compilação.

### Impacto Estimado
- **Arquivos afetados**: ~200-400 arquivos
- **Erros iniciais**: ~1000-2000 erros de compilação
- **Tempo estimado**: 2-4 sprints (refatoração gradual)

---

## Fase 1: Preparação (Atual)

### 1.1 Análise de Impacto
```bash
# Comando para verificar erros com strictNullChecks
npx tsc --strictNullChecks --noEmit 2>&1 | head -100
```

### 1.2 Padrões Comuns a Corrigir

#### 1. Optional Chaining
```typescript
// ❌ Antes
const name = user.profile.name;

// ✅ Depois
const name = user?.profile?.name;
```

#### 2. Nullish Coalescing
```typescript
// ❌ Antes
const value = data || 'default';

// ✅ Depois
const value = data ?? 'default';
```

#### 3. Type Guards
```typescript
// ❌ Antes
function process(data) {
  return data.length;
}

// ✅ Depois
function process(data: string | null): number {
  if (!data) return 0;
  return data.length;
}
```

#### 4. Non-null Assertion (usar com cuidado)
```typescript
// Quando você tem certeza que o valor existe
const element = document.getElementById('root')!;
```

---

## Arquivos Migrados (Fase 1 + Fase 2)

### Fase 1: src/lib/ ✅

| Arquivo | Status | Mudanças |
|---------|--------|----------|
| `src/lib/utils.ts` | ✅ | null guards em formatCurrency/formatDate |
| `src/lib/type-helpers.ts` | ✅ | +7 helpers: assertNonNull, isDefined, safeGet, safeJsonParse, toArray, toString, toNumber |
| `src/lib/logger.ts` | ✅ | Já null-safe |
| `src/lib/unified/format-utils.unified.ts` | ✅ | Já null-safe |
| `src/lib/unified/error-handling.unified.ts` | ✅ | Já null-safe |

### Fase 2: src/utils/ + src/hooks/ ✅

| Arquivo | Status | Mudanças |
|---------|--------|----------|
| `src/utils/performance-utils.ts` | ✅ | Removido @ts-nocheck, null guards para memory API |
| `src/utils/supabase-helpers.ts` | ✅ | Já null-safe com type guards |
| `src/hooks/use-offline-storage.ts` | ✅ | Substituído `any` por `unknown`, deprecated `substr` → `substring` |
| `src/hooks/use-toast.ts` | ✅ | Já null-safe |
| `src/hooks/use-debounce.ts` | ✅ | Já null-safe |
| `src/hooks/useButtonHandlers.ts` | ✅ | Já null-safe |

---

## Fase 3: Migração de Componentes (v3.3.0)

1. **Utilitários e Libs** (baixo acoplamento)
   - `src/lib/logger.ts` ✅
   - `src/lib/crypto.ts` ✅
   - `src/lib/validation.ts`
   - `src/utils/*.ts`

2. **Types e Interfaces** (sem lógica)
   - `src/types/*.ts`
   - `src/integrations/supabase/types.ts` (read-only)

3. **Hooks** (média complexidade)
   - `src/hooks/use-*.ts`

4. **Serviços** (alta complexidade)
   - `src/services/*.ts`
   - `src/modules/**/services/*.ts`

5. **Componentes** (maior volume)
   - `src/components/ui/*` (shadcn - já tipados)
   - `src/components/**/*.tsx`
   - `src/modules/**/*.tsx`

---

## Serviços Validados (Fase 3)

| Arquivo | Status | Notas |
|---------|--------|-------|
| `src/services/enhanced-auth-service.ts` | ✅ | Já null-safe com type guards |
| `src/services/openai.ts` | ✅ | Já null-safe com retorno `null` explícito |
| `src/services/supabase.ts` | ✅ | Já null-safe com error handling |
| `src/services/offline-cache.ts` | ✅ | Removido `as any`, IDBKeyRange correto |
| `src/services/backup-service.ts` | ✅ | Removido `any`, tipagem `Record<string, unknown>` |
| `src/services/ocr-service.ts` | ✅ | Removido `any`, tipagem TesseractBlock |
| `src/services/nlp-service.ts` | ✅ | Removido `any[]`, tipagem explícita nos retornos |
| `src/services/voice.service.ts` | ✅ | Tipagem SpeechRecognition (browser API) |
| `src/services/ai/distributed-ai.service.ts` | ✅ | Já null-safe |
| `src/services/ai/self-healing-engine.ts` | ✅ | Removido `as any`, interface LogRow tipada |
| `src/services/weather/weather-fallback.service.ts` | ✅ | Removido `any` do forecast map |
| `src/modules/mission-control/mobile/syncService.ts` | ✅ | Type-safe com mapeamento Supabase |
| `src/lib/actions/action-handler.ts` | ✅ | Removido `any`, usando `unknown` |

---

## Fase 4: Habilitar Globalmente

### 3.1 Atualizar tsconfig.json
```json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

### 3.2 Validação Final
```bash
npm run build
npm run test
npm run lint
```

---

## Ferramentas de Apoio

### Script de Análise
```bash
# Contar erros por diretório
npx tsc --strictNullChecks --noEmit 2>&1 | grep "error TS" | sed 's/:.*//' | sort | uniq -c | sort -rn | head -20
```

### Regex para Correções em Massa
```regex
# Encontrar acessos potencialmente perigosos
\w+\.\w+\.\w+ # Cadeias de propriedades sem optional chaining
```

---

## Arquivos Prioritários para v3.3.0

| Arquivo | Complexidade | Status |
|---------|--------------|--------|
| `src/lib/logger.ts` | Baixa | ✅ |
| `src/lib/crypto.ts` | Baixa | ✅ |
| `src/lib/validation.ts` | Média | 🔄 |
| `src/hooks/use-toast.ts` | Baixa | ✅ |
| `src/services/auth-service.ts` | Alta | 🔄 |
| `src/modules/mission-control/mobile/syncService.ts` | Alta | ✅ |

---

## Notas

- **Não habilitar** `strictNullChecks` em produção até completar Fase 2
- Usar `// @ts-expect-error` temporariamente para casos complexos
- Priorizar arquivos com lógica crítica de segurança
- Manter testes E2E passando durante toda a migração

---

## Referências

- [TypeScript strictNullChecks](https://www.typescriptlang.org/tsconfig#strictNullChecks)
- [Migrating to strictNullChecks](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
