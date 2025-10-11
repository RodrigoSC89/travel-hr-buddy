"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface DocumentVersion {
  content: string;
  created_at: string;
  document_id: string;
}

export default function RestoreVersionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [version, setVersion] = useState<DocumentVersion | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Captura usuário autenticado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id || null));
  }, []);

  // Carrega versão selecionada
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

  // Confirma a restauração e registra log
  async function confirmRestore() {
    if (!version || !userId) return;

    // ✅ Atualiza documento principal
    await supabase
      .from("documents")
      .update({ content: version.content })
      .eq("id", version.document_id);

    // ✅ Insere log de auditoria
    await supabase.from("document_restore_logs").insert({
      document_id: version.document_id,
      version_id: id,
      restored_by: userId,
    });

    navigate(`/admin/documents/view/${version.document_id}`);
  }

  if (loading) return (
    <div className="p-8 flex items-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      Carregando versão...
    </div>
  );
  
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
