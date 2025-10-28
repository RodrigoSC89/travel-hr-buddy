# Document Hub Module

## 📋 Overview

**Version**: 91.1  
**Category**: Documents  
**Route**: `/dashboard/document-hub`  
**Status**: Active (100%)

Central document management system with AI integration for storage, organization, and retrieval.

## 🎯 Objectives

- Centralized document storage and management
- AI-powered document search and categorization
- Version control and history tracking
- Access control and permissions
- Document preview and export

## 🏗️ Architecture

### Component Structure
```
document-hub/
├── index.tsx               # Main document hub interface
├── components/            # Document management UI
├── services/              # Document operations
└── hooks/                 # Document data hooks
```

## 💾 Database Schema

### documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255),
  file_path TEXT,
  file_type VARCHAR(50),
  file_size BIGINT,
  category VARCHAR(100),
  description TEXT,
  tags TEXT[],
  uploaded_by UUID REFERENCES users(id),
  version INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### document_permissions
```sql
CREATE TABLE document_permissions (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  user_id UUID REFERENCES users(id),
  permission_type VARCHAR(20), -- 'read', 'write', 'admin'
  granted_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 Key Features

- **Upload Management**: Support for multiple file formats
- **Search & Filter**: Full-text search with advanced filters
- **Categories & Tags**: Flexible organization system
- **Preview**: In-browser document preview
- **Export**: Download in various formats
- **Versioning**: Track document changes over time
- **AI Integration**: Smart categorization and search

## 🚀 Usage Examples

```typescript
import DocumentHub from '@/modules/document-hub';

function App() {
  return <DocumentHub />;
}
```

### Document Operations
```typescript
// Upload document
await uploadDocument(file, metadata);

// Search documents
const results = await searchDocuments(query, filters);

// Get document by ID
const doc = await getDocument(documentId);

// Update document
await updateDocument(documentId, updates);
```

## 🔗 Dependencies

- `@/components/ui/*` - UI components
- `@/integrations/supabase/client` - Database client
- AI Services - For document analysis

## 📚 Related Documentation

- [Documents AI README](../documents/documents-ai/README.md)
- [Compliance Hub README](../compliance-hub/README.md)
- [Module Overview](/dev/docs/MODULES_OVERVIEW.md)

---

**Last Updated**: 2025-10-28  
**Version**: 91.1  
**Status**: Fully implemented with Supabase integration
