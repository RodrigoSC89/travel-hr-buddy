import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, Plus, Save, Download, Eye, Edit, Trash2, 
  Clock, Users, TrendingUp, History 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const DocumentTemplatesManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [variables, setVariables] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    content: '',
    category: '',
    tags: [],
    is_public: false
  });
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('document_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (templatesError) throw templatesError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('template_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (categoriesError) throw categoriesError;

      // Fetch variables dictionary
      const { data: variablesData, error: variablesError } = await supabase
        .from('template_variables_dictionary')
        .select('*')
        .order('display_name');

      if (variablesError) throw variablesError;

      setTemplates(templatesData || []);
      setCategories(categoriesData || []);
      setVariables(variablesData || []);

    } catch (error) {
      console.error('Error fetching templates data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const templateData = {
        ...templateForm,
        user_id: user.id
      };

      if (selectedTemplate?.id) {
        // Update existing
        const { error } = await supabase
          .from('document_templates')
          .update(templateData)
          .eq('id', selectedTemplate.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Template updated successfully' });
      } else {
        // Create new
        const { error } = await supabase
          .from('document_templates')
          .insert([templateData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Template created successfully' });
      }

      setEditMode(false);
      setSelectedTemplate(null);
      setTemplateForm({
        name: '',
        description: '',
        content: '',
        category: '',
        tags: [],
        is_public: false
      });
      fetchData();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive'
      });
    }
  };

  const substituteVariables = (content: string, values: Record<string, string>) => {
    let result = content;
    Object.entries(values).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value);
    });
    return result;
  };

  const exportToPDF = async (template: any) => {
    try {
      const content = substituteVariables(template.content, variableValues);
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(template.name, 14, 20);
      
      // Add content (simplified - would need better formatting)
      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(content, 180);
      doc.text(splitText, 14, 35);
      
      const fileName = `${template.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      doc.save(fileName);

      // Log usage
      await supabase.rpc('log_template_usage', {
        p_template_id: template.id,
        p_export_type: 'pdf',
        p_variables: variableValues,
        p_file_name: fileName
      });

      toast({
        title: 'Success',
        description: 'Template exported to PDF'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export template',
        variant: 'destructive'
      });
    }
  };

  const exportToWord = async (template: any) => {
    try {
      const content = substituteVariables(template.content, variableValues);
      
      // Create Word document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: template.name,
                  bold: true,
                  size: 32
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: content
                })
              ]
            })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `${template.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.docx`;
      saveAs(blob, fileName);

      // Log usage
      await supabase.rpc('log_template_usage', {
        p_template_id: template.id,
        p_export_type: 'docx',
        p_variables: variableValues,
        p_file_name: fileName
      });

      toast({
        title: 'Success',
        description: 'Template exported to Word'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export template',
        variant: 'destructive'
      });
    }
  };

  const editTemplate = (template: any) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description || '',
      content: template.content,
      category: template.category || '',
      tags: template.tags || [],
      is_public: template.is_public
    });
    setEditMode(true);
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Template deleted successfully'
      });
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Document Templates</h1>
        </div>
        <Button onClick={() => setEditMode(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {editMode ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTemplate ? 'Edit Template' : 'Create New Template'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder="Enter template name"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={templateForm.description}
                onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={templateForm.category}
                onValueChange={(value) => setTemplateForm({ ...templateForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                value={templateForm.content}
                onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                placeholder="Use {{variable_name}} for dynamic values"
                rows={15}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available variables: {variables.map((v: any) => `{{${v.variable_name}}}`).join(', ')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={templateForm.is_public}
                onChange={(e) => setTemplateForm({ ...templateForm, is_public: e.target.checked })}
                id="is_public"
              />
              <Label htmlFor="is_public">Make template public</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
              <Button variant="outline" onClick={() => { setEditMode(false); setSelectedTemplate(null); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="library" className="w-full">
          <TabsList>
            <TabsTrigger value="library">Template Library</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="history">Usage History</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <p>Loading templates...</p>
              ) : templates.length === 0 ? (
                <p className="text-muted-foreground col-span-3">No templates found</p>
              ) : (
                templates.map((template: any) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        </div>
                        {template.is_public && (
                          <Badge variant="secondary">Public</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {template.category && (
                          <Badge variant="outline">{template.category}</Badge>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Variables: {template.variables?.length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Updated: {format(new Date(template.updated_at), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" onClick={() => editTemplate(template)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setSelectedTemplate(template)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => exportToPDF(template)}>
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteTemplate(template.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="popular">
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Popular templates will appear here based on usage</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Usage History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Template usage history will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Preview Dialog */}
      {selectedTemplate && !editMode && (
        <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Preview</span>
              <Button size="sm" variant="ghost" onClick={() => setSelectedTemplate(null)}>×</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedTemplate.variables?.map((variable: string) => (
                <div key={variable}>
                  <Label>{variable}</Label>
                  <Input
                    value={variableValues[variable] || ''}
                    onChange={(e) => setVariableValues({
                      ...variableValues,
                      [variable]: e.target.value
                    })}
                    placeholder={`Enter ${variable}`}
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <Button size="sm" onClick={() => exportToPDF(selectedTemplate)}>
                  <Download className="h-3 w-3 mr-1" />
                  PDF
                </Button>
                <Button size="sm" onClick={() => exportToWord(selectedTemplate)}>
                  <Download className="h-3 w-3 mr-1" />
                  Word
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentTemplatesManager;
