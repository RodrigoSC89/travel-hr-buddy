/**
 * Document Command Center - Premium Document Management
 * Central de documentos com OCR, templates, workflow e IA
 */

import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { logger } from "@/lib/logger";
import {
  FileText,
  Upload,
  Search,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Eye,
  Edit,
  Trash2,
  Share2,
  Filter,
  LayoutTemplate,
  FileSignature,
  Scan,
  Bot,
  Sparkles,
  GitBranch,
  History,
  Lock,
  Users,
  Calendar,
  Tag,
  MoreVertical,
  FilePlus,
  FileCheck,
  FileWarning,
  Printer,
  Send,
  Archive,
} from "lucide-react";

// Tipos
interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  status: "valid" | "expiring" | "expired" | "draft" | "pending";
  expiryDate?: string;
  vessel?: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  tags: string[];
}

interface Template {
  id: string;
  name: string;
  category: string;
  usageCount: number;
  lastUsed: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  status: "completed" | "current" | "pending";
  assignee?: string;
  completedAt?: string;
}

// Dados de exemplo
const DOCUMENTS: Document[] = [
  {
    id: "doc-1",
    name: "Certificado de Segurança",
    type: "PDF",
    category: "Certificados",
    status: "valid",
    expiryDate: "2025-06-15",
    vessel: "MV Atlantic Star",
    uploadedBy: "Carlos Silva",
    uploadedAt: "2024-01-10",
    size: "2.4 MB",
    tags: ["SOLAS", "Segurança", "Obrigatório"],
  },
  {
    id: "doc-2",
    name: "Certificado ISPS",
    type: "PDF",
    category: "Certificados",
    status: "expiring",
    expiryDate: "2024-03-20",
    vessel: "MV Pacific Queen",
    uploadedBy: "Maria Santos",
    uploadedAt: "2023-03-15",
    size: "1.8 MB",
    tags: ["ISPS", "Segurança", "Porto"],
  },
  {
    id: "doc-3",
    name: "Contrato de Afretamento",
    type: "DOCX",
    category: "Contratos",
    status: "pending",
    vessel: "MV Atlantic Star",
    uploadedBy: "João Pereira",
    uploadedAt: "2024-02-01",
    size: "456 KB",
    tags: ["Contrato", "Comercial"],
  },
  {
    id: "doc-4",
    name: "Relatório de Inspeção PSC",
    type: "PDF",
    category: "Inspeções",
    status: "valid",
    vessel: "MV Ocean Voyager",
    uploadedBy: "Ana Costa",
    uploadedAt: "2024-01-25",
    size: "5.2 MB",
    tags: ["PSC", "Inspeção", "Porto"],
  },
  {
    id: "doc-5",
    name: "Manual de Operações",
    type: "PDF",
    category: "Manuais",
    status: "draft",
    uploadedBy: "Pedro Lima",
    uploadedAt: "2024-02-05",
    size: "12.8 MB",
    tags: ["Manual", "Operações"],
  },
];

const TEMPLATES: Template[] = [
  { id: "tpl-1", name: "Contrato de Tripulação SEP", category: "RH", usageCount: 156, lastUsed: "Há 2 dias" },
  { id: "tpl-2", name: "Relatório de Viagem", category: "Operações", usageCount: 234, lastUsed: "Há 1 hora" },
  { id: "tpl-3", name: "Checklist Pré-Partida", category: "Operações", usageCount: 412, lastUsed: "Hoje" },
  { id: "tpl-4", name: "Certificado de Competência", category: "RH", usageCount: 89, lastUsed: "Há 3 dias" },
  { id: "tpl-5", name: "Relatório de Manutenção", category: "Manutenção", usageCount: 167, lastUsed: "Ontem" },
];

