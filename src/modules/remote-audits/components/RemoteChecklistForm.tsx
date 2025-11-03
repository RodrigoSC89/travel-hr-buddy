/**
 * PATCH 606 - Remote Checklist Form Component
 * Interactive checklist form for remote audits
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Upload, CheckCircle, XCircle, MinusCircle, FileText } from "lucide-react";
import type { RemoteAuditChecklistItem, ChecklistResponse } from "../types";
import { EvidenceUploadService } from "../services/EvidenceUploadService";

interface RemoteChecklistFormProps {
  auditId: string;
  items: RemoteAuditChecklistItem[];
  onItemUpdate: (itemId: string, updates: Partial<RemoteAuditChecklistItem>) => void;
  onEvidenceUpload: (itemId: string, files: File[]) => Promise<void>;
}

export function RemoteChecklistForm({ 
  auditId, 
  items, 
  onItemUpdate,
  onEvidenceUpload 
}: RemoteChecklistFormProps) {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleResponseChange = (itemId: string, response: ChecklistResponse) => {
    onItemUpdate(itemId, { response });
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    onItemUpdate(itemId, { notes });
  };

  const handleFileUpload = async (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(itemId);
    try {
      await onEvidenceUpload(itemId, files);
      onItemUpdate(itemId, { evidenceUploaded: true });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(null);
    }
  };

  const getResponseIcon = (response?: ChecklistResponse) => {
    switch (response) {
      case "yes": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "no": return <XCircle className="w-5 h-5 text-red-600" />;
      case "n/a": return <MinusCircle className="w-5 h-5 text-gray-600" />;
      case "partial": return <FileText className="w-5 h-5 text-yellow-600" />;
      default: return null;
    }
  };

  // Group items by section
  const sections = items.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, RemoteAuditChecklistItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(sections).map(([section, sectionItems]) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle className="text-lg">{section}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sectionItems.map((item) => (
                <div key={item.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.itemNumber && (
                          <span className="text-sm font-medium text-muted-foreground">
                            {item.itemNumber}.
                          </span>
                        )}
                        <h4 className="font-medium">{item.question}</h4>
                      </div>
                      {item.evidenceRequired && (
                        <Badge variant="outline" className="text-xs">
                          Evidence Required
                        </Badge>
                      )}
                    </div>
                    {getResponseIcon(item.response)}
                  </div>

                  {/* Response Buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <Button
                      variant={item.response === "yes" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleResponseChange(item.id, "yes")}
                      className="w-full"
                    >
                      Yes
                    </Button>
                    <Button
                      variant={item.response === "no" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleResponseChange(item.id, "no")}
                      className="w-full"
                    >
                      No
                    </Button>
                    <Button
                      variant={item.response === "partial" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleResponseChange(item.id, "partial")}
                      className="w-full"
                    >
                      Partial
                    </Button>
                    <Button
                      variant={item.response === "n/a" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleResponseChange(item.id, "n/a")}
                      className="w-full"
                    >
                      N/A
                    </Button>
                  </div>

                  {/* Notes */}
                  <Textarea
                    placeholder="Add notes or observations..."
                    value={item.notes || ""}
                    onChange={(e) => handleNotesChange(item.id, e.target.value)}
                    className="mb-3"
                    rows={2}
                  />

                  {/* Evidence Upload */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id={`file-${item.id}`}
                      className="hidden"
                      multiple
                      accept="image/*,application/pdf,video/*"
                      onChange={(e) => handleFileUpload(item.id, e)}
                      disabled={uploading === item.id}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById(`file-${item.id}`)?.click()}
                      disabled={uploading === item.id}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading === item.id ? "Uploading..." : "Upload Evidence"}
                    </Button>
                    {item.evidenceUploaded && (
                      <Badge variant="secondary">✓ Evidence Uploaded</Badge>
                    )}
                  </div>

                  {/* AI Validation Results */}
                  {item.aiValidation && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">AI Validation</p>
                      <p className="text-sm text-muted-foreground">
                        {item.aiValidation.reasoning}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={item.aiValidation.isCompliant ? "default" : "destructive"}>
                          {item.aiValidation.isCompliant ? "Compliant" : "Non-Compliant"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.floor(item.aiValidation.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
