# 🛡️ QUALITY GATES - NAUTI ONE

> **Documentação dos Gates de Qualidade**
> Sistema de prevenção de regressões técnicas

---

## 📋 Visão Geral

Os Quality Gates são scripts que rodam automaticamente em 3 camadas:

| Camada | Quando Executa | O que Verifica |
|--------|----------------|----------------|
| **Pre-commit** | Antes de cada commit | Gates P0 nos arquivos staged |
| **Pre-push** | Antes de cada push | Todos os gates + TypeScript |
| **CI** | Em cada PR | Todos os gates + Build + Tests |

---

## 🚫 GATE A — No Console

### O que bloqueia
- `console.log(`
- `console.warn(`
- `console.error(`
- `console.debug(`
- `console.info(`

### Arquivos verificados
- `src/**/*.{ts,tsx,js,jsx}`
- `supabase/functions/**`
- `supabase/migrations/**`

### Exceções permitidas
- Arquivos de teste (`*.test.ts`, `*.spec.ts`)
- Diretórios de teste (`/tests/`, `/__tests__/`, `/e2e/`)
- Logger central (`src/lib/logger.ts`)
- Service workers (`sw*.js`)

### Como corrigir

```typescript
// ❌ ERRADO
console.log('User data:', userData);
console.error('Failed to fetch:', error);

// ✅ CORRETO
import { logger } from '@/lib/logger';

logger.info('User data:', userData);
logger.error('Failed to fetch:', error);

// Para feedback de usuário, use toast:
import { toast } from 'sonner';
toast.success('Operação concluída');
toast.error('Erro ao processar');
```

### Comando
```bash
npm run gate:console
npm run gate:console -- --staged  # Apenas arquivos staged
```

---

## 🚫 GATE B — No Mock Data

### O que bloqueia
- Constantes: `MOCK_*`, `SAMPLE_*`, `FAKE_*`, `DUMMY_*`
- Variáveis: `mockData`, `sampleData`, `fakeData`, `dummyData`
- Funções: `getMock*(`
- Comentários: `// TODO: replace with real`

### Exceções permitidas
- `src/services/mocks/**`
- `src/tests/**`
- Arquivos de teste (`*.test.*`, `*.spec.*`)

### Como corrigir

```typescript
// ❌ ERRADO
const MOCK_USERS = [{ id: 1, name: 'Test' }];
const data = getMockData();

// ✅ CORRETO - Usar Supabase
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const { data } = useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data;
  }
});
```

### Comando
```bash
npm run gate:mocks
```

---

## 🚫 GATE C — No Fake API

### O que bloqueia
- `return Promise.resolve(`
- `Promise.resolve([...])`
- `Promise.resolve({...})`
- `setTimeout(...resolve`
- `new Promise((resolve) => setTimeout`
- Comentários indicando fake API

### Como corrigir

```typescript
// ❌ ERRADO
async function fetchData() {
  return Promise.resolve([{ id: 1 }]); // fake
}

// ❌ ERRADO - Simulando delay
await new Promise(r => setTimeout(r, 1000));

// ✅ CORRETO - API real
async function fetchData() {
  const { data, error } = await supabase.from('table').select('*');
  if (error) throw error;
  return data;
}

// ✅ CORRETO - Se API externa indisponível
async function fetchExternalData() {
  try {
    const response = await fetch(API_URL);
    return await response.json();
  } catch (error) {
    // Mostrar UI de "serviço indisponível"
    throw new ServiceUnavailableError('External API unavailable');
  }
}
```

### Comando
```bash
npm run gate:fake-api
```

---

## ⚠️ GATE D — No @ts-ignore

### O que bloqueia
- `@ts-ignore`
- `@ts-nocheck`
- `@ts-expect-error`

### Exceções permitidas
- Arquivos de teste
- Tech debt documentado:
  ```typescript
  // @ts-ignore TECHDEBT:TICKET-123 Reason here Deadline:2026-03
  ```

### Como corrigir

