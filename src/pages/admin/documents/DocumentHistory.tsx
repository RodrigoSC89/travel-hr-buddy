import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

interface DocumentVersion {
  content: string;
  created_at: string;
  updated_by: string | null;
}

export default function DocumentHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const loadVersions = async () => {
      const { data, error } = await supabase
        .from("document_versions")
        .select("content, created_at, updated_by")
        .eq("document_id", id)
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setVersions(data);
      }
      setLoading(false);
    };

    loadVersions();
  }, [id]);

  const restoreVersion = async (content: string) => {
    if (!window.confirm("Deseja restaurar esta versão? Ela substituirá o conteúdo atual.")) {
      return;
    }
    
    const { error } = await supabase
      .from("ai_generated_documents")
      .update({ content })
      .eq("id", id);
    
    if (!error) {
      navigate(`/admin/documents/view/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando histórico...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/admin/documents/view/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">📜 Histórico de Versões</h1>
      </div>

      {versions.length === 0 && (
        <p className="text-muted-foreground">Nenhuma versão antiga encontrada.</p>
      )}

      <div className="space-y-4">
        {versions.map((v, i) => (
          <Card key={i}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Salvo em {format(new Date(v.created_at), "dd/MM/yyyy HH:mm")}
                </p>
                <Button size="sm" variant="outline" onClick={() => restoreVersion(v.content)}>
                  🔁 Restaurar esta versão
                </Button>
              </div>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-3 rounded">
                {v.content}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
