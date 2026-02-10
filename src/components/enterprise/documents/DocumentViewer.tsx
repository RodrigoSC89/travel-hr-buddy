/**
 * Document Viewer Component
 * ✅ P0-002: Real data from ai_documents table
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Filter, Download, Eye, Clock, User, Folder, Tag, Calendar, History, Share2, Star, File, FileImage, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    async function fetchDocs() {
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
      }));
      setDocuments(mapped);
      setLoading(false);
    }
    fetchDocs();
  }, []);

  const categories = [...new Set(documents.map(d => d.category))];
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/10 text-green-500">Ativo</Badge>;
      case "archived": return <Badge variant="secondary">Arquivado</Badge>;
      case "draft": return <Badge className="bg-yellow-500/10 text-yellow-500">Rascunho</Badge>;
    }
  };

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
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Mais Filtros</Button>
      </div></CardContent></Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center justify-between"><span className="flex items-center gap-2"><FileText className="h-5 w-5" />Documentos ({filteredDocs.length})</span><Button size="sm"><FileText className="h-4 w-4 mr-2" />Novo Upload</Button></CardTitle></CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
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
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm"><p className="text-muted-foreground">{doc.size}</p><p className="text-xs text-muted-foreground">v{doc.version}</p></div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><History className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><Share2 className="h-4 w-4" /></Button>
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