```typescript
// ❌ ERRADO
// @ts-ignore
const value = someUntypedLib.getValue();

// ✅ CORRETO - Criar tipos
interface LibValue {
  id: string;
  data: unknown;
}

const value = someUntypedLib.getValue() as LibValue;

// ✅ CORRETO - Type guard
function isValidResponse(data: unknown): data is ValidResponse {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

### Comando
```bash
npm run gate:ts-ignore
```

---

## ⚠️ GATE E — Limit Any

### O que bloqueia (apenas em paths críticos)
- `: any`
- `<any>`
- `as any`
- `: any[]`
- `Record<string, any>`
- `Promise<any>`

### Paths críticos
- `src/hooks/**`
- `src/services/**`
- `src/lib/**`
- `src/core/**`
- `supabase/functions/**`

### Exceções permitidas
- Tech debt documentado:
  ```typescript
  // TECHDEBT:ANY TICKET-456 External lib requires any 2026-Q2
  const handler: any = externalLib.createHandler();
  ```

### Como corrigir

```typescript
// ❌ ERRADO
function processData(data: any) {
  return data.value;
}

// ✅ CORRETO - Usar unknown + type guard
function processData(data: unknown) {
  if (isValidData(data)) {
    return data.value;
  }
  throw new Error('Invalid data');
}

// ✅ CORRETO - Criar interface
interface DataPayload {
  value: string;
  metadata: Record<string, unknown>;
}

function processData(data: DataPayload) {
  return data.value;
}
```

### Comando
```bash
npm run gate:any
```

---

## 📊 GATE F — Route Orphans

### O que verifica
1. Rotas em `App.tsx` que não estão no sidebar
2. Links no sidebar que não existem em `App.tsx`

### Whitelist (não precisam estar no sidebar)
- `/login`, `/auth`, `/auth-callback`
- `/admin/*`
- `/debug/*`, `/e2e/*`
- `/dev-routes`, `/404`
- `/settings/*`

### Como corrigir

```typescript
// Se rota existe em App.tsx mas não no sidebar:
// Opção 1: Adicionar ao sidebar-routes.ts
// Opção 2: Adicionar à whitelist em gate-routes.js

// Se link no sidebar aponta para rota inexistente:
// Opção 1: Criar rota em App.tsx
// Opção 2: Remover do sidebar-routes.ts
```

### Comando
```bash
npm run gate:routes
```

---

## 🚀 Executando Gates

### Todos os gates
```bash
npm run gate:all           # Full scan
npm run gate:staged        # Apenas arquivos staged
npm run gate:ci            # Modo CI (mais restritivo)
```

### Gates individuais
```bash
npm run gate:console
npm run gate:mocks
npm run gate:fake-api
npm run gate:ts-ignore
npm run gate:any
npm run gate:routes
```

---

## ⚙️ Configuração

### Husky (Git Hooks)

**Pre-commit** (`.husky/pre-commit`):
- Roda lint-staged
- Gates P0: console, mocks, fake-api

**Pre-push** (`.husky/pre-push`):
- Roda todos os gates
- TypeScript check

### CI (GitHub Actions)

Arquivo: `.github/workflows/quality-gates.yml`

Jobs:
1. **quality-gates**: Todos os gates + lint + typecheck
2. **test**: Unit tests
3. **e2e-smoke**: Smoke tests em PRs
4. **report**: Gera relatório de gates

---

## 📈 Prioridades

| Prioridade | Gates | Comportamento |
|------------|-------|---------------|
| **P0** | console, mocks, fake-api | Bloqueia commit/CI |
| **P1** | ts-ignore, any | Bloqueia CI, warning local |
| **P2** | routes | Warning apenas |

---

## 🔄 Modo Transição (Baseline)

Para projetos com muitas violações existentes:

1. Gerar baseline atual:
```bash
npm run gate:all > scripts/gates/baseline.json 2>&1
```

2. Gates verificam apenas NOVAS violações

3. Meta: Reduzir baseline em 10% por semana

---

## 🆘 Troubleshooting

### "Gate falhou mas preciso commitar urgente"

```bash
# Skip pre-commit (USE COM CAUTELA)
git commit --no-verify -m "hotfix: ..."
```

⚠️ O CI ainda vai falhar se houver violações P0.

### "Falso positivo no gate"

1. Verificar se o código está em diretório de teste
2. Se for legítimo, adicionar exceção documentada
3. Abrir issue para ajustar o gate

---

## 📚 Referências

- [ESLint Rules](https://eslint.org/docs/rules/)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Supabase Client](https://supabase.com/docs/reference/javascript/introduction)
- [TanStack Query](https://tanstack.com/query/latest)

---

*Documentação atualizada: Janeiro 2026*
