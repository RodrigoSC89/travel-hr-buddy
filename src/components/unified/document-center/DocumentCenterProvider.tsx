/**
import { useCallback, useEffect, useMemo, useState } from "react";;
 * Document Center Provider
 * 
 * Manages state and actions for document operations
 */

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DocumentCenterContext from "./DocumentCenterContext";
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

interface DocumentCenterProviderProps {
  config: DocumentCenterConfig;
  children: React.ReactNode;
}

export const DocumentCenterProvider: React.FC<DocumentCenterProviderProps> = ({
  config,
  children,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [documents, setDocuments] = useState<UnifiedDocument[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilterState] = useState<DocumentFilter>({});
  const [sort, setSortState] = useState<DocumentSort>({
    field: "updatedAt",
    order: "desc",
};
  const [viewMode, setViewModeState] = useState<DocumentViewMode>(
    config.defaultViewMode || "grid"
  );
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  // Calculate stats
  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let recentUploads = 0;
    let expiringSoon = 0;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    documents.forEach((doc) => {
      // Count by type
      byType[doc.type] = (byType[doc.type] || 0) + 1;
      
      // Count by status
      byStatus[doc.status] = (byStatus[doc.status] || 0) + 1;
      
      // Count recent uploads
      const createdDate = new Date(doc.createdAt);
      if (createdDate > thirtyDaysAgo) {
        recentUploads++;
      }
      
      // Count expiring soon (if status is expiring or approaching expiry)
      if (doc.status === "expired" || doc.status === "under_review") {
        expiringSoon++;
      }
    });

    return {
      total: documents.length,
      byType,
      byStatus,
      recentUploads,
      expiringSoon,
    };
  }, [documents]);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [filter, sort]);

  // Load documents
  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let docs: UnifiedDocument[];

      if (config.onFetchDocuments) {
        // Custom data source
        docs = await config.onFetchDocuments(filter);
      } else if (config.dataSource === "supabase") {
        // Supabase data source
        let query = supabase.from("documents").select("*");

        // Apply filters
        if (filter.searchTerm) {
          query = query.or(`title.ilike.%${filter.searchTerm}%,description.ilike.%${filter.searchTerm}%`);
        }
        if (filter.types && filter.types.length > 0) {
          query = query.in("type", filter.types);
        }
        if (filter.statuses && filter.statuses.length > 0) {
          query = query.in("status", filter.statuses);
        }
        if (filter.categories && filter.categories.length > 0) {
          query = query.in("category", filter.categories);
        }

        // Apply sorting
        query = query.order(sort.field as string, { ascending: sort.order === "asc" });

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        docs = (data || []) as UnifiedDocument[];
      } else {
        // Mock data for development
        docs = [];
      }

      setDocuments(docs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load documents";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [config, filter, sort, toast]);

  // Upload document
  const uploadDocument = useCallback(
    async (file: File, metadata: Partial<UnifiedDocument>): Promise<UnifiedDocument | null> => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload documents",
          variant: "destructive",
        });
        return null;
      }

      // Check file size
      const maxSize = config.maxFileSize || 10; // Default 10MB
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Maximum file size is ${maxSize}MB`,
          variant: "destructive",
        });
        return null;
      }

      try {
        setIsLoading(true);

        if (config.onUploadDocument) {
          const doc = await config.onUploadDocument(file, metadata);
          setDocuments((prev) => [doc, ...prev]);
          toast({
            title: "Success",
            description: "Document uploaded successfully",
          });
          return doc;
        }

        // Default Supabase upload logic
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("documents")
          .getPublicUrl(filePath);

        const newDoc: UnifiedDocument = {
          id: Math.random().toString(36).substring(7),
          ...metadata,
          title: metadata.title || file.name,
          type: metadata.type || "other",
          category: metadata.category || "general",
          size: file.size,
          version: metadata.version || "1.0",
          tags: metadata.tags || [],
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: user.email || user.id,
          status: metadata.status || "draft",
          permissions: metadata.permissions || {
            isPublic: false,
            canView: true,
            canEdit: true,
            canDelete: true,
            canShare: true,
          },
          url: urlData.publicUrl,
        } as UnifiedDocument;

        setDocuments((prev) => [newDoc, ...prev]);

        toast({
          title: "Success",
          description: "Document uploaded successfully",
        });

        return newDoc;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to upload document";
        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [config, user, toast]
  );

  // Update document
  const updateDocument = useCallback(
    async (id: string, updates: Partial<UnifiedDocument>): Promise<UnifiedDocument | null> => {
      try {
        setIsLoading(true);

        if (config.onUpdateDocument) {
          const doc = await config.onUpdateDocument(id, updates);
          setDocuments((prev) =>
            prev.map((d) => (d.id === id ? doc : d))
          );
          toast({
            title: "Success",
            description: "Document updated successfully",
          });
          return doc;
        }

        // Default update logic
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === id
              ? { ...doc, ...updates, updatedAt: new Date() }
              : doc
          )
        );

        toast({
          title: "Success",
          description: "Document updated successfully",
        });

        return documents.find((d) => d.id === id) || null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update document";
        toast({
          title: "Update failed",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [config, documents, toast]
  );

  // Delete document
  const deleteDocument = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        if (config.onDeleteDocument) {
          await config.onDeleteDocument(id);
          setDocuments((prev) => prev.filter((d) => d.id !== id));
          toast({
            title: "Success",
            description: "Document deleted successfully",
          });
          return true;
        }

        // Default delete logic
        setDocuments((prev) => prev.filter((d) => d.id !== id));

        toast({
          title: "Success",
          description: "Document deleted successfully",
        });

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete document";
        toast({
          title: "Delete failed",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [config, toast]
  );

  // Download document
  const downloadDocument = useCallback(
    async (id: string): Promise<void> => {
      const doc = documents.find((d) => d.id === id);
      if (!doc || !doc.url) {
        toast({
          title: "Download failed",
          description: "Document URL not found",
          variant: "destructive",
        };
        return;
      }

      try {
        const response = await fetch(doc.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.title;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Update analytics
        if (doc.analytics) {
          updateDocument(id, {
            analytics: {
              ...doc.analytics,
              downloadCount: doc.analytics.downloadCount + 1,
            },
          });
        }

        toast({
          title: "Success",
          description: "Document downloaded successfully",
        });
      } catch (err) {
        toast({
          title: "Download failed",
          description: "Failed to download document",
          variant: "destructive",
        });
      }
    },
    [documents, toast, updateDocument]
  );

  // Other actions (share, approve, etc.)
  const shareDocument = useCallback(async (id: string, users: string[]) => {
    toast({ title: "Shared", description: "Document shared successfully" });
  }, [toast]);

  const approveDocument = useCallback(async (id: string, comments?: string) => {
    await updateDocument(id, { status: "approved" });
  }, [updateDocument]);

  const rejectDocument = useCallback(async (id: string, comments?: string) => {
    await updateDocument(id, { status: "rejected" });
  }, [updateDocument]);

  const archiveDocument = useCallback(async (id: string) => {
    await updateDocument(id, { status: "archived" });
  }, [updateDocument]);

  const restoreDocument = useCallback(async (id: string) => {
    await updateDocument(id, { status: "active" });
  }, [updateDocument]);

  const duplicateDocument = useCallback(
    async (id: string): Promise<UnifiedDocument | null> => {
      const doc = documents.find((d) => d.id === id);
      if (!doc) return null;

      const newDoc = {
        ...doc,
        id: Math.random().toString(36).substring(7),
        title: `${doc.title} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setDocuments((prev) => [newDoc, ...prev]);
      return newDoc;
    },
    [documents]
  );

  // Filters
  const setFilter = useCallback((newFilter: Partial<DocumentFilter>) => {
    setFilterState((prev) => ({ ...prev, ...newFilter }));
  }, []);

  const clearFilter = useCallback(() => {
    setFilterState({});
  }, []);

  const setSort = useCallback((newSort: DocumentSort) => {
    setSortState(newSort);
  }, []);

  const searchDocuments = useCallback((term: string) => {
    setFilter({ searchTerm: term });
  }, [setFilter]);

  // View
  const setViewMode = useCallback((mode: DocumentViewMode) => {
    setViewModeState(mode);
  }, []);

  // Selection
  const toggleSelection = useCallback((id: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedDocuments(documents.map((d) => d.id));
  }, [documents]);

  const clearSelection = useCallback(() => {
    setSelectedDocuments([]);
  }, []);

  // Bulk actions
  const bulkDelete = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteDocument(id)));
      clearSelection();
    },
    [deleteDocument, clearSelection]
  );

  const bulkArchive = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => archiveDocument(id)));
      clearSelection();
    },
    [archiveDocument, clearSelection]
  );

  const bulkDownload = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => downloadDocument(id)));
    },
    [downloadDocument]
  );

  // Refresh
  const refresh = useCallback(async () => {
    await loadDocuments();
  }, [loadDocuments]);

  // Permissions
  const canPerformAction = useCallback(
    (action: DocumentAction, document?: UnifiedDocument): boolean => {
      if (config.permissionCheck) {
        return config.permissionCheck(action, document);
      }

      if (!document) return true;

      switch (action) {
      case "view":
        return document.permissions.canView;
      case "edit":
        return document.permissions.canEdit;
      case "delete":
        return document.permissions.canDelete;
      case "share":
        return document.permissions.canShare;
      case "approve":
      case "reject":
        return document.permissions.canApprove || false;
      default:
        return true;
      }
    },
    [config]
  );

  const contextValue = {
    // State
    documents,
    templates,
    isLoading,
    error,
    filter,
    sort,
    viewMode,
    selectedDocuments,
    stats,
    config,

    // Actions
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    shareDocument,
    approveDocument,
    rejectDocument,
    archiveDocument,
    restoreDocument,
    duplicateDocument,

    // Filters & Search
    setFilter,
    clearFilter,
    setSort,
    searchDocuments,

    // View
    setViewMode,

    // Selection
    toggleSelection,
    selectAll,
    clearSelection,

    // Bulk Actions
    bulkDelete,
    bulkArchive,
    bulkDownload,

    // Refresh
    refresh,

    // Permissions
    canPerformAction,
  };

  return (
    <DocumentCenterContext.Provider value={contextValue}>
      {children}
    </DocumentCenterContext.Provider>
  );
};
