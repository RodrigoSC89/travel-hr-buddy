"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, ArrowLeft, History, RotateCcw, X, Mail, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  created_at: string;
  updated_by: string | null;
  author_email?: string;
}

interface Document {
  title: string;
}

export default function DocumentHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [emailFilter, setEmailFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    if (!id) return;
    loadDocument();
    loadVersions();
  }, [id]);

  useEffect(() => {
    applyFilters();
  }, [versions, emailFilter, dateFilter]);

  const loadDocument = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_generated_documents")
        .select("title")
        .eq("id", id)
        .single();

      if (error) throw error;
      setDoc(data);
    } catch (error) {
      console.error("Error loading document:", error);
      toast({
        title: "Erro ao carregar documento",
        description: "Não foi possível carregar o documento.",
        variant: "destructive",
      });
    }
  };

  const loadVersions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("document_versions")
        .select("*")
        .eq("document_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch author emails for all versions
      const versionsWithEmails = await Promise.all(
        (data || []).map(async (version) => {
          if (version.updated_by) {
            try {
              const { data: profile } = await supabase
                .from("profiles")
                .select("email")
                .eq("id", version.updated_by)
                .single();
              
              return {
                ...version,
                author_email: profile?.email || "Desconhecido"
              };
            } catch {
              return {
                ...version,
                author_email: "Desconhecido"
              };
            }
          }
          return {
            ...version,
            author_email: "Desconhecido"
          };
        })
      );

      setVersions(versionsWithEmails);
    } catch (error) {
      console.error("Error loading versions:", error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de versões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...versions];

    // Apply email filter (case-insensitive partial match)
    if (emailFilter.trim()) {
      filtered = filtered.filter((version) =>
        version.author_email?.toLowerCase().includes(emailFilter.toLowerCase())
      );
    }

    // Apply date filter (versions created on or after the selected date)
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter((version) => {
        const versionDate = new Date(version.created_at);
        versionDate.setHours(0, 0, 0, 0);
        return versionDate >= filterDate;
      });
    }

    setFilteredVersions(filtered);
  };

  const clearFilters = () => {
    setEmailFilter("");
    setDateFilter("");
  };

  const handleRestore = async (versionId: string, versionContent: string) => {
    if (!id) return;

    try {
      setRestoring(versionId);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Update the document (this will automatically create a new version via trigger)
      const { error: updateError } = await supabase
        .from("ai_generated_documents")
        .update({ content: versionContent })
        .eq("id", id);

      if (updateError) throw updateError;

      // Log the restoration
      const { error: logError } = await supabase
        .from("document_restore_logs")
        .insert({
          document_id: id,
          version_id: versionId,
          restored_by: user.id,
        });

      if (logError) {
        console.error("Error logging restoration:", logError);
        // Don't throw - restoration was successful
      }

      toast({
        title: "✅ Versão restaurada com sucesso",
        description: "O documento foi atualizado e você será redirecionado.",
      });

      // Navigate back to document view after a short delay
      setTimeout(() => {
        navigate(`/admin/documents/view/${id}`);
      }, 1500);
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Erro ao restaurar versão",
        description: "Não foi possível restaurar esta versão do documento.",
        variant: "destructive",
      });
    } finally {
      setRestoring(null);
    }
  };

  if (loading) {
    return (
      <RoleBasedAccess roles={["admin", "hr_manager"]}>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Carregando histórico de versões...</p>
            </div>
          </div>
        </div>
      </RoleBasedAccess>
    );
  }

  return (
    <RoleBasedAccess roles={["admin", "hr_manager"]}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/documents/view/${id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Documento
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <History className="w-8 h-8" />
              Histórico Completo de Versões
            </h1>
            {doc && (
              <p className="text-muted-foreground mt-2">
                Documento: <span className="font-medium">{doc.title}</span>
              </p>
            )}
          </div>

          {/* Filters Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>🔍 Filtros Avançados</span>
                {(emailFilter || dateFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Limpar Filtros
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Filter */}
                <div className="space-y-2">
                  <label htmlFor="email-filter" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Filtrar por E-mail do Autor
                  </label>
                  <Input
                    id="email-filter"
                    type="text"
                    placeholder="Digite o e-mail (busca parcial)..."
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Pesquisa sem distinção entre maiúsculas e minúsculas
                  </p>
                </div>

                {/* Date Filter */}
                <div className="space-y-2">
                  <label htmlFor="date-filter" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Filtrar por Data de Criação
                  </label>
                  <Input
                    id="date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mostra versões criadas a partir desta data
                  </p>
                </div>
              </div>

              {/* Filter Results Info */}
              {(emailFilter || dateFilter) && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    📊 Mostrando <span className="font-semibold">{filteredVersions.length}</span> de{" "}
                    <span className="font-semibold">{versions.length}</span> versão(ões)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Versions List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>📋 Versões do Documento</span>
                <Badge variant="secondary">
                  {filteredVersions.length} versão(ões)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredVersions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">
                    {versions.length === 0
                      ? "Nenhuma versão encontrada para este documento."
                      : "Nenhuma versão corresponde aos filtros aplicados."}
                  </p>
                  {versions.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="mt-4"
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
                  {filteredVersions.map((version, index) => {
                    const isLatest = index === 0 && !emailFilter && !dateFilter;
                    const isRestoring = restoring === version.id;
                    
                    return (
                      <div
                        key={version.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isLatest && (
                              <Badge variant="default" className="bg-green-600">
                                ⭐ Mais recente
                              </Badge>
                            )}
                            <Badge variant="outline">
                              Versão #{filteredVersions.length - index}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              📅 {format(new Date(version.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span>Autor: {version.author_email}</span>
                          </div>

                          <div className="bg-muted/30 p-3 rounded border text-sm">
                            <p className="text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                              {version.content.substring(0, 200)}
                              {version.content.length > 200 ? "..." : ""}
                            </p>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            📏 {version.content.length} caracteres
                          </p>
                        </div>

                        {!isLatest && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleRestore(version.id, version.content)}
                            disabled={isRestoring}
                            className="shrink-0"
                          >
                            {isRestoring ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Restaurando...
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                ♻️ Restaurar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedAccess>
  );
}
