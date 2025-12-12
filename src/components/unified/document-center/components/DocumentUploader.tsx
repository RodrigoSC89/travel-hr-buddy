/**
import { useRef, useState, useCallback } from "react";;
 * Document Uploader Component
 * 
 * Provides file upload interface
 */

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X, FileText } from "lucide-react";
import { useDocumentCenter } from "../hooks";
import type { UnifiedDocument, DocumentType } from "../types";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DocumentUploaderProps {
  open: boolean;
  onClose: () => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  open,
  onClose,
}) => {
  const { uploadDocument, config } = useDocumentCenter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<Partial<UnifiedDocument>>({
    title: "",
    description: "",
    type: "other",
    category: "",
    tags: [],
    version: "1.0",
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    if (!metadata.title) {
      setMetadata((prev) => ({
        ...prev,
        title: selectedFile.name,
      }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await uploadDocument(file, metadata);
      setProgress(100);
      setTimeout(() => {
        handleClose();
      }, 500);
    } finally {
      clearInterval(progressInterval);
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setMetadata({
      title: "",
      description: "",
      type: "other",
      category: "",
      tags: [],
      version: "1.0",
    });
    setProgress(0);
    onClose();
  };

  const maxSize = config.maxFileSize || 10;
  const acceptedTypes = config.acceptedFileTypes?.join(",") || "*";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Add a new document to the library. Max file size: {maxSize}MB
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
              file && "border-primary bg-primary/5"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSetFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your file here, or
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click(}
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={acceptedTypes}
                  onChange={handleChange}
                  }}
                />
              </>
            )}
          </div>

          {/* Metadata Form */}
          {file && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={metadata.title}
                  onChange={handleChange}))
                  }
                  placeholder="Document title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={metadata.description}
                  onChange={handleChange}))
                  }
                  placeholder="Document description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {config.availableTypes && (
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={metadata.type}
                      onValueChange={(value) =>
                        setMetadata((prev) => ({ ...prev, type: value as DocumentType }))
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {config.availableTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {config.availableCategories && (
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={metadata.category}
                      onValueChange={(value) =>
                        setMetadata((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {config.availableCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={metadata.tags?.join(", ")}
                  onChange={handleChange}))
                  }
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </>
          )}

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || !metadata.title || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
