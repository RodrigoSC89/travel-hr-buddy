# Document Hub - PATCH 91.0

## 📦 Overview

Document Hub é o módulo unificado de gestão de documentos do Nautilus One, consolidando as funcionalidades dos antigos módulos `documents`, `document-ai` e `pdf-processor`.

## 🎯 Funcionalidades

### ✅ Upload e Armazenamento
- Upload de arquivos PDF e DOCX (até 10MB)
- Drag-and-drop interface
- Armazenamento seguro no Supabase Storage
- Metadados armazenados em banco de dados

### 🧠 Análise por IA
- Integração com `runAIContext("document-ai")`
- Extração automática de:
  - Sumário do documento
  - Tópicos principais
  - Status de validade (CNPJ, datas de vencimento, termos)
  - Informações importantes

### 📊 Interface
- Lista de documentos com filtros
- Preview de PDFs inline
- Painel lateral com detalhes completos
- Badges de status de validade
- Download e exclusão de documentos

### 🔐 Segurança e Logs
- Autenticação via Supabase Auth
- Logs técnicos de upload, leitura e falhas
- Validação de tipos de arquivo
- Controle de tamanho de upload

### 🛡️ Fallback
- Tratamento de erros em uploads
- Fallback para documentos ilegíveis
- Análise simplificada quando IA não está disponível

## 📁 Estrutura

```
src/modules/document-hub/
├── index.tsx                    # Página principal
├── types/
│   └── index.ts                # Tipos TypeScript
├── services/
│   ├── supabase.ts             # Integração Supabase
│   └── ai.ts                   # Serviço de análise IA
├── hooks/
│   └── useDocumentHub.ts       # Hook React customizado
└── components/
    ├── DocumentUpload.tsx      # Componente de upload
    ├── DocumentList.tsx        # Lista de documentos
    └── DocumentViewer.tsx      # Visualizador lateral
```

## 🚀 Como Usar

### 1. Adicionar na aplicação

O módulo já está registrado no `MODULE_REGISTRY` e pode ser acessado via rota:

```
/dashboard/document-hub
```

### 2. Usar o hook

```tsx
import { useDocumentHub } from '@/modules/document-hub/hooks/useDocumentHub';

function MyComponent() {
  const {
    documents,
    isLoading,
    handleUpload,
    handleDelete,
    selectedDocument,
  } = useDocumentHub();
  
  // ...
}
```

### 3. Upload de documentos

```tsx
const handleFileUpload = async (file: File) => {
  const result = await handleUpload(file);
  if (result) {
    console.log('Documento carregado:', result);
  }
};
```

## 🗄️ Schema Supabase

### Tabela: `document_metadata`

```sql
create table document_metadata (
  doc_id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users not null,
  filename text not null,
  file_size bigint not null,
  file_type text not null,
  storage_url text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone,
  ai_summary text,
  ai_topics text[],
  validity_status text check (validity_status in ('valid', 'expired', 'expiring_soon', 'invalid')),
  validation_details jsonb
);
```

### Bucket: `documents`

- Público (public URL)
- Limite de tamanho: 10MB por arquivo

## 🧪 Testes

Testes disponíveis em:
```
src/tests/modules/document-hub.test.ts
```

## 📝 Módulos Legados

Os seguintes módulos foram movidos para `/legacy/documents/`:
- `documents-ai/` - Placeholder básico
- `templates/` - Gerenciamento de templates
- `lib/documents/` - API de documentos antiga
- `lib/pdf/` - Utilitários PDF antigos

## 🔄 Migração

Para migrar de módulos antigos:

1. Atualizar imports:
```tsx
// Antes
import { DocumentsAI } from '@/modules/documents/documents-ai/DocumentsAI';

// Depois
import DocumentHub from '@/modules/document-hub';
```

2. Usar nova API:
```tsx
// Antes
import { createDocument } from '@/lib/documents/api';

// Depois
import { uploadDocument } from '@/modules/document-hub/services/supabase';
```

## 🎨 Tecnologias

- React + TypeScript
- Supabase (Storage + Database)
- AI Kernel (`runAIContext`)
- Shadcn/ui components
- date-fns (formatação de datas)
- Lucide React (ícones)

## 📄 Licença

Parte do projeto Nautilus One - Travel HR Buddy
