import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ux-system";
import {
  FileText, 
  Plus, 
  Search, 
  Download,
  Upload,
  Eye,
  Trash2,
  Filter,
  Calendar,
  User,
  Tag,
  Folder,
  AlertTriangle
} from "lucide-react";
import { useDocuments, useUploadDocument, useDeleteDocument, type Document } from "@/hooks/use-documents-crud";

interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  count: number;
}

const defaultCategories: DocumentCategory[] = [
  { id: "1", name: "Segurança", description: "Documentos relacionados à segurança", color: "#ef4444", count: 5 },
  { id: "2", name: "Certificações", description: "Certificados e licenças", color: "#3b82f6", count: 8 },
  { id: "3", name: "Manutenção", description: "Documentos de manutenção", color: "#f59e0b", count: 3 },
  { id: "4", name: "Relatórios", description: "Relatórios operacionais", color: "#10b981", count: 12 },
  { id: "5", name: "Contratos", description: "Contratos e acordos", color: "#8b5cf6", count: 6 }
];

export const DocumentManagement: React.FC = () => {
  const { data: documents = [], isLoading, error, refetch } = useDocuments();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  
  const [categories] = useState<DocumentCategory[]>(defaultCategories);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const { toast } = useToast();

  // Form state for new document
  const [newDocument, setNewDocument] = useState({
    title: "",
    description: "",
    category: "",
    access_level: "organization" as "public" | "organization" | "restricted",
    tags: [] as string[],
    expires_at: ""
  });

  // Form state for new category
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#3b82f6"
  });

  const handleAddDocument = async () => {
    // For now, show a file picker simulation
    sonnerToast.info("Selecione um arquivo para upload");
    setShowAddDialog(false);
  };

  const handleAddCategory = async () => {
    sonnerToast.success(`Categoria "${newCategory.name}" será criada`);
    setNewCategory({ name: "", description: "", color: "#3b82f6" });
    setShowAddCategoryDialog(false);
  };

  const handleDeleteDocument = async () => {
    if (!deleteTarget) return;
    await deleteDocument.mutateAsync(deleteTarget);
    setDeleteTarget(null);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeIcon = (fileType: string | null) => {
    const type = fileType || "";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word")) return "📝";
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
    if (type.includes("image")) return "🖼️";
    return "📁";
  };

  const getOcrStatusColor = (status: string | null) => {
    switch (status) {
      case "completed": return "bg-green-500 text-white";
      case "pending": return "bg-yellow-500 text-black";
      case "processing": return "bg-blue-500 text-white";
      case "error": return "bg-red-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getOcrStatusText = (status: string | null) => {
    switch (status) {
      case "completed": return "Processado";
      case "pending": return "Pendente";
      case "processing": return "Processando";
      case "error": return "Erro";
      default: return "Desconhecido";
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = (doc.file_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Erro ao carregar documentos"
        description="Não foi possível carregar os documentos. Tente novamente."
        actionLabel="Tentar Novamente"
        onAction={() => refetch()}
      />
    );
  }

  // Helper to extract tags from extracted_keywords JSON
  const getDocumentTags = (doc: Document): string[] => {
    if (!doc.extracted_keywords) return [];
    if (Array.isArray(doc.extracted_keywords)) return doc.extracted_keywords as string[];
    if (typeof doc.extracted_keywords === 'object') {
      const kw = doc.extracted_keywords as Record<string, unknown>;
      if (Array.isArray(kw.tags)) return kw.tags as string[];
      if (Array.isArray(kw.keywords)) return kw.keywords as string[];
    }
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Gestão de Documentos
          </h2>
          <p className="text-muted-foreground">
            Organize e gerencie todos os documentos da organização
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Categoria</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cat-name">Nome da Categoria</Label>
                  <Input
                    id="cat-name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Ex: Contratos"
                  />
                </div>
                <div>
                  <Label htmlFor="cat-desc">Descrição</Label>
                  <Textarea
                    id="cat-desc"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Descrição da categoria..."
                  />
                </div>
                <div>
                  <Label htmlFor="cat-color">Cor</Label>
                  <Input
                    id="cat-color"
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddCategory} className="flex-1">
                  Criar Categoria
                </Button>
                <Button variant="outline" onClick={() => setShowAddCategoryDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Documento</Label>
                  <Input
                    id="title"
                    value={newDocument.title}
                    onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                    placeholder="Ex: Manual de Procedimentos"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newDocument.description}
                    onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                    placeholder="Descrição do documento..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select 
                      value={newDocument.category} 
                      onValueChange={(value) => setNewDocument({ ...newDocument, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="access">Nível de Acesso</Label>
                    <Select 
                      value={newDocument.access_level} 
                      onValueChange={(value: "public" | "organization" | "restricted") => 
                        setNewDocument({ ...newDocument, access_level: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Público</SelectItem>
                        <SelectItem value="organization">Organização</SelectItem>
                        <SelectItem value="restricted">Restrito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="expires">Data de Expiração (Opcional)</Label>
                  <Input
                    id="expires"
                    type="datetime-local"
                    value={newDocument.expires_at}
                    onChange={(e) => setNewDocument({ ...newDocument, expires_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="file">Arquivo</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Clique para selecionar ou arraste o arquivo aqui
                    </p>
                    <Input type="file" className="hidden" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddDocument} className="flex-1">
                  Adicionar Documento
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documentos</p>
                <p className="text-3xl font-bold">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categorias</p>
                <p className="text-3xl font-bold">{categories.length}</p>
              </div>
              <Folder className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">OCR Pendente</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {documents.filter(d => d.ocr_status === "pending").length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tamanho Total</p>
                <p className="text-2xl font-bold">
                  {formatFileSize(documents.reduce((sum, doc) => sum + (doc.file_size_bytes || doc.file_size || 0), 0))}
                </p>
              </div>
              <Upload className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="documents" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="expired">Vencimentos</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos ({filteredDocuments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredDocuments.map((doc) => (
                      <div 
                        key={doc.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedDocument?.id === doc.id ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="text-2xl">{getFileTypeIcon(doc.file_type)}</div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{doc.title || doc.file_name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {doc.description || "Sem descrição"}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline">{doc.category || "Geral"}</Badge>
                                <Badge className={getOcrStatusColor(doc.ocr_status)}>
                                  {getOcrStatusText(doc.ocr_status)}
                                </Badge>
                                {getDocumentTags(doc).slice(0, 2).map((tag: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                            <span>{formatFileSize(doc.file_size_bytes || doc.file_size)}</span>
                            <span>{doc.confidence_score ? `${doc.confidence_score}%` : ""}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {doc.uploaded_by}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Document Details */}
            <div>
              {selectedDocument ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Detalhes do Documento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{selectedDocument.title || selectedDocument.file_name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedDocument.description || "Sem descrição"}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{selectedDocument.category || "Geral"}</Badge>
                      <Badge className={getOcrStatusColor(selectedDocument.ocr_status)}>
                        {getOcrStatusText(selectedDocument.ocr_status)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Tamanho:</span>
                        <span className="text-sm font-medium">{formatFileSize(selectedDocument.file_size_bytes || selectedDocument.file_size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Confiança OCR:</span>
                        <span className="text-sm font-medium">{selectedDocument.confidence_score ? `${selectedDocument.confidence_score}%` : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Enviado por:</span>
                        <span className="text-sm font-medium">{selectedDocument.uploaded_by || "Sistema"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Criado em:</span>
                        <span className="text-sm font-medium">
                          {new Date(selectedDocument.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    {getDocumentTags(selectedDocument).length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Tags</p>
                        <div className="flex gap-1 flex-wrap">
                          {getDocumentTags(selectedDocument).map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 space-y-2">
                      <Button className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" className="w-full">
                        Nova Versão
                      </Button>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Selecione um documento para ver os detalhes
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="font-semibold">{category.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">
                      {category.count} documentos
                    </Badge>
                    <Button size="sm" variant="ghost">
                      Ver todos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expired">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Controle de Vencimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Certificado STCW - João Silva", expiry: "2025-02-15", days: 44, status: "warning" },
                  { name: "Contrato de Trabalho - Maria Santos", expiry: "2025-01-20", days: 18, status: "critical" },
                  { name: "Habilitação Marítima - Pedro Costa", expiry: "2024-12-28", days: -5, status: "expired" },
                  { name: "Certificado de Saúde - Ana Lima", expiry: "2025-03-10", days: 67, status: "ok" },
                ].map((doc, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">Vence em: {doc.expiry}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={doc.status === "expired" ? "destructive" : doc.status === "critical" ? "destructive" : doc.status === "warning" ? "secondary" : "default"}>
                        {doc.days < 0 ? `Vencido há ${Math.abs(doc.days)} dias` : `${doc.days} dias restantes`}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => sonnerToast.success(`Notificação enviada para renovação de: ${doc.name}`)}>
                        Notificar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};