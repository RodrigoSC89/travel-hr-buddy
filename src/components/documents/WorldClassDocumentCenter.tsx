/**
 * WorldClassDocumentCenter - Real Supabase Integration
 * Connected to 'documents' table + Supabase Storage
 * Features: CRUD, Upload, Search, Lifecycle, Compliance
 */

import React, { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  FileText, Upload, Download, Search, Eye, Edit, Trash2,
  Calendar, Clock, CheckCircle2, AlertTriangle, Archive,
  Shield, Lock, Unlock, History, Users,
  FileCheck, FileClock, FileWarning, FileX,
  BarChart3, PlusCircle, RefreshCw, Sparkles,
  Brain, Zap, ExternalLink, ChevronRight, ArrowRight,
  Bell, TrendingUp, BookOpen, Network, Activity,
  MessageSquare, FileSignature, ScanLine,
  LayoutGrid, List, Timer, Loader2, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useDocumentsCRUD } from "@/hooks/useDocumentsCRUD";
import type { DocumentRecord, CreateDocumentInput } from "@/hooks/useDocumentsCRUD";
import { createPDF } from "@/lib/pdf/lazy-pdf";

// ==================== HELPERS ====================

const getStatusConfig = (s: string) => {
  const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    active: { label: "Ativo", color: "bg-success/10 text-success border-success/30", icon: <FileCheck className="h-3 w-3" /> },
    draft: { label: "Rascunho", color: "bg-muted text-muted-foreground border-border", icon: <Edit className="h-3 w-3" /> },
    archived: { label: "Arquivado", color: "bg-muted text-muted-foreground border-border", icon: <Archive className="h-3 w-3" /> },
    expired: { label: "Expirado", color: "bg-destructive/10 text-destructive border-destructive/30", icon: <FileWarning className="h-3 w-3" /> },
    pending: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/30", icon: <Clock className="h-3 w-3" /> },
  };
  return map[s] || map.active;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const getTypeIcon = (type: string) => {
  const map: Record<string, string> = {
    certificate: '📜', manual: '📖', report: '📊', photo: '📷',
    presentation: '📽️', procedure: '📋', policy: '🛡️', other: '📄'
  };
  return map[type] || '📄';
};

// ==================== COMPONENT ====================

