/**
 * UNIFIED Document Center Types
 * 
 * Consolidates types from all document-related components
 */

export type DocumentType = 
  | "pdf" 
  | "docx" 
  | "xlsx" 
  | "pptx" 
  | "image" 
  | "video"
  | "contract"
  | "certificate"
  | "manual"
  | "procedure"
  | "report"
  | "legal"
  | "safety"
  | "evidence"
  | "template"
  | "other";

export type DocumentStatus = 
  | "draft" 
  | "review" 
  | "approved" 
  | "archived"
  | "active"
  | "under_review"
  | "expired"
  | "rejected";

export type DocumentViewMode = "grid" | "list" | "table";

export type DocumentAction = 
  | "upload"
  | "download"
  | "view"
  | "edit"
  | "delete"
  | "share"
  | "approve"
  | "reject"
  | "archive"
  | "restore"
  | "duplicate";

export interface DocumentMetadata {
  title: string;
  description?: string;
  type: DocumentType;
  category: string;
  size: number | string;
  format?: string;
  version: string;
  tags: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy: string;
  department?: string;
  owner?: string;
}

export interface DocumentPermissions {
  isPublic: boolean;
  confidential?: boolean;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canApprove?: boolean;
  allowedUsers?: string[];
  allowedRoles?: string[];
}

export interface DocumentApproval {
  user: string;
  status: "pending" | "approved" | "rejected";
  date: Date | string;
  comments?: string;
}

export interface DocumentAnalytics {
  downloadCount: number;
  viewCount: number;
  shareCount?: number;
  lastAccessed?: Date | string;
  trending?: boolean;
}

export interface UnifiedDocument extends DocumentMetadata {
  id: string;
  status: DocumentStatus;
  permissions: DocumentPermissions;
  analytics?: DocumentAnalytics;
  approvals?: DocumentApproval[];
  collaborators?: string[];
  content?: string;
  url?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: Array<{
    name: string;
    type: "text" | "number" | "date" | "select" | "textarea" | "checkbox" | "file";
    label?: string;
    required: boolean;
    options?: string[];
    defaultValue?: any;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      message?: string;
    };
  }>;
  usageCount: number;
  icon?: string;
}

export interface DocumentFilter {
  searchTerm?: string;
  types?: DocumentType[];
  statuses?: DocumentStatus[];
  categories?: string[];
  tags?: string[];
  createdBy?: string[];
  dateRange?: {
    from?: Date | string;
    to?: Date | string;
  };
  confidential?: boolean;
}

export interface DocumentSort {
  field: keyof UnifiedDocument;
  order: "asc" | "desc";
}

export interface DocumentCenterConfig {
  // Display options
  title: string;
  description?: string;
  icon?: React.ReactNode;
  defaultViewMode?: DocumentViewMode;
  
  // Features
  enableUpload?: boolean;
  enableDownload?: boolean;
  enablePreview?: boolean;
  enableVersioning?: boolean;
  enableTemplates?: boolean;
  enableApprovals?: boolean;
  enableAnalytics?: boolean;
  enableCollaboration?: boolean;
  enableBulkActions?: boolean;
  
  // Filters
  availableTypes?: DocumentType[];
  availableStatuses?: DocumentStatus[];
  availableCategories?: string[];
  
  // Actions
  customActions?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    handler: (document: UnifiedDocument) => void | Promise<void>;
    condition?: (document: UnifiedDocument) => boolean;
  }>;
  
  // Data source
  dataSource?: "supabase" | "api" | "custom";
  apiEndpoint?: string;
  onFetchDocuments?: (filter: DocumentFilter) => Promise<UnifiedDocument[]>;
  onUploadDocument?: (file: File, metadata: Partial<UnifiedDocument>) => Promise<UnifiedDocument>;
  onUpdateDocument?: (id: string, updates: Partial<UnifiedDocument>) => Promise<UnifiedDocument>;
  onDeleteDocument?: (id: string) => Promise<void>;
  
  // Permissions
  permissionCheck?: (action: DocumentAction, document?: UnifiedDocument) => boolean;
  
  // UI Customization
  emptyStateMessage?: string;
  emptyStateIcon?: React.ReactNode;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  
  // Pagination
  pageSize?: number;
  enableInfiniteScroll?: boolean;
}

export interface DocumentCenterState {
  documents: UnifiedDocument[];
  templates: DocumentTemplate[];
  isLoading: boolean;
  error: string | null;
  filter: DocumentFilter;
  sort: DocumentSort;
  viewMode: DocumentViewMode;
  selectedDocuments: string[];
  stats: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    recentUploads: number;
    expiringSoon?: number;
  };
}