const WORKFLOW_STEPS_INITIAL: WorkflowStep[] = [
  { id: "step-1", name: "Upload do Documento", status: "completed", assignee: "Sistema", completedAt: "10:30" },
  { id: "step-2", name: "Análise OCR/IA", status: "completed", assignee: "IA", completedAt: "10:31" },
  { id: "step-3", name: "Revisão Técnica", status: "current", assignee: "Carlos Silva" },
  { id: "step-4", name: "Aprovação Legal", status: "pending", assignee: "Jurídico" },
  { id: "step-5", name: "Publicação", status: "pending" },
];

export function DocumentCommandCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("documents");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState(WORKFLOW_STEPS_INITIAL);

  // Dialog states
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // OCR file input ref
  const ocrFileInputRef = useRef<HTMLInputElement>(null);
  const uploadFileInputRef = useRef<HTMLInputElement>(null);

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-emerald-500/20 text-emerald-400"><CheckCircle2 className="h-3 w-3 mr-1" />Válido</Badge>;
      case "expiring":
        return <Badge className="bg-amber-500/20 text-amber-400"><AlertTriangle className="h-3 w-3 mr-1" />Vencendo</Badge>;
      case "expired":
        return <Badge className="bg-red-500/20 text-red-400"><XCircle className="h-3 w-3 mr-1" />Expirado</Badge>;
      case "draft":
        return <Badge className="bg-blue-500/20 text-blue-400"><Edit className="h-3 w-3 mr-1" />Rascunho</Badge>;
      case "pending":
        return <Badge className="bg-purple-500/20 text-purple-400"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      default:
        return null;
    }
  };

  const categories = [
    { id: "all", label: "Todos", count: 1247 },
    { id: "certificates", label: "Certificados", count: 234 },
    { id: "contracts", label: "Contratos", count: 156 },
    { id: "inspections", label: "Inspeções", count: 89 },
    { id: "manuals", label: "Manuais", count: 67 },
    { id: "reports", label: "Relatórios", count: 423 },
  ];

  const metrics = {
    totalDocuments: 1247,
    pendingApproval: 23,
    expiringDocuments: 15,
    ocrProcessed: 892,
    storageUsed: "45.6 GB",
    storageLimit: "100 GB",
  };

  // === ACTION HANDLERS ===

  const handleViewDocument = useCallback((doc: Document) => {
    setPreviewDoc(doc);
    logger.info(`[DocumentCommandCenter] Viewing document: ${doc.name}`);
  }, []);

  const handleDownloadDocument = useCallback((doc: Document) => {
    toast.success(`Download iniciado: ${doc.name}`, { description: `Tipo: ${doc.type} • Tamanho: ${doc.size}` });
    logger.info(`[DocumentCommandCenter] Download requested: ${doc.name}`);
  }, []);

  const handleShareDocument = useCallback((doc: Document) => {
    if (navigator.share) {
      navigator.share({ title: doc.name, text: `Documento: ${doc.name} (${doc.type})` });
    } else {
      navigator.clipboard.writeText(`${doc.name} - ${doc.type} - ${doc.vessel || 'Sem embarcação'}`);
      toast.success("Link copiado para a área de transferência");
    }
  }, []);

  const handleDocumentMore = useCallback((doc: Document) => {
    setActiveTab("versions");
    toast.info(`Visualizando opções para: ${doc.name}`, { duration: 1500 });
  }, []);

  const handleFilter = useCallback(() => {
    setShowFilterPanel(prev => !prev);
    toast.info(showFilterPanel ? "Filtros recolhidos" : "Filtros expandidos", { duration: 1500 });
  }, [showFilterPanel]);

  const handleDigitalizeOCR = useCallback(() => {
    setActiveTab("ocr");
    toast.info("Navegando para processamento OCR", { duration: 1500 });
  }, []);

  const handleUseTemplateBar = useCallback(() => {
    setActiveTab("templates");
    toast.info("Navegando para templates disponíveis", { duration: 1500 });
  }, []);

  const handleUpload = useCallback(() => {
    setShowUploadDialog(true);
  }, []);

  const handleUploadFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileNames = Array.from(files).map(f => f.name).join(", ");
    toast.success(`Upload iniciado: ${fileNames}`, { description: `${files.length} arquivo(s) sendo processado(s)` });
    setShowUploadDialog(false);
    logger.info(`[DocumentCommandCenter] Upload started: ${fileNames}`);
  }, []);

  const handleUseTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setShowTemplateDialog(true);
    logger.info(`[DocumentCommandCenter] Using template: ${template.name}`);
  }, []);

  const handleCreateTemplate = useCallback(() => {
    setActiveTab("templates");
    setShowTemplateDialog(true);
  }, []);

  const handleApproveStep = useCallback(() => {
    setWorkflowSteps(prev => {
      const updated = [...prev];
      const currentIdx = updated.findIndex(s => s.status === "current");
      if (currentIdx >= 0) {
        updated[currentIdx] = { ...updated[currentIdx], status: "completed", completedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
        if (currentIdx + 1 < updated.length) {
          updated[currentIdx + 1] = { ...updated[currentIdx + 1], status: "current" };
        }
      }
      return updated;
    });
    toast.success("Etapa aprovada com sucesso!", { description: "O workflow avançou para a próxima etapa" });
  }, []);

  const handleRejectStep = useCallback(() => {
    const currentStep = workflowSteps.find(s => s.status === "current");
    toast.error(`Etapa rejeitada: ${currentStep?.name}`, {
      description: "O documento foi devolvido para revisão",
      action: { label: "Desfazer", onClick: () => { setWorkflowSteps(prev => { const updated = [...prev]; const lastIdx = updated.map((s, i) => s.status === "completed" ? i : -1).filter(i => i >= 0).pop(); if (lastIdx !== undefined && lastIdx >= 0) { updated[lastIdx] = { ...updated[lastIdx], status: "current" as const }; } return updated; }); toast.success("Rejeição desfeita"); } },
    });
  }, [workflowSteps]);

  const handleOCRSelectFiles = useCallback(() => {
    ocrFileInputRef.current?.click();
  }, []);

  const handleOCRFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileNames = Array.from(files).map(f => f.name).join(", ");
    toast.success(`Processamento OCR iniciado`, { description: `Arquivos: ${fileNames}` });
    logger.info(`[DocumentCommandCenter] OCR processing: ${fileNames}`);
  }, []);

  const handleSendForSignature = useCallback(() => {
    setShowSignatureDialog(true);
  }, []);

  const handleConfirmSignature = useCallback(() => {
    toast.success("Documento enviado para assinatura!", { description: "Os signatários receberão notificação por email" });
    setShowSignatureDialog(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header com métricas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-muted-foreground">Total Docs</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.totalDocuments}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-muted-foreground">Pendentes</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.pendingApproval}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span className="text-sm text-muted-foreground">Vencendo</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.expiringDocuments}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Scan className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-muted-foreground">OCR Processados</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.ocrProcessed}</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 bg-gradient-to-br from-slate-500/10 to-gray-500/10 border-slate-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-muted-foreground">Armazenamento</span>
              </div>
              <span className="text-sm font-medium">{metrics.storageUsed} / {metrics.storageLimit}</span>
            </div>
            <Progress value={45.6} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Barra de ações */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar documentos, certificados, contratos..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={handleFilter}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDigitalizeOCR}>
                <Scan className="h-4 w-4 mr-2" />
                Digitalizar (OCR)
              </Button>
              <Button variant="outline" onClick={handleUseTemplateBar}>
                <LayoutTemplate className="h-4 w-4 mr-2" />
                Usar Template
              </Button>
              <Button className="bg-primary" onClick={handleUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <LayoutTemplate className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Workflow</span>
          </TabsTrigger>
          <TabsTrigger value="ocr" className="gap-2">
            <Scan className="h-4 w-4" />
            <span className="hidden sm:inline">OCR/IA</span>
          </TabsTrigger>
          <TabsTrigger value="signatures" className="gap-2">
            <FileSignature className="h-4 w-4" />
            <span className="hidden sm:inline">Assinaturas</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Documentos */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex gap-6">
            {/* Sidebar de categorias */}
            <Card className="w-64 shrink-0 hidden lg:block">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Categorias</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 p-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <Badge variant={selectedCategory === cat.id ? "secondary" : "outline"}>
                        {cat.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lista de documentos */}
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Documentos Recentes</CardTitle>
                  <Badge variant="outline">{DOCUMENTS.length} documentos</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {DOCUMENTS.map((doc) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{doc.name}</h4>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <span>{doc.type}</span>
                                <span>•</span>
                                <span>{doc.size}</span>
                                {doc.vessel && (
                                  <>
                                    <span>•</span>
                                    <span>{doc.vessel}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {doc.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(doc.status)}
                            {doc.expiryDate && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Expira: {doc.expiryDate}
                              </span>
                            )}
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDocument(doc)} title="Visualizar">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadDocument(doc)} title="Download">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShareDocument(doc)} title="Compartilhar">
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDocumentMore(doc)} title="Mais opções">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((template) => (
              <Card key={template.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <LayoutTemplate className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.category}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                    <span>{template.usageCount} usos</span>
                    <span>Usado {template.lastUsed}</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline" size="sm" onClick={() => handleUseTemplate(template)}>
                    <FilePlus className="h-4 w-4 mr-2" />
                    Usar Template
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer" onClick={handleCreateTemplate}>
              <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[180px]">
                <div className="p-3 rounded-full bg-muted mb-3">
                  <FilePlus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">Criar Novo Template</p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Crie templates personalizados para sua operação
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Workflow */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow de Aprovação</CardTitle>
              <CardDescription>
                Acompanhe o fluxo de aprovação dos documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {workflowSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4 pb-8 last:pb-0">
                    {index < workflowSteps.length - 1 && (
                      <div className="absolute left-[15px] top-[40px] w-0.5 h-[calc(100%-40px)] bg-muted" />
                    )}
                    
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      step.status === "completed" 
                        ? "bg-emerald-500 text-white" 
                        : step.status === "current"
                        ? "bg-primary text-primary-foreground animate-pulse"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {step.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${
                          step.status === "pending" ? "text-muted-foreground" : ""
                        }`}>
                          {step.name}
                        </h4>
                        {step.completedAt && (
                          <span className="text-sm text-muted-foreground">
                            Concluído às {step.completedAt}
                          </span>
                        )}
                      </div>
                      {step.assignee && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Responsável: {step.assignee}
                        </p>
                      )}
                      {step.status === "current" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleApproveStep}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500" onClick={handleRejectStep}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeitar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: OCR/IA */}
        <TabsContent value="ocr" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Processamento OCR
                </CardTitle>
                <CardDescription>
                  Digitalize documentos físicos com reconhecimento automático
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium mb-2">Arraste documentos aqui</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Suportamos PDF, JPG, PNG até 25MB
                  </p>
                  <input
                    ref={ocrFileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    className="hidden"
                    onChange={(e) => handleOCRFiles(e.target.files)}
                  />
                  <Button onClick={handleOCRSelectFiles}>
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivos
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Análise com IA
                </CardTitle>
                <CardDescription>
                  Extração automática de informações e classificação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Extração de Texto", accuracy: 98, status: "active" },
                    { label: "Classificação de Documentos", accuracy: 95, status: "active" },
                    { label: "Detecção de Datas", accuracy: 97, status: "active" },
                    { label: "Extração de Entidades", accuracy: 92, status: "active" },
                    { label: "Validação de Conformidade", accuracy: 89, status: "active" },
                  ].map((feature) => (
                    <div key={feature.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature.label}</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400">
                        {feature.accuracy}% precisão
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Assinaturas */}
        <TabsContent value="signatures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5" />
                Assinaturas Digitais
              </CardTitle>
              <CardDescription>
                Gerencie assinaturas eletrônicas com validade jurídica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium">Aguardando</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Documentos aguardando sua assinatura</p>
                </div>
                
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Send className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Enviados</p>
                      <p className="text-2xl font-bold">28</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Documentos enviados para assinatura</p>
                </div>
                
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <FileCheck className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium">Concluídos</p>
                      <p className="text-2xl font-bold">156</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Documentos totalmente assinados</p>
                </div>
              </div>

              <div className="mt-6">
                <Button className="w-full md:w-auto" onClick={handleSendForSignature}>
                  <FileSignature className="h-4 w-4 mr-2" />
                  Enviar para Assinatura
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* === DIALOGS === */}

      {/* Preview Document Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {previewDoc?.name}
            </DialogTitle>
            <DialogDescription>Detalhes do documento</DialogDescription>
          </DialogHeader>
          {previewDoc && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Tipo:</span> {previewDoc.type}</div>
                <div><span className="text-muted-foreground">Tamanho:</span> {previewDoc.size}</div>
                <div><span className="text-muted-foreground">Categoria:</span> {previewDoc.category}</div>
                <div><span className="text-muted-foreground">Enviado por:</span> {previewDoc.uploadedBy}</div>
                {previewDoc.vessel && <div><span className="text-muted-foreground">Embarcação:</span> {previewDoc.vessel}</div>}
                {previewDoc.expiryDate && <div><span className="text-muted-foreground">Expira:</span> {previewDoc.expiryDate}</div>}
              </div>
              <div className="flex flex-wrap gap-1">
                {previewDoc.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { handleDownloadDocument(previewDoc!); setPreviewDoc(null); }}>
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
            <Button onClick={() => setPreviewDoc(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Upload de Documentos</DialogTitle>
            <DialogDescription>Selecione arquivos para enviar ao sistema</DialogDescription>
          </DialogHeader>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">PDF, DOCX, JPG, PNG até 25MB</p>
            <input
              ref={uploadFileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => handleUploadFiles(e.target.files)}
            />
            <Button onClick={() => uploadFileInputRef.current?.click()}>Selecionar Arquivos</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Usage Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><LayoutTemplate className="h-5 w-5" /> Usar Template</DialogTitle>
            <DialogDescription>Criando documento a partir de: {selectedTemplate?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do documento</Label>
              <Input defaultValue={`${selectedTemplate?.name || ''} - ${new Date().toLocaleDateString('pt-BR')}`} />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea placeholder="Notas adicionais..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancelar</Button>
            <Button onClick={() => { 
              const docName = `${selectedTemplate?.name || 'Documento'} - ${new Date().toLocaleDateString('pt-BR')}`;
              const blob = new Blob([`# ${docName}\n\nTemplate: ${selectedTemplate?.name}\nCriado em: ${new Date().toLocaleString('pt-BR')}\n\n---\n\nConteúdo do documento aqui...`], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `${docName}.md`; a.click(); URL.revokeObjectURL(url);
              toast.success(`Documento "${docName}" criado e baixado`); 
              setShowTemplateDialog(false); 
            }}>
              Criar Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Signature Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileSignature className="h-5 w-5" /> Enviar para Assinatura</DialogTitle>
            <DialogDescription>Configure os signatários e envie o documento</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email do signatário</Label>
              <Input type="email" placeholder="nome@empresa.com" />
            </div>
            <div>
              <Label>Mensagem (opcional)</Label>
              <Textarea placeholder="Mensagem para o signatário..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignatureDialog(false)}>Cancelar</Button>
            <Button onClick={handleConfirmSignature}>
              <Send className="h-4 w-4 mr-2" /> Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DocumentCommandCenter;
