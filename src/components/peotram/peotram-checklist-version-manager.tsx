import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Copy,
  Download,
  Upload,
  Calendar,
  Ship,
  GripVertical,
  Check,
  X,
  FileJson,
  FileSpreadsheet,
  FileText,
  Settings2
} from 'lucide-react';
import { toast } from 'sonner';

interface ChecklistRequirement {
  id: string;
  code: string;
  description: string;
  weight: number;
  mandatory: boolean;
  vesselTypes?: string[]; // PSV, OSRV, AHTS, etc.
}

interface ChecklistElement {
  id: string;
  number: string;
  name: string;
  requirements: ChecklistRequirement[];
  totalWeight: number;
}

interface ChecklistTemplate {
  id: string;
  year: number;
  version: string;
  vesselType: 'PSV' | 'OSRV' | 'AHTS' | 'ALL';
  isActive: boolean;
  elements: ChecklistElement[];
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

const VESSEL_TYPES = [
  { value: 'PSV', label: 'PSV - Platform Supply Vessel', color: 'bg-blue-100 text-blue-800' },
  { value: 'OSRV', label: 'OSRV - Oil Spill Response Vessel', color: 'bg-green-100 text-green-800' },
  { value: 'AHTS', label: 'AHTS - Anchor Handling Tug Supply', color: 'bg-purple-100 text-purple-800' },
  { value: 'ALL', label: 'Todos os Tipos', color: 'bg-gray-100 text-gray-800' },
];

export const PeotramChecklistVersionManager: React.FC = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([
    {
      id: 'tpl-2024-1',
      year: 2024,
      version: '2024.1',
      vesselType: 'ALL',
      isActive: true,
      elements: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      description: 'Template padrão PEOTRAM 2024',
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingElement, setEditingElement] = useState<ChecklistElement | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const createNewTemplate = () => {
    const newTemplate: ChecklistTemplate = {
      id: `tpl-${Date.now()}`,
      year: new Date().getFullYear(),
      version: `${new Date().getFullYear()}.1`,
      vesselType: 'ALL',
      isActive: false,
      elements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTemplates([...templates, newTemplate]);
    setSelectedTemplate(newTemplate);
    setIsEditing(true);
    toast.success('Novo template criado!');
  };

  const duplicateTemplate = (template: ChecklistTemplate) => {
    const newTemplate: ChecklistTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      version: `${template.year}.${parseInt(template.version.split('.')[1] || '1') + 1}`,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTemplates([...templates, newTemplate]);
    toast.success('Template duplicado!');
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
    }
    toast.success('Template removido!');
  };

  const activateTemplate = (templateId: string) => {
    setTemplates(templates.map(t => ({
      ...t,
      isActive: t.id === templateId,
    })));
    toast.success('Template ativado!');
  };

  const addElement = () => {
    if (!selectedTemplate) return;

    const newElement: ChecklistElement = {
      id: `elem-${Date.now()}`,
      number: `ELEM_${selectedTemplate.elements.length + 1}`,
      name: 'Novo Elemento',
      requirements: [],
      totalWeight: 0,
    };

    setSelectedTemplate({
      ...selectedTemplate,
      elements: [...selectedTemplate.elements, newElement],
      updatedAt: new Date(),
    });

    setEditingElement(newElement);
  };

  const addRequirement = (elementId: string) => {
    if (!selectedTemplate) return;

    const newRequirement: ChecklistRequirement = {
      id: `req-${Date.now()}`,
      code: `REQ_${Date.now()}`,
      description: 'Novo requisito',
      weight: 1,
      mandatory: false,
    };

    setSelectedTemplate({
      ...selectedTemplate,
      elements: selectedTemplate.elements.map(elem =>
        elem.id === elementId
          ? {
              ...elem,
              requirements: [...elem.requirements, newRequirement],
              totalWeight: elem.totalWeight + newRequirement.weight,
            }
          : elem
      ),
      updatedAt: new Date(),
    });
  };

  const updateRequirement = (elementId: string, reqId: string, updates: Partial<ChecklistRequirement>) => {
    if (!selectedTemplate) return;

    setSelectedTemplate({
      ...selectedTemplate,
      elements: selectedTemplate.elements.map(elem =>
        elem.id === elementId
          ? {
              ...elem,
              requirements: elem.requirements.map(req =>
                req.id === reqId ? { ...req, ...updates } : req
              ),
              totalWeight: elem.requirements.reduce((sum, req) =>
                sum + (req.id === reqId ? (updates.weight || req.weight) : req.weight), 0
              ),
            }
          : elem
      ),
      updatedAt: new Date(),
    });
  };

  const deleteRequirement = (elementId: string, reqId: string) => {
    if (!selectedTemplate) return;

    setSelectedTemplate({
      ...selectedTemplate,
      elements: selectedTemplate.elements.map(elem =>
        elem.id === elementId
          ? {
              ...elem,
              requirements: elem.requirements.filter(req => req.id !== reqId),
              totalWeight: elem.requirements
                .filter(req => req.id !== reqId)
                .reduce((sum, req) => sum + req.weight, 0),
            }
          : elem
      ),
      updatedAt: new Date(),
    });
  };

  const saveTemplate = () => {
    if (!selectedTemplate) return;

    setTemplates(templates.map(t =>
      t.id === selectedTemplate.id ? selectedTemplate : t
    ));

    setIsEditing(false);
    toast.success('Template salvo com sucesso!');
  };

  const exportTemplate = (format: 'json' | 'excel' | 'pdf') => {
    if (!selectedTemplate) return;

    switch (format) {
      case 'json':
        const blob = new Blob([JSON.stringify(selectedTemplate, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `peotram-template-${selectedTemplate.version}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Template exportado como JSON!');
        break;
      case 'excel':
        toast.info('Exportação Excel em desenvolvimento');
        break;
      case 'pdf':
        toast.info('Exportação PDF em desenvolvimento');
        break;
    }
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!selectedTemplate || !draggedItem) return;

    const elements = [...selectedTemplate.elements];
    const draggedIndex = elements.findIndex(e => e.id === draggedItem);
    const targetIndex = elements.findIndex(e => e.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = elements.splice(draggedIndex, 1);
      elements.splice(targetIndex, 0, removed);

      setSelectedTemplate({
        ...selectedTemplate,
        elements,
        updatedAt: new Date(),
      });
    }

    setDraggedItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Gerenciador de Versões de Checklist</CardTitle>
                <CardDescription>
                  Controle de versões por ciclo e customização por tipo de embarcação
                </CardDescription>
              </div>
            </div>
            <Button onClick={createNewTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Templates Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'bg-primary/5 border-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{template.version}</span>
                  </div>
                  {template.isActive && (
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Badge
                    variant="outline"
                    className={VESSEL_TYPES.find(v => v.value === template.vesselType)?.color}
                  >
                    {template.vesselType}
                  </Badge>
                  <span className="text-muted-foreground">
                    {template.elements.length} elementos
                  </span>
                </div>
                <div className="flex gap-1 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateTemplate(template);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {!template.isActive && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          activateTemplate(template.id);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTemplate(template.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Template Editor */}
        <Card className="lg:col-span-2">
          {selectedTemplate ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Editor de Template: {selectedTemplate.version}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportTemplate('json')}
                    >
                      <FileJson className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportTemplate('excel')}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportTemplate('pdf')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    {isEditing ? (
                      <Button onClick={saveTemplate}>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Metadata */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label>Ano</Label>
                    <Input
                      type="number"
                      value={selectedTemplate.year}
                      onChange={(e) =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          year: parseInt(e.target.value),
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Versão</Label>
                    <Input
                      value={selectedTemplate.version}
                      onChange={(e) =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          version: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Tipo de Embarcação</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={selectedTemplate.vesselType}
                      onChange={(e) =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          vesselType: e.target.value as any,
                        })
                      }
                      disabled={!isEditing}
                    >
                      {VESSEL_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Elements List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Elementos do Checklist</h3>
                    {isEditing && (
                      <Button size="sm" onClick={addElement}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Elemento
                      </Button>
                    )}
                  </div>

                  {selectedTemplate.elements.map((element) => (
                    <div
                      key={element.id}
                      draggable={isEditing}
                      onDragStart={() => handleDragStart(element.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(element.id)}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        {isEditing && (
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                        )}
                        <div className="flex-1">
                          <Input
                            value={element.name}
                            onChange={(e) =>
                              setSelectedTemplate({
                                ...selectedTemplate,
                                elements: selectedTemplate.elements.map(elem =>
                                  elem.id === element.id
                                    ? { ...elem, name: e.target.value }
                                    : elem
                                ),
                              })
                            }
                            disabled={!isEditing}
                            className="font-medium"
                          />
                        </div>
                        <Badge variant="secondary">
                          Peso Total: {element.totalWeight}
                        </Badge>
                      </div>

                      {/* Requirements */}
                      <div className="pl-8 space-y-2">
                        {element.requirements.map((req) => (
                          <div key={req.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                            <Input
                              value={req.description}
                              onChange={(e) =>
                                updateRequirement(element.id, req.id, {
                                  description: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                              className="flex-1"
                              placeholder="Descrição do requisito"
                            />
                            <Input
                              type="number"
                              value={req.weight}
                              onChange={(e) =>
                                updateRequirement(element.id, req.id, {
                                  weight: parseInt(e.target.value) || 1,
                                })
                              }
                              disabled={!isEditing}
                              className="w-20"
                              placeholder="Peso"
                            />
                            <input
                              type="checkbox"
                              checked={req.mandatory}
                              onChange={(e) =>
                                updateRequirement(element.id, req.id, {
                                  mandatory: e.target.checked,
                                })
                              }
                              disabled={!isEditing}
                              className="w-4 h-4"
                              title="Obrigatório"
                            />
                            {isEditing && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteRequirement(element.id, req.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addRequirement(element.id)}
                          >
                            <Plus className="h-3 w-3 mr-2" />
                            Adicionar Requisito
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="py-12 text-center text-muted-foreground">
              <Settings2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Selecione um template para editar</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};
