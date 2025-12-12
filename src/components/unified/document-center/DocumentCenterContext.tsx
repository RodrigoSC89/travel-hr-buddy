/**
import { useContext, useCallback } from "react";;
 * Document Center Context
 * 
 * Provides state management for document operations
 */

import React, { createContext, useContext } from "react";
import type {
  UnifiedDocument,
  DocumentTemplate,
  DocumentFilter,
  DocumentSort,
  DocumentViewMode,
  DocumentCenterConfig,
  DocumentCenterState,
  DocumentAction,
} from "./types";

interface DocumentCenterContextValue extends DocumentCenterState {
  config: DocumentCenterConfig;
  
  // Actions
  uploadDocument: (file: File, metadata: Partial<UnifiedDocument>) => Promise<UnifiedDocument | null>;
  updateDocument: (id: string, updates: Partial<UnifiedDocument>) => Promise<UnifiedDocument | null>;
  deleteDocument: (id: string) => Promise<boolean>;
  downloadDocument: (id: string) => Promise<void>;
  shareDocument: (id: string, users: string[]) => Promise<void>;
  approveDocument: (id: string, comments?: string) => Promise<void>;
  rejectDocument: (id: string, comments?: string) => Promise<void>;
  archiveDocument: (id: string) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  duplicateDocument: (id: string) => Promise<UnifiedDocument | null>;
  
  // Filters & Search
  setFilter: (filter: Partial<DocumentFilter>) => void;
  clearFilter: () => void;
  setSort: (sort: DocumentSort) => void;
  searchDocuments: (term: string) => void;
  
  // View
  setViewMode: (mode: DocumentViewMode) => void;
  
  // Selection
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // Bulk Actions
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkArchive: (ids: string[]) => Promise<void>;
  bulkDownload: (ids: string[]) => Promise<void>;
  
  // Refresh
  refresh: () => Promise<void>;
  
  // Permissions
  canPerformAction: (action: DocumentAction, document?: UnifiedDocument) => boolean;
}

const DocumentCenterContext = createContext<DocumentCenterContextValue | undefined>(undefined);

export const useDocumentCenterContext = memo(() => {
  const context = useContext(DocumentCenterContext);
  if (!context) {
    throw new Error(
      "useDocumentCenterContext must be used within DocumentCenterProvider"
    );
  };
  return context;
};

export default DocumentCenterContext;
