// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Save,
  Eye,
  Download,
  History,
  Plus,
  Edit,
  Trash2,
  Code,
  RefreshCw,
  FileDown
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface DocumentTemplate {
  id: string;
  title: string;
  content: string;
  is_favorite: boolean;
  is_private: boolean;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface TemplateVersion {
  id: string;
  template_id: string;
  version_number: number;
  title: string;
  content: string;
  variables: any;
  created_by: string;
  created_at: string;
}

const AVAILABLE_VARIABLES = [
  { key: "{{user_name}}", description: "Current user's name" },
  { key: "{{user_email}}", description: "Current user's email" },
  { key: "{{company_name}}", description: "Company name" },
  { key: "{{vessel_name}}", description: "Vessel name" },
  { key: "{{mission_id}}", description: "Mission ID" },
  { key: "{{current_date}}", description: "Current date" },
  { key: "{{current_time}}", description: "Current time" },
  { key: "{{voyage_number}}", description: "Voyage number" },
  { key: "{{port_of_departure}}", description: "Departure port" },
  { key: "{{port_of_arrival}}", description: "Arrival port" },
  { key: "{{captain_name}}", description: "Captain's name" },
  { key: "{{crew_count}}", description: "Number of crew members" },
];

const DocumentTemplatesDynamic = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const [previewContent, setPreviewContent] = useState("");
  const [realTimeData, setRealTimeData] = useState<any>({});

  useEffect(() => {
    loadTemplates();
    loadRealTimeData();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_document_templates")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    }
  };

  const loadRealTimeData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch real data from Supabase
      const [profileData, vesselData, missionData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user?.id).single(),
        supabase.from('vessels').select('*').limit(1).single(),
        supabase.from('mission_workflows').select('*').limit(1).single(),
      ]);

      setRealTimeData({
        user_name: profileData.data?.full_name || "John Doe",
        user_email: user?.email || "user@example.com",
        company_name: "Maritime Operations Inc.",
        vessel_name: vesselData.data?.name || "MV Atlantic Explorer",
        mission_id: missionData.data?.id || "MISSION-2024-001",
        current_date: new Date().toLocaleDateString(),
        current_time: new Date().toLocaleTimeString(),
        voyage_number: "VOY-2024-042",
        port_of_departure: "Port of Santos",
        port_of_arrival: "Port of Rotterdam",
        captain_name: "Captain James Wilson",
        crew_count: "25",
      });
    } catch (error) {
      console.error("Error loading real-time data:", error);
      // Use fallback data
      setRealTimeData({
        user_name: "John Doe",
        user_email: "user@example.com",
        company_name: "Maritime Operations Inc.",
        vessel_name: "MV Atlantic Explorer",
        mission_id: "MISSION-2024-001",
        current_date: new Date().toLocaleDateString(),
        current_time: new Date().toLocaleTimeString(),
        voyage_number: "VOY-2024-042",
        port_of_departure: "Port of Santos",
        port_of_arrival: "Port of Rotterdam",
        captain_name: "Captain James Wilson",
        crew_count: "25",
      });
    }
  };

  const loadVersions = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from("document_template_versions")
        .select("*")
        .eq("template_id", templateId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
      setShowVersions(true);
    } catch (error) {
      console.error("Error loading versions:", error);
      toast({
        title: "Error",
        description: "Failed to load version history",
        variant: "destructive",
      });
    }
  };

  const replaceVariables = (content: string, data: any) => {
    let replaced = content;
    Object.entries(data).forEach(([key, value]) => {
      const variable = `{{${key}}}`;
      replaced = replaced.replace(new RegExp(variable, 'g'), String(value));
    });
    return replaced;
  };

  const generatePreview = () => {
    const content = editMode ? formData.content : selectedTemplate?.content || "";
    const preview = replaceVariables(content, realTimeData);
    setPreviewContent(preview);
    setShowPreview(true);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = formData.content;
      const newContent =
        currentContent.substring(0, start) +
        variable +
        currentContent.substring(end);
      setFormData({ ...formData, content: newContent });
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const saveTemplate = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please provide title and content",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      let templateId = selectedTemplate?.id;

      if (editMode && selectedTemplate) {
        // Update existing template
        const { error } = await supabase
          .from("ai_document_templates")
          .update({
            title: formData.title,
            content: formData.content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedTemplate.id);

        if (error) throw error;

        // Create new version
        const { data: versionData } = await supabase
          .from("document_template_versions")
          .select("version_number")
          .eq("template_id", selectedTemplate.id)
          .order("version_number", { ascending: false })
          .limit(1)
          .single();

        const nextVersion = (versionData?.version_number || 0) + 1;

        await supabase
          .from("document_template_versions")
          .insert({
            template_id: selectedTemplate.id,
            version_number: nextVersion,
            title: formData.title,
            content: formData.content,
            variables: AVAILABLE_VARIABLES.map(v => v.key),
            created_by: user?.id,
          });

        toast({
          title: "Template Updated",
          description: `Version ${nextVersion} created`,
        });
      } else {
        // Create new template
        const { data: newTemplate, error } = await supabase
          .from("ai_document_templates")
          .insert({
            title: formData.title,
            content: formData.content,
            is_favorite: false,
            is_private: false,
            tags: [],
            created_by: user?.id,
          })
          .select()
          .single();

        if (error) throw error;
        templateId = newTemplate.id;

        // Create version 1
        await supabase
          .from("document_template_versions")
          .insert({
            template_id: newTemplate.id,
            version_number: 1,
            title: formData.title,
            content: formData.content,
            variables: AVAILABLE_VARIABLES.map(v => v.key),
            created_by: user?.id,
          });

        toast({
          title: "Template Created",
          description: "Version 1 created",
        });
      }

      setShowEditor(false);
      setFormData({ title: "", content: "" });
      setEditMode(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      const content = replaceVariables(
        selectedTemplate?.content || "",
        realTimeData
      );

      // Create a temporary div for rendering
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      tempDiv.style.padding = '40px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.color = '#000';
      tempDiv.style.backgroundColor = '#fff';
      tempDiv.style.width = '800px';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(tempDiv);

      // Generate PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm');
      let position = 0;

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      pdf.save(`${selectedTemplate?.title || 'document'}.pdf`);

      // Log generation
      await supabase.from("document_generation_history").insert({
        template_id: selectedTemplate?.id,
        generated_by: (await supabase.auth.getUser()).data.user?.id,
        variables_used: realTimeData,
        output_format: "pdf",
      });

      toast({
        title: "PDF Exported",
        description: "Document exported successfully",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const exportToDOCX = () => {
    try {
      const content = replaceVariables(
        selectedTemplate?.content || "",
        realTimeData
      );

      // Simple DOCX export (for production, use a proper library like docx)
      const blob = new Blob([content], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedTemplate?.title || 'document'}.docx`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "DOCX Exported",
        description: "Document exported successfully",
      });
    } catch (error) {
      console.error("Error exporting DOCX:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export DOCX",
        variant: "destructive",
      });
    }
  };

  const editTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      title: template.title,
      content: template.content,
    });
    setEditMode(true);
    setShowEditor(true);
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from("ai_document_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: "Template removed successfully",
      });

      loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const restoreVersion = async (version: TemplateVersion) => {
    try {
      const { error } = await supabase
        .from("ai_document_templates")
        .update({
          title: version.title,
          content: version.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", version.template_id);

      if (error) throw error;

      // Create new version from restored content
      const { data: versionData } = await supabase
        .from("document_template_versions")
        .select("version_number")
        .eq("template_id", version.template_id)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (versionData?.version_number || 0) + 1;
      const { data: { user } } = await supabase.auth.getUser();

      await supabase
        .from("document_template_versions")
        .insert({
          template_id: version.template_id,
          version_number: nextVersion,
          title: version.title,
          content: version.content,
          variables: version.variables,
          created_by: user?.id,
        });

      toast({
        title: "Version Restored",
        description: `Restored to version ${version.version_number}, created as version ${nextVersion}`,
      });

      setShowVersions(false);
      loadTemplates();
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Error",
        description: "Failed to restore version",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Document Templates: Dynamic Generator
          </h1>
          <p className="text-muted-foreground">
            Create, edit, and export documents with dynamic variables
          </p>
        </div>
        <Button
          onClick={() => {
            setEditMode(false);
            setSelectedTemplate(null);
            setFormData({ title: "", content: "" });
            setShowEditor(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedTemplate(template);
                      generatePreview();
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => loadVersions(template.id)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="line-clamp-2">
                {template.content.substring(0, 100)}...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 text-xs">
                {template.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => editTemplate(template)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedTemplate(template);
                    exportToPDF();
                  }}
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteTemplate(template.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Template" : "Create New Template"}
            </DialogTitle>
            <DialogDescription>
              Use variables to create dynamic documents with real-time data
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="editor" className="h-full">
              <TabsList>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="h-[calc(100%-3rem)] space-y-4">
                <div>
                  <Label htmlFor="title">Template Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Voyage Report Template"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="template-content">Content</Label>
                  <Textarea
                    id="template-content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Enter your template content with variables like {{user_name}}..."
                    className="h-96 font-mono"
                  />
                </div>
              </TabsContent>

              <TabsContent value="variables" className="h-[calc(100%-3rem)]">
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Click to insert a variable into your template
                    </p>
                    {AVAILABLE_VARIABLES.map((variable) => (
                      <div
                        key={variable.key}
                        className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => insertVariable(variable.key)}
                      >
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {variable.key}
                          </code>
                          <Code className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {variable.description}
                        </p>
                        {realTimeData[variable.key.replace(/{{|}}/g, '')] && (
                          <p className="text-xs text-blue-600 mt-1">
                            Current value: {realTimeData[variable.key.replace(/{{|}}/g, '')]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="preview" className="h-[calc(100%-3rem)]">
                <div className="space-y-4">
                  <Button onClick={generatePreview} size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Preview
                  </Button>
                  <ScrollArea className="h-96">
                    <div
                      className="p-6 border rounded-lg bg-white"
                      dangerouslySetInnerHTML={{
                        __html: replaceVariables(formData.content, realTimeData),
                      }}
                    />
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button onClick={saveTemplate} disabled={loading}>
              {loading ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Preview: {selectedTemplate?.title}</DialogTitle>
            <DialogDescription>
              Document with populated variables
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div
              className="p-8 border rounded-lg bg-white"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={exportToDOCX}>
              <FileDown className="h-4 w-4 mr-2" />
              Export DOCX
            </Button>
            <Button onClick={exportToPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Versions Dialog */}
      <Dialog open={showVersions} onOpenChange={setShowVersions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              View and restore previous versions
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {versions.map((version) => (
                <div key={version.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Badge>Version {version.version_number}</Badge>
                      <p className="text-sm font-medium mt-1">{version.title}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreVersion(version)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Restore
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(version.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentTemplatesDynamic;
