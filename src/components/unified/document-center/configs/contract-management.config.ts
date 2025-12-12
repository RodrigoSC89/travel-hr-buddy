/**
 * Configuration for Contract Management Center
 * 
 * Replaces: src/components/documents/document-management-center.tsx (contract focus)
 */

import { FileCheck } from "lucide-react";
import type { DocumentCenterConfig } from "../types";

export const contractManagementConfig: DocumentCenterConfig = {
  title: "Contract Management Center",
  description: "Manage contracts, certificates, and legal documents",
  icon: <FileCheck className="w-6 h-6" />,
  defaultViewMode: "table",

  // Features
  enableUpload: true,
  enableDownload: true,
  enablePreview: true,
  enableVersioning: true,
  enableApprovals: true,
  enableAnalytics: true,
  enableCollaboration: true,
  enableBulkActions: true,

  // Available options
  availableTypes: [
    "contract",
    "certificate",
    "legal",
    "procedure",
  ],
  availableStatuses: [
    "draft",
    "under_review",
    "approved",
    "active",
    "expired",
    "archived",
  ],
  availableCategories: [
    "Employment Contracts",
    "Service Agreements",
    "Vendor Contracts",
    "Certificates",
    "Legal Documents",
    "Compliance",
  ],

  // Upload settings
  maxFileSize: 10, // 10MB
  acceptedFileTypes: [".pdf", ".docx"],

  // Data source
  dataSource: "supabase",

  // Permissions
  permissionCheck: (action, document) => {
    // Example permission logic
    if (action === "delete" && document?.status === "approved") {
      return false; // Can't delete approved contracts
    }
    return true;
  },

  // UI
  emptyStateMessage: "No contracts found. Upload contracts and legal documents.",
  pageSize: 25,
};
