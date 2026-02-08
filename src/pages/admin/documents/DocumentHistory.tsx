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
import { Loader2, ArrowLeft, RotateCcw, Filter, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

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
      // Query document_versions with proper schema fields
      const docId = id as string;
      const { data, error } = await supabase
        .from("document_versions")
        .select("id, document_id, document_snapshot, changed_at, changed_by, change_summary, file_path")
        .eq("document_id", docId)
        .order("changed_at", { ascending: false });

      if (error) throw error;

      // Transform data mapping schema fields to interface
      const transformedData: DocumentVersion[] = (data || []).map((version) => {
        const snapshot = version.document_snapshot as Record<string, unknown> | null;
        return {
          id: version.id,
          document_id: version.document_id || "",
          content: snapshot ? (typeof snapshot === 'string' ? snapshot : JSON.stringify(snapshot)) : version.change_summary || "",
          created_at: version.changed_at || "",
          updated_by: version.changed_by,
          author_email: version.changed_by || "Desconhecido",
        };
      });

      setVersions(transformedData);
    } catch (error) {
      logger.error("Error loading versions:", error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de versões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter versions with useMemo for performance
  const filteredVersions = useMemo(() => {
    return versions.filter((version) => {
      const matchesEmail = emailFilter.trim() === "" ||
        version.author_email?.toLowerCase().includes(emailFilter.toLowerCase());
      const matchesDate = dateFilter === "" ||
        new Date(version.created_at) >= new Date(dateFilter);
      return matchesEmail && matchesDate;
    });
  }, [versions, emailFilter, dateFilter]);

  const hasActiveFilters = emailFilter.trim() !== "" || dateFilter !== "";

  const clearFilters = () => {
    setEmailFilter("");
    setDateFilter("");
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
      logger.error("Error restoring version:", error);
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

        {/* Advanced Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              🔍 Filtros Avançados
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {(emailFilter ? 1 : 0) + (dateFilter ? 1 : 0)} filtro(s) ativo(s)
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Filter */}
              <div className="space-y-2">
                <Label htmlFor="email-filter">
                  📧 Filtrar por Email do Autor
                </Label>
                <Input
                  id="email-filter"
                  type="text"
                  placeholder="Digite o email ou parte dele..."
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <Label htmlFor="date-filter">
                  📅 Filtrar por Data (a partir de)
                </Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full md:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Versions List Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {versions.length === 0
                ? "Nenhuma versão encontrada"
                : filteredVersions.length === 0
                  ? "Nenhuma versão encontrada com os filtros aplicados"
                  : `${filteredVersions.length} de ${versions.length} versão(ões) exibida(s)`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {versions.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                <p>Este documento ainda não possui versões anteriores.</p>
              </div>
            ) : filteredVersions.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                <p>Nenhuma versão corresponde aos filtros aplicados.</p>
                <Button
                  variant="link"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {filteredVersions.map((version) => {
                  // Find the original index in the full versions array for proper labeling
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
                              <p className="text-xs text-muted-foreground">
                                <strong>Caracteres:</strong> {version.content.length}
                              </p>
                              <div className="border rounded-lg p-3 bg-muted/50">
                                <p className="text-sm text-muted-foreground">
                                  {version.content.substring(0, 200)}
                                  {version.content.length > 200 ? "..." : ""}
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
                                    ♻️ Restaurar esta versão
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
