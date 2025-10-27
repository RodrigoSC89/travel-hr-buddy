import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Plus, 
  Edit, 
  Save, 
  Trash2, 
  Eye, 
  Download, 
  Copy,
  Code,
  Search,
  Filter
} from "lucide-react";
import jsPDF from "jspdf";

interface DocumentTemplate {
  id: string;
  title: string;
  content: string;
  template_type: 'contract' | 'report' | 'letter' | 'certificate' | 'document';
  variables: Array<{ name: string; description: string; default?: string }>;
  pdf_settings: {
    fontSize?: number;
    margins?: { top: number; bottom: number; left: number; right: number };
    pageSize?: 'a4' | 'letter';
  };
  is_favorite: boolean;
  is_private: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface TemplateFormData {
  title: string;
  content: string;
  template_type: string;
  variables: Array<{ name: string; description: string; default?: string }>;
  is_private: boolean;
  tags: string[];
}

export const DocumentTemplateEditor: React.FC = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState<TemplateFormData>({
    title: "",
    content: "",
    template_type: "document",
    variables: [],
    is_private: false,
    tags: []
  });

  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_document_templates')
        .select('*')
        .order('updated_at', { ascending: false }) as any;

      if (error) throw error;
      setTemplates((data || []) as any);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const extractVariables = (content: string): Array<{ name: string; description: string }> => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = content.match(regex) || [];
    const uniqueVars = [...new Set(matches.map(m => m.replace(/[{}]/g, '').trim()))];
    return uniqueVars.map(v => ({ name: v, description: `Variable: ${v}` }));
  };

  const handleSaveTemplate = async () => {
    try {
      const variables = extractVariables(formData.content);
      
      const templateData = {
        title: formData.title,
        content: formData.content,
        template_type: formData.template_type,
        variables: variables,
        is_private: formData.is_private,
        tags: formData.tags,
        pdf_settings: {
          fontSize: 12,
          margins: { top: 20, bottom: 20, left: 20, right: 20 },
          pageSize: 'a4'
        }
      };

      if (selectedTemplate) {
        const { error } = await supabase
          .from('ai_document_templates')
          .update(templateData as any)
          .eq('id', selectedTemplate.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Template updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('ai_document_templates')
          .insert([templateData as any]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Template created successfully"
        });
      }

      fetchTemplates();
      resetForm();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase
        .from('ai_document_templates')
        .delete()
        .eq('id', id) as any;

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      template_type: "document",
      variables: [],
      is_private: false,
      tags: []
    });
    setSelectedTemplate(null);
    setIsEditing(false);
  };

  const handleEditTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      title: template.title,
      content: template.content,
      template_type: template.template_type,
      variables: template.variables,
      is_private: template.is_private,
      tags: template.tags
    });
    setIsEditing(true);
  };

  const handlePreview = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    const initialData: Record<string, string> = {};
    template.variables.forEach(v => {
      initialData[v.name] = v.default || '';
    });
    setPreviewData(initialData);
    setIsPreviewOpen(true);
  };

  const replaceVariables = (content: string, data: Record<string, string>): string => {
    let result = content;
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  };

  const exportToPDF = async (template: DocumentTemplate, data: Record<string, string>) => {
    try {
      const content = replaceVariables(template.content, data);
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margins = template.pdf_settings?.margins || { top: 20, bottom: 20, left: 20, right: 20 };
      const maxWidth = pageWidth - margins.left - margins.right;
      
      doc.setFontSize(template.pdf_settings?.fontSize || 12);
      
      const lines = doc.splitTextToSize(content, maxWidth);
      doc.text(lines, margins.left, margins.top);
      
      doc.save(`${template.title.replace(/\s+/g, '_')}.pdf`);
      
      toast({
        title: "Success",
        description: "PDF exported successfully"
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive"
      });
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || t.template_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Document Templates
              </CardTitle>
              <CardDescription>
                Create, edit, and manage dynamic document templates with PDF export
              </CardDescription>
            </div>
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="letter">Letter</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Templates List */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No templates found. Create your first template to get started.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{template.template_type}</Badge>
                          {template.is_private && <Badge variant="secondary">Private</Badge>}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Variables: {template.variables.length}
                      </div>
                      {template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 pt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(template.content);
                            toast({ title: "Copied", description: "Template copied to clipboard" });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Template title"
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.template_type}
                onValueChange={(value) => setFormData({ ...formData, template_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Use {`{{variable_name}}`} for dynamic fields (e.g., {`{{client_name}}`}, {`{{mission_date}}`})
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter template content with variables..."
                rows={15}
                className="font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="private"
                checked={formData.is_private}
                onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
              />
              <Label htmlFor="private">Make this template private</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview & Export: {selectedTemplate?.title}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Fill in variables:</h3>
                <div className="space-y-3">
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable.name}>
                      <Label htmlFor={variable.name}>
                        {variable.name}
                        {variable.description && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({variable.description})
                          </span>
                        )}
                      </Label>
                      <Input
                        id={variable.name}
                        value={previewData[variable.name] || ''}
                        onChange={(e) =>
                          setPreviewData({ ...previewData, [variable.name]: e.target.value })
                        }
                        placeholder={`Enter ${variable.name}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Preview:</h3>
                <div className="border rounded-lg p-4 bg-muted/50 whitespace-pre-wrap">
                  {replaceVariables(selectedTemplate.content, previewData)}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => exportToPDF(selectedTemplate, previewData)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export to PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
