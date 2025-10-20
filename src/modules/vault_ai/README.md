# 📚 Nautilus Vault Técnico IA

O repositório inteligente do sistema — documentos, manuais, relatórios e pareceres técnicos com leitura semântica, busca contextual e resposta via LLM embarcada.

## 🧩 Estrutura de Arquivos

```
vault_ai/
├── index.ts              # Exports do módulo
├── types.ts              # Definições de tipos TypeScript
├── VaultCore.tsx         # Painel principal do Vault
├── FileIndexer.tsx       # Indexador de documentos
├── SemanticSearch.tsx    # Busca semântica
├── VaultLLM.tsx          # Interface LLM
└── README.md             # Este arquivo
```

## 🎯 Funcionalidades

### 1. 📂 Indexador de Documentos (FileIndexer)
Responsável por catalogar e registrar documentos (PDF, DOCX, TXT).

**Recursos:**
- Adicionar documentos ao índice
- Listar documentos indexados
- Remover documentos do índice
- Suporte a múltiplos tipos de arquivo
- Armazenamento local (localStorage)

### 2. 🔍 Busca Semântica (SemanticSearch)
Busca contextual com correspondência semântica (base vetorizada local).

**Recursos:**
- Busca fuzzy com algoritmo de similaridade
- Ranking de relevância
- Filtros por tipo de documento
- Resultados contextualizados

### 3. 🧠 LLM Interface (VaultLLM)
Interface de IA embarcada – interpreta e responde sobre conteúdo técnico.

**Recursos:**
- Consultas sobre documentos técnicos
- Contextos pré-definidos (ASOG, FMEA, Manuais, DP, SGSO)
- Histórico de conversas
- Respostas contextualizadas

## 🔱 Integração no Sistema

### No NautilusOne.tsx
```typescript
import { VaultCore } from "@/modules/vault_ai";

// Adicionar na aba de módulos
<TabsContent value="vault">
  <VaultCore />
</TabsContent>
```

## 📊 Tipos de Dados

### DocumentIndex
```typescript
interface DocumentIndex {
  id: string;
  nome: string;
  caminho: string;
  tipo: "PDF" | "DOCX" | "TXT" | "outros";
  dataIndexacao: string;
  tamanho?: number;
}
```

### SearchResult
```typescript
interface SearchResult {
  documento: DocumentIndex;
  relevancia: number;
  contexto?: string;
}
```

### VaultContext
```typescript
interface VaultContext {
  chave: string;
  conteudo: string;
  categoria: string;
}
```

## 🚀 Como Usar

1. **Indexar Documentos:**
   - Navegue até a aba "Indexar"
   - Clique em "Adicionar Documento"
   - Digite o caminho do arquivo
   - Clique em "Indexar Documento"

2. **Buscar Documentos:**
   - Navegue até a aba "Buscar"
   - Digite um termo de busca
   - Clique em "Buscar"
   - Visualize os resultados com ranking de relevância

3. **Consultar IA:**
   - Navegue até a aba "IA"
   - Digite uma pergunta sobre documentos técnicos
   - Clique em "Enviar"
   - Visualize a resposta contextualizada

## 📦 Armazenamento

Os dados são armazenados localmente usando `localStorage`:
- Chave: `nautilus_vault_index`
- Formato: JSON Array de DocumentIndex

## 🔒 Segurança

- Dados armazenados apenas no navegador do usuário
- Sem envio de dados para servidores externos
- Logging seguro com o sistema centralizado

## 🎨 UI/UX

- Interface responsiva com Tailwind CSS
- Componentes ShadcN UI
- Tema dark mode compatível
- Ícones Lucide React
- Badges coloridos para status

## ✅ Status

- [x] Implementação completa dos módulos
- [x] Interface de usuário
- [x] Integração com logger
- [x] Armazenamento local
- [x] Busca semântica
- [x] LLM Interface
- [x] Documentação

## 📝 Notas de Desenvolvimento

- Baseado no design original em Python
- Adaptado para TypeScript/React
- Integrado ao ecossistema Nautilus One
- Usa componentes e padrões existentes no projeto
