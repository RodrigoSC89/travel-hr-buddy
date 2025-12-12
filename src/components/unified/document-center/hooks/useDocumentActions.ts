/**
 * useDocumentActions Hook
 * 
 * Provides document-specific actions with enhanced functionality
 */

import { useCallback } from "react";
import { useDocumentCenterContext } from "../DocumentCenterContext";
import type { UnifiedDocument, DocumentAction } from "../types";

export const useDocumentActions = (document?: UnifiedDocument) => {
  const {
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
    canPerformAction,
  } = useDocumentCenterContext();

  const canPerform = useCallback(
    (action: DocumentAction) => {
      return canPerformAction(action, document);
    },
    [canPerformAction, document]
  );

  const handleUpload = useCallback(
    async (file: File, metadata: Partial<UnifiedDocument>) => {
      if (!canPerform("upload")) {
        throw new Error("Not authorized to upload documents");
      }
      return uploadDocument(file, metadata);
    },
    [uploadDocument, canPerform]
  );

  const handleUpdate = useCallback(
    async (updates: Partial<UnifiedDocument>) => {
      if (!document || !canPerform("edit")) {
        throw new Error("Not authorized to edit this document");
      }
      return updateDocument(document.id, updates);
    },
    [document, updateDocument, canPerform]
  );

  const handleDelete = useCallback(async () => {
    if (!document || !canPerform("delete")) {
      throw new Error("Not authorized to delete this document");
    }
    return deleteDocument(document.id);
  }, [document, deleteDocument, canPerform]);

  const handleDownload = useCallback(async () => {
    if (!document || !canPerform("download")) {
      throw new Error("Not authorized to download this document");
    }
    return downloadDocument(document.id);
  }, [document, downloadDocument, canPerform]);

  const handleShare = useCallback(
    async (users: string[]) => {
      if (!document || !canPerform("share")) {
        throw new Error("Not authorized to share this document");
      }
      return shareDocument(document.id, users);
    },
    [document, shareDocument, canPerform]
  );

  const handleApprove = useCallback(
    async (comments?: string) => {
      if (!document || !canPerform("approve")) {
        throw new Error("Not authorized to approve this document");
      }
      return approveDocument(document.id, comments);
    },
    [document, approveDocument, canPerform]
  );

  const handleReject = useCallback(
    async (comments?: string) => {
      if (!document || !canPerform("reject")) {
        throw new Error("Not authorized to reject this document");
      }
      return rejectDocument(document.id, comments);
    },
    [document, rejectDocument, canPerform]
  );

  const handleArchive = useCallback(async () => {
    if (!document || !canPerform("archive")) {
      throw new Error("Not authorized to archive this document");
    }
    return archiveDocument(document.id);
  }, [document, archiveDocument, canPerform]);

  const handleRestore = useCallback(async () => {
    if (!document) {
      throw new Error("No document to restore");
    }
    return restoreDocument(document.id);
  }, [document, restoreDocument]);

  const handleDuplicate = useCallback(async () => {
    if (!document) {
      throw new Error("No document to duplicate");
    }
    return duplicateDocument(document.id);
  }, [document, duplicateDocument]);

  return {
    canPerform,
    upload: handleUpload,
    update: handleUpdate,
    delete: handleDelete,
    download: handleDownload,
    share: handleShare,
    approve: handleApprove,
    reject: handleReject,
    archive: handleArchive,
    restore: handleRestore,
    duplicate: handleDuplicate,
  };
};
