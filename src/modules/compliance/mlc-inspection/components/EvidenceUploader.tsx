import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EvidenceUploaderProps {
  inspectionId: string;
  onUpdate: () => void;
}

export const EvidenceUploader = memo(function({ inspectionId, onUpdate }: EvidenceUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      };
      return;
    }

    try {
      setUploading(true);
      
      // In a real implementation, this would upload to Supabase Storage
      // and then create an evidence record
      toast({
        title: "Upload functionality",
        description: "File upload would be implemented with Supabase Storage integration",
      };
      
      setSelectedFile(null);
      onUpdate();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      };
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Evidence Upload</CardTitle>
        <CardDescription>
          Attach documents, images, or videos relevant to the MLC inspection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select file</Label>
            <Input 
              id="file" 
              type="file" 
              className="cursor-pointer"
              onChange={handleFileSelect}
              accept="image/*,application/pdf,.doc,.docx"
            />
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              className="flex items-center gap-1"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              <UploadCloud className="w-4 h-4" /> 
              {uploading ? "Uploading..." : "Upload"}
            </Button>
            {selectedFile && (
              <Button 
                variant="destructive" 
                className="flex items-center gap-1"
                onClick={handleRemove}
                disabled={uploading}
              >
                <Trash2 className="w-4 h-4" /> 
                Remove
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground mt-4">
            <p>Supported file types:</p>
            <p>• Images (JPG, PNG, etc.)</p>
            <p>• PDF documents</p>
            <p>• Word documents (DOC, DOCX)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
