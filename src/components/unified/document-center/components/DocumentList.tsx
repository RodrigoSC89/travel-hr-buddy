/**
 * Document List Component
 * 
 * Displays documents in list format
 */

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Download,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { UnifiedDocument } from "../types";
import { useDocumentActions } from "../hooks";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  documents: UnifiedDocument[];
  onView?: (doc: UnifiedDocument) => void;
  onEdit?: (doc: UnifiedDocument) => void;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
  className?: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  review: "bg-yellow-500",
  under_review: "bg-yellow-500",
  approved: "bg-green-500",
  active: "bg-green-500",
  archived: "bg-gray-400",
  expired: "bg-red-500",
  rejected: "bg-red-500",
};

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onView,
  onEdit,
  selectedIds = [],
  onSelect,
  onSelectAll,
  className,
}) => {
  const formatSize = (size: number | string): string => {
    if (typeof size === "string") return size;
    const mb = size / (1024 * 1024);
    if (mb < 1) return `${(size / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className={cn("border rounded-lg", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {onSelect && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === documents.length && documents.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <DocumentListRow
              key={document.id}
              document={document}
              selected={selectedIds.includes(document.id)}
              onSelect={onSelect}
              onView={onView}
              onEdit={onEdit}
            />
          ))}
          {documents.length === 0 && (
            <TableRow>
              <TableCell colSpan={onSelect ? 8 : 7} className="text-center py-8 text-muted-foreground">
                No documents found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

interface DocumentListRowProps {
  document: UnifiedDocument;
  selected: boolean;
  onSelect?: (id: string) => void;
  onView?: (doc: UnifiedDocument) => void;
  onEdit?: (doc: UnifiedDocument) => void;
}

const DocumentListRow: React.FC<DocumentListRowProps> = ({
  document,
  selected,
  onSelect,
  onView,
  onEdit,
}) => {
  const actions = useDocumentActions(document);

  const formatSize = (size: number | string): string => {
    if (typeof size === "string") return size;
    const mb = size / (1024 * 1024);
    if (mb < 1) return `${(size / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <TableRow className={cn(selected && "bg-muted/50")}>
      {onSelect && (
        <TableCell>
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(document.id)}
          />
        </TableCell>
      )}
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="truncate max-w-md">{document.title}</span>
          {document.description && (
            <span className="text-xs text-muted-foreground truncate max-w-md">
              {document.description}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {document.type}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={cn("text-xs", statusColors[document.status])}>
          {document.status}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatSize(document.size)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(document.updatedAt), {
          addSuffix: true,
          locale: ptBR,
        })}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {document.createdBy}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.canPerform("view") && (
              <DropdownMenuItem onClick={() => onView?.(document)}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>
            )}
            {actions.canPerform("edit") && (
              <DropdownMenuItem onClick={() => onEdit?.(document)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {actions.canPerform("download") && (
              <DropdownMenuItem onClick={() => actions.download()}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {actions.canPerform("delete") && (
              <DropdownMenuItem
                onClick={() => {
                  if (window.confirm("Delete this document?")) {
                    actions.delete();
                  }
                }}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
