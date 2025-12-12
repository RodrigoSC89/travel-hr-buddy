import { useEffect, useState } from "react";;

/**
 * PATCH 417: Complete Template Management Page
 * Integrates WYSIWYG editor, preview, and template management
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Save, Eye } from "lucide-react";
import { TemplateEditor } from "./TemplateEditor";
import { TemplatePreview } from "./TemplatePreview";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { extractTemplateVariables } from "../services/template-utils";

const commonVariables = [
  "company_name",
  "employee_name",
  "employee_id",
  "position",
  "department",
  "date",
  "manager_name",
  "vessel_name",
  "crew_member",
  "certification",
  "expiry_date",
  "start_date",
  "end_date",
  "signature"
];

export const CompleteTemplateManager = memo(() => {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] = useState("report");
  const [templateContent, setTemplateContent] = useState("");
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !templateContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a name and content for the template",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Extract variables from content using utility function
      const variables = extractTemplateVariables(templateContent);

      const { error } = await supabase.from("templates").insert({
        name: templateName,
        description: templateDescription,
        category: templateCategory,
        content: templateContent,
        format: "html",
        status: "active",
        variables: variables,
        metadata: {
          created_with: "template_editor_v1",
          patch: "417"
        }
      });

      if (error) throw error;

      toast({
        title: "Template Saved",
        description: "Your template has been saved successfully",
      });

      // Reset form
      setTemplateName("");
      setTemplateDescription("");
      setTemplateContent("");
      setShowPreview(false);
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Document Templates</h1>
            <p className="text-muted-foreground">Create and manage document templates with dynamic variables</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowPreview(!showPreview)}
          variant="outline"
        >
          <Eye className="w-4 h-4 mr-2" />
          {showPreview ? "Hide" : "Show"} Preview
        </Button>
      </div>

      {/* Template Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Employee Contract"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <Select value={templateCategory} onValueChange={setTemplateCategory}>
                <SelectTrigger id="template-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Brief description of this template..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Editor and Preview */}
      <div className={showPreview ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}>
        <TemplateEditor
          initialContent={templateContent}
          onChange={setTemplateContent}
          variables={commonVariables}
        />

        {showPreview && (
          <TemplatePreview
            templateContent={templateContent}
            variables={commonVariables}
            templateName={templateName || "Untitled Template"}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button onClick={handleSaveTemplate} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Template"}
        </Button>
      </div>
    </div>
  );
};
