# Vault AI Module

## Purpose / Description

The **Vault Técnico IA** (Technical AI Vault) module provides an **intelligent document repository system** with semantic search, document indexing, and AI-powered document interpretation for technical documentation.

**Key Use Cases:**
- Technical document cataloging and indexing
- Semantic search across document repositories
- AI-powered document interpretation and Q&A
- Technical standards consultation (ASOG, FMEA, IMCA, SGSO, MTS)
- Compliance documentation management

## Folder Structure

```bash
src/modules/vault_ai/
├── components/      # UI components
│   ├── VaultCore.tsx         # Main dashboard and menu
│   ├── FileIndexer.tsx       # Document indexing interface
│   ├── SemanticSearch.tsx    # Semantic search interface
│   └── LLMInterface.tsx      # AI chat interface
├── services/        # Business logic services
│   └── vaultStorage.ts       # Document storage management
├── types/           # TypeScript type definitions
│   └── index.ts              # Type definitions
└── README.md        # This file
```

## Main Components / Files

### Components

- **VaultCore.tsx** — Main dashboard with menu and navigation
- **FileIndexer.tsx** — Document cataloging and registration (PDF, DOCX, TXT)
- **SemanticSearch.tsx** — Semantic search with fuzzy matching
- **LLMInterface.tsx** — Embedded AI interface for technical document Q&A

### Services

- **vaultStorage.ts** — Local storage management for document index
  - Load/save document index
  - Add/remove documents
  - Search and retrieve documents

### Types

- **VaultDocument** — Document metadata structure
- **SearchResult** — Search result with relevance score
- **LLMContext** — AI context for document interpretation
- **VaultIndexData** — Full index data structure

## Technical Features

### 1. Document Indexer
- Add technical documents with metadata
- Support for multiple file types (PDF, DOCX, TXT, etc.)
- Automatic timestamp and ID generation
- Document removal and management

### 2. Semantic Search
- Fuzzy matching algorithm for document names and paths
- Relevance scoring (0-100%)
- Top 5 results with sorting by relevance
- Cutoff threshold of 20% for filtering

### 3. LLM Interface
- Context-aware responses for technical documents
- Pre-configured knowledge base for:
  - ASOG (Aviation Safety Operations Guide)
  - FMEA (Failure Mode and Effects Analysis)
  - IMCA (International Marine Contractors Association)
  - SGSO (Safety Management System)
  - MTS (Marine Technology Society)
- Chat interface with message history
- Real-time response generation

## Data Storage

Documents are stored in `localStorage` with the following structure:

```json
{
  "documentos": [
    {
      "id": "uuid",
      "nome": "Manual_FMEA_2024.pdf",
      "caminho": "/vault/manuais/fmea.pdf",
      "tipo": "PDF",
      "dataIndexacao": "2024-01-01T00:00:00.000Z"
    }
  ],
  "versao": "1.0.0",
  "ultimaAtualizacao": "2024-01-01T00:00:00.000Z"
}
```

## External Integrations

- **Logger** — Centralized logging utility from `@/lib/logger`
- **Sonner** — Toast notifications
- **Framer Motion** — Animations
- **Radix UI** — UI components

## Status

🟢 **Functional** — AI document vault operational

## Usage Example

```tsx
import { VaultCore } from "@/modules/vault_ai";

function App() {
  return <VaultCore />;
}
```

## Routes

Add to your router:

```tsx
<Route path="/vault-ai" element={<VaultCore />} />
```

## TODOs / Improvements

- [ ] Integrate with actual file storage (Supabase Storage)
- [ ] Add OCR for scanned documents
- [ ] Implement full-text search in document content
- [ ] Add document versioning
- [ ] Implement document sharing and permissions
- [ ] Add export functionality for search results
- [ ] Integrate with OpenAI API for enhanced AI responses
- [ ] Add support for document annotations
- [ ] Implement document comparison features
- [ ] Add batch document processing

## Related Modules

- **Documentos** — General document management
- **Documentos IA** — AI-powered document processing
- **Assistente IA** — General AI assistant

## Technical Standards Supported

- ✅ ASOG (Aviation Safety Operations Guide)
- ✅ FMEA (Failure Mode and Effects Analysis)
- ✅ IMCA (International Marine Contractors Association)
- ✅ SGSO (Sistema de Gestão de Segurança Operacional)
- ✅ MTS (Marine Technology Society)
