/**
 * Documentation Section Component
 * PATCH 92.0 - Document upload and AI analysis
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Brain, FileText, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { handleDocumentUpload } from "../services/document-service";
import { Logger } from "@/lib/utils/logger";

export const DocumentationSection: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("regulation");
  const [documentCategory, setDocumentCategory] = useState<string>("ISM");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      Logger.info("File selected", { fileName: file.name, size: file.size });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);
    setAnalyzing(true);

    try {
      const result = await handleDocumentUpload(
        selectedFile,
        {
          title: selectedFile.name,
          type: documentType as any,
          category: documentCategory as any
        },
        undefined,
        { analyzeWithAI: true }
      );

      if (result.success) {
        toast.success("Document uploaded successfully");
        if (result.analysis) {
          toast.info("AI analysis completed", {
            description: result.analysis.summary.substring(0, 100) + "..."
          });
        }
        setSelectedFile(null);
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      Logger.error("Upload error", error, "compliance-hub");
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Compliance Document</CardTitle>
          <CardDescription>
            Upload regulatory documents, policies, procedures, or evidence. AI will analyze and extract key information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="document-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regulation">Regulation</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="evidence">Evidence</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-category">Category</Label>
              <Select value={documentCategory} onValueChange={setDocumentCategory}>
                <SelectTrigger id="document-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ISM">ISM Code</SelectItem>
                  <SelectItem value="ISPS">ISPS</SelectItem>
                  <SelectItem value="IMCA">IMCA</SelectItem>
                  <SelectItem value="FMEA">FMEA</SelectItem>
                  <SelectItem value="NORMAM">NORMAM</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                {analyzing ? "Analyzing with AI..." : "Uploading..."}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload and Analyze
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>
            Recently uploaded compliance documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No documents yet. Upload your first document above.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
