/**
 * Document Viewer Component
 * Visualizador inline com versionamento e metadados
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  User,
  Folder,
  Tag,
  Calendar,
  History,
  Share2,
  Star,
  MoreVertical,
  File,
  FileImage,
  FileSpreadsheet
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  category: string;
  type: string;
  vessel?: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  version: number;
  status: "active" | "archived" | "draft";
  tags: string[];
  isFavorite: boolean;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Safety Management Manual - Rev 5",
    category: "ISM",
    type: "pdf",
    vessel: "MV Atlantic Pioneer",
    uploadedBy: "Carlos Silva",
    uploadedAt: "2025-01-15T10:30:00",
    size: "2.4 MB",
    version: 5,
    status: "active",
    tags: ["ISM", "Segurança", "Obrigatório"],
    isFavorite: true
  },
  {
    id: "2",
    title: "Crew List - January 2025",
    category: "Tripulação",
    type: "xlsx",
    vessel: "MV Pacific Voyager",
    uploadedBy: "Maria Santos",
    uploadedAt: "2025-01-28T14:15:00",
    size: "156 KB",
    version: 1,
    status: "active",
    tags: ["Crew", "RH"],
    isFavorite: false
  },
  {
    id: "3",
    title: "Port State Control Report - Hamburg",
    category: "Inspeções",
    type: "pdf",
    vessel: "MV Nordic Star",
    uploadedBy: "João Auditor",
    uploadedAt: "2025-01-20T09:00:00",
    size: "890 KB",
    version: 1,
    status: "active",
    tags: ["PSC", "Inspeção", "Compliance"],
    isFavorite: false
  },
  {
    id: "4",
    title: "Maintenance Schedule Q1 2025",
    category: "Manutenção",
    type: "xlsx",
    vessel: "All Vessels",
    uploadedBy: "Pedro Técnico",
    uploadedAt: "2025-01-05T11:45:00",
    size: "1.2 MB",
    version: 3,
    status: "active",
    tags: ["Manutenção", "Planejamento"],
    isFavorite: true
  },
  {
    id: "5",
    title: "Drydock Proposal - MV Atlantic Pioneer",
    category: "Manutenção",
    type: "pdf",
    uploadedBy: "Estaleiro XYZ",
    uploadedAt: "2025-02-01T16:30:00",
    size: "4.5 MB",
    version: 2,
    status: "draft",
    tags: ["Drydock", "Orçamento"],
    isFavorite: false
  }
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-500" />;
    case "xlsx":
    case "xls":
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    case "jpg":
    case "png":
      return <FileImage className="h-5 w-5 text-blue-500" />;
    default:
      return <File className="h-5 w-5 text-muted-foreground" />;
  }
};

export function DocumentViewer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const categories = [...new Set(mockDocuments.map(d => d.category))];

  const filteredDocs = mockDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500">Ativo</Badge>;
      case "archived":
        return <Badge variant="secondary">Arquivado</Badge>;
      case "draft":
        return <Badge className="bg-yellow-500/10 text-yellow-500">Rascunho</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Documentos</p>
                <p className="text-3xl font-bold">{mockDocuments.length}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categorias</p>
                <p className="text-3xl font-bold">{categories.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Folder className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Favoritos</p>
                <p className="text-3xl font-bold text-yellow-500">
                  {mockDocuments.filter(d => d.isFavorite).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rascunhos</p>
                <p className="text-3xl font-bold">
                  {mockDocuments.filter(d => d.status === "draft").length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-muted">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar documentos, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <Folder className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Mais Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos ({filteredDocs.length})
            </span>
            <Button size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Novo Upload
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      {getFileIcon(doc.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{doc.title}</h3>
                        {doc.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        {getStatusBadge(doc.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Folder className="h-3 w-3" />
                          {doc.category}
                        </span>
                        {doc.vessel && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {doc.vessel}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {doc.uploadedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(doc.uploadedAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {doc.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">{doc.size}</p>
                      <p className="text-xs text-muted-foreground">v{doc.version}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <History className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentViewer;
