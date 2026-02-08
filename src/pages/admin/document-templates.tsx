import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  FileText, 
  Plus, 
  Save, 
  Eye, 
  Download, 
  History,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  content: string;
  variables: string[] | null;
  is_public: boolean | null;
  created_at: string;
}

interface TemplateVersion {
  id: string;
  version_number: number | null;
  change_notes: string | null;
  created_at: string | null;
}

export default function DocumentTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Template editor state
  const [templateContent, setTemplateContent] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  
  // Document generation state
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      setTemplateContent(selectedTemplate.content);
      setTemplateName(selectedTemplate.name);
      setTemplateCategory(selectedTemplate.category || "");
      setTemplateDescription(selectedTemplate.description || "");
      fetchTemplateVersions(selectedTemplate.id);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    updatePreview();
  }, [templateContent, variableValues]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .order("name");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      logger.error("Error fetching templates", { error });
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplateVersions = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from("template_versions")
        .select("*")
        .eq("template_id", templateId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      setVersions((data || []) as TemplateVersion[]);
    } catch (error) {
      logger.error("Error fetching versions", { error });
    }
  };

  const updatePreview = () => {
    let preview = templateContent;
    
    Object.entries(variableValues).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      preview = preview.replace(regex, value || `[${key}]`);
    });
    
    setPreviewContent(preview);
  };

  const saveTemplate = async () => {
    if (!selectedTemplate) {
      // Create new template
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        
        const { error } = await supabase
          .from("document_templates")
          .insert([{
            name: templateName,
            description: templateDescription,
            category: templateCategory,
            content: templateContent,
            variables: extractVariables(templateContent),
            user_id: user.id,
          }]);

        if (error) throw error;

        toast({
          title: "Template Created",
          description: "New template created successfully",
        });

        fetchTemplates();
      } catch (error) {
        logger.error("Error creating template", { error });
        toast({
          title: "Error",
          description: "Failed to create template",
          variant: "destructive",
        });
      }
    } else {
      // Update existing template
      try {
        const { error } = await supabase
          .from("document_templates")
          .update({
            name: templateName,
            description: templateDescription,
            category: templateCategory,
            content: templateContent,
            variables: extractVariables(templateContent),
          })
          .eq("id", selectedTemplate.id);

        if (error) throw error;

        toast({
          title: "Template Updated",
          description: "Template updated successfully",
        });

        fetchTemplates();
        fetchTemplateVersions(selectedTemplate.id);
      } catch (error) {
        logger.error("Error updating template", { error });
        toast({
          title: "Error",
          description: "Failed to update template",
          variant: "destructive",
        });
      }
    }
  };

  const generateDocument = async () => {
    if (!selectedTemplate) return;

    try {
      // Generate document using ai_generated_documents table
      const { data: { user } } = await supabase.auth.getUser();
      
      let generatedContent = templateContent;
      Object.entries(variableValues).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        generatedContent = generatedContent.replace(regex, value || "");
      });

      const { error } = await supabase
        .from("ai_generated_documents")
        .insert({
          template_id: selectedTemplate.id,
          title: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
          content: generatedContent,
          document_type: selectedTemplate.category || "general",
          created_by: user?.id,
          status: "draft",
        });

      if (error) throw error;

      toast({
        title: "Document Generated",
        description: "Document created successfully",
      });
    } catch (error) {
      logger.error("Error generating document", { error });
      toast({
        title: "Error",
        description: "Failed to generate document",
        variant: "destructive",
      });
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.slice(2, -2)))];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Document Templates
          </h1>
          <p className="text-muted-foreground">
            Create and manage document templates with dynamic variables
          </p>
        </div>
        <Button onClick={() => setSelectedTemplate(null)}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Template List */}
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>{templates.length} templates available</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer hover:bg-accent transition-colors ${
                      selectedTemplate?.id === template.id ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{template.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {template.category && (
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Template Editor */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Template Editor</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showPreview ? "Hide" : "Show"} Preview
                </Button>
                <Button size="sm" onClick={saveTemplate}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="editor" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="history">
                  <History className="mr-2 h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Enter template name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={templateCategory} onValueChange={setTemplateCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contracts">Contracts</SelectItem>
                        <SelectItem value="Reports">Reports</SelectItem>
                        <SelectItem value="Letters">Letters</SelectItem>
                        <SelectItem value="Certificates">Certificates</SelectItem>
                        <SelectItem value="Invoices">Invoices</SelectItem>
                        <SelectItem value="Forms">Forms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      placeholder="Enter description"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="content">Template Content</Label>
                    <Textarea
                      id="content"
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                      placeholder="Enter template content. Use {{variable_name}} for dynamic values."
                      className="min-h-[300px] font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {"{{variable_name}}"} syntax for dynamic variables
                    </p>
                  </div>

                  {showPreview && (
                    <div className="grid gap-2">
                      <Label>Live Preview</Label>
                      <div className="border rounded-lg p-4 min-h-[200px] bg-muted/50">
                        <pre className="whitespace-pre-wrap text-sm">
                          {previewContent}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="variables" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Fill in variable values to preview the document
                  </p>
                  {extractVariables(templateContent).map((varName) => (
                    <div key={varName} className="grid gap-2">
                      <Label htmlFor={varName}>{varName}</Label>
                      <Input
                        id={varName}
                        value={variableValues[varName] || ""}
                        onChange={(e) =>
                          setVariableValues({
                            ...variableValues,
                            [varName]: e.target.value
                          })
                        }
                        placeholder={`Enter ${varName}`}
                      />
                    </div>
                  ))}
                  {selectedTemplate && (
                    <Button className="w-full" onClick={generateDocument}>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Document
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Version history for the selected template
                  </p>
                  {versions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No version history available
                    </p>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {versions.map((version) => (
                          <Card key={version.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Badge variant="outline">
                                    v{version.version_number || "?"}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {version.change_notes || "No notes"}
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {version.created_at
                                    ? new Date(version.created_at).toLocaleDateString()
                                    : "N/A"}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
