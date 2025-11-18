# 🧪 Module Harness - Guia para Desenvolvedores

## O que é?

Página dev-only (`/__module_harness`) que permite importar **qualquer módulo em tempo de execução** sem incluí-lo no bundle inicial. Perfeito para debugar módulos pesados que estão travando o Dashboard.

## Acesso Rápido

```bash
# Dev server rodando? Acesse:
http://localhost:8080/__module_harness
```

**Nota**: Só funciona em `npm run dev` (não aparece em produção).

## Como Usar

### 1. Testar um módulo pesado

Digite o caminho de import no input e clique **Load**:

```
@/pages/Dashboard
```

O módulo será importado dinamicamente **SEM** afetar o bundle principal.

### 2. Exemplos prontos

Clique nos botões de exemplo para testar:

- **`@/pages/Dashboard`** - Página principal
- **`@/pages/Travel`** - Módulo de viagens
- **`onnxruntime-web`** - ONNX (~10MB)
- **`xlsx`** - Excel export (~2MB)
- **`three`** - 3D rendering (~600KB)

### 3. Ver exports do módulo

Se o módulo não é um componente React, verá os exports em JSON:

```javascript
// Exemplo: importar "xlsx"
{
  "utils": { ... },
  "writeFile": [Function],
  "readFile": [Function]
}
```

## Use Cases

### Debugar Dashboard travando

```
1. Abra /__module_harness
2. Digite: @/pages/Dashboard
3. Clique Load
4. Veja erros no console do navegador (sem travar o app inteiro)
```

### Testar módulo ONNX isolado

```
1. Digite: @/ai/nautilus-inference
2. Load
3. Inspecione erros de modelo sem incluir no bundle
```

### Verificar tamanho de libs

Abra DevTools → Network → veja o tamanho do chunk carregado quando fizer Load de `onnxruntime-web` ou `xlsx`.

## Benefícios

✅ **Zero impacto no bundle** - Módulos carregados sob demanda  
✅ **Debug isolado** - Erro em um módulo não quebra o app  
✅ **Velocidade** - Dashboard carrega instantaneamente  
✅ **Visibilidade** - Devs veem exatamente qual módulo é pesado  

## Próximos Passos

### Para devs que encontrarem módulos pesados:

1. Identifique o módulo com Module Harness
2. Converta para lazy import em `src/App.tsx`:

```tsx
// ❌ ANTES (import estático - 2MB no bundle inicial)
import HeavyModule from "@/modules/heavy";

// ✅ DEPOIS (lazy import - carrega sob demanda)
const HeavyModule = safeLazyImport(() => import("@/modules/heavy"), "HeavyModule");
```

3. Teste novamente no harness para confirmar

### Para módulos externos (ONNX, TensorFlow):

- Já estão em lazy load via `type` imports
- Se aparecerem no bundle, verifique se há import estático em algum arquivo

## Troubleshooting

**Erro: "Cannot find module"**
- Verifique se o caminho está correto
- Use paths do TypeScript (@/ = src/)
- Confira no filesystem se o arquivo existe

**Módulo carrega mas não renderiza**
- Pode não ser um componente React
- Veja os exports no JSON abaixo

**Build ainda pesado**
- Use `npm run build -- --debug` e veja o bundle analyzer
- Procure por imports estáticos de libs pesadas

## Comandos Úteis

```bash
# Rodar dev server
npm run dev

# Verificar tamanho do bundle (após build)
npm run build
ls -lh dist/assets/*.js

# Analisar bundle (se tiver plugin)
npm run build -- --analyze
```

## Estrutura Técnica

```
src/pages/ModuleHarness.tsx  ← Componente principal
src/App.tsx                  ← Rota /__module_harness (dev-only)
```

Import usa `/* @vite-ignore */` para permitir paths dinâmicos sem análise estática do Vite.

---

**Dúvidas?** Abra issue no repo ou pergunte no canal #dev
