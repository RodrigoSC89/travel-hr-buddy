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
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  variables: any[];
  version: number;
  is_active: boolean;
  created_at: string;
}

interface GeneratedDocument {
  id: string;
  template_id: string;
  name: string;
  content: string;
  format: string;
  status: string;
  generated_at: string;
}

interface TemplateVersion {
  id: string;
  version: number;
  change_summary: string;
  created_at: string;
}

export default function DocumentTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([]);
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
    fetchGeneratedDocuments();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      setTemplateContent(selectedTemplate.content);
      setTemplateName(selectedTemplate.name);
      setTemplateCategory(selectedTemplate.category);
      setTemplateDescription(selectedTemplate.description || "");
      fetchTemplateVersions(selectedTemplate.id);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    // Update preview in real-time
    updatePreview();
  }, [templateContent, variableValues]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("document_templates")
        .select("*")
        .eq("is_active", true)
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

  const fetchGeneratedDocuments = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("generated_documents")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setGeneratedDocs(data || []);
    } catch (error) {
      logger.error("Error fetching generated documents", { error });
    }
  };

  const fetchTemplateVersions = async (templateId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from("template_versions")
        .select("*")
        .eq("template_id", templateId)
        .order("version", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      logger.error("Error fetching versions", { error });
    }
  };

  const updatePreview = () => {
    let preview = templateContent;
    
    // Replace all variables with their values
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
        const { error } = await (supabase as any)
          .from("document_templates")
          .insert({
            name: templateName,
            description: templateDescription,
            category: templateCategory,
            content: templateContent,
            variables: extractVariables(templateContent)
          });

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
      // Update existing template (create new version)
      try {
        const { error } = await (supabase as any).rpc("create_template_version", {
          p_template_id: selectedTemplate.id,
          p_content: templateContent,
          p_variables: extractVariables(templateContent),
          p_change_summary: "Manual update"
        });

        if (error) throw error;

        toast({
          title: "Template Updated",
          description: "New version created successfully",
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
      const { data, error } = await (supabase as any).rpc("generate_document_from_template", {
        p_template_id: selectedTemplate.id,
        p_name: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
        p_variable_values: variableValues,
        p_format: "html"
      });

      if (error) throw error;

      toast({
        title: "Document Generated",
        description: "Document created successfully",
      });

      fetchGeneratedDocuments();
    } catch (error) {
      logger.error("Error generating document", { error });
      toast({
        title: "Error",
        description: "Failed to generate document",
        variant: "destructive",
      });
    }
  };

  const rollbackVersion = async (version: number) => {
    if (!selectedTemplate) return;

    try {
      const { error } = await (supabase as any).rpc("rollback_template_version", {
        p_template_id: selectedTemplate.id,
        p_version: version
      });

      if (error) throw error;

      toast({
        title: "Version Restored",
        description: `Rolled back to version ${version}`,
      });

      fetchTemplates();
      fetchTemplateVersions(selectedTemplate.id);
    } catch (error) {
      logger.error("Error rolling back version", { error });
      toast({
        title: "Error",
        description: "Failed to rollback version",
        variant: "destructive",
      });
    }
  };

  const extractVariables = (content: string): any[] => {
    const matches = content.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
    const uniqueVars = [...new Set(matches.map(m => m.slice(2, -2)))];
    
    return uniqueVars.map(varName => ({
      name: varName,
      type: "text",
      required: true
    }));
  };

  const exportDocument = async (documentId: string, format: string) => {
    toast({
      title: "Exporting Document",
      description: `Generating ${format.toUpperCase()} file...`,
    });

    // In production, this would trigger actual export
    // For now, just mark as exported
    try {
      const { error } = await (supabase as any).rpc("export_document", {
        p_document_id: documentId,
        p_file_url: `/exports/${documentId}.${format}`
      });

      if (error) throw error;

      toast({
        title: "Export Complete",
        description: "Document exported successfully",
      });

      fetchGeneratedDocuments();
    } catch (error) {
      logger.error("Error exporting document", { error });
    }
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
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              v{template.version}
                            </Badge>
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
                  {selectedTemplate && extractVariables(templateContent).map((variable) => (
                    <div key={variable.name} className="grid gap-2">
                      <Label htmlFor={variable.name}>{variable.name}</Label>
                      <Input
                        id={variable.name}
                        value={variableValues[variable.name] || ""}
                        onChange={(e) =>
                          setVariableValues({
                            ...variableValues,
                            [variable.name]: e.target.value
                          })
                        }
                        placeholder={`Enter ${variable.name}`}
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
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {versions.map((version) => (
                      <Card key={version.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="outline">Version {version.version}</Badge>
                              <p className="text-sm mt-1">{version.change_summary}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(version.created_at).toLocaleString()}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => rollbackVersion(version.version)}
                            >
                              Restore
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Generated Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Documents</CardTitle>
          <CardDescription>Recently generated documents from templates</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {generatedDocs.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.generated_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={doc.status === "exported" ? "default" : "secondary"}>
                          {doc.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => exportDocument(doc.id, "pdf")}
                        >
                          <Download className="mr-2 h-3 w-3" />
                          PDF
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => exportDocument(doc.id, "docx")}
                        >
                          <Download className="mr-2 h-3 w-3" />
                          DOCX
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
