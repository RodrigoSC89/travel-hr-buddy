"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, ArrowLeft, RotateCcw, Search, Calendar, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  created_at: string;
  updated_by: string | null;
  author_email?: string;
}

export default function DocumentHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [emailFilter, setEmailFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    if (!id) return;
    loadVersions();
  }, [id]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      // Use explicit foreign key relationship for author email
      const { data, error } = await supabase
        .from("document_versions")
        .select(`
          id,
          document_id,
          content,
          created_at,
          updated_by,
          profiles!document_versions_updated_by_fkey(email)
        `)
        .eq("document_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data with author email
      const transformedData = (data || []).map((version) => {
        const profiles = version.profiles as unknown as { email: string } | null;
        return {
          id: version.id,
          document_id: version.document_id,
          content: version.content,
          created_at: version.created_at,
          updated_by: version.updated_by,
          author_email: profiles?.email || "Desconhecido",
        };
      });

      setVersions(transformedData);
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

  const handleRestore = async (versionId: string, versionContent: string) => {
    if (!id) return;

    setRestoring(versionId);
    try {
      // Update the document with the version content
      const { error: updateError } = await supabase
        .from("ai_generated_documents")
        .update({ content: versionContent })
        .eq("id", id);

      if (updateError) throw updateError;

      toast({
        title: "✅ Versão restaurada com sucesso",
        description: "O documento foi atualizado com a versão selecionada.",
      });

      // Navigate back to document view
      navigate(`/admin/documents/view/${id}`);
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

  // Client-side filtering with memoization for performance
  const filteredVersions = useMemo(() => {
    return versions.filter((version) => {
      // Email filter: case-insensitive partial matching
      const matchesEmail = emailFilter.trim() === "" ||
        version.author_email?.toLowerCase().includes(emailFilter.toLowerCase());

      // Date filter: show versions created on or after the selected date
      const matchesDate = dateFilter === "" ||
        new Date(version.created_at) >= new Date(dateFilter);

      // Both filters must match (AND logic)
      return matchesEmail && matchesDate;
    });
  }, [versions, emailFilter, dateFilter]);

  const clearFilters = () => {
    setEmailFilter("");
    setDateFilter("");
  };

  if (loading) {
    return (
      <RoleBasedAccess roles={["admin", "hr_manager"]}>
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando histórico de versões...
          </div>
        </div>
      </RoleBasedAccess>
    );
  }

  return (
    <RoleBasedAccess roles={["admin", "hr_manager"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/documents/view/${id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">📜 Histórico Completo do Documento</h1>
        </div>

        {/* Advanced Filtering Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              🔍 Filtros Avançados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Filter */}
              <div className="space-y-2">
                <Label htmlFor="email-filter" className="flex items-center gap-2">
                  📧 Filtrar por Email do Autor
                </Label>
                <Input
                  id="email-filter"
                  type="text"
                  placeholder="Digite o email do autor..."
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                />
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <Label htmlFor="date-filter" className="flex items-center gap-2">
                  📅 Filtrar por Data (a partir de)
                </Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Status and Clear Button */}
            {(emailFilter || dateFilter) && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredVersions.length === versions.length
                    ? `Mostrando todas as ${versions.length} versão(ões)`
                    : `Mostrando ${filteredVersions.length} de ${versions.length} versão(ões)`}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {filteredVersions.length === 0
                ? "Nenhuma versão encontrada"
                : `${filteredVersions.length} versão(ões) disponível(is)`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredVersions.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                <p>
                  {versions.length === 0
                    ? "Este documento ainda não possui versões anteriores."
                    : "Nenhuma versão corresponde aos filtros aplicados."}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
                {filteredVersions.map((version, index) => {
                  // Find original index for proper version numbering
                  const originalIndex = versions.findIndex(v => v.id === version.id);
                  return (
                    <Card key={version.id} className="border">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={originalIndex === 0 ? "default" : "secondary"}>
                                  {originalIndex === 0 ? "⭐ Mais recente" : `Versão ${versions.length - originalIndex}`}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {format(
                                    new Date(version.created_at),
                                    "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                                    { locale: ptBR }
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                <strong>📧 Autor:</strong> {version.author_email}
                              </p>
                              <div className="border rounded-lg p-3 bg-muted/50">
                                <p className="text-sm text-muted-foreground">
                                  {version.content.substring(0, 200)}
                                  {version.content.length > 200 ? "..." : ""}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {version.content.length} caracteres
                                </p>
                              </div>
                            </div>
                            {originalIndex !== 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(version.id, version.content)}
                                disabled={restoring !== null}
                                className="ml-4 shrink-0"
                              >
                                {restoring === version.id ? (
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
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleBasedAccess>
  );
}
