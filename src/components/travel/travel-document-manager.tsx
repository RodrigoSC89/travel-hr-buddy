import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  Star,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plane,
  Hotel,
  Car,
  CreditCard,
  FileImage,
  FileVideo,
  File,
  Folder,
  Share2,
  Lock,
  Globe,
  Users,
  Tag,
  Edit3,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TravelDocument {
  id: string;
  name: string;
  type: "passport" | "visa" | "ticket" | "hotel" | "insurance" | "receipt" | "other";
  category: "personal" | "booking" | "financial" | "legal";
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  expiryDate?: Date;
  status: "valid" | "expiring" | "expired" | "pending";
  tags: string[];
  isStarred: boolean;
  isShared: boolean;
  sharedWith: string[];
  visibility: "private" | "team" | "public";
  relatedTrip?: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  uploadedBy: string;
}

interface DocumentFolder {
  id: string;
  name: string;
  documentsCount: number;
  color: string;
  icon: React.ReactNode;
}

export const TravelDocumentManager = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDocument, setSelectedDocument] = useState<TravelDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock data
  useState(() => {
    const mockDocuments: TravelDocument[] = [
      {
        id: "1",
        name: "Passaporte - João Silva",
        type: "passport",
        category: "personal",
        fileType: "PDF",
        fileSize: 2.4,
        uploadDate: new Date("2024-01-15"),
        expiryDate: new Date("2029-06-20"),
        status: "valid",
        tags: ["pessoal", "identificação"],
        isStarred: true,
        isShared: false,
        sharedWith: [],
        visibility: "private",
        url: "/documents/passport.pdf",
        uploadedBy: "João Silva",
      },
      {
        id: "2",
        name: "Passagem Aérea - Rio Janeiro",
        type: "ticket",
        category: "booking",
        fileType: "PDF",
        fileSize: 0.8,
        uploadDate: new Date("2024-02-10"),
        status: "valid",
        tags: ["viagem", "rio de janeiro"],
        isStarred: false,
        isShared: true,
        sharedWith: ["maria@empresa.com", "pedro@empresa.com"],
        visibility: "team",
        relatedTrip: "Viagem Rio - Fev 2024",
        url: "/documents/ticket-rio.pdf",
        uploadedBy: "João Silva",
        description: "Passagem aérea de ida e volta para reunião no Rio de Janeiro",
      },
      {
        id: "3",
        name: "Voucher Hotel Copacabana",
        type: "hotel",
        category: "booking",
        fileType: "PDF",
        fileSize: 1.2,
        uploadDate: new Date("2024-02-12"),
        status: "valid",
        tags: ["hotel", "copacabana"],
        isStarred: false,
        isShared: true,
        sharedWith: ["equipe-rio@empresa.com"],
        visibility: "team",
        relatedTrip: "Viagem Rio - Fev 2024",
        url: "/documents/hotel-voucher.pdf",
        uploadedBy: "Maria Santos",
      },
      {
        id: "4",
        name: "Seguro Viagem Internacional",
        type: "insurance",
        category: "legal",
        fileType: "PDF",
        fileSize: 0.6,
        uploadDate: new Date("2024-01-20"),
        expiryDate: new Date("2024-12-31"),
        status: "expiring",
        tags: ["seguro", "internacional"],
        isStarred: true,
        isShared: false,
        sharedWith: [],
        visibility: "private",
        url: "/documents/travel-insurance.pdf",
        uploadedBy: "João Silva",
      },
      {
        id: "5",
        name: "Recibo Taxi Aeroporto",
        type: "receipt",
        category: "financial",
        fileType: "JPG",
        fileSize: 1.8,
        uploadDate: new Date("2024-02-15"),
        status: "valid",
        tags: ["transporte", "reembolso"],
        isStarred: false,
        isShared: false,
        sharedWith: [],
        visibility: "private",
        url: "/documents/taxi-receipt.jpg",
        thumbnailUrl: "/thumbnails/taxi-receipt-thumb.jpg",
        uploadedBy: "Pedro Costa",
      },
    ];
    setDocuments(mockDocuments);
  });

  const folders: DocumentFolder[] = [
    {
      id: "personal",
      name: "Documentos Pessoais",
      documentsCount: documents.filter(d => d.category === "personal").length,
      color: "bg-blue-100 text-blue-700",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: "booking",
      name: "Reservas",
      documentsCount: documents.filter(d => d.category === "booking").length,
      color: "bg-green-100 text-green-700",
      icon: <Plane className="h-5 w-5" />,
    },
    {
      id: "financial",
      name: "Financeiro",
      documentsCount: documents.filter(d => d.category === "financial").length,
      color: "bg-yellow-100 text-yellow-700",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      id: "legal",
      name: "Documentos Legais",
      documentsCount: documents.filter(d => d.category === "legal").length,
      color: "bg-purple-100 text-purple-700",
      icon: <Lock className="h-5 w-5" />,
    },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          // Add mock document
          const newDoc: TravelDocument = {
            id: Date.now().toString(),
            name: files[0].name,
            type: "other",
            category: "personal",
            fileType: files[0].name.split(".").pop()?.toUpperCase() || "FILE",
            fileSize: files[0].size / (1024 * 1024),
            uploadDate: new Date(),
            status: "valid",
            tags: [],
            isStarred: false,
            isShared: false,
            sharedWith: [],
            visibility: "private",
            url: URL.createObjectURL(files[0]),
            uploadedBy: "Usuário Atual",
          };

          setDocuments(prev => [...prev, newDoc]);
          toast({
            title: "Documento enviado",
            description: `${files[0].name} foi enviado com sucesso.`,
          });

          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "expiring":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "passport":
        return <FileText className="h-5 w-5" />;
      case "visa":
        return <FileText className="h-5 w-5" />;
      case "ticket":
        return <Plane className="h-5 w-5" />;
      case "hotel":
        return <Hotel className="h-5 w-5" />;
      case "insurance":
        return <Lock className="h-5 w-5" />;
      case "receipt":
        return <CreditCard className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "jpg":
      case "jpeg":
      case "png":
        return <FileImage className="h-8 w-8 text-blue-500" />;
      case "mp4":
      case "avi":
        return <FileVideo className="h-8 w-8 text-purple-500" />;
      default:
        return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const toggleStar = (id: string) => {
    setDocuments(prev =>
      prev.map(doc => (doc.id === id ? { ...doc, isStarred: !doc.isStarred } : doc))
    );
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: "Documento removido",
      description: "O documento foi removido com sucesso.",
    });
  };

  const renderDocumentGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredDocuments.map(doc => (
        <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getFileIcon(doc.fileType)}
                <div className="flex items-center gap-1">
                  {getStatusIcon(doc.status)}
                  {doc.isShared && <Share2 className="h-3 w-3 text-muted-foreground" />}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={e => {
                    e.stopPropagation();
                    toggleStar(doc.id);
                  }}
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      doc.isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    )}
                  />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedDocument(doc);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={e => {
                    e.stopPropagation();
                    deleteDocument(doc.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <h4 className="font-medium text-sm mb-2 truncate">{doc.name}</h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{doc.fileType}</span>
                <span>{doc.fileSize.toFixed(1)} MB</span>
              </div>

              {doc.expiryDate && (
                <div className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  <span>Expira em {format(doc.expiryDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {doc.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {doc.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{doc.tags.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDocumentList = () => (
    <div className="space-y-2">
      {filteredDocuments.map(doc => (
        <Card key={doc.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {getFileIcon(doc.fileType)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{doc.name}</h4>
                    {getStatusIcon(doc.status)}
                    {doc.isStarred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                    {doc.isShared && <Share2 className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {doc.fileType} • {doc.fileSize.toFixed(1)} MB
                    </span>
                    <span>Enviado em {format(doc.uploadDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                    <span>por {doc.uploadedBy}</span>
                    {doc.expiryDate && (
                      <span>
                        Expira em {format(doc.expiryDate, "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedDocument(doc)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteDocument(doc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Gerenciador de Documentos</h2>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Enviar Documento
          </Button>
        </div>
      </div>

      {isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Upload className="h-5 w-5 animate-bounce" />
              <div className="flex-1">
                <p className="text-sm font-medium">Enviando documento...</p>
                <Progress value={uploadProgress} className="mt-2" />
              </div>
              <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Folders Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {folders.map(folder => (
          <Card key={folder.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", folder.color)}>{folder.icon}</div>
                <div>
                  <h3 className="font-medium text-sm">{folder.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {folder.documentsCount} documentos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="personal">Pessoais</SelectItem>
                <SelectItem value="booking">Reservas</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
                <SelectItem value="legal">Legais</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="valid">Válido</SelectItem>
                <SelectItem value="expiring">Expirando</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
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
        </CardContent>
      </Card>

      {/* Documents Display */}
      <div>{viewMode === "grid" ? renderDocumentGrid() : renderDocumentList()}</div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou envie novos documentos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
