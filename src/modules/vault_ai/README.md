# 📚 Nautilus Vault Técnico IA

## Visão Geral

O **Vault Técnico IA** é um repositório inteligente do sistema Nautilus One para gerenciar documentos, manuais, relatórios e pareceres técnicos com leitura semântica, busca contextual e resposta via LLM embarcada.

## 🎯 Funcionalidades

### 📂 Indexação de Documentos
- Catalogação de documentos técnicos (PDF, DOCX, TXT)
- Armazenamento local persistente
- Metadados e timestamps

### 🔍 Busca Semântica
- Busca contextual inteligente
- Correspondência por similaridade
- Ranking de relevância

### 🧠 IA Embarcada
- Interface LLM para interpretação de documentos
- Base de conhecimento técnico pré-configurada
- Respostas contextualizadas sobre normas e procedimentos

## 📁 Estrutura do Módulo

```
vault_ai/
├── components/
│   └── VaultCore.tsx         # Componente principal com interface
├── pages/
│   └── VaultAIPage.tsx       # Página do módulo
├── services/
│   ├── fileIndexer.ts        # Serviço de indexação
│   ├── semanticSearch.ts     # Serviço de busca semântica
│   └── vaultLLM.ts          # Serviço de IA/LLM
├── types/
│   └── index.ts              # Tipos TypeScript
└── index.ts                  # Exports do módulo
```

## 🚀 Uso

### Importação

```typescript
import { VaultCore, VaultAIPage } from "@/modules/vault_ai";
```

### Integração

```typescript
import { VaultCore } from "@/modules/vault_ai";

function MyComponent() {
  return <VaultCore />;
}
```

## 🔧 Serviços

### FileIndexer
Gerencia o catálogo de documentos indexados.

```typescript
const indexer = new FileIndexer();
indexer.indexar("/caminho/documento.pdf");
const documentos = indexer.listar();
```

### SemanticSearch
Realiza buscas contextuais nos documentos.

```typescript
const search = new SemanticSearch(documentos);
const resultados = search.buscar("ASOG");
```

### VaultLLM
Interface de IA para consultas sobre documentação técnica.

```typescript
const llm = new VaultLLM();
const resposta = llm.responder("O que é FMEA?");
```

## 📊 Tópicos IA Disponíveis

- **ASOG** - Aeronautical Study of Obstacle Geometry
- **FMEA** - Failure Mode and Effects Analysis
- **Manual** - Manuais técnicos
- **DP** - Posicionamento Dinâmico
- **SGSO** - Sistema de Gestão de Saúde e Segurança
- **Náutico** - Documentação náutica

## 🔒 Armazenamento

Os dados são armazenados localmente usando `localStorage`:
- Chave: `vault_index_data`
- Formato: JSON com array de documentos e timestamp

## 🛠️ Tecnologias

- React + TypeScript
- Shadcn UI Components
- LocalStorage API
- Semantic Matching Algorithm

## 📝 Logging

Todos os eventos importantes são registrados usando o logger centralizado:
```typescript
import { logger } from "@/lib/logger";
```

## 🎨 UI/UX

- Interface em abas (Indexar, Buscar, Consultar IA)
- Cards com informações detalhadas
- Badges para status e relevância
- Scroll areas para listas longas
- Tema responsivo (light/dark)

## 🔄 Atualizações Futuras

- [ ] Integração com OpenAI para análise avançada
- [ ] OCR para extração de texto de PDFs
- [ ] Versionamento de documentos
- [ ] Sincronização com backend
- [ ] Exportação de índices
- [ ] Busca por conteúdo (full-text)

## 📚 Documentação Adicional

Para mais informações sobre o Nautilus One, consulte a documentação principal do sistema.

---

**Versão:** 1.0.0  
**Última Atualização:** 2025-10-20
