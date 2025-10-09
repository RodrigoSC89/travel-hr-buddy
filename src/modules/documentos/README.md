# Documentos Module

## Purpose / Description

The Documentos (Documents) module provides **comprehensive document management** including storage, organization, sharing, and collaboration on documents throughout the organization.

**Key Use Cases:**
- Upload and store documents
- Organize documents in folders
- Share documents with permissions
- Version control for documents
- Search and filter documents
- Document templates and forms
- Digital signatures and approvals

## Folder Structure

```bash
src/modules/documentos/
├── components/      # Document UI components (DocumentCard, FileUploader, Viewer)
├── pages/           # Document management pages
├── hooks/           # Hooks for document operations
├── services/        # Document storage and retrieval services
├── types/           # TypeScript types for documents and metadata
└── utils/           # Document processing utilities
```

## Main Components / Files

- **DocumentCard.tsx** — Display document preview and metadata
- **FileUploader.tsx** — Drag-and-drop file upload
- **DocumentViewer.tsx** — Preview documents in various formats
- **FolderTree.tsx** — Hierarchical folder structure
- **documentService.ts** — Document CRUD operations
- **storageService.ts** — File storage integration

## External Integrations

- **Supabase Storage** — Document file storage
- **Tesseract.js** — OCR for scanned documents
- **Documentos-IA Module** — AI-powered document processing

## Status

🟢 **Functional** — Document management operational

## TODOs / Improvements

- [ ] Add collaborative editing
- [ ] Implement document versioning UI
- [ ] Add document workflow automation
- [ ] Create document templates library
- [ ] Add advanced search with filters
- [ ] Implement document analytics
- [ ] Add document expiration and archiving
