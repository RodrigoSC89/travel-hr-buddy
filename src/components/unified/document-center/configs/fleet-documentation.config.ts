/**
 * Configuration for Fleet Documentation Center
 * 
 * Replaces: src/components/fleet/documentation-center.tsx
 */

import { Ship } from "lucide-react";
import type { DocumentCenterConfig } from "../types";

export const fleetDocumentationConfig: DocumentCenterConfig = {
  title: "Fleet Documentation Center",
  description: "Manage fleet-related documents and manuals",
  icon: <Ship className="w-6 h-6" />,
  defaultViewMode: "list",

  // Features
  enableUpload: true,
  enableDownload: true,
  enablePreview: true,
  enableVersioning: true,
  enableApprovals: false,
  enableAnalytics: true,
  enableBulkActions: true,

  // Available options
  availableTypes: [
    "manual",
    "procedure",
    "report",
    "certificate",
    "safety",
    "pdf",
  ],
  availableStatuses: [
    "active",
    "under_review",
    "expired",
    "archived",
  ],
  availableCategories: [
    "Safety Manuals",
    "Operating Procedures",
    "Maintenance Records",
    "Certificates",
    "Inspection Reports",
    "Training Materials",
  ],

  // Upload settings
  maxFileSize: 25, // 25MB
  acceptedFileTypes: [".pdf", ".doc", ".docx"],

  // Data source
  dataSource: "supabase",

  // UI
  emptyStateMessage: "No fleet documents found. Add manuals and procedures to get started.",
  pageSize: 30,
};
