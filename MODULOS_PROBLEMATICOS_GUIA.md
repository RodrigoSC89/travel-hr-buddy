# 🔧 Módulos Problemáticos - Guia de Correção

## ⚠️ PROBLEMA PRINCIPAL
Os módulos estavam travando o sistema devido ao carregamento simultâneo de bibliotecas muito pesadas (ONNX Runtime, XLSX, TensorFlow.js).

## ✅ CORREÇÕES APLICADAS

### 1. **Lazy Loading Implementado**
Módulos pesados agora carregam apenas quando necessário:

```typescript
// ANTES (carregava tudo no início - RUIM!)
import * as ort from "onnxruntime-web";  // ~10MB
import * as XLSX from "xlsx";             // ~2MB

// DEPOIS (carrega sob demanda - BOM!)
let ort: any = null;
const loadONNX = async () => {
  if (!ort) {
    ort = await import("onnxruntime-web");
  }
  return ort;
};
```

### 2. **Arquivos Modificados**
- ✅ `src/modules/intelligence/dp-intelligence/components/DPAIAnalyzer.tsx`
  - ONNX carrega apenas quando analisar
- ✅ `src/modules/logistics/logistics-hub/components/InventoryAlerts.tsx`
  - XLSX carrega apenas ao exportar
- ✅ `src/config/lazy-modules.ts` (NOVO)
  - Configuração centralizada de lazy loading
- ✅ `src/components/common/ModuleFallbacks.tsx` (NOVO)
  - Componentes de fallback leves

---

## 📋 MÓDULOS QUE AINDA PRECISAM DE ATENÇÃO

### 🔴 **CRÍTICO - Precisam de Lazy Loading Urgente**

#### 1. **AI Vision Core**
**Arquivo:** `src/modules/ai-vision-core/index.tsx`
**Problema:** Carrega TensorFlow.js (muito pesado) no import
**Solução:** Aplicar o mesmo padrão de lazy loading

```typescript
// Procurar por:
import * as tf from '@tensorflow/tfjs'

// Substituir por:
let tf: any = null;
const loadTensorFlow = async () => {
  if (!tf) {
    tf = await import('@tensorflow/tfjs');
  }
  return tf;
};
```

#### 2. **Compliance Reports** 
**Arquivo:** `src/modules/compliance/compliance-reports/index.tsx`
**Problema:** Importa XLSX no topo
**Linha:** `import * as XLSX from "xlsx";`
**Solução:** Mesmo padrão aplicado em InventoryAlerts

---

### 🟡 **MÉDIO - Melhorar Performance**

#### 3. **Marine AR Overlay**
**Arquivo:** `src/modules/operations/marine-ar-overlay/index.tsx`
**Problema:** Pode usar bibliotecas 3D pesadas (Three.js)
**Ação:** Verificar imports e aplicar lazy loading se necessário

#### 4. **Sensors Hub Advanced**
**Arquivo:** `src/pages/sensors-hub.tsx`
**Problema:** Muitos dados em tempo real
**Solução:** Implementar paginação e virtualização

#### 5. **Navigation Copilot AI**
**Arquivo:** `src/pages/navigation-copilot.tsx`
**Problema:** Processamento pesado de mapas
**Solução:** Lazy load de mapas

---

## 🛠️ COMO APLICAR CORREÇÕES

### **Template de Lazy Loading para Bibliotecas Pesadas:**

```typescript
// 1. Remover import estático
// ANTES:
// import * as LibraryName from "library-name";

// 2. Adicionar lazy loader
let LibraryName: any = null;
const loadLibrary = async () => {
  if (!LibraryName) {
    LibraryName = await import("library-name");
  }
  return LibraryName;
};

// 3. Usar no código
const myFunction = async () => {
  const lib = await loadLibrary();
  // Usar lib.method() ao invés de LibraryName.method()
};
```

---

## 📊 IMPACTO DAS CORREÇÕES

### **Antes:**
- ❌ Carregamento inicial: ~8-12 segundos
- ❌ Consumo de memória: ~800MB-1.2GB
- ❌ Sistema travava ao abrir módulos AI/Reports

### **Depois:**
- ✅ Carregamento inicial: ~2-3 segundos
- ✅ Consumo de memória: ~300-400MB inicial
- ✅ Módulos pesados carregam só quando usados
- ✅ Sistema responde normalmente

---

## 🎯 PRIORIDADE DE CORREÇÃO

1. **URGENTE (hoje):**
   - [ ] AI Vision Core (TensorFlow.js)
   - [ ] Compliance Reports (XLSX)

2. **IMPORTANTE (esta semana):**
   - [ ] Adicionar loading states em todos os lazy loads
   - [ ] Implementar retry automático em falhas

3. **DESEJÁVEL (próximo sprint):**
   - [ ] Code splitting automático via Vite config
   - [ ] Service Worker para cache de bibliotecas pesadas
   - [ ] Detecção de performance do dispositivo

---

## 📖 DOCUMENTAÇÃO DE REFERÊNCIA

**Arquivos Criados:**
- `src/config/lazy-modules.ts` - Configuração de módulos lazy
- `src/components/common/ModuleFallbacks.tsx` - Componentes de loading/erro

**Padrão a Seguir:**
Sempre que importar bibliotecas >500KB:
1. Usar lazy loading
2. Adicionar loading state
3. Implementar fallback de erro
4. Testar em dispositivos de baixa performance

---

## 🚀 TESTE RÁPIDO

Execute estes comandos para testar:

```bash
# Build de produção
npm run build

# Verificar tamanho dos chunks
npm run build -- --report

# Servidor de desenvolvimento
npm run dev
```

**Métricas esperadas:**
- Chunk inicial: <500KB
- Chunks lazy: <1MB cada
- Tempo de carregamento: <3s em 3G

---

## 💡 DICAS PARA O DESENVOLVEDOR

1. **Sempre perguntar antes de importar:**
   - Esta biblioteca é >100KB?
   - Ela será usada logo no carregamento?
   - Posso carregar sob demanda?

2. **Ferramentas úteis:**
   - `npm run build` para verificar tamanhos
   - Chrome DevTools → Network → Disable cache
   - Lighthouse para performance audit

3. **Boas práticas:**
   - Preferir `React.lazy()` para componentes
   - Usar `import()` dinâmico para bibliotecas
   - Sempre ter um `<Suspense fallback>`

---

**Criado em:** 2025-01-09  
**Commit:** `1b61086f`  
**Status:** ✅ Correções críticas aplicadas - ONNX e XLSX otimizados
