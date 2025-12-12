/**
import { useEffect, useMemo, useState, useCallback } from "react";;
 * PATCH 409: Apply Template Dialog Component
 * Dialog for applying templates to documents with real-time preview
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  TemplateApplicationService, 
  ExportOptions 
} from "@/services/template-application.service";
import { 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  Eye,
  Edit,
} from "lucide-react";

interface ApplyTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateContent: string;
  templateName?: string;
  onApply?: (result: string) => void;
}

export const ApplyTemplateDialog = memo(function({
  open,
  onOpenChange,
  templateContent,
  templateName = "Template",
  onApply,
}: ApplyTemplateDialogProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const { toast } = useToast();

  // Extract variables from template
  const extractedVariables = useMemo(() => {
    return TemplateApplicationService.extractVariables(templateContent);
  }, [templateContent]);

  // Get auto-fill suggestions
  const autoFillSuggestions = useMemo(() => {
    return TemplateApplicationService.getAutoFillSuggestions({
      user: {
        name: "Current User",
        email: "user@example.com",
        role: "Employee",
      },
      organization: {
        name: "Organization Name",
      },
    };
  }, []);

  // Apply template with current variables
  const appliedResult = useMemo(() => {
    return TemplateApplicationService.applyTemplate(templateContent, variables);
  }, [templateContent, variables]);

  // Initialize variables on mount
  useEffect(() => {
    if (open) {
      const initialVars: Record<string, string> = {};
      extractedVariables.forEach(varName => {
        // Try to use auto-fill suggestions
        initialVars[varName] = autoFillSuggestions[varName] || "";
  };
      setVariables(initialVars);
    }
  }, [open, extractedVariables, autoFillSuggestions]);

  const handleAutoFill = () => {
    setVariables(prev => ({
      ...prev,
      ...autoFillSuggestions,
    }));
    toast({
      title: "Auto-fill applied",
      description: "Common variables have been filled automatically",
    };
  };

  const handleVariableChange = (varName: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [varName]: value,
    }));
  };

  const handleExport = async (format: ExportOptions["format"]) => {
    const result = await TemplateApplicationService.exportDocument(
      appliedResult.content,
      {
        format,
        filename: `${templateName.replace(/\s+/g, "_")}.${format.toLowerCase()}`,
      }
    );

    if (result.success && result.data) {
      TemplateApplicationService.downloadDocument(
        result.data,
        `${templateName.replace(/\s+/g, "_")}.${format.toLowerCase()}`
      );
      toast({
        title: "Export successful",
        description: `Document exported as ${format}`,
      };
    } else {
      toast({
        title: "Export failed",
        description: result.error || "Failed to export document",
        variant: "destructive",
      });
    }
  };

  const handleApply = () => {
    if (appliedResult.success) {
      onApply?.(appliedResult.content);
      toast({
        title: "Template applied",
        description: `${appliedResult.appliedVariables.length} variables applied`,
      };
      onOpenChange(false);
    }
  };

  const getVariableLabel = (varName: string): string => {
    return TemplateApplicationService.COMMON_VARIABLES[varName as keyof typeof TemplateApplicationService.COMMON_VARIABLES] || varName;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Apply Template: {templateName}
          </DialogTitle>
          <DialogDescription>
            Fill in the variables below and preview the result
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "edit" | "preview"}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Variables
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoFill}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Auto-fill
            </Button>
          </div>

          <TabsContent value="edit" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {extractedVariables.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No variables found in template</p>
                  </div>
                ) : (
                  extractedVariables.map((varName) => (
                    <div key={varName} className="space-y-2">
                      <Label htmlFor={varName} className="flex items-center gap-2">
                        {getVariableLabel(varName)}
                        <Badge variant="secondary" className="text-xs">
                          {`{{${varName}}}`}
                        </Badge>
                      </Label>
                      <Input
                        id={varName}
                        value={variables[varName] || ""}
                        onChange={handleChange}
                        placeholder={`Enter ${getVariableLabel(varName)}`}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Status indicators */}
            <div className="flex gap-4 pt-2 border-t">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{appliedResult.appliedVariables.length} applied</span>
              </div>
              {appliedResult.missingVariables.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span>{appliedResult.missingVariables.length} missing</span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="prose prose-sm max-w-none p-4 border rounded-lg bg-muted/30">
                {appliedResult.content.split("\n").map((line, index) => (
                  <p key={index} className="my-2">{line || "\u00A0"}</p>
                ))}
              </div>
            </ScrollArea>

            {/* Export options */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlehandleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlehandleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                HTML
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleonOpenChange}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!appliedResult.success}>
            Apply Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Type guard for badge variant
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

function getBadgeVariant(severity: string): BadgeVariant {
  switch (severity) {
  case "critical":
    return "destructive";
  case "high":
    return "outline";
  default:
    return "secondary";
  }
}
