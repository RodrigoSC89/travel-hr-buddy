import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Share2, 
  Trash2,
  Star,
  StarOff,
  MoreVertical,
  FolderOpen,
  Clock,
  User,
  Tag,
  Zap,
  Brain,
  Scan,
  FileCheck,
  AlertCircle,
  CheckCircle,
  FileX,
  Plus,
  Grid,
  List,
  SortAsc,
  Calendar
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: Date;
  author: string;
  status: "processing" | "completed" | "error" | "pending";
  category: string;
  tags: string[];
  favorite: boolean;
  aiSummary?: string;
  extractedText?: string;
  insights?: string[];
  confidence: number;
  version: number;
  permissions: string[];
}

interface AIAnalysis {
  summary: string;
  keyPoints: string[];
  sentiment: "positive" | "neutral" | "negative";
  topics: string[];
  confidence: number;
}

const IntelligentDocumentManager = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Contrato_Fornecedor_2024.pdf",
      type: "PDF",
      size: "2.4 MB",
      lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000),
      author: "João Silva",
      status: "completed",
      category: "Contratos",
      tags: ["contrato", "fornecedor", "2024"],
      favorite: true,
      aiSummary: "Contrato de fornecimento de materiais com prazo de 12 meses...",
      confidence: 95,
      version: 1,
      permissions: ["read", "write", "share"]
    },
    {
      id: "2",
      name: "Relatório_Vendas_Q1.xlsx",
      type: "Excel",
      size: "1.8 MB",
      lastModified: new Date(Date.now() - 5 * 60 * 60 * 1000),
      author: "Maria Santos",
      status: "processing",
      category: "Relatórios",
      tags: ["vendas", "Q1", "análise"],
      favorite: false,
      confidence: 87,
      version: 2,
      permissions: ["read", "write"]
    },
    {
      id: "3",
      name: "Política_Segurança.docx",
      type: "Word",
      size: "856 KB",
      lastModified: new Date(Date.now() - 8 * 60 * 60 * 1000),
      author: "Carlos Tech",
      status: "completed",
      category: "Políticas",
      tags: ["segurança", "política", "TI"],
      favorite: false,
      aiSummary: "Documento define diretrizes de segurança da informação...",
      confidence: 92,
      version: 3,
      permissions: ["read"]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("lastModified");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ["all", "Contratos", "Relatórios", "Políticas", "Financeiro", "RH"];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "processing":
      return <Zap className="w-4 h-4 text-blue-500 animate-pulse" />;
    case "error":
      return <FileX className="w-4 h-4 text-red-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "error":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
    case "pdf":
      return <FileText className="w-8 h-8 text-red-500" />;
    case "excel":
      return <FileText className="w-8 h-8 text-green-500" />;
    case "word":
      return <FileText className="w-8 h-8 text-blue-500" />;
    default:
      return <FileText className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setShowUploadDialog(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setShowUploadDialog(false);
          setUploadProgress(0);
          toast({
            title: "Upload concluído",
            description: `${files.length} arquivo(s) enviado(s) com sucesso`
          });
          
          // Add new document to list
          const newDoc: Document = {
            id: (documents.length + 1).toString(),
            name: files[0].name,
            type: files[0].name.split(".").pop()?.toUpperCase() || "Unknown",
            size: `${(files[0].size / (1024 * 1024)).toFixed(1)} MB`,
            lastModified: new Date(),
            author: "Usuário Atual",
            status: "processing",
            category: "Sem categoria",
            tags: [],
            favorite: false,
            confidence: 0,
            version: 1,
            permissions: ["read", "write", "share"]
          };
          
          setDocuments(prev => [newDoc, ...prev]);
        }, 1000);
      }
    }, 200);
  };

  const toggleFavorite = (id: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, favorite: !doc.favorite } : doc
    ));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: "Documento excluído",
      description: "O documento foi removido permanentemente"
    });
  };

  const analyzeDocument = (id: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, status: "processing" } : doc
    ));
    
    // Simulate AI analysis
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? { 
          ...doc, 
          status: "completed",
          aiSummary: "Análise IA concluída. Documento contém informações importantes sobre...",
          confidence: Math.floor(Math.random() * 20) + 80
        } : doc
      ));
      
      toast({
        title: "Análise IA concluída",
        description: "Documento analisado com sucesso"
      });
    }, 3000);
  };

  const shareDocument = (document: Document) => {
    toast({
      title: "Link de compartilhamento",
      description: "Link copiado para a área de transferência"
    });
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão Inteligente de Documentos</h1>
          <p className="text-muted-foreground">
            IA avançada para análise e organização de documentos
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar documentos, tags ou conteúdo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-background border border-border rounded px-3 py-2"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === "all" ? "Todas as categorias" : category}
            </option>
          ))}
        </select>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SortAsc className="w-4 h-4" />
              Ordenar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy("lastModified")}>
              Última modificação
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("name")}>
              Nome
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("size")}>
              Tamanho
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Processando</span>
            </div>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.status === "processing").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Favoritos</span>
            </div>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.favorite).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">IA Analisados</span>
            </div>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.aiSummary).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Grid/List */}
      <div className={viewMode === "grid" ? 
        "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : 
        "space-y-2"
      }>
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="border-border hover:shadow-md transition-shadow">
            {viewMode === "grid" ? (
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(document.type)}
                    <div className="flex-1">
                      <h3 className="font-medium text-sm truncate" title={document.name}>
                        {document.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {document.size} • {document.type}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => shareDocument(document)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => analyzeDocument(document.id)}>
                        <Brain className="w-4 h-4 mr-2" />
                        Analisar IA
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteDocument(document.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(document.status)}>
                      {getStatusIcon(document.status)}
                      <span className="ml-1">{document.status}</span>
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(document.id)}
                    >
                      {document.favorite ? 
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> :
                        <StarOff className="w-4 h-4" />
                      }
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{document.author}</span>
                    <Clock className="w-3 h-3 ml-2" />
                    <span>{document.lastModified.toLocaleDateString()}</span>
                  </div>
                  
                  {document.confidence > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Confiança IA</span>
                        <span>{document.confidence}%</span>
                      </div>
                      <Progress value={document.confidence} className="h-1" />
                    </div>
                  )}
                  
                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {document.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {document.aiSummary && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {document.aiSummary}
                    </p>
                  )}
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {getTypeIcon(document.type)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{document.name}</h3>
                      <Badge className={getStatusColor(document.status)}>
                        {document.status}
                      </Badge>
                      {document.favorite && (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{document.size}</span>
                      <span>{document.author}</span>
                      <span>{document.lastModified.toLocaleDateString()}</span>
                      <span>{document.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => shareDocument(document)}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => analyzeDocument(document.id)}>
                          <Brain className="w-4 h-4 mr-2" />
                          Analisar IA
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteDocument(document.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Upload Progress Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviando Documentos</DialogTitle>
            <DialogDescription>
              Processando e analisando arquivos com IA...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Progress value={uploadProgress} />
            <p className="text-center text-sm text-muted-foreground">
              {uploadProgress}% concluído
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntelligentDocumentManager;