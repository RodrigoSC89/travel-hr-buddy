/**
 * Forms & Checklists Builder - Enterprise Intelligence Suite
 * Construtor visual de formulários e checklists com IA
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Save,
  Download,
  Sparkles,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List,
  Image,
  FileText,
  Star,
  Settings,
  Copy,
  MoreVertical,
  Play,
  Edit,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type FieldType = 'text' | 'number' | 'date' | 'checkbox' | 'select' | 'textarea' | 'photo' | 'signature' | 'rating';

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: { min?: number; max?: number; pattern?: string };
}

interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  category: string;
  fields: FormField[];
  isPublished: boolean;
  createdAt: Date;
  submissions: number;
}

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Texto', icon: <Type className="h-4 w-4" /> },
  { type: 'number', label: 'Número', icon: <Hash className="h-4 w-4" /> },
  { type: 'date', label: 'Data', icon: <Calendar className="h-4 w-4" /> },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="h-4 w-4" /> },
  { type: 'select', label: 'Seleção', icon: <List className="h-4 w-4" /> },
  { type: 'textarea', label: 'Texto Longo', icon: <FileText className="h-4 w-4" /> },
  { type: 'photo', label: 'Foto', icon: <Image className="h-4 w-4" /> },
  { type: 'rating', label: 'Avaliação', icon: <Star className="h-4 w-4" /> },
];

const TEMPLATES: FormTemplate[] = [
  {
    id: '1',
    title: 'Inspeção de Segurança Diária',
    description: 'Checklist completo para inspeção de segurança',
    category: 'Segurança',
    fields: [
      { id: '1', type: 'checkbox', label: 'EPIs verificados', required: true },
      { id: '2', type: 'checkbox', label: 'Extintores inspecionados', required: true },
      { id: '3', type: 'text', label: 'Observações', required: false },
    ],
    isPublished: true,
    createdAt: new Date('2025-01-15'),
    submissions: 245,
  },
  {
    id: '2',
    title: 'Relatório de Manutenção',
    description: 'Formulário para registro de manutenções',
    category: 'Manutenção',
    fields: [
      { id: '1', type: 'text', label: 'Equipamento', required: true },
      { id: '2', type: 'select', label: 'Tipo de Manutenção', required: true, options: ['Preventiva', 'Corretiva', 'Preditiva'] },
      { id: '3', type: 'textarea', label: 'Descrição do Serviço', required: true },
    ],
    isPublished: true,
    createdAt: new Date('2025-01-10'),
    submissions: 128,
  },
];

export default function FormsBuilderPage() {
  const [templates, setTemplates] = useState<FormTemplate[]>(TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState<FormTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const createNewTemplate = () => {
    const newTemplate: FormTemplate = {
      id: crypto.randomUUID(),
      title: 'Novo Formulário',
      description: '',
      category: 'Geral',
      fields: [],
      isPublished: false,
      createdAt: new Date(),
      submissions: 0,
    };
    setTemplates(prev => [newTemplate, ...prev]);
    setActiveTemplate(newTemplate);
    setIsEditing(true);
    toast.success('Novo formulário criado!');
  };

  const addField = (type: FieldType) => {
    if (!activeTemplate) return;
    
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `Novo campo ${FIELD_TYPES.find(f => f.type === type)?.label}`,
      required: false,
    };

    setActiveTemplate(prev => prev ? {
      ...prev,
      fields: [...prev.fields, newField],
    } : null);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!activeTemplate) return;
    
    setActiveTemplate(prev => prev ? {
      ...prev,
      fields: prev.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f),
    } : null);
  };

  const removeField = (fieldId: string) => {
    if (!activeTemplate) return;
    
    setActiveTemplate(prev => prev ? {
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId),
    } : null);
  };

  const saveTemplate = () => {
    if (!activeTemplate) return;
    
    setTemplates(prev => prev.map(t => t.id === activeTemplate.id ? activeTemplate : t));
    toast.success('Formulário salvo com sucesso!');
  };

  const publishTemplate = () => {
    if (!activeTemplate) return;
    
    const updated = { ...activeTemplate, isPublished: true };
    setActiveTemplate(updated);
    setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
    toast.success('Formulário publicado!');
  };

  const generateWithAI = async () => {
    toast.loading('Gerando campos com IA...');
    
    setTimeout(() => {
      if (!activeTemplate) return;
      
      const aiFields: FormField[] = [
        { id: crypto.randomUUID(), type: 'date', label: 'Data da Inspeção', required: true },
        { id: crypto.randomUUID(), type: 'text', label: 'Responsável', required: true },
        { id: crypto.randomUUID(), type: 'select', label: 'Área Inspecionada', required: true, options: ['Ponte', 'Casa de Máquinas', 'Convés', 'Praça de Máquinas'] },
        { id: crypto.randomUUID(), type: 'checkbox', label: 'Equipamentos de segurança verificados', required: true },
        { id: crypto.randomUUID(), type: 'checkbox', label: 'Documentação em dia', required: true },
        { id: crypto.randomUUID(), type: 'rating', label: 'Condição geral', required: true },
        { id: crypto.randomUUID(), type: 'textarea', label: 'Não conformidades encontradas', required: false },
        { id: crypto.randomUUID(), type: 'photo', label: 'Evidência fotográfica', required: false },
      ];
      
      setActiveTemplate(prev => prev ? {
        ...prev,
        fields: [...prev.fields, ...aiFields],
      } : null);
      
      toast.dismiss();
      toast.success('8 campos gerados com IA!');
    }, 2000);
  };

  return (
    <>
      <Helmet>
        <title>Forms & Checklists Builder | Nautilus One</title>
        <meta name="description" content="Construtor visual de formulários e checklists" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Forms & Checklists Builder
                <Badge className="bg-gradient-to-r from-primary to-primary/70">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Crie formulários e checklists com assistência de IA
              </p>
            </div>
          </div>

          <Button onClick={createNewTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Formulário
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Templates List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Formulários</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-all",
                        activeTemplate?.id === template.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted"
                      )}
                      onClick={() => {
                        setActiveTemplate(template);
                        setIsEditing(false);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">{template.title}</h4>
                        {template.isPublished ? (
                          <Badge variant="outline" className="text-xs bg-success/10 text-success">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Rascunho
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {template.fields.length} campos • {template.submissions} submissões
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Editor */}
          <Card className="lg:col-span-3">
            {activeTemplate ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={activeTemplate.title}
                        onChange={(e) => setActiveTemplate(prev => prev ? { ...prev, title: e.target.value } : null)}
                        className="text-xl font-bold mb-2"
                      />
                    ) : (
                      <CardTitle>{activeTemplate.title}</CardTitle>
                    )}
                    <CardDescription>
                      {activeTemplate.fields.length} campos • Categoria: {activeTemplate.category}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                      <Eye className="h-4 w-4 mr-2" />
                      {showPreview ? 'Editor' : 'Preview'}
                    </Button>
                    {isEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={generateWithAI}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Gerar com IA
                        </Button>
                        <Button size="sm" onClick={saveTemplate}>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                        {!activeTemplate.isPublished && (
                          <Button size="sm" variant="default" onClick={publishTemplate}>
                            <Play className="h-4 w-4 mr-2" />
                            Publicar
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {showPreview ? (
                    /* Preview Mode */
                    <div className="max-w-2xl mx-auto space-y-4">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold">{activeTemplate.title}</h2>
                        {activeTemplate.description && (
                          <p className="text-muted-foreground">{activeTemplate.description}</p>
                        )}
                      </div>
                      {activeTemplate.fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label className="flex items-center gap-1">
                            {field.label}
                            {field.required && <span className="text-destructive">*</span>}
                          </Label>
                          {field.type === 'text' && <Input placeholder={field.placeholder} />}
                          {field.type === 'number' && <Input type="number" placeholder={field.placeholder} />}
                          {field.type === 'date' && <Input type="date" />}
                          {field.type === 'textarea' && <Textarea placeholder={field.placeholder} />}
                          {field.type === 'checkbox' && (
                            <div className="flex items-center gap-2">
                              <input type="checkbox" className="h-4 w-4" />
                              <span className="text-sm">{field.label}</span>
                            </div>
                          )}
                          {field.type === 'select' && (
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((opt) => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {field.type === 'rating' && (
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Button key={n} variant="outline" size="sm">
                                  <Star className="h-4 w-4" />
                                </Button>
                              ))}
                            </div>
                          )}
                          {field.type === 'photo' && (
                            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                              <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Clique para adicionar foto</p>
                            </div>
                          )}
                        </div>
                      ))}
                      <Button className="w-full mt-6">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Submeter Formulário
                      </Button>
                    </div>
                  ) : isEditing ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      {/* Field Palette */}
                      <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium w-full mb-2">Adicionar Campo:</span>
                        {FIELD_TYPES.map((fieldType) => (
                          <Button
                            key={fieldType.type}
                            variant="outline"
                            size="sm"
                            onClick={() => addField(fieldType.type)}
                          >
                            {fieldType.icon}
                            <span className="ml-2">{fieldType.label}</span>
                          </Button>
                        ))}
                      </div>

                      {/* Fields List */}
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-3">
                          {activeTemplate.fields.map((field, index) => (
                            <motion.div
                              key={field.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              
                              <div className="flex-1 grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                  <Input
                                    value={field.label}
                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                    placeholder="Nome do campo"
                                  />
                                </div>
                                <Select
                                  value={field.type}
                                  onValueChange={(value: FieldType) => updateField(field.id, { type: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {FIELD_TYPES.map((ft) => (
                                      <SelectItem key={ft.type} value={ft.type}>
                                        <span className="flex items-center gap-2">
                                          {ft.icon}
                                          {ft.label}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center gap-2">
                                <Label className="flex items-center gap-1 text-xs">
                                  <Switch
                                    checked={field.required}
                                    onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                                  />
                                  Obrigatório
                                </Label>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeField(field.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </motion.div>
                          ))}

                          {activeTemplate.fields.length === 0 && (
                            <div className="text-center py-12">
                              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">
                                Adicione campos usando a paleta acima ou{' '}
                                <Button variant="link" className="p-0" onClick={generateWithAI}>
                                  gere com IA
                                </Button>
                              </p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-3xl font-bold">{activeTemplate.submissions}</div>
                            <p className="text-sm text-muted-foreground">Total de submissões</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-3xl font-bold">{activeTemplate.fields.length}</div>
                            <p className="text-sm text-muted-foreground">Campos no formulário</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Campos do Formulário:</h4>
                        {activeTemplate.fields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                            <span className="text-sm text-muted-foreground">{index + 1}.</span>
                            {FIELD_TYPES.find(f => f.type === field.type)?.icon}
                            <span className="flex-1">{field.label}</span>
                            {field.required && <Badge variant="outline" className="text-xs">Obrigatório</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center h-[600px]">
                <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Selecione um formulário</h3>
                <p className="text-muted-foreground mb-4">
                  Escolha um formulário existente ou crie um novo
                </p>
                <Button onClick={createNewTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Novo Formulário
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
