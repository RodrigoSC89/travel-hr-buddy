/**
 * AdvancedDocumentCenter - Connected to Supabase 'documents' table
 * PATCH Sprint 8: Replaced generateMockData() with useDocumentsCRUD hook
 * Real CRUD: Create, Upload, Update status, Delete, Download, Search
 */

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileText, Upload, Download, Search, Eye, Edit, Trash2,
  Calendar, Clock, CheckCircle, AlertTriangle, Archive,
  Workflow, RefreshCw, Plus, X, File, Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentsCRUD, type DocumentRecord, type CreateDocumentInput } from "@/hooks/useDocumentsCRUD";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const documentTypes = [
  { value: "certificate", label: "Certificado" },
  { value: "manual", label: "Manual" },
  { value: "report", label: "Relatório" },
  { value: "policy", label: "Política" },
  { value: "checklist", label: "Checklist" },
  { value: "contract", label: "Contrato" },
  { value: "other", label: "Outro" },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: "Ativo", color: "bg-success/10 text-success border-success/20", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  draft: { label: "Rascunho", color: "bg-info/10 text-info border-info/20", icon: <Edit className="h-3.5 w-3.5" /> },
  expired: { label: "Expirado", color: "bg-destructive/10 text-destructive border-destructive/20", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  archived: { label: "Arquivado", color: "bg-muted text-muted-foreground border-muted", icon: <Archive className="h-3.5 w-3.5" /> },
  review: { label: "Em Revisão", color: "bg-warning/10 text-warning border-warning/20", icon: <Clock className="h-3.5 w-3.5" /> },
};

function formatFileSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  const icons: Record<string, string> = {
    certificate: "🏅",
    manual: "📘",
    report: "📊",
    policy: "📋",
    checklist: "✅",
    contract: "📜",
    photo: "🖼️",
    presentation: "📊",
  };
  return icons[type] || "📄";
}

