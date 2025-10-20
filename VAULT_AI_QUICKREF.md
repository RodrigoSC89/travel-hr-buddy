# Nautilus Vault Técnico IA - Quick Reference

## 🚀 Quick Start

### Access the Module
1. Navigate to `/vault-ai` in your browser
2. Or click the "Vault Técnico IA" card from the modules grid (IA category)

### Main Features
- **📂 Indexar Documentos**: Add and manage technical documents
- **🔎 Buscar Documentos**: Search with semantic matching
- **🧠 Consultar IA**: Ask questions about technical documents

## 📖 API Quick Reference

### Add Document
```typescript
import { addDocument } from "@/modules/vault_ai/services/vaultStorage";

const doc = addDocument(
  "Document Name",
  "/path/to/file.pdf",
  "PDF",          // Optional: auto-detected
  ["tag1", "tag2"] // Optional
);
```

### Search Documents
```typescript
import { searchDocuments } from "@/modules/vault_ai/services/vaultStorage";

const results = searchDocuments("query");
// Returns: VaultDocument[] with matching documents
```

### Get Statistics
```typescript
import { getStatistics } from "@/modules/vault_ai/services/vaultStorage";

const stats = getStatistics();
// Returns: { totalDocuments, documentsByType, mostRecentDocument, oldestDocument }
```

### Remove Document
```typescript
import { removeDocument } from "@/modules/vault_ai/services/vaultStorage";

const success = removeDocument(documentId);
// Returns: boolean
```

### Get All Documents
```typescript
import { getAllDocuments } from "@/modules/vault_ai/services/vaultStorage";

const docs = getAllDocuments();
// Returns: VaultDocument[]
```

### Clear Vault
```typescript
import { clearVault } from "@/modules/vault_ai/services/vaultStorage";

clearVault();
// Removes all documents
```

## 🎯 Technical Contexts

The AI assistant automatically detects these contexts from keywords:

| Context | Keywords | Description |
|---------|----------|-------------|
| ASOG | asog, servicing | Aircraft Servicing and Operating Guidelines |
| FMEA | fmea, failure mode | Failure Mode and Effects Analysis |
| IMCA | imca, marine contractor | International Marine Contractors Association |
| SGSO | sgso, segurança operacional | Safety Management System |
| MTS | mts, manual técnico | Technical System Manuals |
| GENERAL | (default) | General technical inquiries |

## 📊 Storage Details

- **Storage Type**: LocalStorage
- **Storage Key**: `vault_index`
- **Version**: 1.0.0
- **Max Size**: Browser dependent (typically 5-10MB)

## 🧪 Testing

Run tests:
```bash
npm run test src/tests/modules/vault_ai/vaultStorage.test.ts
```

All 28 tests should pass ✅

## 🔧 File Type Auto-Detection

Supported extensions:
- **PDF**: .pdf
- **Word**: .doc, .docx
- **Excel**: .xls, .xlsx
- **PowerPoint**: .ppt, .pptx
- **Text**: .txt
- **Markdown**: .md
- **Unknown**: Other extensions

## 📝 Data Structure

### VaultDocument
```typescript
{
  id: string;           // UUID v4
  nome: string;         // Document name
  caminho: string;      // File path/URL
  tipo?: string;        // File type
  tags?: string[];      // Optional tags
  dataIndexacao: string; // ISO-8601 timestamp
}
```

### VaultIndex
```typescript
{
  version: string;      // "1.0.0"
  documents: VaultDocument[];
  lastUpdated: string;  // ISO-8601 timestamp
}
```

### SearchResult
```typescript
{
  ...VaultDocument,
  relevance: number;    // 0-100 score
}
```

## 🎨 UI Components

### VaultCore
- Main dashboard with card-based navigation
- No props required

### FileIndexer
```typescript
<FileIndexer onBack={() => void} />
```

### SemanticSearch
```typescript
<SemanticSearch onBack={() => void} />
```

### LLMInterface
```typescript
<LLMInterface onBack={() => void} />
```

## 🔍 Search Tips

1. **Name Search**: Most relevant (100% score)
2. **Path Search**: Highly relevant (60% score)
3. **Tag Search**: Relevant (70% score)
4. **Partial Match**: Moderate relevance (0-50% score)
5. Use multiple keywords for better results
6. Search is case-insensitive

## 📊 Relevance Scoring

- **80-100%**: High relevance (green badge)
- **60-79%**: Medium relevance (secondary badge)
- **0-59%**: Low relevance (outline badge)

## 🚨 Error Handling

All operations include error handling:
- Duplicate prevention
- Corrupted data recovery
- Storage quota exceeded
- Input validation

## 📱 Responsive Design

Works on:
- Desktop (1920x1080+)
- Tablet (768x1024)
- Mobile (320x568+)

## ⌨️ Keyboard Support

- Tab navigation through forms
- Enter to submit
- Esc to close modals (future feature)

## 🔐 Security Notes

- Client-side storage only
- No sensitive data transmitted
- Path-based duplicate detection
- Input sanitization

## 📚 Documentation

- **Module README**: `src/modules/vault_ai/README.md`
- **Implementation Summary**: `VAULT_AI_IMPLEMENTATION_SUMMARY.md`
- **This Guide**: `VAULT_AI_QUICKREF.md`

## 🐛 Known Limitations

1. LocalStorage size limits (5-10MB)
2. No actual file upload (paths only)
3. No server-side persistence
4. No real LLM integration (template responses)
5. No OCR capabilities

## 💡 Best Practices

1. Use descriptive document names
2. Add relevant tags for better searchability
3. Use consistent path formats
4. Regular backups (export to JSON)
5. Clear old documents periodically

## 🔄 Migration

When upgrading:
1. Version automatically detected
2. Data migrated on first load
3. No manual intervention needed

## 📞 Support

For issues or questions:
- Check the full README
- Review implementation summary
- Check test suite for examples
- Review component source code

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-20  
**Status**: Production Ready ✅
