"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, FileText, Search, Eye, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  generated_by?: string;
}

export default function DocumentListPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [searchTerm, documents]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ai_generated_documents")
        .select("id, title, content, created_at, generated_by")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
      setFilteredDocuments(data || []);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({
        title: "Erro ao carregar documentos",
        description: "Não foi possível carregar a lista de documentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    if (!searchTerm.trim()) {
      setFilteredDocuments(documents);
      return;
    }

    const filtered = documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocuments(filtered);
  };

  const handleViewDocument = (id: string) => {
    navigate(`/admin/documents/view/${id}`);
  };

  return (
    <RoleBasedAccess roles={["admin", "hr_manager"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">📄 Documentos Gerados com IA</h1>
            <p className="text-muted-foreground mt-1">
              Visualize e gerencie todos os documentos gerados pela IA
            </p>
          </div>
          <Button onClick={() => navigate("/admin/documents/ai")}>
            ✨ Gerar Novo Documento
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buscar Documentos</CardTitle>
            <CardDescription>
              Pesquise por título ou conteúdo do documento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Digite para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Carregando documentos...</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? "Nenhum documento encontrado" : "Nenhum documento ainda"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm
                  ? "Tente ajustar sua pesquisa"
                  : "Comece gerando seu primeiro documento com IA"}
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate("/admin/documents/ai")}>
                  ✨ Gerar Primeiro Documento
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDocument(doc.id)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">{doc.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {doc.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {format(new Date(doc.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {doc.content.length} caracteres
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDocument(doc.id);
                      }}
                      className="ml-4"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredDocuments.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Mostrando {filteredDocuments.length} de {documents.length} documento(s)
          </div>
        )}
      </div>
    </RoleBasedAccess>
  );
}
