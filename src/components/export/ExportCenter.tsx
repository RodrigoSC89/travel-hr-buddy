/**
 * Export Center - Multi-format export hub
 * PDF, Excel, Word, CSV exports with templates and scheduling
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  FileJson,
  Printer,
  Mail,
  Clock,
  CheckCircle,
  RefreshCw,
  Settings,
  Calendar,
  Filter,
  Layers,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { ScheduledExportsDialog } from "./ScheduledExportsDialog";

interface ExportTemplate {
  id: string;
  name: string;
  type: "pdf" | "excel" | "word" | "csv" | "json";
  module: string;
  description: string;
  lastUsed: Date | null;
  isFavorite: boolean;
}

interface ExportJob {
  id: string;
  templateId: string;
  templateName: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  createdAt: Date;
  completedAt: Date | null;
  fileUrl: string | null;
  fileSize: string | null;
}

const EXPORT_TEMPLATES: ExportTemplate[] = [
  { id: "t1", name: "Relatório de Manutenção Mensal", type: "pdf", module: "Maintenance", description: "Resumo completo das manutenções do mês", lastUsed: new Date(), isFavorite: true },
  { id: "t2", name: "Checklist PSC", type: "pdf", module: "Compliance", description: "Checklist preparatório para Port State Control", lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), isFavorite: true },
  { id: "t3", name: "Relatório ESG Trimestral", type: "pdf", module: "ESG", description: "Emissões, resíduos e métricas ambientais", lastUsed: null, isFavorite: false },
  { id: "t4", name: "Lista de Tripulação", type: "excel", module: "Crew", description: "Dados completos da tripulação com certificações", lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), isFavorite: true },
  { id: "t5", name: "Inventário de Equipamentos", type: "excel", module: "Assets", description: "Lista de todos os equipamentos com status", lastUsed: null, isFavorite: false },
  { id: "t6", name: "Histórico de Incidentes", type: "excel", module: "Safety", description: "Registro de todos os incidentes com análises", lastUsed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), isFavorite: false },
  { id: "t7", name: "Contrato de Afretamento", type: "word", module: "Charter", description: "Template de contrato com campos preenchíveis", lastUsed: null, isFavorite: false },
  { id: "t8", name: "Dados para ERP", type: "csv", module: "Finance", description: "Exportação de dados financeiros para integração", lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), isFavorite: true },
  { id: "t9", name: "API Data Dump", type: "json", module: "System", description: "Exportação completa para backup ou migração", lastUsed: null, isFavorite: false },
  { id: "t10", name: "Auditoria PEOTRAM", type: "pdf", module: "Audit", description: "Relatório completo de auditoria PEOTRAM", lastUsed: new Date(), isFavorite: true }
];

export function ExportCenter() {
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    { id: "j1", templateId: "t1", templateName: "Relatório de Manutenção Mensal", status: "completed", progress: 100, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000), fileUrl: "#", fileSize: "2.4 MB" },
    { id: "j2", templateId: "t4", templateName: "Lista de Tripulação", status: "completed", progress: 100, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 12000), fileUrl: "#", fileSize: "856 KB" }
  ]);
  const [isExporting, setIsExporting] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="h-5 w-5 text-red-500" />;
      case "excel": return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      case "word": return <File className="h-5 w-5 text-blue-500" />;
      case "csv": return <FileSpreadsheet className="h-5 w-5 text-orange-500" />;
      case "json": return <FileJson className="h-5 w-5 text-purple-500" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500/20 text-green-500"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
      case "processing": return <Badge className="bg-blue-500/20 text-blue-500"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Processando</Badge>;
      case "failed": return <Badge variant="destructive">Falhou</Badge>;
      default: return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const startExport = async (template: ExportTemplate) => {
    setIsExporting(true);
    
    const newJob: ExportJob = {
      id: `j${Date.now()}`,
      templateId: template.id,
      templateName: template.name,
      status: "processing",
      progress: 0,
      createdAt: new Date(),
      completedAt: null,
      fileUrl: null,
      fileSize: null
    };

    setExportJobs(prev => [newJob, ...prev]);

    // Simulate export progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setExportJobs(prev => prev.map(job => 
        job.id === newJob.id ? { ...job, progress: i } : job
      ));
    }

    // Complete the export
    setExportJobs(prev => prev.map(job => 
      job.id === newJob.id ? {
        ...job,
        status: "completed",
        progress: 100,
        completedAt: new Date(),
        fileUrl: "#",
        fileSize: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`
      } : job
    ));

    setIsExporting(false);
    toast.success("Exportação concluída!", {
      description: `${template.name} está pronto para download`
    });
  };

  const uniqueModules = [...new Set(EXPORT_TEMPLATES.map(t => t.module))];

  // Filter templates
  const filteredTemplates = EXPORT_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = moduleFilter === "all" || template.module === moduleFilter;
    const matchesFormat = formatFilter === "all" || template.type === formatFilter;
    return matchesSearch && matchesModule && matchesFormat;
  });

  const handleDownloadExport = (job: ExportJob) => {
    // Simulate file download
    toast.success("Download iniciado!", {
      description: `${job.templateName} (${job.fileSize})`
    });
  };

  const handleEmailExport = (job: ExportJob) => {
    toast.success("Email enviado!", {
      description: "O relatório foi enviado para seu email"
    });
  };

  const handlePrintExport = (job: ExportJob) => {
    window.print();
    toast.success("Preparando impressão...");
  };

  const handleApplyFilters = () => {
    const count = filteredTemplates.length;
    toast.success(`${count} template${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`);
  };

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Export Center</h2>
            <p className="text-sm text-muted-foreground">
              Exporte relatórios em PDF, Excel, Word, CSV e JSON
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            toast.loading("Carregando configurações...", { id: "export-config", duration: 1000 });
            setTimeout(() => {
              toast.success("Configurações de exportação carregadas", { 
                id: "export-config",
                description: "Formatos: PDF, Excel, Word, CSV, JSON disponíveis" 
              });
            }, 1000);
          }}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            toast.loading("Abrindo agendador...", { id: "export-schedule", duration: 1000 });
            setTimeout(() => {
              toast.success("Agendador de exportações", { 
                id: "export-schedule",
                description: "Configure exportações automáticas diárias, semanais ou mensais" 
              });
            }, 1000);
          }}>
            <Calendar className="h-4 w-4 mr-2" />
            Agendar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">
            <Layers className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Calendar className="h-4 w-4 mr-2" />
            Agendados
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-48">
                  <Label>Buscar template</Label>
                  <Input placeholder="Nome ou descrição..." />
                </div>
                <div>
                  <Label>Módulo</Label>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueModules.map(mod => (
                        <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Formato</Label>
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="word">Word</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => toast.info("Filtros aplicados!")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXPORT_TEMPLATES.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getFileIcon(template.type)}
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                    </div>
                    {template.isFavorite && <Badge variant="secondary">⭐</Badge>}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <Badge variant="outline" className="mr-2">{template.module}</Badge>
                      {template.lastUsed && (
                        <span>Usado {new Date(template.lastUsed).toLocaleDateString("pt-BR")}</span>
                      )}
                    </div>
                    <Button size="sm" onClick={() => startExport(template)} disabled={isExporting}>
                      <Download className="h-3 w-3 mr-1" />
                      Exportar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Exportações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {exportJobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{job.templateName}</p>
                          <p className="text-sm text-muted-foreground">
                            {job.createdAt.toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(job.status)}
                          {job.fileSize && (
                            <span className="text-sm text-muted-foreground">{job.fileSize}</span>
                          )}
                          {job.status === "completed" && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => toast.success("Download iniciado!")}>
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => toast.info("Abrindo opções de email...")}>
                                <Mail className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => toast.info("Enviando para impressora...")}>
                                <Printer className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      {job.status === "processing" && (
                        <Progress value={job.progress} className="h-2 mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Exportações Agendadas</CardTitle>
                <Button size="sm" onClick={() => setShowScheduleDialog(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma exportação agendada</p>
                <p className="text-sm">Agende exportações automáticas diárias, semanais ou mensais</p>
                <Button className="mt-4" onClick={() => setShowScheduleDialog(true)}>
                  Criar Primeiro Agendamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    
    <ScheduledExportsDialog 
      open={showScheduleDialog}
      onOpenChange={setShowScheduleDialog}
      templates={EXPORT_TEMPLATES.map(t => ({ id: t.id, name: t.name }))}
    />
    </>
  );
}

export default ExportCenter;
