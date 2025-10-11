"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Version {
  content: string;
  created_at: string;
  document_id: string;
}

export default function RestoreVersionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [version, setVersion] = useState<Version | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    supabase
      .from("document_versions")
      .select("content, created_at, document_id")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setVersion(data);
        setLoading(false);
      });
  }, [id]);

  async function confirmRestore() {
    if (!version) return;

    await supabase
      .from("ai_generated_documents")
      .update({ content: version.content })
      .eq("id", version.document_id);

    navigate(`/admin/documents/view/${version.document_id}`);
  }

  if (loading) return <div className="p-8">Carregando versão...</div>;
  if (!version) return <div className="p-8 text-destructive">Versão não encontrada.</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">🔁 Restaurar Versão</h1>
      <p className="text-muted-foreground">
        Deseja realmente restaurar o documento com o conteúdo salvo em:
      </p>
      <p className="text-sm text-muted-foreground">
        {format(new Date(version.created_at), "dd/MM/yyyy HH:mm")}
      </p>

      <Card>
        <CardContent className="whitespace-pre-wrap p-4">
          {version.content}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="destructive" onClick={confirmRestore}>
          ✅ Confirmar Restauração
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
