/**
 * UNIFIED Document Center Base Component
 * 
 * Consolidates all document-related centers:
 * - advanced-document-center.tsx
 * - document-management-center.tsx
 * - documentation-center.tsx
 * - intelligent-document-manager.tsx
 * - peotram-document-manager.tsx
 * - evidence-manager.tsx
 * - crew-dossier-manager.tsx
 * - certificate-manager.tsx
 * - template-manager.tsx
 * 
 * Features:
 * - Configurable document types, statuses, and categories
 * - Multiple view modes (grid, list, table)
 * - Upload, download, preview, edit, delete
 * - Filtering and search
 * - Bulk operations
 * - Permissions and access control
 * - Analytics tracking
 * - Template system
 * - Approval workflows
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  Download,
  Grid3x3,
  List,
  Table as TableIcon,
  RefreshCw,
  Trash2,
  Archive,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocumentCenterProvider } from "./DocumentCenterProvider";
import { useDocumentCenter } from "./hooks";
import {
  DocumentCard,
  DocumentList,
  DocumentFilters,
  DocumentUploader,
} from "./components";
import type { DocumentCenterConfig, UnifiedDocument, DocumentViewMode } from "./types";
import { cn } from "@/lib/utils";

// ============================================
// MAIN COMPONENT
// ============================================

interface DocumentCenterBaseProps {
  config: DocumentCenterConfig;
  className?: string;
}

export const DocumentCenterBase: React.FC<DocumentCenterBaseProps> = ({
  config,
  className,
}) => {
  return (
    <DocumentCenterProvider config={config}>
      <DocumentCenterContent className={className} />
    </DocumentCenterProvider>
  );
};

// ============================================
// CONTENT COMPONENT (uses context)
// ============================================

const DocumentCenterContent: React.FC<{ className?: string }> = ({ className }) => {
  const {
    documents,
    isLoading,
    error,
    viewMode,
    setViewMode,
    selectedDocuments,
    selectAll,
    clearSelection,
    bulkDelete,
    bulkArchive,
    bulkDownload,
    refresh,
    stats,
    config,
  } = useDocumentCenter();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<UnifiedDocument | null>(null);

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedDocuments.length} documents?`)) {
      await bulkDelete(selectedDocuments);
    }
  };

  const handleBulkArchive = async () => {
    await bulkArchive(selectedDocuments);
  };

  const handleBulkDownload = async () => {
    await bulkDownload(selectedDocuments);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            {config.icon || <FileText className="w-6 h-6" />}
            <h1 className="text-2xl font-bold">{config.title}</h1>
          </div>
          {config.description && (
            <p className="text-muted-foreground mt-1">{config.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {config.enableUpload && (
            <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={refresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      {config.enableAnalytics && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Documents</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Recent Uploads</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                {stats.recentUploads}
                <TrendingUp className="w-4 h-4 text-green-500" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                {stats.byStatus.active || stats.byStatus.approved || 0}
                <CheckCircle className="w-4 h-4 text-green-500" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Needs Attention</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                {stats.expiringSoon || 0}
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filters */}
      <DocumentFilters />

      {/* Bulk Actions Bar */}
      {selectedDocuments.length > 0 && config.enableBulkActions && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {selectedDocuments.length} document(s) selected
              </span>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDownload}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkArchive}
                className="gap-2"
              >
                <Archive className="w-4 h-4" />
                Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="gap-2 text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {documents.length} document(s)
          </span>
        </div>
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && !documents.length && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Documents Display */}
      {!isLoading && documents.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            {config.emptyStateIcon || <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />}
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground mb-4">
              {config.emptyStateMessage || "Upload your first document to get started"}
            </p>
            {config.enableUpload && (
              <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Upload Document
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {documents.length > 0 && (
        <>
          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onView={setSelectedDocument}
                  selected={selectedDocuments.includes(doc.id)}
                  onSelect={config.enableBulkActions ? (id) => {
                    // Toggle selection handled by context
                  } : undefined}
                />
              ))}
            </div>
          )}

          {/* List/Table View */}
          {(viewMode === "list" || viewMode === "table") && (
            <DocumentList
              documents={documents}
              onView={setSelectedDocument}
              selectedIds={selectedDocuments}
              onSelect={config.enableBulkActions ? (id) => {
                // Toggle selection handled by context
              } : undefined}
              onSelectAll={config.enableBulkActions ? selectAll : undefined}
            />
          )}
        </>
      )}

      {/* Upload Dialog */}
      <DocumentUploader
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      />

      {/* Document View/Edit Dialog */}
      {/* TODO: Add DocumentViewer/DocumentEditor components */}
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default DocumentCenterBase;
export * from "./types";
export * from "./hooks";
export * from "./components";
export { DocumentCenterProvider };
