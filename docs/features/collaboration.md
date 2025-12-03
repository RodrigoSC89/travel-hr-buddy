# Colaboração

## Visão Geral

Ferramentas para trabalho em equipe com edição em tempo real, comentários e notificações.

## Componentes

### Editor Colaborativo (`src/modules/collaboration/`)

Edição simultânea usando Yjs:
- Sincronização em tempo real
- Cursores de outros usuários
- Resolução de conflitos
- Offline-first

```typescript
import { useCollaboration } from "@/modules/collaboration";

const { provider, awareness, doc } = useCollaboration({
  documentId: "doc-123",
  userId: user.id
});
```

### Comentários

Sistema de comentários em documentos:
- Threads de discussão
- Menções (@user)
- Reações
- Resoluções

### Notificações

Alertas de atividades:
- In-app notifications
- Push notifications
- Email digest

## Funcionalidades

### 1. Edição em Tempo Real

Baseado em:
- **Yjs**: CRDT para sincronização
- **WebRTC**: P2P quando possível
- **Supabase Realtime**: Fallback

### 2. Awareness

Veja quem está online:
- Cursores coloridos
- Lista de usuários ativos
- Status de presença

### 3. Histórico de Atividades

Log completo de ações:
- Quem editou o quê
- Quando foi alterado
- Versões anteriores

## Implementação

### Setup do Provider

```typescript
// Em useCollaboration.ts
const ydoc = new Y.Doc();
const provider = new WebrtcProvider("doc-" + documentId, ydoc, {
  signaling: [SIGNALING_SERVER]
});

const awareness = provider.awareness;
awareness.setLocalStateField("user", {
  name: user.name,
  color: userColor
});
```

### Sincronização com Banco

```typescript
// Salvar estado do documento
const saveDocument = async () => {
  const content = Y.encodeStateAsUpdate(ydoc);
  await supabase
    .from("documents")
    .update({ content: Array.from(content) })
    .eq("id", documentId);
};
```

## Eventos Realtime

```typescript
// Subscribe a mudanças
const channel = supabase
  .channel("document-" + documentId)
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "document_comments",
    filter: `document_id=eq.${documentId}`
  }, handleCommentChange)
  .subscribe();
```
