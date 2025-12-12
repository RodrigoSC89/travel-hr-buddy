/**
 * Document Card Component
 * 
 * Displays a single document in card format
 */

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  Share2,
  MoreVertical,
  File,
  FileSpreadsheet,
  FileImage,
  FileVideo,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { UnifiedDocument } from "../types";
import { useDocumentActions } from "../hooks";

interface DocumentCardProps {
  document: UnifiedDocument;
  onView?: (doc: UnifiedDocument) => void;
  onEdit?: (doc: UnifiedDocument) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-8 h-8" />,
  docx: <FileText className="w-8 h-8" />,
  xlsx: <FileSpreadsheet className="w-8 h-8" />,
  pptx: <File className="w-8 h-8" />,
  image: <FileImage className="w-8 h-8" />,
  video: <FileVideo className="w-8 h-8" />,
  default: <File className="w-8 h-8" />,
};

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

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onEdit,
  selected,
  onSelect,
  className,
}) => {
  const actions = useDocumentActions(document);

  const handleView = () => {
    onView?.(document);
  };

  const handleEdit = () => {
    onEdit?.(document);
  };

  const handleDownload = async () => {
    await actions.download();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      await actions.delete();
    }
  };

  const formatSize = (size: number | string): string => {
    if (typeof size === "string") return size;
    const mb = size / (1024 * 1024);
    if (mb < 1) return `${(size / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-shadow duration-200",
        selected && "ring-2 ring-primary",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {onSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onSelect(document.id}
                className="w-4 h-4 rounded border-gray-300"
              />
            )}
            <div className="text-muted-foreground">
              {typeIcons[document.type] || typeIcons.default}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{document.title}</CardTitle>
              <CardDescription className="text-sm">
                {document.category}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.canPerform("view") && (
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
              )}
              {actions.canPerform("edit") && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {actions.canPerform("download") && (
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
              )}
              {actions.canPerform("share") && (
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {actions.canPerform("delete") && (
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {document.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {document.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          {document.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {document.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{document.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <Badge className={cn("text-xs", statusColors[document.status])}>
              {document.status}
            </Badge>
            <span>{formatSize(document.size)}</span>
          </div>
          <span>
            {formatDistanceToNow(new Date(document.updatedAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};
