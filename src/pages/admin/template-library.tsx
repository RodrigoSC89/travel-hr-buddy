/**
 * PATCH 488 - Template Library Gallery
 * Browse and use predefined templates
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  AlertTriangle, 
  Shield, 
  FileCheck, 
  ClipboardList,
  Eye,
  Download,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { TEMPLATE_LIBRARY, getTemplatesByType, getAllTypes, type TemplateDefinition } from "@/modules/templates/template-library";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TemplateLibraryGallery: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);

  const filteredTemplates = selectedType === "all" 
    ? TEMPLATE_LIBRARY 
    : getTemplatesByType(selectedType as TemplateDefinition["type"]);

  const typeIcons = {
    document: FileText,
    incident: AlertTriangle,
    fmea: Shield,
    contract: FileCheck,
    report: ClipboardList
  };

  const handleUseTemplate = async (template: TemplateDefinition) => {
    try {
      // Save template to user's templates
      const { error } = await supabase
        .from("ai_document_templates")
        .insert({
          title: template.title,
          content: template.content,
          placeholders: template.placeholders,
          created_by: user?.id,
          is_favorite: false,
        });

      if (error) throw error;

      toast.success(`Template "${template.title}" added to your templates`);
      
      // Navigate to template editor
      setTimeout(() => {
        navigate("/admin/templates");
      }, 1000);
    } catch (error) {
      console.error("Error using template:", error);
      toast.error("Failed to use template");
    }
  };

  const handleCopyTemplate = (template: TemplateDefinition) => {
    navigator.clipboard.writeText(template.content);
    toast.success("Template content copied to clipboard");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Template Library</h1>
            <p className="text-sm text-muted-foreground">
              PATCH 488 - Professional templates ready to use
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{TEMPLATE_LIBRARY.length}</div>
            <p className="text-xs text-muted-foreground">Total Templates</p>
          </CardContent>
        </Card>
        {getAllTypes().map(type => {
          const Icon = typeIcons[type];
          const count = getTemplatesByType(type).length;
          return (
            <Card key={type}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">{count}</div>
                </div>
                <p className="text-xs text-muted-foreground capitalize">{type}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            All ({TEMPLATE_LIBRARY.length})
          </TabsTrigger>
          {getAllTypes().map(type => {
            const Icon = typeIcons[type];
            return (
              <TabsTrigger key={type} value={type}>
                <Icon className="h-4 w-4 mr-2" />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedType} className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map(template => {
              const Icon = typeIcons[template.type];
              return (
                <Card key={template.id} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Icon className="h-6 w-6 text-primary" />
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {template.placeholders.length} placeholders
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setPreviewTemplate(template)}
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        onClick={() => handleUseTemplate(template)}
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{previewTemplate.title}</CardTitle>
                  <CardDescription>{previewTemplate.description}</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setPreviewTemplate(null)}
                >
                  ✕
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge>{previewTemplate.type}</Badge>
                {previewTemplate.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.content }}
                />
              </ScrollArea>
            </CardContent>
            <div className="p-6 border-t flex gap-2">
              <Button 
                variant="outline"
                onClick={() => handleCopyTemplate(previewTemplate)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Content
              </Button>
              <Button 
                onClick={() => handleUseTemplate(previewTemplate)}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TemplateLibraryGallery;
