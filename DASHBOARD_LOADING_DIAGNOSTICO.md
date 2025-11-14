# Diagnóstico do Problema de Loading Infinito no Dashboard

**Data:** 14/11/2025  
**Status:** 🔍 Em Investigação  
**Commit:** 0dc739c3

## 🎯 Problema Reportado

O módulo Dashboard está apresentando loading infinito - o spinner de carregamento aparece e não sai desse modo.

## 🛠️ Soluções Implementadas

### 1. Timeout em Imports Dinâmicos (Commit 69beff77)

**Arquivo:** `src/utils/safeLazyImport.tsx`

**Mudança:**
- Adicionado timeout de 10 segundos por tentativa de import
- Evita que imports pendentes mantenham Suspense infinitamente
- Preserva mecanismo de retry (3 tentativas por padrão)

**Código:**
```typescript
const importerWithTimeout = () => Promise.race([
  importer(),
  new Promise((_res, rej) => setTimeout(() => rej(new Error("Import timeout")), timeoutMs)),
]);
```

### 2. Sistema de Diagnóstico Automático (Commit 0dc739c3)

#### 2.1. Logging Detalhado em safeLazyImport

**Funcionalidades:**
- ✅ Captura erro com stack trace completo
- ✅ Salva no `localStorage['safeLazyImport:lastError']`
- ✅ Registra: módulo, timestamp, número de tentativas, timeout
- ✅ Console log com emoji 🔍 para identificação rápida

**Estrutura do Erro:**
```json
{
  "module": "Nome do Módulo",
  "timestamp": "2025-11-14T...",
  "error": "Mensagem de erro",
  "stack": "Stack trace completo",
  "retries": 3,
  "timeout": 10000
}
```

#### 2.2. ErrorDebugBanner Visual

**Arquivo:** `src/components/debug/ErrorDebugBanner.tsx`

**Funcionalidades:**
- ✅ Banner vermelho no canto inferior direito
- ✅ Mostra módulo que falhou + mensagem de erro
- ✅ Stack trace expansível (collapse/expand)
- ✅ Botão "Copiar Debug Info" (copia JSON completo)
- ✅ Botão "Recarregar Página"
- ✅ Auto-oculta erros com mais de 5 minutos
- ✅ Dismissível (botão X)
- ✅ Atualiza a cada 2 segundos automaticamente

**Integração:**
- Adicionado ao `App.tsx` globalmente
- Aparece em todas as rotas
- Não interfere com funcionalidade normal

#### 2.3. Proteção em TenantContext

**Arquivo:** `src/contexts/TenantContext.tsx`

**Mudança:**
- Adicionado `try-catch` em `loadDemoTenant()`
- Garante que `setIsLoading(false)` sempre execute
- Previne travamento se dados demo falharem

## 🔬 Causas Possíveis Identificadas

### 1. Import Chunk Failure ❌
**Sintoma:** Chunk não carrega (404/500/timeout)  
**Diagnóstico:** Banner de erro aparecerá automaticamente  
**Solução:** Timeout implementado + retry mechanism

### 2. RLS Bloqueando Dados ⚠️
**Sintoma:** Supabase queries ficam pendentes  
**Diagnóstico:** Network tab mostra requests pendentes  
**Solução:** Aplicar migration RLS (já criada)

### 3. Hook em Loop Infinito ⚠️
**Sintoma:** `useEffect` sem dependências corretas  
**Diagnóstico:** TenantContext tem múltiplos `useEffect`  
**Solução:** Já adicionado timeout + fallback para demo

### 4. Timeout de Rede 🌐
**Sintoma:** Supabase lento/indisponível  
**Diagnóstico:** Já implementado timeout de 3s em queries  
**Solução:** Fallback para dados demo automático

## 📊 Arquivos Modificados

```
src/utils/safeLazyImport.tsx              (+30 linhas) - Timeout + logging
src/components/debug/ErrorDebugBanner.tsx (novo)       - Banner de debug
src/App.tsx                               (+2 linhas)  - Import + integração
src/contexts/TenantContext.tsx            (+4 linhas)  - Try-catch demo
```

## 🧪 Como Testar

### Opção 1: Visual (Recomendado)

1. Abrir `http://localhost:8080/dashboard`
2. Se aparecer banner vermelho no canto inferior direito:
   - Clicar em "Copiar Debug Info"
   - Colar conteúdo aqui
3. Se não aparecer banner e tela carregar: ✅ Problema resolvido!
4. Se não aparecer banner e ficar loading infinito:
   - Abrir DevTools (F12) → Console
   - Procurar por mensagens com 🔍
   - Copiar erros em vermelho

### Opção 2: Console

```javascript
// No Console do navegador (F12):
JSON.parse(localStorage.getItem('safeLazyImport:lastError'))
```

### Opção 3: Network

1. DevTools (F12) → Network
2. Filtrar por "fetch" ou "chunk"
3. Verificar se há recursos em vermelho ou pendentes (⏳)
4. Copiar nome do recurso + status code

## 🎯 Próximos Passos

### Se Banner Aparecer:
1. ✅ Analisar JSON do erro
2. ✅ Identificar chunk/módulo problemático
3. ✅ Corrigir import path ou chunk splitting

### Se Ficar Loading sem Banner:
1. ✅ Verificar Network tab (RLS queries pendentes?)
2. ✅ Aplicar migration RLS se necessário
3. ✅ Adicionar logs temporários em hooks suspeitos

### Se Dashboard Carregar:
1. ✅ Problema resolvido pelo timeout!
2. ✅ Commitar documentação
3. ✅ Atualizar STATUS_FINAL_SISTEMA.md

## 📈 Performance

**Build:** ✅ Passing (3min 5s)  
**Dev Server:** ✅ Iniciado em 2.4s  
**Diagnóstico:** ✅ Automático e visual

## 🔗 Commits Relacionados

- `69beff77` - fix(safeLazyImport): add import timeout
- `0dc739c3` - feat: add comprehensive error diagnosis system

---

**Aguardando teste do usuário para identificar causa raiz exata...**
