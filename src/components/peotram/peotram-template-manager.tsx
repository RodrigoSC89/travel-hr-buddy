import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Ship,
  Building,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PeotramTemplate {
  id: string;
  year: number;
  version: string;
  template_data: {
    elements: Array<{
      number: string;
      name: string;
      requirements: string[];
    }>;
  };
  is_active: boolean;
  checklist_type: "vessel" | "shore";
  created_at: string;
}

interface TemplateManagerProps {
  templates: PeotramTemplate[];
  onTemplateUpdate: (template: PeotramTemplate) => void;
}

export const PeotramTemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onTemplateUpdate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PeotramTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<PeotramTemplate>>({});

  const createNewTemplate = async (templateData: any) => {
    try {
      const { data, error } = await supabase
        .from("peotram_templates")
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;

      // Trigger refresh of templates list
      window.location.reload();

      toast({
        title: "Sucesso",
        description: "Template PEOTRAM criado com sucesso!",
      });
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o template.",
        variant: "destructive",
      });
    }
  };

  const updateTemplate = async (id: string, updates: any) => {
    try {
      const { error } = await supabase.from("peotram_templates").update(updates).eq("id", id);

      if (error) throw error;

      await onTemplateUpdate(editingTemplate as PeotramTemplate);
      setIsEditDialogOpen(false);

      toast({
        title: "Sucesso",
        description: "Template atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o template.",
        variant: "destructive",
      });
    }
  };

  const toggleTemplateStatus = async (template: PeotramTemplate) => {
    await updateTemplate(template.id, { is_active: !template.is_active });
  };

  const currentYear = new Date().getFullYear();
  const vesselTemplates = templates.filter(t => t.checklist_type === "vessel");
  const shoreTemplates = templates.filter(t => t.checklist_type === "shore");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vessel Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Templates para Embarcações
            </CardTitle>
            <CardDescription>Templates específicos para auditorias em navios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {vesselTemplates.map(template => (
              <div key={template.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.year} v{template.version}
                    </Badge>
                    {template.is_active && (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTemplate(template);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTemplateStatus(template)}
                    >
                      {template.is_active ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {template.template_data.elements?.length || 0} elementos configurados
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Shore Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Templates para Base Terrestre
            </CardTitle>
            <CardDescription>
              Templates específicos para auditorias em escritórios e bases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {shoreTemplates.map(template => (
              <div key={template.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.year} v{template.version}
                    </Badge>
                    {template.is_active && (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTemplate(template);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTemplateStatus(template)}
                    >
                      {template.is_active ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {template.template_data.elements?.length || 0} elementos configurados
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Template Details/Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar Template PEOTRAM {editingTemplate.year} -{" "}
              {editingTemplate.checklist_type === "vessel" ? "Embarcação" : "Base Terrestre"}
            </DialogTitle>
            <DialogDescription>
              Configure os elementos e requisitos do template PEOTRAM
            </DialogDescription>
          </DialogHeader>

          {editingTemplate.template_data?.elements && (
            <div className="space-y-4">
              {editingTemplate.template_data.elements.map((element, index) => (
                <Card key={element.number}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      Elemento {element.number}: {element.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Requisitos:</Label>
                      <ul className="space-y-1">
                        {element.requirements.map((req, reqIndex) => (
                          <li
                            key={reqIndex}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (editingTemplate.id) {
                  updateTemplate(editingTemplate.id, {
                    template_data: editingTemplate.template_data,
                  });
                }
              }}
            >
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
