import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Download, 
  FileText, 
  Image, 
  Video, 
  Mic,
  Camera,
  Paperclip,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  Tags,
  FolderOpen,
  Archive
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Document {
  id: string;
  name: string;
  type: "evidence" | "procedure" | "report" | "certificate" | "photo" | "video" | "audio";
  format: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  auditId?: string;
  elementId?: string;
  requirementId?: string;
  tags: string[];
  description: string;
  version: string;
  status: "pending" | "approved" | "rejected" | "archived";
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
  url?: string;
  thumbnail?: string;
  metadata?: {
    location?: string;
    timestamp?: string;
    equipment?: string;
    inspector?: string;
  };
}

interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  documents: Document[];
  completionRate: number;
}

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  {
    id: "evidence",
    name: "Evidências de Auditoria",
    description: "Fotos, vídeos e documentos que comprovam conformidade",
    required: true,
    documents: [],
    completionRate: 0
  },
  {
    id: "procedures",
    name: "Procedimentos e Políticas",
    description: "Documentos normativos e procedimentos operacionais",
    required: true,
    documents: [],
    completionRate: 0
  },
  {
    id: "certificates",
    name: "Certificações",
    description: "Certificados de conformidade e qualificações",
    required: true,
    documents: [],
    completionRate: 0
  },
  {
    id: "reports",
    name: "Relatórios",
    description: "Relatórios de auditoria e análises técnicas",
    required: false,
    documents: [],
    completionRate: 0
  }
];

