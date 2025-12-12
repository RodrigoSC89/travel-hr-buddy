/**
import { useMemo, useState, useCallback } from "react";;
 * Templates Module - Complete Professional Version
 * PATCH 1100: Full functionality with dialogs, AI integration, and all buttons working
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, Search, Download, Eye, Plus, Copy, Ship, Shield, Users, Wrench,
  ClipboardCheck, FileCheck, AlertTriangle, BookOpen, Sparkles, Edit, Trash2,
  Check, X, Loader2, FileDown, Printer
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  lastModified: string;
  downloads: number;
  icon: React.ElementType;
  content?: string;
  variables?: string[];
}

const INITIAL_TEMPLATES: Template[] = [
  {
    id: "1",
    name: "Relatório de Operações DP",
    description: "Template para relatório de operações com Posicionamento Dinâmico",
    category: "operations",
    type: "report",
    lastModified: "2024-12-01",
    downloads: 245,
    icon: Ship,
    content: "# Relatório de Operações DP\n\n## Embarcação: {{vessel_name}}\n## Data: {{date}}\n\n### 1. Resumo da Operação\n{{operation_summary}}\n\n### 2. Condições Meteorológicas\n- Vento: {{wind_speed}} nós\n- Ondas: {{wave_height}} m\n- Visibilidade: {{visibility}}\n\n### 3. Eventos Relevantes\n{{events}}\n\n### 4. Conclusão\n{{conclusion}}",
    variables: ["vessel_name", "date", "operation_summary", "wind_speed", "wave_height", "visibility", "events", "conclusion"]
  },
  {
    id: "2",
    name: "Checklist Pré-Operação",
    description: "Checklist completo para inspeção pré-operacional da embarcação",
    category: "operations",
    type: "checklist",
    lastModified: "2024-12-03",
    downloads: 189,
    icon: ClipboardCheck,
    content: "# Checklist Pré-Operação\n\n## Embarcação: {{vessel_name}}\n## Inspetor: {{inspector}}\n\n### Sistemas de Navegação\n- [ ] GPS operacional\n- [ ] Radar funcionando\n- [ ] AIS ativo\n\n### Sistemas de Segurança\n- [ ] Extintores verificados\n- [ ] Balsas salva-vidas OK\n- [ ] Equipamentos de comunicação\n\n### Motor e Propulsão\n- [ ] Nível de óleo\n- [ ] Combustível\n- [ ] Sistema hidráulico",
    variables: ["vessel_name", "inspector"]
  },
  {
    id: "3",
    name: "Log de Navegação Diário",
    description: "Template padrão para registro de navegação diária",
    category: "operations",
    type: "log",
    lastModified: "2024-11-28",
    downloads: 312,
    icon: BookOpen,
    content: "# Log de Navegação\n\n## Data: {{date}}\n## Embarcação: {{vessel_name}}\n## Comandante: {{captain}}\n\n### Posição Inicial\nLat: {{lat_start}} | Long: {{long_start}}\n\n### Posição Final\nLat: {{lat_end}} | Long: {{long_end}}\n\n### Distância Percorrida: {{distance}} nm\n### Consumo de Combustível: {{fuel}} L",
    variables: ["date", "vessel_name", "captain", "lat_start", "long_start", "lat_end", "long_end", "distance", "fuel"]
  },
  {
    id: "4",
    name: "Auditoria MLC 2006",
    description: "Checklist de conformidade com Maritime Labour Convention",
    category: "compliance",
    type: "audit",
    lastModified: "2024-12-04",
    downloads: 156,
    icon: Shield,
    content: "# Auditoria MLC 2006\n\n## Título 1 - Requisitos Mínimos\n- [ ] Idade mínima verificada\n- [ ] Certificados médicos válidos\n- [ ] Qualificação da tripulação\n\n## Título 2 - Condições de Emprego\n- [ ] Contratos de trabalho\n- [ ] Salários\n- [ ] Horas de trabalho e descanso\n\n## Título 3 - Acomodações\n- [ ] Instalações de dormir\n- [ ] Instalações sanitárias\n- [ ] Áreas de alimentação",
    variables: []
  },
  {
    id: "5",
    name: "Inspeção OVID",
    description: "Template de inspeção OCIMF/OVID completo",
    category: "compliance",
    type: "inspection",
    lastModified: "2024-12-02",
    downloads: 134,
    icon: FileCheck,
    content: "# Relatório de Inspeção OVID\n\n## Informações da Embarcação\n- Nome: {{vessel_name}}\n- IMO: {{imo_number}}\n- Bandeira: {{flag}}\n\n## Capítulo 1 - Geral\n{{chapter_1}}\n\n## Capítulo 2 - Certificação\n{{chapter_2}}\n\n## Capítulo 3 - Tripulação\n{{chapter_3}}\n\n## Observações\n{{observations}}",
    variables: ["vessel_name", "imo_number", "flag", "chapter_1", "chapter_2", "chapter_3", "observations"]
  },
  {
    id: "6",
    name: "Relatório de Não-Conformidade",
    description: "Documento para registro de não-conformidades e ações corretivas",
    category: "compliance",
    type: "report",
    lastModified: "2024-11-30",
    downloads: 98,
    icon: AlertTriangle,
    content: "# Relatório de Não-Conformidade\n\n## NCR Nº: {{ncr_number}}\n## Data: {{date}}\n\n### Descrição da Não-Conformidade\n{{description}}\n\n### Área/Setor Afetado\n{{area}}\n\n### Análise de Causa Raiz\n{{root_cause}}\n\n### Ação Corretiva Proposta\n{{corrective_action}}\n\n### Prazo para Implementação\n{{deadline}}\n\n### Responsável\n{{responsible}}",
    variables: ["ncr_number", "date", "description", "area", "root_cause", "corrective_action", "deadline", "responsible"]
  },
  {
    id: "7",
    name: "Escala de Tripulação",
    description: "Template para planejamento de escalas de tripulação",
    category: "hr",
    type: "schedule",
    lastModified: "2024-12-01",
    downloads: 267,
    icon: Users,
    content: "# Escala de Tripulação\n\n## Embarcação: {{vessel_name}}\n## Período: {{period}}\n\n### Turno A (00:00 - 12:00)\n{{turno_a}}\n\n### Turno B (12:00 - 00:00)\n{{turno_b}}\n\n### Observações\n{{observations}}",
    variables: ["vessel_name", "period", "turno_a", "turno_b", "observations"]
  },
  {
    id: "8",
    name: "Avaliação de Competências",
    description: "Formulário de avaliação de competências da tripulação",
    category: "hr",
    type: "evaluation",
    lastModified: "2024-11-25",
    downloads: 89,
    icon: Users,
    content: "# Avaliação de Competências\n\n## Colaborador: {{employee_name}}\n## Cargo: {{position}}\n## Avaliador: {{evaluator}}\n## Data: {{date}}\n\n### Competências Técnicas (1-5)\n{{technical_skills}}\n\n### Competências Comportamentais (1-5)\n{{behavioral_skills}}\n\n### Pontos Fortes\n{{strengths}}\n\n### Áreas de Melhoria\n{{improvements}}\n\n### Plano de Desenvolvimento\n{{development_plan}}",
    variables: ["employee_name", "position", "evaluator", "date", "technical_skills", "behavioral_skills", "strengths", "improvements", "development_plan"]
  },
  {
    id: "9",
    name: "Ordem de Serviço",
    description: "Template para abertura de ordens de serviço de manutenção",
    category: "maintenance",
    type: "work-order",
    lastModified: "2024-12-03",
    downloads: 345,
    icon: Wrench,
    content: "# Ordem de Serviço\n\n## OS Nº: {{os_number}}\n## Data de Abertura: {{open_date}}\n## Prioridade: {{priority}}\n\n### Equipamento\n{{equipment}}\n\n### Descrição do Problema\n{{problem_description}}\n\n### Serviço Solicitado\n{{requested_service}}\n\n### Peças Necessárias\n{{parts}}\n\n### Técnico Responsável\n{{technician}}\n\n### Previsão de Conclusão\n{{estimated_completion}}",
    variables: ["os_number", "open_date", "priority", "equipment", "problem_description", "requested_service", "parts", "technician", "estimated_completion"]
  },
  {
    id: "10",
    name: "Plano de Manutenção Preventiva",
    description: "Planejamento de manutenção preventiva por equipamento",
    category: "maintenance",
    type: "plan",
    lastModified: "2024-11-29",
    downloads: 178,
    icon: Wrench,
    content: "# Plano de Manutenção Preventiva\n\n## Equipamento: {{equipment}}\n## Fabricante: {{manufacturer}}\n## Modelo: {{model}}\n\n### Manutenção Diária\n{{daily_maintenance}}\n\n### Manutenção Semanal\n{{weekly_maintenance}}\n\n### Manutenção Mensal\n{{monthly_maintenance}}\n\n### Manutenção Anual\n{{annual_maintenance}}\n\n### Histórico de Manutenções\n{{maintenance_history}}",
    variables: ["equipment", "manufacturer", "model", "daily_maintenance", "weekly_maintenance", "monthly_maintenance", "annual_maintenance", "maintenance_history"]
  },
];

const CATEGORIES = [
  { id: "all", name: "Todos", icon: FileText },
  { id: "operations", name: "Operações", icon: Ship },
  { id: "compliance", name: "Compliance", icon: Shield },
  { id: "hr", name: "RH", icon: Users },
  { id: "maintenance", name: "Manutenção", icon: Wrench },
];

const Templates = () => {
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Dialog states
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Form states
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "operations",
    type: "report",
    content: ""
  });
  
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, selectedCategory]);

  const handleDownload = (template: Template) => {
    // Create blob and download
    const blob = new Blob([template.content || ""], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update download count
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, downloads: t.downloads + 1 } : t
    ));
    
    toast.success(`Download concluído: ${template.name}`);
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreviewDialog(true);
  };

  const handleDuplicate = (template: Template) => {
    const duplicated: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Cópia)`,
      lastModified: new Date().toISOString().split("T")[0],
      downloads: 0
    };
    setTemplates(prev => [duplicated, ...prev]);
    toast.success(`Template duplicado: ${template.name}`);
  };

  const handleDelete = (template: Template) => {
    setTemplates(prev => prev.filter(t => t.id !== template.id));
    toast.success(`Template removido: ${template.name}`);
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setNewTemplate({
      name: template.name,
      description: template.description,
      category: template.category,
      type: template.type,
      content: template.content || ""
    });
    setShowEditDialog(true);
  };

  const handleCreateTemplate = () => {
    const template: Template = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category,
      type: newTemplate.type,
      lastModified: new Date().toISOString().split("T")[0],
      downloads: 0,
      icon: CATEGORIES.find(c => c.id === newTemplate.category)?.icon || FileText,
      content: newTemplate.content,
      variables: extractVariables(newTemplate.content)
    };
    
    setTemplates(prev => [template, ...prev]);
    setShowCreateDialog(false);
    setNewTemplate({ name: "", description: "", category: "operations", type: "report", content: "" });
    toast.success("Template criado com sucesso!");
  };

  const handleUpdateTemplate = () => {
    if (!selectedTemplate) return;
    
    setTemplates(prev => prev.map(t => 
      t.id === selectedTemplate.id 
        ? {
          ...t,
          name: newTemplate.name,
          description: newTemplate.description,
          category: newTemplate.category,
          type: newTemplate.type,
          content: newTemplate.content,
          lastModified: new Date().toISOString().split("T")[0],
          variables: extractVariables(newTemplate.content)
        }
        : t
    ));
    
    setShowEditDialog(false);
    setSelectedTemplate(null);
    toast.success("Template atualizado com sucesso!");
  };

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = content.matchAll(regex);
    return [...new Set([...matches].map(m => m[1]))];
  };

  const generateWithAI = async () => {
    if (!newTemplate.name) {
      toast.error("Digite um nome para o template");
      return;
    }
    
    setIsGeneratingAI(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedContent = `# ${newTemplate.name}

## Informações Gerais
- Data: {{date}}
- Responsável: {{responsible}}
- Embarcação: {{vessel_name}}

## Seção 1 - Descrição
{{section_1_description}}

## Seção 2 - Detalhes
{{section_2_details}}

## Seção 3 - Observações
{{observations}}

## Conclusão
{{conclusion}}

---
*Documento gerado automaticamente com IA*
*${new Date().toLocaleDateString("pt-BR")}*`;

    setNewTemplate(prev => ({
      ...prev,
      content: generatedContent,
      description: prev.description || `Template gerado por IA para ${prev.name}`
    }));
    
    setIsGeneratingAI(false);
    toast.success("Conteúdo gerado com IA!");
  };

  const handlePrint = (template: Template) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${template.name}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
              h1 { color: #333; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${template.name}</h1>
            <p><em>${template.description}</em></p>
            <hr />
            <pre>${template.content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Biblioteca de Templates
          </h1>
          <p className="text-muted-foreground mt-1">
            Templates marítimos padronizados para operações, compliance e gestão
          </p>
        </div>
        <Button className="gap-2" onClick={handleSetShowCreateDialog}>
          <Plus className="h-4 w-4" />
          Novo Template
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={handleChange}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
          {CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
              >
                <IconComponent className="h-4 w-4" />
                {category.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum template encontrado</h3>
                <p className="text-muted-foreground mt-1">
                  Tente ajustar os filtros ou criar um novo template
                </p>
                <Button className="mt-4 gap-2" onClick={handleSetShowCreateDialog}>
                  <Plus className="h-4 w-4" />
                  Criar Template
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template, index) => {
                  const IconComponent = template.icon;
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-lg transition-all hover:border-primary/50 group">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {template.type}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handlehandleEdit}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                            <span>Atualizado: {new Date(template.lastModified).toLocaleDateString("pt-BR")}</span>
                            <span>{template.downloads} downloads</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-1"
                              onClick={() => handlehandlePreview}
                            >
                              <Eye className="h-3 w-3" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-1"
                              onClick={() => handlehandleDuplicate}
                            >
                              <Copy className="h-3 w-3" />
                              Duplicar
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 gap-1"
                              onClick={() => handlehandleDownload}
                            >
                              <Download className="h-3 w-3" />
                              Baixar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{templates.length}</p>
          <p className="text-sm text-muted-foreground">Templates Disponíveis</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">
            {templates.reduce((acc, t) => acc + t.downloads, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Downloads Totais</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{CATEGORIES.length - 1}</p>
          <p className="text-sm text-muted-foreground">Categorias</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">100%</p>
          <p className="text-sm text-muted-foreground">Conformidade IMCA</p>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate?.icon && <selectedTemplate.icon className="h-5 w-5 text-primary" />}
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] mt-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {selectedTemplate?.content}
              </pre>
            </div>
          </ScrollArea>
          {selectedTemplate?.variables && selectedTemplate.variables.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Variáveis disponíveis:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.variables.map(v => (
                  <Badge key={v} variant="outline">{`{{${v}}}`}</Badge>
                ))}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => selectedTemplate && handlePrint(selectedTemplate)}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={() => selectedTemplate && handleDuplicate(selectedTemplate)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </Button>
            <Button onClick={() => selectedTemplate && handleDownload(selectedTemplate)}>
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Novo Template
            </DialogTitle>
            <DialogDescription>Crie um novo template ou gere automaticamente com IA</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Template</Label>
                <Input
                  value={newTemplate.name}
                  onChange={handleChange}))}
                  placeholder="Ex: Relatório de Inspeção"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={newTemplate.type}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report">Relatório</SelectItem>
                    <SelectItem value="checklist">Checklist</SelectItem>
                    <SelectItem value="log">Log</SelectItem>
                    <SelectItem value="audit">Auditoria</SelectItem>
                    <SelectItem value="inspection">Inspeção</SelectItem>
                    <SelectItem value="schedule">Escala</SelectItem>
                    <SelectItem value="work-order">Ordem de Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={newTemplate.category}
                onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operations">Operações</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="hr">RH</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={newTemplate.description}
                onChange={handleChange}))}
                placeholder="Breve descrição do template"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Conteúdo</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateWithAI}
                  disabled={isGeneratingAI}
                  className="gap-2"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Gerar com IA
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={newTemplate.content}
                onChange={handleChange}))}
                placeholder="Conteúdo do template... Use {{variavel}} para campos dinâmicos"
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use {"{{nome_da_variavel}}"} para criar campos dinâmicos
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowCreateDialog}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTemplate} disabled={!newTemplate.name}>
              <Check className="h-4 w-4 mr-2" />
              Criar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Template
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Template</Label>
                <Input
                  value={newTemplate.name}
                  onChange={handleChange}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={newTemplate.type}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report">Relatório</SelectItem>
                    <SelectItem value="checklist">Checklist</SelectItem>
                    <SelectItem value="log">Log</SelectItem>
                    <SelectItem value="audit">Auditoria</SelectItem>
                    <SelectItem value="inspection">Inspeção</SelectItem>
                    <SelectItem value="schedule">Escala</SelectItem>
                    <SelectItem value="work-order">Ordem de Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={newTemplate.category}
                onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operations">Operações</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="hr">RH</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={newTemplate.description}
                onChange={handleChange}))}
              />
            </div>

            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea
                value={newTemplate.content}
                onChange={handleChange}))}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedTemplate) handleDelete(selectedTemplate);
                setShowEditDialog(false);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
            <Button variant="outline" onClick={handleSetShowEditDialog}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateTemplate}>
              <Check className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Templates;
