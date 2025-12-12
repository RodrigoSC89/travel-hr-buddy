import { useCallback, useState } from "react";;
import React, { useState, useCallback } from "react";
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
  User,
  Loader2,
  Link,
  Copy,
  Check,
  X
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<SharedDocument | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onUpload?.(selectedFile);
      toast({
        title: "Upload concluído",
        description: `${selectedFile.name} foi enviado com sucesso`,
      });
      setIsUploadOpen(false);
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleDownload = async (doc: SharedDocument) => {
    setIsDownloading(doc.id);
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onDownload?.(doc);
      toast({
        title: "Download concluído",
        description: `${doc.name} foi baixado com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const handleViewDoc = (doc: SharedDocument) => {
    setSelectedDoc(doc);
    setIsViewOpen(true);
    onView?.(doc);
  };

  const handleShareDoc = (doc: SharedDocument) => {
    setSelectedDoc(doc);
    setIsShareOpen(true);
  };

  const handleDeleteDoc = (doc: SharedDocument) => {
    setSelectedDoc(doc);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDoc) {
      onDelete?.(selectedDoc);
      toast({
        title: "Documento excluído",
        description: `${selectedDoc.name} foi removido`,
        variant: "destructive",
      });
    }
    setIsDeleteOpen(false);
    setSelectedDoc(null);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://workspace.nautilus/docs/${selectedDoc?.id}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast({
        title: "Link copiado",
        description: "O link foi copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const confirmShare = () => {
    if (selectedDoc) {
      onShare?.(selectedDoc);
      toast({
        title: "Documento compartilhado",
        description: `${selectedDoc.name} agora está compartilhado com a equipe`,
      });
    }
    setIsShareOpen(false);
    setSelectedDoc(null);
  };

  return (
    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Documentos Compartilhados
          </CardTitle>
          <Button size="sm" className="gap-2" onClick={() => setIsUploadOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
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
                  onClick={() => handleViewDoc(doc)}
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
                      disabled={isDownloading === doc.id}
                      onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                    >
                      {isDownloading === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
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
                      <DropdownMenuContent align="end" className="bg-background border">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDoc(doc); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareDoc(doc); }}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartilhar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc); }}
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

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload de Documento</DialogTitle>
            <DialogDescription>
              Arraste um arquivo ou clique para selecionar
            </DialogDescription>
          </DialogHeader>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              selectedFile ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                {getFileIcon(selectedFile.name.split(".").pop()?.toUpperCase() as any || "OTHER")}
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remover
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, DOCX, XLSX, imagens até 10MB
                </p>
              </>
            )}
            <input 
              id="file-input" 
              type="file" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }} 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsUploadOpen(false); setSelectedFile(null); }}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDoc && getFileIcon(selectedDoc.type)}
              {selectedDoc?.name}
            </DialogTitle>
            <DialogDescription>
              Última modificação: {selectedDoc?.lastModified} por {selectedDoc?.modifiedBy}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-[300px] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              {selectedDoc && getFileIcon(selectedDoc.type)}
              <p className="mt-4 text-muted-foreground">
                Visualização do documento
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedDoc?.size}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => selectedDoc && handleDownload(selectedDoc)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Documento</DialogTitle>
            <DialogDescription>
              Compartilhe "{selectedDoc?.name}" com a equipe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Link className="h-4 w-4 text-muted-foreground" />
              <Input 
                value={`https://workspace.nautilus/docs/${selectedDoc?.id}`}
                readOnly
                className="flex-1 bg-transparent border-none"
              />
              <Button size="sm" variant="ghost" onClick={handleCopyLink}>
                {linkCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Todos os membros da equipe com acesso ao workspace poderão visualizar este documento.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{selectedDoc?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default WorkspaceDocuments;
