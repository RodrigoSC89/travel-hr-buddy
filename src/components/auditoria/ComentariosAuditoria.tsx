import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Comentario {
  id: string
  comentario: string
  user_id: string
  created_at: string
}

export function ComentariosAuditoria({ auditoriaId }: { auditoriaId: string }) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [carregando, setCarregando] = useState(false);

  const carregarComentarios = async () => {
    const res = await fetch(`/api/auditoria/${auditoriaId}/comentarios`);
    const data = await res.json();
    setComentarios(data);
  };

  useEffect(() => {
    carregarComentarios();
  }, []);

  const enviarComentario = async () => {
    setCarregando(true);
    await fetch(`/api/auditoria/${auditoriaId}/comentarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comentario: novoComentario }),
    });
    setNovoComentario("");
    await carregarComentarios();
    setCarregando(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">💬 Comentários da Auditoria</h2>

      <ScrollArea className="max-h-64 border p-2 rounded-md">
        {comentarios.map((c) => (
          <div key={c.id} className="text-sm border-b py-2">
            <div className="text-muted-foreground text-xs mb-1">
              {new Date(c.created_at).toLocaleString()} - {c.user_id}
            </div>
            <div>{c.comentario}</div>
          </div>
        ))}
      </ScrollArea>

      <Textarea
        value={novoComentario}
        onChange={(e) => setNovoComentario(e.target.value)}
        placeholder="Adicionar um comentário..."
      />
      <Button disabled={carregando || !novoComentario.trim()} onClick={enviarComentario}>
        Enviar
      </Button>
    </div>
  );
}