export const AdvancedDocumentCenter: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isNewDocDialogOpen, setIsNewDocDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentRecord | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [newDocForm, setNewDocForm] = useState<CreateDocumentInput>({
    title: "",
    document_type: "manual",
    content: "",
    status: "active",
  });

  const {
    documents,
    isLoading,
    stats,
    createDocument,
    uploadDocument,
    updateDocument,
    deleteDocument,
    refetch,
  } = useDocumentsCRUD({
    category: categoryFilter,
    status: statusFilter,
    search: searchTerm || undefined,
  });

  // Filter locally for instant search feedback
  const filteredDocs = documents.filter((doc) => {
    if (searchTerm) {
      return doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles(Array.from(event.target.files));
    }
  };

  const handleUploadSubmit = async () => {
    if (uploadedFiles.length === 0) return;
    for (const file of uploadedFiles) {
      await uploadDocument.mutateAsync({ file });
    }
    setUploadedFiles([]);
    setIsUploadDialogOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleNewDocSubmit = async () => {
    if (!newDocForm.title.trim()) return;
    await createDocument.mutateAsync(newDocForm);
    setNewDocForm({ title: "", document_type: "manual", content: "", status: "active" });
    setIsNewDocDialogOpen(false);
  };

  const handleStatusChange = (doc: DocumentRecord, newStatus: string) => {
    updateDocument.mutate({ id: doc.id, status: newStatus });
  };

  const confirmDelete = () => {
    if (docToDelete) {
      deleteDocument.mutate(docToDelete.id);
      setDocToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDownload = (doc: DocumentRecord) => {
    if (doc.file_url) {
      window.open(doc.file_url, "_blank");
    } else {
      const content = `Documento: ${doc.title}\nTipo: ${doc.document_type}\nStatus: ${doc.status}\nCriado: ${format(new Date(doc.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={`doc-stat-skeleton-${i}`} className="h-28" />)}
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={`doc-list-skeleton-${i}`} className="h-20" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Centro de Documentos</h2>
          <p className="text-muted-foreground">
            {stats.total} documentos • {stats.active} ativos • {stats.certificates} certificados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button onClick={() => setIsNewDocDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Documento
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.active} ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificates}</div>
            <p className="text-xs text-muted-foreground">documentos certificados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">necessitam renovação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(documents.map(d => d.document_type)).size}
            </div>
            <p className="text-xs text-muted-foreground">categorias distintas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Document List */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="analytics">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {documentTypes.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Document List */}
          {filteredDocs.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground text-lg">Nenhum documento encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">Crie um novo documento ou faça upload de um arquivo</p>
              <Button className="mt-4" onClick={() => setIsNewDocDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Documento
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredDocs.map((doc) => {
                const status = statusConfig[doc.status] || statusConfig.active;
                return (
                  <Card key={doc.id} className="hover:bg-muted/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl">{getFileIcon(doc.document_type)}</span>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{doc.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span className="capitalize">{doc.document_type}</span>
                              <span>•</span>
                              <span>{formatFileSize(doc.file_size)}</span>
                              <span>•</span>
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(doc.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                              {doc.expiry_date && (
                                <>
                                  <span>•</span>
                                  <span className={new Date(doc.expiry_date) < new Date() ? "text-destructive" : ""}>
                                    Expira: {format(new Date(doc.expiry_date), "dd/MM/yyyy")}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="outline" className={status.color}>
                            {status.icon}
                            <span className="ml-1">{status.label}</span>
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedDocument(doc); setIsViewDialogOpen(true); }} aria-label="Visualizar documento" title="Visualizar documento">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} aria-label="Baixar documento" title="Baixar documento">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setDocToDelete(doc); setIsDeleteDialogOpen(true); }} aria-label="Excluir documento" title="Excluir documento">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Documentos por Tipo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(
                  documents.reduce((acc, doc) => {
                    acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{getFileIcon(type)}</span>
                      <span className="capitalize text-sm">{type}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
                {documents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Documentos por Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(
                  documents.reduce((acc, doc) => {
                    acc[doc.status] = (acc[doc.status] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([st, count]) => {
                  const cfg = statusConfig[st] || statusConfig.active;
                  return (
                    <div key={st} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {cfg.icon}
                        <span className="text-sm">{cfg.label}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  );
                })}
                {documents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== DIALOGS ===== */}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload de Documento</DialogTitle>
            <DialogDescription>Selecione um ou mais arquivos para enviar ao repositório.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Clique para selecionar arquivos ou arraste aqui
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOC, XLS, PPT, imagens (máx 50MB)
              </p>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file, fileIdx) => (
                  <div key={file.name} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== fileIdx))} aria-label="Remover arquivo" title="Remover arquivo">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUploadedFiles([]); setIsUploadDialogOpen(false); }}>
              Cancelar
            </Button>
            <Button onClick={handleUploadSubmit} disabled={uploadedFiles.length === 0 || uploadDocument.isPending}>
              {uploadDocument.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" />Enviar {uploadedFiles.length} arquivo(s)</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Document Dialog */}
      <Dialog open={isNewDocDialogOpen} onOpenChange={setIsNewDocDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Documento</DialogTitle>
            <DialogDescription>Crie um novo registro de documento no sistema.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={newDocForm.title}
                onChange={(e) => setNewDocForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nome do documento"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={newDocForm.document_type} onValueChange={(v) => setNewDocForm(prev => ({ ...prev, document_type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={newDocForm.content || ""}
                onChange={(e) => setNewDocForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Descrição ou conteúdo do documento"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDocDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleNewDocSubmit} disabled={!newDocForm.title.trim() || createDocument.isPending}>
              {createDocument.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Criando...</>
              ) : (
                <><Plus className="h-4 w-4 mr-2" />Criar Documento</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedDocument ? getFileIcon(selectedDocument.document_type) : "📄"}</span>
              {selectedDocument?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <p className="font-medium capitalize">{selectedDocument.document_type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p><Badge variant="outline" className={statusConfig[selectedDocument.status]?.color || ""}>{statusConfig[selectedDocument.status]?.label || selectedDocument.status}</Badge></p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tamanho:</span>
                  <p className="font-medium">{formatFileSize(selectedDocument.file_size)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Criado em:</span>
                  <p className="font-medium">{format(new Date(selectedDocument.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                </div>
                {selectedDocument.expiry_date && (
                  <div>
                    <span className="text-muted-foreground">Expira em:</span>
                    <p className={`font-medium ${new Date(selectedDocument.expiry_date) < new Date() ? "text-destructive" : ""}`}>
                      {format(new Date(selectedDocument.expiry_date), "dd/MM/yyyy")}
                    </p>
                  </div>
                )}
                {selectedDocument.mime_type && (
                  <div>
                    <span className="text-muted-foreground">Formato:</span>
                    <p className="font-medium">{selectedDocument.mime_type}</p>
                  </div>
                )}
              </div>
              {selectedDocument.content && (
                <div>
                  <span className="text-sm text-muted-foreground">Conteúdo:</span>
                  <p className="mt-1 text-sm bg-muted/50 p-3 rounded">{selectedDocument.content}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Select
                  value={selectedDocument.status}
                  onValueChange={(v) => {
                    handleStatusChange(selectedDocument, v);
                    setSelectedDocument({ ...selectedDocument, status: v });
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Alterar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="review">Em Revisão</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Fechar</Button>
            {selectedDocument && (
              <Button onClick={() => handleDownload(selectedDocument)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "{docToDelete?.title}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteDocument.isPending}>
              {deleteDocument.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Excluindo...</>
              ) : (
                <><Trash2 className="h-4 w-4 mr-2" />Excluir</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
