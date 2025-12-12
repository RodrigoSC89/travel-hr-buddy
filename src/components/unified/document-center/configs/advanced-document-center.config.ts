/**
 * Configuration for Advanced Document Center
 * 
 * Replaces: src/components/documents/advanced-document-center.tsx
 */

import { FileText } from "lucide-react";
import type { DocumentCenterConfig } from "../types";

export const advancedDocumentCenterConfig: DocumentCenterConfig = {
  title: "Advanced Document Center",
  description: "Manage all your documents with advanced features",
  icon: <FileText className="w-6 h-6" />,
  defaultViewMode: "grid",

  // Features
  enableUpload: true,
  enableDownload: true,
  enablePreview: true,
  enableVersioning: true,
  enableTemplates: true,
  enableApprovals: true,
  enableAnalytics: true,
  enableCollaboration: true,
  enableBulkActions: true,

  // Available options
  availableTypes: [
    "pdf",
    "docx",
    "xlsx",
    "pptx",
    "image",
    "video",
    "other",
  ],
  availableStatuses: [
    "draft",
    "review",
    "approved",
    "archived",
    "rejected",
  ],
  availableCategories: [
    "General",
    "Legal",
    "Financial",
    "HR",
    "Operations",
    "Technical",
    "Marketing",
  ],

  // Upload settings
  maxFileSize: 50, // 50MB
  acceptedFileTypes: [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".mp4",
    ".mov",
  ],

  // Data source
  dataSource: "supabase",

  // UI
  emptyStateMessage: "No documents yet. Upload your first document to get started.",
  pageSize: 20,
};
