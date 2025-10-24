# PATCH 83.0 - Sistema de Diagnóstico e Auto-Correção

## 🎯 Objetivo

Sistema completo para detectar e corrigir automaticamente falhas silenciosas que ocorrem em produção, incluindo:

- ✅ Detecção de imports quebrados
- ✅ Identificação de `useEffect` mal configurados
- ✅ Componentes retornando `undefined`/`null` sem fallback
- ✅ Rotas quebradas (erro 500, tela branca)
- ✅ Regeneração automática do `modulesRegistry.ts`
- ✅ Mapa completo de rotas do sistema

## 📦 Arquivos Criados

### Scripts Principais

- **`scripts/diagnostic-scanner.ts`** - Scanner completo que detecta todos os problemas
- **`scripts/auto-fix.ts`** - Sistema de correção automática
- **`dev/logs/diagnostic_auto_report.json`** - Relatório detalhado de diagnóstico (gerado)
- **`dev/router/structure.json`** - Mapa de estrutura de rotas (gerado)

## 🚀 Como Usar

### 1. Executar Scan Completo

```bash
npm run diagnostic:scan
```

Este comando:
- Escaneia `/src/app/`, `/src/modules/`, `/src/pages/developer/`
- Detecta imports quebrados
- Identifica problemas com `useEffect`
- Localiza componentes sem fallback
- Valida todas as rotas
- Gera relatório em `/dev/logs/diagnostic_auto_report.json`

### 2. Aplicar Correções Automáticas

```bash
npm run diagnostic:fix
```

Este comando:
- Lê o relatório de diagnóstico
- Aplica correções automáticas para problemas conhecidos
- Regenera o `modulesRegistry.ts`
- Cria backup do registry anterior
- Gera mapa de rotas em `/dev/router/structure.json`

### 3. Executar Scan + Fix em Sequência

```bash
npm run diagnostic:full
```

## 📊 Estrutura do Relatório

O relatório gerado em `/dev/logs/diagnostic_auto_report.json` contém:

```json
{
  "timestamp": "2025-10-24T01:00:00.000Z",
  "totalIssues": 42,
  "criticalIssues": 5,
  "issuesByType": {
    "broken-import": 10,
    "broken-useEffect": 15,
    "undefined-return": 12,
    "missing-fallback": 5
  },
  "issues": [
    {
      "type": "broken-import",
      "severity": "critical",
      "file": "src/pages/Example.tsx",
      "line": 5,
      "issue": "Import 'modules/removed-module' points to non-existent module",
      "suggestion": "Check if module was removed or path changed",
      "autoFixAvailable": false
    }
  ],
  "moduleRegistry": {
    "totalModules": 85,
    "activeModules": 80,
    "brokenModules": ["modules/old-feature", "modules/deprecated"],
    "orphanedFiles": ["src/modules/new-feature/index.tsx"]
  },
  "routeMap": {
    "totalRoutes": 150,
    "brokenRoutes": ["/broken-page", "/old-feature"],
    "missingFallbacks": ["src/components/SlowComponent.tsx"]
  }
}
```

## 🔧 Tipos de Problemas Detectados

### 1. Imports Quebrados (`broken-import`)

**Problema:**
```typescript
import { Feature } from 'modules/removed-feature'; // ❌ Módulo não existe
```

**Detecção:**
- Verifica se o arquivo importado existe
- Valida paths relativos e absolutos
- Suporta aliases `@/`

**Correção:** Manual - requer decisão do desenvolvedor

---

### 2. useEffect Quebrado (`broken-useEffect`)

**Problema:**
```typescript
// ❌ useEffect não deve ser async
useEffect(async () => {
  await fetchData();
}, []);
```

**Correção Automática:**
```typescript
// ✅ Padrão correto
useEffect(() => {
  const fetchData = async () => {
    await fetchData();
  };
  fetchData();
}, []);
```

---

### 3. Retorno Undefined (`undefined-return`)

**Problema:**
```typescript
function MyComponent() {
  if (!data) return null; // ❌ Sem fallback
  return <div>{data}</div>;
}
```

**Correção Automática:**
```typescript
function MyComponent() {
  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <MyComponentWrapped />
    </React.Suspense>
  );
}
```

---

### 4. Rotas Quebradas (`broken-route`)

**Problema:**
```typescript
const BrokenPage = React.lazy(() => import('@/pages/NonExistent')); // ❌
```

**Correção Automática:**
```typescript
// DISABLED (broken): const BrokenPage = React.lazy(() => import('@/pages/NonExistent'));
```

