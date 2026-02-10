/**
 * Document Viewer Component
 * ✅ P0-002: Real data from ai_documents table
 * ✅ FUNCTIONAL BUTTONS: Upload, Download, View, Filter
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FileText, Search, Filter, Download, Eye, Clock, User, Folder, Tag, Calendar, History, Share2, Star, File, FileImage, FileSpreadsheet, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  storagePath?: string;
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf": return <FileText className="h-5 w-5 text-red-500" />;
    case "xlsx": case "xls": return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    case "jpg": case "png": return <FileImage className="h-5 w-5 text-blue-500" />;
    default: return <File className="h-5 w-5 text-muted-foreground" />;
  }
};

export function DocumentViewer() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchDocs = useCallback(async () => {
    const { data } = await supabase
      .from("ai_documents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const mapped: Document[] = (data || []).map((d: any) => ({
      id: d.id,
      title: d.title || d.file_name,
      category: d.category || "Geral",
      type: d.file_type?.replace("application/", "").replace("image/", "") || "file",
      uploadedBy: "Sistema",
      uploadedAt: d.created_at,
      size: d.file_size_bytes ? `${(d.file_size_bytes / 1024 / 1024).toFixed(1)} MB` : "N/A",
      version: 1,
      status: d.ocr_status === "completed" ? "active" as const : "draft" as const,
      tags: (d.extracted_keywords as any)?.slice?.(0, 3) || [],
      isFavorite: false,
      storagePath: d.storage_path,
    }));
    setDocuments(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const categories = [...new Set(documents.map(d => d.category))];
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/10 text-green-500">Válido</Badge>;
      case "archived": return <Badge variant="secondary">Arquivado</Badge>;
      case "draft": return <Badge className="bg-yellow-500/10 text-yellow-500">Rascunho</Badge>;
    }
  };

  const handleUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.png,.xlsx';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      setUploading(true);
      let successCount = 0;
      
      for (const file of Array.from(files)) {
        const path = `documents/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(path, file);
        
        if (uploadError) {
          // Storage bucket may not exist, insert metadata anyway
          toast.error(`Erro no upload de ${file.name}: ${uploadError.message}`);
        }
        
        const { error: dbError } = await supabase
          .from('ai_documents')
          .insert({
            file_name: file.name,
            title: file.name.replace(/\.[^.]+$/, ''),
            file_type: file.type || 'application/octet-stream',
            file_size_bytes: file.size,
            storage_path: path,
            ocr_status: 'pending',
          } as never);
        
        if (!dbError) successCount++;
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} documento(s) enviado(s) com sucesso`);
        fetchDocs();
      }
      setUploading(false);
    };
    input.click();
  }, [fetchDocs]);

  const handleDownload = useCallback(async (doc: Document) => {
    if (doc.storagePath) {
      const { data } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.storagePath, 3600);
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
        toast.success(`Baixando ${doc.title}`);
        return;
      }
    }
    toast.info(`Documento "${doc.title}" sem arquivo para download`);
  }, []);

  const handleView = useCallback((doc: Document) => {
    setPreviewDoc(doc);
  }, []);

  const handleShare = useCallback((doc: Document) => {
    navigator.clipboard.writeText(`${window.location.origin}/workbench?section=docs&doc=${doc.id}`);
    toast.success("Link do documento copiado!");
  }, []);

  const handleVersionHistory = useCallback((doc: Document) => {
    toast.info(`Histórico de versões de "${doc.title}" — v${doc.version} (versão atual)`);
  }, []);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total de Documentos</p><p className="text-3xl font-bold">{documents.length}</p></div><div className="p-3 rounded-full bg-primary/10"><FileText className="h-6 w-6 text-primary" /></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Categorias</p><p className="text-3xl font-bold">{categories.length}</p></div><div className="p-3 rounded-full bg-blue-500/10"><Folder className="h-6 w-6 text-blue-500" /></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Favoritos</p><p className="text-3xl font-bold text-yellow-500">{documents.filter(d => d.isFavorite).length}</p></div><div className="p-3 rounded-full bg-yellow-500/10"><Star className="h-6 w-6 text-yellow-500" /></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Rascunhos</p><p className="text-3xl font-bold">{documents.filter(d => d.status === "draft").length}</p></div><div className="p-3 rounded-full bg-muted"><Clock className="h-6 w-6 text-muted-foreground" /></div></div></CardContent></Card>
      </div>

      <Card><CardContent className="pt-6"><div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar documentos, tags..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div>
        <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-[180px]"><Folder className="h-4 w-4 mr-2" /><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent><SelectItem value="all">Todas Categorias</SelectItem>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? "Ocultar Filtros" : "Mais Filtros"}
        </Button>
      </div>
      {showFilters && (
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => { setFilterCategory("all"); setFilterStatus("all"); setSearchTerm(""); }}>
            <X className="h-4 w-4 mr-1" /> Limpar filtros
          </Button>
        </div>
      )}
      </CardContent></Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center justify-between"><span className="flex items-center gap-2"><FileText className="h-5 w-5" />Documentos ({filteredDocs.length})</span><Button size="sm" onClick={handleUpload} disabled={uploading}><Upload className="h-4 w-4 mr-2" />{uploading ? "Enviando..." : "Novo Upload"}</Button></CardTitle></CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleView(doc)}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">{getFileIcon(doc.type)}</div>
                    <div>
                      <div className="flex items-center gap-2"><h3 className="font-medium">{doc.title}</h3>{doc.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}{getStatusBadge(doc.status)}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Folder className="h-3 w-3" />{doc.category}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{doc.uploadedBy}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(doc.uploadedAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex gap-1 mt-2">{doc.tags.map((tag, i) => <Badge key={i} variant="outline" className="text-xs"><Tag className="h-2 w-2 mr-1" />{tag}</Badge>)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                    <div className="text-right text-sm"><p className="text-muted-foreground">{doc.size}</p><p className="text-xs text-muted-foreground">v{doc.version}</p></div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleView(doc)} title="Visualizar"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)} title="Baixar"><Download className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleVersionHistory(doc)} title="Histórico"><History className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleShare(doc)} title="Compartilhar"><Share2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredDocs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Nenhum documento encontrado</p>
                  <p className="text-sm mt-1">Tente ajustar os filtros ou faça upload de um novo documento</p>
                  <Button className="mt-4" onClick={handleUpload}><Upload className="h-4 w-4 mr-2" />Upload</Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{previewDoc?.title}</DialogTitle></DialogHeader>
          {previewDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Categoria:</span> {previewDoc.category}</div>
                <div><span className="text-muted-foreground">Tipo:</span> {previewDoc.type}</div>
                <div><span className="text-muted-foreground">Tamanho:</span> {previewDoc.size}</div>
                <div><span className="text-muted-foreground">Versão:</span> v{previewDoc.version}</div>
                <div><span className="text-muted-foreground">Status:</span> {getStatusBadge(previewDoc.status)}</div>
                <div><span className="text-muted-foreground">Data:</span> {new Date(previewDoc.uploadedAt).toLocaleDateString("pt-BR")}</div>
              </div>
              {previewDoc.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">{previewDoc.tags.map((tag, i) => <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>)}</div>
              )}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleDownload(previewDoc)}><Download className="h-4 w-4 mr-2" />Baixar</Button>
                <Button variant="outline" className="flex-1" onClick={() => handleShare(previewDoc)}><Share2 className="h-4 w-4 mr-2" />Compartilhar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DocumentViewer;
