import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Upload,
  Download,
  Share2,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  FolderPlus,
  Calendar,
  User,
  Tag,
  Archive,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  Globe,
  Users,
  FileCheck,
  Workflow,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Document {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "docx" | "xlsx" | "pptx" | "image" | "other";
  category: string;
  size: number;
  status: "draft" | "review" | "approved" | "archived";
  version: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  isPublic: boolean;
  downloadCount: number;
  viewCount: number;
  collaborators: string[];
  approvals: Array<{
    user: string;
    status: "pending" | "approved" | "rejected";
    date: Date;
    comments?: string;
  }>;
}

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: Array<{
    name: string;
    type: "text" | "number" | "date" | "select" | "textarea";
    required: boolean;
    options?: string[];
  }>;
  usageCount: number;
}

export const AdvancedDocumentCenter: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Dados simulados para demonstração
  const generateMockData = () => {
    const mockDocuments: Document[] = [
      {
        id: "1",
        title: "Manual de Operações Marítimas",
        description: "Guia completo de procedimentos operacionais para embarcações",
        type: "pdf",
        category: "manuais",
        size: 2048576, // 2MB
        status: "approved",
        version: "2.1",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdBy: "João Silva",
        tags: ["marítimo", "operações", "manual", "segurança"],
        isPublic: false,
        downloadCount: 47,
        viewCount: 156,
        collaborators: ["João Silva", "Maria Santos", "Pedro Costa"],
        approvals: [
          {
            user: "Supervisor Marítimo",
            status: "approved",
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            user: "Diretor Operacional",
            status: "approved",
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        id: "2",
        title: "Relatório Financeiro Q1 2024",
        description: "Análise financeira do primeiro trimestre",
        type: "xlsx",
        category: "relatórios",
        size: 1536000, // 1.5MB
        status: "review",
        version: "1.3",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdBy: "Ana Oliveira",
        tags: ["financeiro", "relatório", "Q1", "2024"],
        isPublic: false,
        downloadCount: 23,
        viewCount: 89,
        collaborators: ["Ana Oliveira", "Carlos Ferreira"],
        approvals: [
          { user: "Gerente Financeiro", status: "pending", date: new Date() },
          { user: "CFO", status: "pending", date: new Date() },
        ],
      },
      {
        id: "3",
        title: "Política de Recursos Humanos",
        description: "Documento oficial das políticas de RH da empresa",
        type: "docx",
        category: "políticas",
        size: 512000, // 512KB
        status: "draft",
        version: "3.0",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        createdBy: "Roberto Lima",
        tags: ["rh", "política", "recursos humanos", "oficial"],
        isPublic: true,
        downloadCount: 12,
        viewCount: 67,
        collaborators: ["Roberto Lima", "Fernanda Alves"],
        approvals: [{ user: "Diretor de RH", status: "pending", date: new Date() }],
      },
      {
        id: "4",
        title: "Certificados de Qualidade ISO",
        description: "Coleção de certificados ISO da empresa",
        type: "pdf",
        category: "certificados",
        size: 3072000, // 3MB
        status: "approved",
        version: "1.0",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        createdBy: "Qualidade ISO",
        tags: ["iso", "qualidade", "certificado", "auditoria"],
        isPublic: true,
        downloadCount: 89,
        viewCount: 234,
        collaborators: ["Qualidade ISO"],
        approvals: [
          {
            user: "Auditor Interno",
            status: "approved",
            date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    ];

    const mockTemplates: DocumentTemplate[] = [
      {
        id: "t1",
        name: "Relatório de Incidente",
        description: "Template para reportar incidentes operacionais",
        category: "relatórios",
        usageCount: 34,
        fields: [
          { name: "Data do Incidente", type: "date", required: true },
          { name: "Local", type: "text", required: true },
          { name: "Descrição", type: "textarea", required: true },
          {
            name: "Gravidade",
            type: "select",
            required: true,
            options: ["Baixa", "Média", "Alta", "Crítica"],
          },
          { name: "Responsável", type: "text", required: true },
        ],
      },
      {
        id: "t2",
        name: "Solicitação de Férias",
        description: "Template para solicitação de períodos de férias",
        category: "rh",
        usageCount: 87,
        fields: [
          { name: "Nome do Funcionário", type: "text", required: true },
          { name: "Data de Início", type: "date", required: true },
          { name: "Data de Fim", type: "date", required: true },
          { name: "Motivo", type: "textarea", required: false },
          { name: "Substituto", type: "text", required: true },
        ],
      },
      {
        id: "t3",
        name: "Avaliação de Fornecedor",
        description: "Template para avaliar fornecedores",
        category: "compras",
        usageCount: 23,
        fields: [
          { name: "Nome do Fornecedor", type: "text", required: true },
          {
            name: "Categoria",
            type: "select",
            required: true,
            options: ["Serviços", "Produtos", "Equipamentos"],
          },
          { name: "Qualidade", type: "number", required: true },
          { name: "Pontualidade", type: "number", required: true },
          { name: "Observações", type: "textarea", required: false },
        ],
      },
    ];

    setDocuments(mockDocuments);
    setTemplates(mockTemplates);
    setIsLoading(false);
  };

  useEffect(() => {
    generateMockData();
  }, []);

  const getFileTypeIcon = (type: string) => {
    switch (type) {
    case "pdf":
      return "📄";
    case "docx":
      return "📝";
    case "xlsx":
      return "📊";
    case "pptx":
      return "📊";
    case "image":
      return "🖼️";
    default:
      return "📁";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "approved":
      return "text-green-600 bg-green-100";
    case "review":
      return "text-yellow-600 bg-yellow-100";
    case "draft":
      return "text-blue-600 bg-blue-100";
    case "archived":
      return "text-muted-foreground bg-gray-100";
    default:
      return "text-muted-foreground bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "approved":
      return <CheckCircle className="h-4 w-4" />;
    case "review":
      return <Clock className="h-4 w-4" />;
    case "draft":
      return <Edit className="h-4 w-4" />;
    case "archived":
      return <Archive className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleUpload = () => {
    toast({
      title: "Upload simulado",
      description: "Funcionalidade de upload será implementada.",
    });
  };

  const handleDownload = (documentId: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === documentId ? { ...doc, downloadCount: doc.downloadCount + 1 } : doc
      )
    );

    toast({
      title: "Download iniciado",
      description: "O documento está sendo baixado.",
    });
  };

  const handleView = (document: Document) => {
    setDocuments(prev =>
      prev.map(doc => (doc.id === document.id ? { ...doc, viewCount: doc.viewCount + 1 } : doc))
    );

    setSelectedDocument(document);
  };

  const handleStatusChange = (documentId: string, newStatus: Document["status"]) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === documentId ? { ...doc, status: newStatus, updatedAt: new Date() } : doc
      )
    );

    toast({
      title: "Status atualizado",
      description: `Documento marcado como ${newStatus}.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Centro de Documentos</h2>
          <p className="text-muted-foreground">
            Gerencie documentos, templates e fluxos de aprovação
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Documento
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              {documents.filter(d => d.status === "approved").length} aprovados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads Hoje</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.reduce((acc, doc) => acc + doc.downloadCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">+12% vs ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Revisão</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.status === "review").length}
            </div>
            <p className="text-xs text-muted-foreground">aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">disponíveis</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="approval">Aprovações</TabsTrigger>
          <TabsTrigger value="analytics">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="manuais">Manuais</SelectItem>
                <SelectItem value="relatórios">Relatórios</SelectItem>
                <SelectItem value="políticas">Políticas</SelectItem>
                <SelectItem value="certificados">Certificados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="review">Revisão</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                Lista
              </Button>
            </div>
          </div>

          {/* Lista/Grid de Documentos */}
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map(doc => (
                <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getFileTypeIcon(doc.type)}</span>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{doc.title}</CardTitle>
                          <CardDescription className="text-sm line-clamp-2">
                            {doc.description}
                          </CardDescription>
                        </div>
                      </div>

                      <Badge className={getStatusColor(doc.status)}>
                        {getStatusIcon(doc.status)}
                        <span className="ml-1 capitalize">{doc.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>v{doc.version}</span>
                        <span>{formatFileSize(doc.size)}</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {doc.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{doc.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {doc.viewCount}
                        </span>
                        <span className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {doc.downloadCount}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {doc.collaborators.length}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleView(doc)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => handleDownload(doc.id)}>
                          <Download className="h-3 w-3 mr-1" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map(doc => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <span className="text-xl">{getFileTypeIcon(doc.type)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{doc.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {doc.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>{doc.updatedAt.toLocaleDateString()}</span>
                          <span>{doc.createdBy}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                        <Button size="sm" variant="outline" onClick={() => handleView(doc)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" onClick={() => handleDownload(doc.id)}>
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Documentos</CardTitle>
              <CardDescription>
                Modelos pré-configurados para criação rápida de documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map(template => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline">{template.category}</Badge>
                          <span className="text-muted-foreground">
                            {template.fields.length} campos
                          </span>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Usado {template.usageCount} vezes
                        </div>

                        <Button className="w-full" size="sm">
                          Usar Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Aprovações</CardTitle>
              <CardDescription>Documentos aguardando sua aprovação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents
                  .filter(doc => doc.status === "review")
                  .map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{doc.title}</h4>
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>Criado por: {doc.createdBy}</span>
                          <span>Versão: {doc.version}</span>
                          <span>Atualizado: {doc.updatedAt.toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(doc)}>
                          <Eye className="h-3 w-3 mr-1" />
                          Revisar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(doc.id, "draft")}
                        >
                          Rejeitar
                        </Button>
                        <Button size="sm" onClick={() => handleStatusChange(doc.id, "approved")}>
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Documentos por Categoria</CardTitle>
                <CardDescription>Distribuição de documentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["manuais", "relatórios", "políticas", "certificados"].map(category => {
                    const count = documents.filter(d => d.category === category).length;
                    const percentage = (count / documents.length) * 100;

                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="capitalize">{category}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20 h-2" />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Downloads e visualizações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Downloads hoje</span>
                    <span className="font-bold">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Visualizações hoje</span>
                    <span className="font-bold">234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Novos documentos</span>
                    <span className="font-bold">7</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Aprovações pendentes</span>
                    <span className="font-bold text-yellow-600">
                      {documents.filter(d => d.status === "review").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
