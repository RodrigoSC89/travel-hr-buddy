"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, ArrowLeft, RotateCcw } from "lucide-react";
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

        <Card>
          <CardHeader>
            <CardTitle>
              {versions.length === 0
                ? "Nenhuma versão encontrada"
                : `${versions.length} versão(ões) disponível(is)`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {versions.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                <p>Este documento ainda não possui versões anteriores.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {versions.map((version, index) => (
                  <Card key={version.id} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={index === 0 ? "default" : "secondary"}>
                                {index === 0 ? "Mais recente" : `Versão ${versions.length - index}`}
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
                              <strong>Autor:</strong> {version.author_email}
                            </p>
                            <div className="border rounded-lg p-3 bg-muted/50">
                              <p className="text-sm text-muted-foreground">
                                {version.content.substring(0, 200)}
                                {version.content.length > 200 ? "..." : ""}
                              </p>
                            </div>
                          </div>
                          {index !== 0 && (
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleBasedAccess>
  );
}
