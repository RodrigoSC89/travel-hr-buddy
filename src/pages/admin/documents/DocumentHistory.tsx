"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, ArrowLeft, Search, RotateCcw, History } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  created_at: string;
  updated_by: string | null;
  user_email?: string;
}

export default function DocumentHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEmail, setFilterEmail] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");

  useEffect(() => {
    if (id) {
      loadDocumentTitle();
      fetchVersions();
    }
  }, [id]);

  useEffect(() => {
    applyFilters();
  }, [filterEmail, filterDate, versions]);

  const loadDocumentTitle = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_generated_documents")
        .select("title")
        .eq("id", id)
        .single();

      if (error) throw error;
      setDocumentTitle(data?.title || "Documento");
    } catch (error) {
      console.error("Error loading document title:", error);
    }
  };

  const fetchUserEmail = async (userId: string | null): Promise<string> => {
    if (!userId) return "Desconhecido";

    try {
      const { data } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      return data?.email || "Desconhecido";
    } catch (error) {
      console.error("Error fetching user email:", error);
      return "Desconhecido";
    }
  };

  const fetchVersions = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("document_versions")
        .select("*")
        .eq("document_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user emails for each version
      const versionsWithEmails = await Promise.all(
        (data || []).map(async (version) => ({
          ...version,
          user_email: await fetchUserEmail(version.updated_by),
        }))
      );

      setVersions(versionsWithEmails);
      setFilteredVersions(versionsWithEmails);
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

    // Filter by email
    if (filterEmail.trim()) {
      filtered = filtered.filter((v) =>
        v.user_email?.toLowerCase().includes(filterEmail.toLowerCase())
      );
    }

    // Filter by date
    if (filterDate) {
      const filterDateObj = new Date(filterDate);
      filterDateObj.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter((v) => {
        const versionDate = new Date(v.created_at);
        versionDate.setHours(0, 0, 0, 0);
        return versionDate >= filterDateObj;
      });
    }

    setFilteredVersions(filtered);
  };

  const restoreVersion = async (versionId: string) => {
    if (!id) return;

    const version = versions.find((v) => v.id === versionId);
    if (!version) return;

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      // Update document content (this will trigger automatic version creation)
      const { error: updateError } = await supabase
        .from("ai_generated_documents")
        .update({ content: version.content })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

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
        // Don't fail the operation if logging fails
      }

      toast({
        title: "✅ Documento restaurado com sucesso!",
        description: `A versão de ${format(
          new Date(version.created_at),
          "dd/MM/yyyy 'às' HH:mm",
          { locale: ptBR }
        )} foi restaurada.`,
      });

      navigate(`/admin/documents/view/${id}`);
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Erro ao restaurar documento",
        description: "Não foi possível restaurar esta versão.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <RoleBasedAccess roles={["admin", "hr_manager"]}>
        <div className="p-8 text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando histórico...
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
        </div>

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="w-8 h-8" />
            📜 Histórico de Versões
          </h1>
          <p className="text-muted-foreground mt-1">
            {documentTitle} - {filteredVersions.length} versão(ões) encontrada(s)
          </p>
        </div>

        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Busca</CardTitle>
            <CardDescription>
              Filtre o histórico por e-mail do autor ou data de criação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <Input
                  placeholder="Filtrar por e-mail"
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setFilterEmail("");
                  setFilterDate("");
                }}
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Versions List */}
        <Card>
          <CardHeader>
            <CardTitle>Versões do Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[65vh]">
              {filteredVersions.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma versão encontrada com os filtros aplicados.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredVersions.map((v, index) => (
                    <Card key={v.id} className="border">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              🕒{" "}
                              {format(
                                new Date(v.created_at),
                                "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                                { locale: ptBR }
                              )}
                              {index === 0 && (
                                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  Mais recente
                                </span>
                              )}
                            </div>
                            <div className="text-sm">
                              👤 {v.user_email || "Desconhecido"}
                            </div>
                            <p className="text-sm line-clamp-3 text-muted-foreground">
                              📝 {v.content.slice(0, 200)}
                              {v.content.length > 200 ? "..." : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {v.content.length} caracteres
                            </p>
                          </div>
                          {index !== 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => restoreVersion(v.id)}
                              className="ml-4 shrink-0"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              ♻️ Restaurar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </RoleBasedAccess>
  );
}
