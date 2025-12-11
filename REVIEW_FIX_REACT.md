# REVIEW_FIX_REACT.md - Correção Definitiva do Erro de Hooks React

## Data: 2025-12-11

## Erro Corrigido
```
Cannot read properties of null (reading 'useState')
Cannot read properties of null (reading 'useMemo')
```

## Causa Raiz Identificada

O erro ocorria devido a **duas causas principais**:

### 1. Lazy Loading de Context Providers

Os Context Providers (`TenantProvider` e `OrganizationProvider`) estavam sendo carregados via `React.lazy()` no `App.tsx`:

```tsx
// ❌ ERRADO - Lazy loading de context providers causa erro de hooks
const TenantProvider = React.lazy(() => 
  import("./contexts/TenantContext").then(m => ({ default: m.TenantProvider }))
);
const OrganizationProvider = React.lazy(() => 
  import("./contexts/OrganizationContext").then(m => ({ default: m.OrganizationProvider }))
);
```

Quando um Context Provider é carregado de forma lazy, ele é renderizado dentro de um `Suspense` boundary que pode causar múltiplas instâncias do dispatcher React, resultando em `null` quando os hooks tentam acessar o dispatcher.

### 2. Padrões de Import Inconsistentes

Os arquivos de contexto usavam padrões de import diferentes:

- `AuthContext.tsx`: `import * as React from "react";` (namespace import)
- `TenantContext.tsx`: `import React, { createContext, useContext, useState } from "react";` (mixed import)
- `OrganizationContext.tsx`: `import React, { createContext, useContext, useState } from "react";` (mixed import)

Essa inconsistência pode causar múltiplas referências ao React em diferentes chunks do bundle.

## Solução Aplicada

### 1. Remoção do Lazy Loading nos Context Providers

```tsx
// ✅ CORRETO - Import direto dos context providers
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
```

### 2. Padronização dos Imports React

Todos os arquivos de contexto agora usam o mesmo padrão de import:

```tsx
// ✅ CORRETO - Namespace import consistente em todos os arquivos
import * as React from "react";
```

### 3. Reorganização da Hierarquia de Providers

```tsx
// ✅ CORRETO - Providers carregados sincronamente, não lazy
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <TenantProvider>
      <OrganizationProvider>
        <AppRoutes />
      </OrganizationProvider>
    </TenantProvider>
  </AuthProvider>
</QueryClientProvider>
```

## Arquivos Modificados

1. **src/main.tsx** - Simplificado, sem hacks de inicialização
2. **src/App.tsx** - Context providers importados diretamente, não lazy
3. **src/contexts/TenantContext.tsx** - Namespace import + simplificação
4. **src/contexts/OrganizationContext.tsx** - Namespace import + simplificação

## Configuração Vite (Já Existente)

O `vite.config.ts` já possui a configuração correta de dedupe:

```ts
resolve: {
  dedupe: [
    "react", 
    "react-dom", 
    "react-router-dom",
    "@tanstack/react-query",
    "react-helmet-async"
  ],
},
optimizeDeps: {
  include: [
    "react", 
    "react-dom", 
    "react-dom/client",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
    // ...
  ],
},
```

## Regras para Evitar Regressão

1. **NUNCA** use `React.lazy()` para Context Providers
2. **SEMPRE** use `import * as React from "react";` em todos os arquivos
3. **SEMPRE** importe Context Providers diretamente no App.tsx
4. **Lazy loading é permitido** apenas para páginas e componentes pesados que não são providers

## Testes de Validação

Para validar que o erro não ocorre mais:

1. Recarregar a página (F5) na rota `/`
2. Recarregar a página na rota `/login`
3. Recarregar a página na rota `/dashboard`
4. Navegar entre rotas sem erro
5. Console livre de erros de hooks React

## Conclusão

A correção foi aplicada de forma definitiva, sem uso de workarounds como `setTimeout`, `try/catch`, ou verificações de `null` nos hooks. A solução segue as melhores práticas do React para gerenciamento de contexto.
