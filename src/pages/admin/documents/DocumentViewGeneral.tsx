import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2, ArrowLeft, FileText } from "lucide-react";

interface Document {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export default function DocumentViewGeneralPage() {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      if (!id) {
        setError("ID do documento não fornecido");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error loading document:", error);
          setError("Erro ao carregar documento");
        } else if (!data) {
          setError("Documento não encontrado");
        } else {
          setDocument(data);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Erro ao carregar documento");
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando documento...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-8 space-y-6">
        <Link to="/admin/documents/list">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para lista
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <Link to="/admin/documents/list">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para lista
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <FileText className="h-6 w-6 text-primary mt-1" />
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{document.title}</CardTitle>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <p>
                  Criado em: {format(new Date(document.created_at), "dd/MM/yyyy 'às' HH:mm")}
                </p>
                {document.updated_at !== document.created_at && (
                  <p>
                    Atualizado em: {format(new Date(document.updated_at), "dd/MM/yyyy 'às' HH:mm")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {document.content ? (
              <div className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg border">
                {document.content}
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                Este documento não possui conteúdo.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
