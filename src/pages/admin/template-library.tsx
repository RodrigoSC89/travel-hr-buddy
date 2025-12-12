// PATCH 488.0 - Template Library Page
import { useState, useCallback } from "react";;
// Gallery UI with type filtering, preview, copy-to-clipboard

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  AlertCircle, 
  Activity, 
  FileCheck, 
  ClipboardCopy, 
  Eye, 
  CheckCircle,
  Search
} from "lucide-react";
import { templateLibrary, TemplateDefinition } from "@/modules/templates/template-library";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export default function TemplateLibraryPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const { toast } = useToast();

  const typeIcons: Record<string, unknown> = {
    document: FileText,
    incident: AlertCircle,
    fmea: Activity,
    contract: FileCheck,
    report: FileText,
    checklist: CheckCircle,
  };

  const filteredTemplates = templateLibrary.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || template.type === selectedType;
    return matchesSearch && matchesType;
  });

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Template content copied to clipboard",
    });
  });

  const useTemplate = async (template: TemplateDefinition) => {
    // In a real implementation, this would save to Supabase ai_document_templates
    toast({
      title: "Template Loaded",
      description: `${template.name} ready for editing`,
    });
    // Simulate save to database
    logger.info("Saving template to ai_document_templates", { templateId: template.id, templateName: template.name });
  });

  const types = ["all", "document", "incident", "fmea", "contract", "report", "checklist"];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Library</h1>
          <p className="text-muted-foreground">
            Production-ready maritime document templates
          </p>
        </div>
        <Badge variant="outline">PATCH 488.0</Badge>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={handleChange}
            className="pl-10"
          />
        </div>
      </div>

      {/* Type Filter Tabs */}
      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList>
          {types.map((type) => (
            <TabsTrigger key={type} value={type} className="capitalize">
              {type}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedType} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const Icon = typeIcons[template.type] || FileText;
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {template.type}
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {template.placeholders.length} placeholders
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {template.placeholders.slice(0, 3).map((placeholder) => (
                            <Badge key={placeholder} variant="outline" className="text-xs">
                              {placeholder.replace(/[{}]/g, "")}
                            </Badge>
                          ))}
                          {template.placeholders.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.placeholders.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSetSelectedTemplate}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleuseTemplate}
                          className="flex-1"
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No templates found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate && React.createElement(typeIcons[selectedTemplate.type] || FileText, {
                className: "h-5 w-5"
              })}
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Placeholders ({selectedTemplate.placeholders.length})</h4>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-muted rounded">
                  {selectedTemplate.placeholders.map((placeholder) => (
                    <Badge key={placeholder} variant="secondary" className="text-xs">
                      {placeholder}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Template Content</h4>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{selectedTemplate.content}</pre>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handlecopyToClipboard}
                  variant="outline"
                  className="flex-1"
                >
                  <ClipboardCopy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button
                  onClick={() => {
                    useTemplate(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                  className="flex-1"
                >
                  Use This Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
