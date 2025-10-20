# 🧠 Nautilus Memory Engine

Sistema de aprendizado contínuo do Nautilus Intelligence Core.

## 📋 Visão Geral

O Nautilus Memory Engine é um módulo de memória inteligente que registra, organiza e analisa o histórico de falhas e correções do sistema. Ele permite que o Nautilus Intelligence Core aprenda com comportamentos passados e forneça insights preventivos.

## ✨ Recursos

- **📘 Histórico Persistente**: Armazena logs, falhas e soluções aplicadas
- **🔁 Autoaprendizado**: Reconhece padrões de erro e age preventivamente
- **📊 Relatórios Inteligentes**: Mostra recorrência de falhas técnicas
- **🧩 Integração Nativa**: Conectado ao Intelligence Core sem dependências externas
- **🔒 Conformidade**: Mantém histórico de correções para auditorias PEO-DP / NORMAM-101

## 🏗️ Estrutura

```
src/ai/nautilus-core/
├── index.js              # Orquestrador principal
├── analyzer.js           # Analisador de logs
├── suggestFix.js         # Sugestões de correção via LLM
├── createPR.js           # Criador automático de PRs
└── memory/
    ├── memoryEngine.js   # Motor de memória
    └── memoryDB.json     # Base de dados (auto-gerada)
```

## 🚀 Uso

### Executar o Nautilus Intelligence Core

```bash
node src/ai/nautilus-core/index.js
```

### Integração Programática

```javascript
import { MemoryEngine } from "./src/ai/nautilus-core/memory/memoryEngine.js";

const memory = new MemoryEngine();

// Armazenar uma falha e correção
memory.store(
  ["❌ Build failed", "⚠️ Type error"],
  "fix: correct type definitions"
);

// Obter padrões recorrentes
const patterns = memory.getRecurrentPatterns();
console.log(patterns);

// Obter histórico completo
const history = memory.getHistory();
console.log(history);
```

## 📊 API do MemoryEngine

### `store(findings: string[], fixSummary: string)`

Armazena um novo registro de falha e correção.

**Parâmetros:**
- `findings`: Array de strings com os problemas detectados
- `fixSummary`: Resumo da correção aplicada

### `getRecurrentPatterns()`

Analisa e retorna padrões recorrentes de falhas.

**Retorna:** Array de objetos com `{ pattern, occurrences }`

### `getHistory()`

Retorna o histórico completo de falhas e correções, ordenado por data (mais recente primeiro).

**Retorna:** Array de objetos com `{ id, timestamp, findings, fixSummary }`

## 🧪 Testes

Execute o módulo para verificar o funcionamento:

```bash
node src/ai/nautilus-core/index.js
```

## 📈 Evolução

O sistema evolui automaticamente com cada execução de CI/CD, acumulando conhecimento sobre:
- Tipos de falhas mais comuns
- Soluções aplicadas com sucesso
- Padrões temporais de problemas
- Correlações entre diferentes tipos de erro

## 🔐 Segurança e Privacidade

- O arquivo `memoryDB.json` está incluído no `.gitignore`
- Dados sensíveis não são armazenados
- Conformidade com NORMAM-101 e PEO-DP
