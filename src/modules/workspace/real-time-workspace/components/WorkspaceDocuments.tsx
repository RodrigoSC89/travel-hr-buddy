import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Upload, 
  Search, 
  Download, 
  Eye, 
  Share2, 
  Trash2, 
  MoreHorizontal,
  FileSpreadsheet,
  FileImage,
  File,
  FolderOpen,
  Clock,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export interface SharedDocument {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "XLSX" | "IMG" | "OTHER";
  size: string;
  lastModified: string;
  modifiedBy: string;
  shared?: boolean;
  version?: string;
}

interface WorkspaceDocumentsProps {
  documents: SharedDocument[];
  onUpload?: (file: File) => void;
  onDownload?: (doc: SharedDocument) => void;
  onView?: (doc: SharedDocument) => void;
  onShare?: (doc: SharedDocument) => void;
  onDelete?: (doc: SharedDocument) => void;
}

const getFileIcon = (type: SharedDocument["type"]) => {
  switch (type) {
    case "PDF": return <FileText className="h-5 w-5 text-red-500" />;
    case "DOCX": return <FileText className="h-5 w-5 text-blue-500" />;
    case "XLSX": return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    case "IMG": return <FileImage className="h-5 w-5 text-purple-500" />;
    default: return <File className="h-5 w-5 text-muted-foreground" />;
  }
};

const getTypeBadgeVariant = (type: SharedDocument["type"]) => {
  switch (type) {
    case "PDF": return "destructive";
    case "DOCX": return "default";
    case "XLSX": return "secondary";
    default: return "outline";
  }
};

export const WorkspaceDocuments: React.FC<WorkspaceDocumentsProps> = ({
  documents,
  onUpload,
  onDownload,
  onView,
  onShare,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { toast } = useToast();

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = () => {
    toast({
      title: "Upload iniciado",
      description: "Seu arquivo está sendo enviado...",
    });
    setIsUploadOpen(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload?.(files[0]);
      toast({
        title: "Arquivo recebido",
        description: `${files[0].name} será enviado`,
      });
    }
  };

  return (
    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Documentos Compartilhados
          </CardTitle>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload de Documento</DialogTitle>
                <DialogDescription>
                  Arraste um arquivo ou clique para selecionar
                </DialogDescription>
              </DialogHeader>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, DOCX, XLSX, imagens até 10MB
                </p>
                <input id="file-input" type="file" className="hidden" onChange={(e) => {
                  if (e.target.files?.[0]) {
                    onUpload?.(e.target.files[0]);
                    handleUpload();
                  }
                }} />
              </div>
              <Button onClick={handleUpload} className="w-full">Enviar</Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar documentos..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
          <div className="p-3 space-y-2">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum documento encontrado</p>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 hover:border-primary/30 cursor-pointer transition-all duration-200"
                  onClick={() => onView?.(doc)}
                >
                  <div className="p-2.5 rounded-lg bg-muted">
                    {getFileIcon(doc.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      {doc.shared && (
                        <Share2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {doc.lastModified}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {doc.modifiedBy}
                      </span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                  
                  <Badge variant={getTypeBadgeVariant(doc.type) as any} className="text-xs">
                    {doc.type}
                  </Badge>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); onDownload?.(doc); }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView?.(doc)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onShare?.(doc)}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartilhar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => onDelete?.(doc)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WorkspaceDocuments;