## 🗺️ Estrutura de Rotas

O arquivo `/dev/router/structure.json` contém um mapa completo:

```json
{
  "timestamp": "2025-10-24T01:00:00.000Z",
  "totalRoutes": 150,
  "activeRoutes": 145,
  "brokenRoutes": 5,
  "routes": [
    {
      "path": "/dashboard",
      "component": "Dashboard",
      "status": "active"
    },
    {
      "path": "/old-feature",
      "component": "OldFeature",
      "status": "broken"
    }
  ]
}
```

## 📚 Regeneração do Module Registry

O sistema regenera automaticamente o `src/modules/registry.ts`:

### Processo:

1. **Backup** - Cria `registry.backup.ts` com versão anterior
2. **Validação** - Remove módulos quebrados
3. **Descoberta** - Adiciona arquivos órfãos (não registrados)
4. **Categorização** - Categoriza automaticamente por path
5. **Geração** - Cria novo registry com timestamp

### Exemplo de Entrada Auto-Gerada:

```typescript
'features.new-feature': {
  id: 'features.new-feature',
  name: 'New Feature',
  category: 'features',
  path: 'modules/features/new-feature',
  description: 'Auto-generated module entry',
  status: 'active',
  lazy: true,
}
```

## 🔍 Detalhes Técnicos

### Scanner (diagnostic-scanner.ts)

**Classes:**
- `DiagnosticScanner` - Classe principal de scanning
- `DiagnosticReport` - Interface do relatório
- `DiagnosticIssue` - Interface de problema individual

**Métodos principais:**
- `scan()` - Executa scan completo
- `scanBrokenImports()` - Detecta imports quebrados
- `scanBrokenUseEffect()` - Valida hooks
- `scanUndefinedReturns()` - Verifica retornos
- `validateModuleRegistry()` - Valida registry
- `validateRoutes()` - Valida rotas

### Auto-Fixer (auto-fix.ts)

**Classes:**
- `AutoFixer` - Classe principal de correção

**Métodos principais:**
- `applyFixes()` - Aplica todas as correções
- `fixBrokenUseEffect()` - Corrige useEffect
- `fixUndefinedReturn()` - Adiciona fallbacks
- `fixBrokenRoute()` - Desabilita rotas quebradas
- `regenerateModuleRegistry()` - Regenera registry
- `generateRouteStructure()` - Gera mapa de rotas

## ⚠️ Avisos Importantes

1. **Backup Automático**: O sistema cria backup do registry antes de modificar
2. **Código Crítico**: Revise correções automáticas antes de deploy
3. **Imports Quebrados**: Requerem correção manual
4. **Rotas Desabilitadas**: São comentadas, não removidas

## 🧪 Integração com CI/CD

Adicione ao seu pipeline:

```yaml
# .github/workflows/diagnostic.yml
name: Diagnostic Check
on: [push, pull_request]
jobs:
  diagnose:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run diagnostic:scan
      - name: Upload Report
        uses: actions/upload-artifact@v2
        with:
          name: diagnostic-report
          path: dev/logs/diagnostic_auto_report.json
```

## 📈 Métricas e Monitoramento

O sistema rastreia:
- Total de problemas detectados
- Problemas críticos vs não-críticos
- Taxa de correção automática
- Módulos órfãos descobertos
- Rotas quebradas identificadas

## 🎨 Próximos Passos

Após executar o sistema:

1. ✅ Revisar o relatório em `/dev/logs/diagnostic_auto_report.json`
2. ✅ Verificar correções aplicadas no git diff
3. ✅ Testar rotas críticas manualmente
4. ✅ Corrigir imports quebrados que requerem decisão manual
5. ✅ Validar o novo `modulesRegistry.ts`
6. ✅ Executar build e testes: `npm run build && npm test`

## 💡 Dicas

- Execute `diagnostic:scan` regularmente (semanal)
- Revise módulos órfãos para decidir se devem ser registrados
- Use o mapa de rotas para documentação
- Mantenha backups do registry para rollback se necessário

## 🐛 Troubleshooting

### "Module not found" ao executar scripts

```bash
npm install --save-dev tsx glob
```

### Permissões negadas nos scripts

```bash
chmod +x scripts/*.ts
```

### Relatório vazio

Verifique se existem arquivos em:
- `src/app/`
- `src/modules/`
- `src/pages/developer/`

---

**Versão:** PATCH 83.0  
**Data:** 2025-10-24  
**Autor:** Sistema de Auto-Correção Nautilus One
