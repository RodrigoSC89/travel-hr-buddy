import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DocumentVersion {
  id: string;
  content: string;
  created_at: string;
  updated_by: string | null;
  user_email?: string;
}

export default function DocumentHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchVersions();
    }
  }, [id]);

  async function fetchVersions() {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("document_versions")
        .select(`
          id, 
          content, 
          created_at, 
          updated_by,
          profiles!document_versions_updated_by_fkey(email)
        `)
        .eq("document_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to include user email
      const transformedData: DocumentVersion[] = (data || []).map((version) => {
        const profiles = version.profiles as unknown as { email: string } | null;
        return {
          id: version.id,
          content: version.content,
          created_at: version.created_at,
          updated_by: version.updated_by,
          user_email: profiles?.email || "Desconhecido",
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
  }

  async function restoreVersion(versionId: string) {
    const version = versions.find((v) => v.id === versionId);
    if (!version) return;

    try {
      const { error } = await supabase
        .from("ai_generated_documents")
        .update({
          content: version.content,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "✅ Documento restaurado com sucesso!",
        description: `A versão de ${format(new Date(version.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} foi restaurada.`,
      });

      navigate(`/admin/documents/view/${id}`);
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Erro ao restaurar",
        description: "Não foi possível restaurar esta versão do documento.",
        variant: "destructive",
      });
    }
  }

  return (
    <RoleBasedAccess roles={["admin", "hr_manager"]}>
      <div className="container mx-auto p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/documents/view/${id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">📜 Histórico de Versões</h1>
        </div>

        <ScrollArea className="h-[70vh] rounded-md border p-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
              <span className="text-muted-foreground">Carregando...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              <p>Nenhuma versão encontrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((v) => (
                <Card key={v.id} className="p-4">
                  <CardHeader className="p-0 pb-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        🕒 {format(new Date(v.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-sm">👤 {v.user_email}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="line-clamp-3 text-sm text-muted-foreground mb-3">
                      📝 {v.content.slice(0, 200)}
                      {v.content.length > 200 ? "..." : ""}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreVersion(v.id)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      ♻️ Restaurar esta versão
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </RoleBasedAccess>
  );
}