export const PeotramDocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>(DOCUMENT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [newDocument, setNewDocument] = useState({
    name: "",
    type: "evidence" as Document["type"],
    description: "",
    tags: "",
    auditId: "",
    elementId: "",
    requirementId: ""
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      // Simular carregamento de documentos
      const mockDocuments: Document[] = [
        {
          id: "DOC_001",
          name: "Política de Segurança SMS.pdf",
          type: "procedure",
          format: "pdf",
          size: 2048576,
          uploadedBy: "João Silva",
          uploadedAt: "2024-12-15T10:30:00Z",
          auditId: "AUDIT_001",
          elementId: "ELEMENTO_01",
          requirementId: "1.1.1",
          tags: ["política", "SMS", "segurança"],
          description: "Política corporativa de Segurança, Meio Ambiente e Saúde",
          version: "2.1",
          status: "approved",
          reviewedBy: "Maria Santos",
          reviewedAt: "2024-12-15T14:00:00Z",
          metadata: {
            inspector: "João Silva",
            timestamp: "2024-12-15T10:30:00Z"
          }
        },
        {
          id: "DOC_002",
          name: "Evidência_Treinamento_NR34.jpg",
          type: "photo",
          format: "jpg",
          size: 1024768,
          uploadedBy: "Carlos Eduardo",
          uploadedAt: "2024-12-14T16:45:00Z",
          auditId: "AUDIT_001",
          elementId: "ELEMENTO_02",
          requirementId: "2.1.1",
          tags: ["evidência", "treinamento", "NR-34"],
          description: "Foto do certificado de treinamento NR-34",
          version: "1.0",
          status: "pending",
          thumbnail: "/api/placeholder/150/150",
          metadata: {
            location: "Sala de Treinamento - Base Santos",
            timestamp: "2024-12-14T16:45:00Z",
            equipment: "iPhone 14 Pro",
            inspector: "Carlos Eduardo"
          }
        },
        {
          id: "DOC_003",
          name: "Inspeção_Equipamentos_Video.mp4",
          type: "video",
          format: "mp4",
          size: 15728640,
          uploadedBy: "Ana Costa",
          uploadedAt: "2024-12-13T09:15:00Z",
          auditId: "AUDIT_001",
          elementId: "ELEMENTO_06",
          tags: ["inspeção", "equipamentos", "manutenção"],
          description: "Vídeo da inspeção de equipamentos de segurança",
          version: "1.0",
          status: "approved",
          reviewedBy: "José Santos",
          reviewedAt: "2024-12-13T15:30:00Z",
          thumbnail: "/api/placeholder/150/100",
          metadata: {
            location: "Convés Principal - MV Atlantic Explorer",
            timestamp: "2024-12-13T09:15:00Z",
            equipment: "GoPro Hero 11",
            inspector: "Ana Costa"
          }
        }
      ];

      setDocuments(mockDocuments);
      updateCategoryCompletion(mockDocuments);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
    }
  };

  const updateCategoryCompletion = (docs: Document[]) => {
    setCategories(prev => prev.map(category => {
      const categoryDocs = docs.filter(doc => {
        if (category.id === "evidence") return ["photo", "video", "audio"].includes(doc.type);
        if (category.id === "procedures") return doc.type === "procedure";
        if (category.id === "certificates") return doc.type === "certificate";
        if (category.id === "reports") return doc.type === "report";
        return false;
      });

      return {
        ...category,
        documents: categoryDocs,
        completionRate: categoryDocs.length > 0 ? Math.min((categoryDocs.length / 5) * 100, 100) : 0
      };
    }));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simular upload
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const newDoc: Document = {
        id: `DOC_${Date.now()}_${i}`,
        name: file.name,
        type: getDocumentType(file.type),
        format: file.name.split(".").pop() || "",
        size: file.size,
        uploadedBy: "Usuário Atual",
        uploadedAt: new Date().toISOString(),
        auditId: newDocument.auditId,
        elementId: newDocument.elementId,
        requirementId: newDocument.requirementId,
        tags: newDocument.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        description: newDocument.description,
        version: "1.0",
        status: "pending",
        url: URL.createObjectURL(file),
        thumbnail: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        metadata: {
          timestamp: new Date().toISOString(),
          inspector: "Usuário Atual"
        }
      };

      setDocuments(prev => [...prev, newDoc]);
    }

    setIsUploading(false);
    setUploadProgress(0);
    setIsUploadOpen(false);
    setNewDocument({
      name: "",
      type: "evidence",
      description: "",
      tags: "",
      auditId: "",
      elementId: "",
      requirementId: ""
    });
  };

  const getDocumentType = (mimeType: string): Document["type"] => {
    if (mimeType.startsWith("image/")) return "photo";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType === "application/pdf") return "report";
    return "evidence";
  };

  const getFileIcon = (type: Document["type"], format: string) => {
    switch (type) {
    case "photo": return Image;
    case "video": return Video;
    case "audio": return Mic;
    case "procedure":
    case "report":
    case "certificate":
      return FileText;
    default: return Paperclip;
    }
  };

  const getStatusColor = (status: Document["status"]) => {
    switch (status) {
    case "approved": return "bg-success/20 text-success border-success/30";
    case "pending": return "bg-warning/20 text-warning border-warning/30";
    case "rejected": return "bg-destructive/20 text-destructive border-destructive/30";
    case "archived": return "bg-muted/20 text-muted-foreground border-muted/30";
    default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getStatusIcon = (status: Document["status"]) => {
    switch (status) {
    case "approved": return CheckCircle;
    case "pending": return Clock;
    case "rejected": return AlertTriangle;
    case "archived": return Archive;
    default: return Clock;
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
    const matchesCategory = selectedCategory === "all" || 
      (selectedCategory === "evidence" && ["photo", "video", "audio"].includes(doc.type)) ||
      (selectedCategory === "procedures" && doc.type === "procedure") ||
      (selectedCategory === "certificates" && doc.type === "certificate") ||
      (selectedCategory === "reports" && doc.type === "report");
    
    const matchesSearch = searchTerm === "" || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gerenciador de Documentos PEOTRAM</h2>
            <p className="text-muted-foreground">
              Upload, organização e controle de documentos de auditoria
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload de Documentos
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload de Documentos</DialogTitle>
                  <DialogDescription>
                    Faça upload de evidências, procedimentos e documentos relacionados à auditoria PEOTRAM
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Documento</Label>
                      <Select 
                        value={newDocument.type} 
                        onValueChange={(value: Document["type"]) => 
                          setNewDocument(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="evidence">Evidência</SelectItem>
                          <SelectItem value="procedure">Procedimento</SelectItem>
                          <SelectItem value="report">Relatório</SelectItem>
                          <SelectItem value="certificate">Certificado</SelectItem>
                          <SelectItem value="photo">Foto</SelectItem>
                          <SelectItem value="video">Vídeo</SelectItem>
                          <SelectItem value="audio">Áudio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Auditoria</Label>
                      <Input
                        value={newDocument.auditId}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, auditId: e.target.value }))}
                        placeholder="ID da Auditoria"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={newDocument.description}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o documento e sua relevância para a auditoria..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags (separadas por vírgula)</Label>
                    <Input
                      value={newDocument.tags}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="evidência, conformidade, segurança"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Selecionar Arquivos</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov,.mp3,.wav"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Clique para selecionar arquivos ou arraste e solte aqui
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Suporta PDF, DOC, DOCX, JPG, PNG, MP4, MOV, MP3, WAV
                        </p>
                      </label>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fazendo upload...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Resumo por categoria */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{category.name}</h3>
                  <Badge variant={category.required ? "default" : "secondary"}>
                    {category.required ? "Obrigatório" : "Opcional"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Documentos: {category.documents.length}</span>
                    <span>Completude: {Math.round(category.completionRate)}%</span>
                  </div>
                  <Progress value={category.completionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros e busca */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              <SelectItem value="evidence">Evidências</SelectItem>
              <SelectItem value="procedures">Procedimentos</SelectItem>
              <SelectItem value="certificates">Certificados</SelectItem>
              <SelectItem value="reports">Relatórios</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de documentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const FileIcon = getFileIcon(doc.type, doc.format);
            const StatusIcon = getStatusIcon(doc.status);
            
            return (
              <Card key={doc.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <FileIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{doc.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <Badge variant="outline" className={getStatusColor(doc.status)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {doc.status === "approved" ? "Aprovado" :
                          doc.status === "pending" ? "Pendente" :
                            doc.status === "rejected" ? "Rejeitado" : "Arquivado"}
                      </Badge>
                    </div>
                  </div>

                  {doc.thumbnail && (
                    <div className="mb-3">
                      <img 
                        src={doc.thumbnail} 
                        alt={doc.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>{doc.format.toUpperCase()}</span>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {doc.uploadedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(doc.uploadedAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {doc.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{doc.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visualizar</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Baixar</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredDocuments.length === 0 && (
          <Card className="p-8 text-center">
            <CardContent>
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Nenhum documento corresponde aos filtros aplicados." : "Não há documentos nesta categoria."}
              </p>
              <Button onClick={() => setIsUploadOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Documento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};