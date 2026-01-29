/**
 * Enterprise Document Center
 * Superior to SoftExpert, Fluig, Unisea, TMmaster
 * All-in-one with AI integration
 */

import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, Upload, Download, Search, Filter, Eye, Edit, Trash2,
  FolderPlus, Calendar, Tag, Archive, Star, Clock, CheckCircle,
  AlertTriangle, Lock, Globe, Users, FileCheck, Workflow, BarChart3,
  Plus, X, File, BookOpen, ClipboardList, Shield, Award, GraduationCap,
  FileSignature, Brain, Sparkles, RefreshCw, ChevronRight, FolderOpen,
  Settings, History, Share2, Printer
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  useDocumentCategories,
  useEnterpriseDocuments,
  useDocumentTemplates,
  useEnterpriseChecklists,
  useUploadDocument,
  useUpdateDocument,
  useDeleteDocument,
  useLogDocumentAccess,
  DOCUMENT_TYPES,
  REGULATORY_REFERENCES,
  REVIEW_FREQUENCIES,
  type EnterpriseDocument,
  type Checklist
} from "@/hooks/use-enterprise-documents";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Icon mapping
const getDocTypeIcon = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    manual: <BookOpen className="h-4 w-4" />,
    procedure: <ClipboardList className="h-4 w-4" />,
    policy: <Shield className="h-4 w-4" />,
    checklist: <CheckCircle className="h-4 w-4" />,
    form: <FileText className="h-4 w-4" />,
    certificate: <Award className="h-4 w-4" />,
    contract: <FileSignature className="h-4 w-4" />,
    training_material: <GraduationCap className="h-4 w-4" />,
    report: <BarChart3 className="h-4 w-4" />,
    compliance: <Shield className="h-4 w-4" />,
    safety: <AlertTriangle className="h-4 w-4" />,
    hr: <Users className="h-4 w-4" />,
  };
  return icons[type] || <File className="h-4 w-4" />;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: "bg-gray-500/10 text-gray-500 border-gray-500/30",
    pending_review: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    approved: "bg-green-500/10 text-green-500 border-green-500/30",
    published: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    archived: "bg-muted text-muted-foreground border-muted",
    obsolete: "bg-red-500/10 text-red-500 border-red-500/30"
  };
  return colors[status] || colors.draft;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: "Rascunho",
    pending_review: "Em Revisão",
    approved: "Aprovado",
    published: "Publicado",
    archived: "Arquivado",
    obsolete: "Obsoleto"
  };
  return labels[status] || status;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export function EnterpriseDocumentCenter() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [activeTab, setActiveTab] = useState("documents");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<EnterpriseDocument | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    document_type: "manual",
    category_id: "",
    vessel_id: "",
    tags: "",
    regulatory_reference: [] as string[],
    valid_from: "",
    valid_until: "",
    review_frequency: ""
  });

  // Queries
  const { data: categories = [] } = useDocumentCategories();
  const { data: documents = [], isLoading: isLoadingDocs, refetch: refetchDocs } = useEnterpriseDocuments({
    category_id: categoryFilter !== "all" ? categoryFilter : undefined,
    document_type: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchTerm || undefined
  });
  const { data: templates = [] } = useDocumentTemplates();
  const { data: checklists = [] } = useEnterpriseChecklists();

  // Mutations
  const uploadMutation = useUploadDocument();
  const updateMutation = useUpdateDocument();
  const deleteMutation = useDeleteDocument();
  const logAccessMutation = useLogDocumentAccess();

  // Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Limite: 50MB");
        return;
      }
      setUploadFile(file);
      setUploadForm(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, "")
      }));
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      toast.error("Selecione um arquivo");
      return;
    }
    if (!uploadForm.title.trim()) {
      toast.error("Informe o título do documento");
      return;
    }

    setUploadProgress(20);

    try {
      await uploadMutation.mutateAsync({
        file: uploadFile,
        title: uploadForm.title,
        description: uploadForm.description,
        document_type: uploadForm.document_type,
        category_id: uploadForm.category_id || undefined,
        vessel_id: uploadForm.vessel_id || undefined,
        tags: uploadForm.tags ? uploadForm.tags.split(",").map(t => t.trim()) : undefined,
        regulatory_reference: uploadForm.regulatory_reference.length > 0 ? uploadForm.regulatory_reference : undefined,
        valid_from: uploadForm.valid_from || undefined,
        valid_until: uploadForm.valid_until || undefined,
        review_frequency: uploadForm.review_frequency || undefined
      });

      setUploadProgress(100);
      
      // Reset form
      setUploadFile(null);
      setUploadForm({
        title: "",
        description: "",
        document_type: "manual",
        category_id: "",
        vessel_id: "",
        tags: "",
        regulatory_reference: [],
        valid_from: "",
        valid_until: "",
        review_frequency: ""
      });
      setIsUploadDialogOpen(false);
      setUploadProgress(0);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setUploadProgress(0);
      console.error("Upload failed:", error);
    }
  };

  const handleViewDocument = (doc: EnterpriseDocument) => {
    setSelectedDocument(doc);
    setIsViewDialogOpen(true);
    logAccessMutation.mutate({ document_id: doc.id, action: 'view' });
  };

  const handleDownload = async (doc: EnterpriseDocument) => {
    if (doc.file_url) {
      logAccessMutation.mutate({ document_id: doc.id, action: 'download' });
      window.open(doc.file_url, '_blank');
    } else {
      toast.error("URL do arquivo não disponível");
    }
  };

  const handleStatusChange = async (doc: EnterpriseDocument, newStatus: string) => {
    await updateMutation.mutateAsync({
      id: doc.id,
      updates: { status: newStatus as EnterpriseDocument['status'] }
    });
  };

  const handleDelete = async (doc: EnterpriseDocument) => {
    if (confirm(`Deseja realmente excluir "${doc.title}"?`)) {
      await deleteMutation.mutateAsync(doc.id);
    }
  };

  // Stats
  const stats = {
    total: documents.length,
    published: documents.filter(d => d.status === 'published').length,
    pendingReview: documents.filter(d => d.status === 'pending_review').length,
    expiring: documents.filter(d => {
      if (!d.valid_until) return false;
      const daysUntilExpiry = Math.ceil((new Date(d.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30">
            <FolderOpen className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Centro de Documentos Enterprise</h1>
            <p className="text-muted-foreground">
              Gestão completa de manuais, procedimentos, checklists e formulários
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-400 border-green-500/30">
            <Brain className="h-3 w-3" />
            IA Integrada
          </Badge>
          <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Documento
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Documentos</p>
                <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publicados</p>
                <p className="text-2xl font-bold text-green-400">{stats.published}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Revisão</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pendingReview}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expirando em 30 dias</p>
                <p className="text-2xl font-bold text-red-400">{stats.expiring}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="checklists" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Checklists
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FolderPlus className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="workflows" className="gap-2">
            <Workflow className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4 mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar documentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Categorias</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="pending_review">Em Revisão</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => refetchDocs()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardContent className="p-0">
              {isLoadingDocs ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum documento encontrado</p>
                  <p className="text-sm">Faça upload do primeiro documento</p>
                  <Button className="mt-4 gap-2" onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4" />
                    Upload Documento
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="divide-y">
                    {documents.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleViewDocument(doc)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {getDocTypeIcon(doc.document_type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{doc.title}</h3>
                              {doc.document_code && (
                                <Badge variant="outline" className="text-xs">{doc.document_code}</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type}</span>
                              <span>•</span>
                              <span>{formatFileSize(doc.file_size)}</span>
                              <span>•</span>
                              <span>v{doc.version}</span>
                              {doc.regulatory_reference && doc.regulatory_reference.length > 0 && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                                    {doc.regulatory_reference[0]}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(doc.status)}>
                            {getStatusLabel(doc.status)}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleViewDocument(doc); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Checklists</CardTitle>
                  <CardDescription>Listas de verificação e inspeção</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Checklist
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {checklists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhum checklist encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {checklists.map(checklist => (
                    <div key={checklist.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">{checklist.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{checklist.completed_items}/{checklist.total_items} itens</span>
                            <span>•</span>
                            <span>{checklist.checklist_type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Progress value={checklist.completion_percentage} />
                        </div>
                        <Badge className={
                          checklist.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                          checklist.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-gray-500/10 text-gray-500'
                        }>
                          {checklist.status === 'completed' ? 'Concluído' :
                           checklist.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Templates de Documentos</CardTitle>
                  <CardDescription>Modelos para criação rápida de documentos</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {templates.map(template => (
                  <Card key={template.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <FileText className="h-5 w-5 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.description || "Sem descrição"}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{template.template_type}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {template.usage_count} usos
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflows de Aprovação</CardTitle>
              <CardDescription>Fluxos de revisão e aprovação de documentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Workflow className="h-12 w-12 mb-4 opacity-50" />
                <p>Configure workflows de aprovação para seus documentos</p>
                <Button className="mt-4 gap-2" variant="outline">
                  <Settings className="h-4 w-4" />
                  Configurar Workflows
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Documentos</CardTitle>
              <CardDescription>Métricas e insights sobre uso de documentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-4">Por Tipo de Documento</h4>
                    <div className="space-y-2">
                      {DOCUMENT_TYPES.slice(0, 5).map(type => {
                        const count = documents.filter(d => d.document_type === type.value).length;
                        const percentage = documents.length > 0 ? (count / documents.length) * 100 : 0;
                        return (
                          <div key={type.value} className="flex items-center gap-2">
                            <span className="text-sm w-32">{type.label}</span>
                            <Progress value={percentage} className="flex-1" />
                            <span className="text-sm text-muted-foreground w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-4">Por Status</h4>
                    <div className="space-y-2">
                      {['draft', 'pending_review', 'approved', 'published', 'archived'].map(status => {
                        const count = documents.filter(d => d.status === status).length;
                        const percentage = documents.length > 0 ? (count / documents.length) * 100 : 0;
                        return (
                          <div key={status} className="flex items-center gap-2">
                            <span className="text-sm w-32">{getStatusLabel(status)}</span>
                            <Progress value={percentage} className="flex-1" />
                            <span className="text-sm text-muted-foreground w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Documento
            </DialogTitle>
            <DialogDescription>
              Faça upload de manuais, procedimentos, checklists, formulários e outros documentos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File Input */}
            <div className="space-y-2">
              <Label>Arquivo</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileSelect}
                />
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{uploadFile.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(uploadFile.size)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Clique para selecionar ou arraste um arquivo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, XLS, PPT, Imagens (máx. 50MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título do documento"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do documento"
                rows={3}
              />
            </div>

            {/* Type and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Documento *</Label>
                <Select
                  value={uploadForm.document_type}
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, document_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={uploadForm.category_id}
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Separadas por vírgula"
              />
            </div>

            {/* Regulatory References */}
            <div className="space-y-2">
              <Label>Referências Regulatórias</Label>
              <div className="grid grid-cols-3 gap-2">
                {REGULATORY_REFERENCES.slice(0, 9).map(ref => (
                  <div key={ref} className="flex items-center space-x-2">
                    <Checkbox
                      id={ref}
                      checked={uploadForm.regulatory_reference.includes(ref)}
                      onCheckedChange={(checked) => {
                        setUploadForm(prev => ({
                          ...prev,
                          regulatory_reference: checked
                            ? [...prev.regulatory_reference, ref]
                            : prev.regulatory_reference.filter(r => r !== ref)
                        }));
                      }}
                    />
                    <label htmlFor={ref} className="text-sm">{ref}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Validity and Review */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Válido de</Label>
                <Input
                  type="date"
                  value={uploadForm.valid_from}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, valid_from: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Válido até</Label>
                <Input
                  type="date"
                  value={uploadForm.valid_until}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, valid_until: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Frequência de Revisão</Label>
                <Select
                  value={uploadForm.review_frequency}
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, review_frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {REVIEW_FREQUENCIES.map(freq => (
                      <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Progress */}
            {uploadProgress > 0 && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  {uploadProgress < 100 ? 'Enviando...' : 'Concluído!'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={!uploadFile || uploadMutation.isPending}
              className="gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Enviar Documento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedDocument && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {getDocTypeIcon(selectedDocument.document_type)}
                  </div>
                  <div>
                    <DialogTitle>{selectedDocument.title}</DialogTitle>
                    <DialogDescription>
                      {selectedDocument.document_code} • v{selectedDocument.version}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Status and Actions */}
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(selectedDocument.status)}>
                    {getStatusLabel(selectedDocument.status)}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownload(selectedDocument)}>
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Printer className="h-4 w-4" />
                      Imprimir
                    </Button>
                  </div>
                </div>

                {/* Description */}
                {selectedDocument.description && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm">{selectedDocument.description}</p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">
                      {DOCUMENT_TYPES.find(t => t.value === selectedDocument.document_type)?.label}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tamanho</p>
                    <p className="font-medium">{formatFileSize(selectedDocument.file_size)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Criado em</p>
                    <p className="font-medium">
                      {format(new Date(selectedDocument.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Atualizado em</p>
                    <p className="font-medium">
                      {format(new Date(selectedDocument.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  {selectedDocument.valid_until && (
                    <>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Válido até</p>
                        <p className="font-medium">{selectedDocument.valid_until}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Frequência de Revisão</p>
                        <p className="font-medium">
                          {REVIEW_FREQUENCIES.find(f => f.value === selectedDocument.review_frequency)?.label || '-'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Tags */}
                {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regulatory References */}
                {selectedDocument.regulatory_reference && selectedDocument.regulatory_reference.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Referências Regulatórias</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.regulatory_reference.map(ref => (
                        <Badge key={ref} className="bg-blue-500/10 text-blue-400 border-blue-500/30">{ref}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Analysis */}
                {selectedDocument.ai_summary && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Análise de IA</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedDocument.ai_summary}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Statistics */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{selectedDocument.view_count} visualizações</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{selectedDocument.download_count} downloads</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Fechar
                </Button>
                <Button className="gap-2" onClick={() => handleDownload(selectedDocument)}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EnterpriseDocumentCenter;
