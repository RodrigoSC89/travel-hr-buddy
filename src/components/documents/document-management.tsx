import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
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
  Folder
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  description?: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  access_level: "public" | "organization" | "restricted";
  category: string;
  tags: string[];
  version: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  count: number;
}

export const DocumentManagement: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    loadDocuments();
    loadCategories();
  }, []);

  const loadDocuments = async () => {
    try {
      // Mock data for demonstration
      const mockDocuments: Document[] = [
        {
          id: "1",
          title: "Manual de Segurança Marítima",
          description: "Procedimentos de segurança para todas as embarcações da frota",
          file_path: "/docs/manual-seguranca.pdf",
          file_size: 2567890,
          file_type: "application/pdf",
          uploaded_by: "Carlos Silva",
          access_level: "organization",
          category: "Segurança",
          tags: ["segurança", "manual", "procedimentos"],
          version: 3,
          expires_at: "2024-12-31T23:59:59Z",
          created_at: "2024-01-01T10:00:00Z",
          updated_at: "2024-01-15T14:30:00Z"
        },
        {
          id: "2",
          title: "Certificado ISM - MV Atlântico",
          description: "Certificado de Gestão de Segurança Internacional",
          file_path: "/docs/ism-atlantico.pdf",
          file_size: 1234567,
          file_type: "application/pdf",
          uploaded_by: "Maria Oliveira",
          access_level: "organization",
          category: "Certificações",
          tags: ["ism", "certificado", "mv-atlantico"],
          version: 1,
          expires_at: "2025-06-15T23:59:59Z",
          created_at: "2024-01-10T09:00:00Z",
          updated_at: "2024-01-10T09:00:00Z"
        },
        {
          id: "3",
          title: "Plano de Manutenção Preventiva",
          description: "Cronograma e procedimentos de manutenção preventiva da frota",
          file_path: "/docs/plano-manutencao.xlsx",
          file_size: 987654,
          file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          uploaded_by: "João Santos",
          access_level: "organization",
          category: "Manutenção",
          tags: ["manutenção", "preventiva", "cronograma"],
          version: 2,
          created_at: "2024-01-05T11:00:00Z",
          updated_at: "2024-01-20T16:00:00Z"
        },
        {
          id: "4",
          title: "Relatório de Inspeção - Porto de Santos",
          description: "Relatório detalhado da última inspeção portuária",
          file_path: "/docs/inspecao-santos.docx",
          file_size: 567890,
          file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          uploaded_by: "Ana Costa",
          access_level: "restricted",
          category: "Relatórios",
          tags: ["inspeção", "porto", "santos"],
          version: 1,
          created_at: "2024-01-18T13:00:00Z",
          updated_at: "2024-01-18T13:00:00Z"
        }
      ];
      
      setDocuments(mockDocuments);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os documentos",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Mock categories
      const mockCategories: DocumentCategory[] = [
        { id: "1", name: "Segurança", description: "Documentos relacionados à segurança", color: "#ef4444", count: 5 },
        { id: "2", name: "Certificações", description: "Certificados e licenças", color: "#3b82f6", count: 8 },
        { id: "3", name: "Manutenção", description: "Documentos de manutenção", color: "#f59e0b", count: 3 },
        { id: "4", name: "Relatórios", description: "Relatórios operacionais", color: "#10b981", count: 12 },
        { id: "5", name: "Contratos", description: "Contratos e acordos", color: "#8b5cf6", count: 6 }
      ];
      
      setCategories(mockCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleAddDocument = async () => {
    try {
      const document: Document = {
        id: Math.random().toString(),
        ...newDocument,
        file_path: `/docs/${newDocument.title.toLowerCase().replace(/\s+/g, "-")}.pdf`,
        file_size: Math.floor(Math.random() * 5000000) + 100000,
        file_type: "application/pdf",
        uploaded_by: "Current User",
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setDocuments([...documents, document]);
      setNewDocument({
        title: "",
        description: "",
        category: "",
        access_level: "organization",
        tags: [],
        expires_at: ""
      });
      setShowAddDialog(false);
      
      toast({
        title: "Documento Adicionado",
        description: `${document.title} foi adicionado com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o documento",
        variant: "destructive"
      });
    }
  };

  const handleAddCategory = async () => {
    try {
      const category: DocumentCategory = {
        id: Math.random().toString(),
        ...newCategory,
        count: 0
      };
      
      setCategories([...categories, category]);
      setNewCategory({
        name: "",
        description: "",
        color: "#3b82f6"
      });
      setShowAddCategoryDialog(false);
      
      toast({
        title: "Categoria Criada",
        description: `${category.name} foi criada com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a categoria",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word")) return "📝";
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "📊";
    if (fileType.includes("image")) return "🖼️";
    return "📁";
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
    case "public": return "bg-green-500 text-azure-50";
    case "organization": return "bg-blue-500 text-azure-50";
    case "restricted": return "bg-red-500 text-azure-50";
    default: return "bg-gray-500 text-azure-50";
    }
  };

  const getAccessLevelText = (level: string) => {
    switch (level) {
    case "public": return "Público";
    case "organization": return "Organização";
    case "restricted": return "Restrito";
    default: return "Desconhecido";
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
                <p className="text-sm font-medium text-muted-foreground">Expirando Breve</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {documents.filter(d => 
                    d.expires_at && 
                    new Date(d.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  ).length}
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
                  {formatFileSize(documents.reduce((sum, doc) => sum + doc.file_size, 0))}
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
                              <h3 className="font-semibold">{doc.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {doc.description}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline">{doc.category}</Badge>
                                <Badge className={getAccessLevelColor(doc.access_level)}>
                                  {getAccessLevelText(doc.access_level)}
                                </Badge>
                                {doc.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {doc.tags.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{doc.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                            <span>{formatFileSize(doc.file_size)}</span>
                            <span>v{doc.version}</span>
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
                      <h3 className="font-semibold mb-2">{selectedDocument.title}</h3>
                      <p className="text-sm text-muted-foreground">{selectedDocument.description}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{selectedDocument.category}</Badge>
                      <Badge className={getAccessLevelColor(selectedDocument.access_level)}>
                        {getAccessLevelText(selectedDocument.access_level)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Tamanho:</span>
                        <span className="text-sm font-medium">{formatFileSize(selectedDocument.file_size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Versão:</span>
                        <span className="text-sm font-medium">v{selectedDocument.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Enviado por:</span>
                        <span className="text-sm font-medium">{selectedDocument.uploaded_by}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Criado em:</span>
                        <span className="text-sm font-medium">
                          {new Date(selectedDocument.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {selectedDocument.expires_at && (
                        <div className="flex justify-between">
                          <span className="text-sm">Expira em:</span>
                          <span className="text-sm font-medium">
                            {new Date(selectedDocument.expires_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedDocument.tags.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Tags</p>
                        <div className="flex gap-1 flex-wrap">
                          {selectedDocument.tags.map((tag, index) => (
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
            <CardContent className="p-8 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Controle de vencimentos de documentos será implementado em breve
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};