export const WorldClassDocumentCenter: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("documents");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("report");
  const [newStatus, setNewStatus] = useState("active");

  // Real data from Supabase
  const {
    documents, isLoading, error, stats,
    createDocument, uploadDocument, updateDocument, deleteDocument, refetch
  } = useDocumentsCRUD({
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchTerm || undefined,
  });

  const filteredDocs = useMemo(() => {
    // Additional client-side filtering if needed
    return documents;
  }, [documents]);

  const categories = useMemo(() => {
    const cats = new Set(documents.map(d => d.document_type).filter(Boolean));
    return Array.from(cats);
  }, [documents]);

  const expiringDocs = useMemo(() => {
    return documents.filter(d => {
      if (!d.expiry_date) return false;
      const days = (new Date(d.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days > 0 && days <= 30;
    });
  }, [documents]);

  const expiredDocs = useMemo(() => {
    return documents.filter(d => {
      if (!d.expiry_date) return false;
      return new Date(d.expiry_date) < new Date();
    });
  }, [documents]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      uploadDocument.mutate({ file });
    }
    e.target.value = '';
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createDocument.mutate({
      title: newTitle,
      document_type: newType,
      status: newStatus,
    });
    setIsCreateOpen(false);
    setNewTitle("");
  };

  const handleDelete = (id: string) => {
    deleteDocument.mutate(id);
    setIsDetailOpen(false);
  };

  const handleStatusUpdate = (id: string, status: string) => {
    updateDocument.mutate({ id, status } as unknown as Parameters<typeof updateDocument.mutate>[0]);
  };

  const handleExportDocsPDF = async () => {
    try {
      const doc = await createPDF('portrait');
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Nautilus One - Relatório de Documentos', 20, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 20, 28);
      doc.text(`Total: ${documents.length} documentos | Ativos: ${stats.active} | Expirados: ${stats.expired}`, 20, 35);

      const tableData = documents.map((d, idx) => [
        String(idx + 1),
        d.title,
        d.document_type,
        getStatusConfig(d.status).label,
        d.expiry_date ? new Date(d.expiry_date).toLocaleDateString('pt-BR') : '-',
        formatFileSize(d.file_size),
      ]);

      (doc as unknown as { autoTable: (options: Record<string, unknown>) => void }).autoTable({
        startY: 42,
        head: [['#', 'Título', 'Tipo', 'Status', 'Expira', 'Tamanho']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 82, 136], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 20, right: 20 },
      });

      doc.save(`documentos-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: "📄 PDF exportado", description: `${documents.length} documentos exportados` });
    } catch (err) {
      toast({ title: "Erro ao gerar PDF", description: String(err), variant: "destructive" });
    }
  };

  // ==================== RENDER ====================

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-destructive font-medium">Erro ao carregar documentos</p>
        <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" /> Tentar novamente
        </Button>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* ===== HEADER ===== */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              Gestão Eletrônica de Documentos
            </h1>
            <p className="text-muted-foreground mt-1">
              {documents.length} documentos • Dados em tempo real do Supabase Storage
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-1" />
              Upload Arquivo
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportDocsPDF}>
              <Download className="h-4 w-4 mr-1" />
              Exportar PDF
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-1" />
              Novo Documento
            </Button>
          </div>
        </div>

        {/* ===== KPI CARDS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, icon: <FileText className="h-4 w-4" />, color: "text-primary" },
            { label: "Ativos", value: stats.active, icon: <FileCheck className="h-4 w-4" />, color: "text-success" },
            { label: "Expirados", value: stats.expired, icon: <FileWarning className="h-4 w-4" />, color: "text-destructive" },
            { label: "Certificados", value: stats.certificates, icon: <Shield className="h-4 w-4" />, color: "text-warning" },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={kpi.color}>{kpi.icon}</span>
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : kpi.value}</p>
            </Card>
          ))}
        </div>

        {/* Upload progress */}
        {uploadDocument.isPending && (
          <Card className="p-4 border-primary/50 bg-primary/5">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Fazendo upload do arquivo...</span>
            </div>
          </Card>
        )}

        {/* ===== MAIN TABS ===== */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="documents">📁 Documentos</TabsTrigger>
            <TabsTrigger value="expiring">⚠️ Expirando ({expiringDocs.length + expiredDocs.length})</TabsTrigger>
            <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
          </TabsList>

          {/* ===== DOCUMENTS TAB ===== */}
          <TabsContent value="documents" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por título..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
              {categories.length > 0 && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")} aria-label="Visualização em lista" title="Lista">
                  <List className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")} aria-label="Visualização em grade" title="Grade">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando documentos...</span>
              </div>
            )}

            {!isLoading && filteredDocs.length === 0 && (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Nenhum documento encontrado</h3>
                <p className="text-sm text-muted-foreground mt-1">Faça upload de um arquivo ou crie um novo registro</p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-1" /> Upload
                  </Button>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-1" /> Criar Documento
                  </Button>
                </div>
              </Card>
            )}

            {/* LIST VIEW */}
            {!isLoading && viewMode === "list" && filteredDocs.length > 0 && (
              <div className="space-y-2">
                {filteredDocs.map(doc => {
                  const cfg = getStatusConfig(doc.status);
                  return (
                    <Card key={doc.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => { setSelectedDoc(doc); setIsDetailOpen(true); }}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{getTypeIcon(doc.document_type)}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{doc.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>{doc.document_type}</span>
                              <span>•</span>
                              <span>{formatFileSize(doc.file_size)}</span>
                              <span>•</span>
                              <span>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                              {doc.expiry_date && (
                                <>
                                  <span>•</span>
                                  <span className={new Date(doc.expiry_date) < new Date() ? 'text-destructive font-medium' : ''}>
                                    Expira: {new Date(doc.expiry_date).toLocaleDateString('pt-BR')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className={cfg.color}>
                            {cfg.icon}
                            <span className="ml-1">{cfg.label}</span>
                          </Badge>
                          {doc.file_url && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); window.open(doc.file_url!, '_blank'); }}>
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Download</TooltipContent>
                            </Tooltip>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* GRID VIEW */}
            {!isLoading && viewMode === "grid" && filteredDocs.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map(doc => {
                  const cfg = getStatusConfig(doc.status);
                  return (
                    <Card key={doc.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => { setSelectedDoc(doc); setIsDetailOpen(true); }}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{getTypeIcon(doc.document_type)}</span>
                          <Badge variant="outline" className={cfg.color}>
                            {cfg.icon} <span className="ml-1">{cfg.label}</span>
                          </Badge>
                        </div>
                        <CardTitle className="text-base mt-2">{doc.title}</CardTitle>
                        <CardDescription>{doc.document_type} • {formatFileSize(doc.file_size)}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Criado: {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        {doc.expiry_date && (
                          <p className={`text-xs ${new Date(doc.expiry_date) < new Date() ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                            Expira: {new Date(doc.expiry_date).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        {doc.file_url && (
                          <Button variant="outline" size="sm" className="w-full" onClick={e => { e.stopPropagation(); window.open(doc.file_url!, '_blank'); }}>
                            <Download className="h-3 w-3 mr-1" /> Download
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== EXPIRING TAB ===== */}
          <TabsContent value="expiring" className="space-y-4">
            {expiredDocs.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" /> Documentos Expirados ({expiredDocs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {expiredDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5 cursor-pointer hover:bg-destructive/10"
                      onClick={() => { setSelectedDoc(doc); setIsDetailOpen(true); }}>
                      <div>
                        <p className="text-sm font-medium">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.document_type}</p>
                      </div>
                      <Badge variant="destructive">
                        Expirou {new Date(doc.expiry_date!).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {expiringDocs.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-warning">
                    <Clock className="h-4 w-4" /> Expirando em 30 dias ({expiringDocs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {expiringDocs.map(doc => {
                    const days = Math.round((new Date(doc.expiry_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-warning/30 bg-warning/5 cursor-pointer hover:bg-warning/10"
                        onClick={() => { setSelectedDoc(doc); setIsDetailOpen(true); }}>
                        <div>
                          <p className="text-sm font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.document_type}</p>
                        </div>
                        <Badge variant="outline" className="text-warning border-warning/30">
                          {days} dias restantes
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {expiredDocs.length === 0 && expiringDocs.length === 0 && (
              <Card className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
                <h3 className="font-semibold">Tudo em dia!</h3>
                <p className="text-sm text-muted-foreground">Nenhum documento expirando nos próximos 30 dias</p>
              </Card>
            )}
          </TabsContent>

          {/* ===== ANALYTICS TAB ===== */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Por Tipo</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {categories.length === 0 && <p className="text-sm text-muted-foreground">Nenhum documento ainda</p>}
                  {categories.map(cat => {
                    const count = documents.filter(d => d.document_type === cat).length;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-1">{getTypeIcon(cat)} {cat}</span>
                          <span className="font-bold">{count}</span>
                        </div>
                        <Progress value={documents.length > 0 ? (count / documents.length) * 100 : 0} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Por Status</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {['active', 'draft', 'archived'].map(s => {
                    const cfg = getStatusConfig(s);
                    const count = documents.filter(d => d.status === s).length;
                    return (
                      <div key={s} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {cfg.icon}
                          <span className="text-sm">{cfg.label}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Armazenamento</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-primary">
                      {formatFileSize(documents.reduce((a, d) => a + (d.file_size || 0), 0))}
                    </p>
                    <p className="text-sm text-muted-foreground">Total em uso</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Documentos com arquivo</span>
                    <span className="font-bold">{documents.filter(d => d.file_url).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Somente registro</span>
                    <span className="font-bold">{documents.filter(d => !d.file_url).length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* ===== DETAIL DIALOG ===== */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedDoc && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{getTypeIcon(selectedDoc.document_type)}</span>
                    <Badge variant="outline" className={getStatusConfig(selectedDoc.status).color}>
                      {getStatusConfig(selectedDoc.status).icon}
                      <span className="ml-1">{getStatusConfig(selectedDoc.status).label}</span>
                    </Badge>
                  </div>
                  <DialogTitle className="text-xl">{selectedDoc.title}</DialogTitle>
                  <DialogDescription>
                    {selectedDoc.document_type} • {formatFileSize(selectedDoc.file_size)} • Criado em {new Date(selectedDoc.created_at).toLocaleDateString('pt-BR')}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4">
                  {selectedDoc.content && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Conteúdo</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{selectedDoc.content}</p>
                    </div>
                  )}

                  {selectedDoc.expiry_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={`text-sm ${new Date(selectedDoc.expiry_date) < new Date() ? 'text-destructive font-medium' : ''}`}>
                        Expira: {new Date(selectedDoc.expiry_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Atualizado: {new Date(selectedDoc.updated_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <Separator />

                <DialogFooter className="mt-4 gap-2 flex-wrap">
                  {selectedDoc.file_url && (
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedDoc.file_url!, '_blank')}>
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  )}
                  {selectedDoc.status === 'active' && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(selectedDoc.id, 'archived')}>
                      <Archive className="h-4 w-4 mr-1" /> Arquivar
                    </Button>
                  )}
                  {selectedDoc.status === 'archived' && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(selectedDoc.id, 'active')}>
                      <RefreshCw className="h-4 w-4 mr-1" /> Reativar
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedDoc.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Excluir
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ===== CREATE DIALOG ===== */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Documento</DialogTitle>
              <DialogDescription>Crie um registro de documento ou faça upload de um arquivo</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Manual do Sistema de Gestão" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report">Relatório</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="certificate">Certificado</SelectItem>
                    <SelectItem value="procedure">Procedimento</SelectItem>
                    <SelectItem value="policy">Política</SelectItem>
                    <SelectItem value="photo">Foto/Evidência</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Arraste um arquivo ou clique para upload</p>
                <p className="text-xs text-muted-foreground">PDF, DOC, XLS, PNG, JPG (máx. 50MB)</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!newTitle.trim() || createDocument.isPending}>
                {createDocument.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <PlusCircle className="h-4 w-4 mr-1" />}
                Criar Documento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
