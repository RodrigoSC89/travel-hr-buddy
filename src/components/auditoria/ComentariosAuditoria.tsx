import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExportarComentariosPDF } from "@/components/sgso/ExportarComentariosPDF";

interface Comentario {
  id: string;
  comentario: string;
  user_id: string;
  created_at: string;
}

export function ComentariosAuditoria({ auditoriaId }: { auditoriaId: string }) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [carregando, setCarregando] = useState(false);

  const carregarComentarios = async () => {
    try {
      const res = await fetch(`/api/auditoria/${auditoriaId}/comentarios`);
      if (res.ok) {
        const data = await res.json();
        setComentarios(data);
      }
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
    }
  };

  useEffect(() => {
    carregarComentarios();
  }, [auditoriaId]);

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;
    
    setCarregando(true);
    try {
      const res = await fetch(`/api/auditoria/${auditoriaId}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comentario: novoComentario }),
      });
      
      if (res.ok) {
        setNovoComentario("");
        // Wait a bit for AI to respond before refreshing
        setTimeout(async () => {
          await carregarComentarios();
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">💬 Comentários da Auditoria</h2>
        <div className="flex items-center gap-4">
          <div className="text-muted-foreground text-sm">
            Total de comentários: {comentarios.length}
          </div>
          <ExportarComentariosPDF comentarios={comentarios} />
        </div>
      </div>

      <ScrollArea className="max-h-96 border rounded-md p-4 bg-gray-50">
        {comentarios.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </div>
        ) : (
          <div className="space-y-3">
            {comentarios.map((c) => (
              <div 
                key={c.id} 
                className={`p-4 rounded-lg border ${
                  c.user_id === "ia-auto-responder" 
                    ? "bg-blue-50 border-blue-200" 
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {c.user_id === "ia-auto-responder" ? "🤖" : "👤"}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">
                      {c.user_id === "ia-auto-responder" ? "IA Auditor IMCA" : c.user_id}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {c.comentario}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="space-y-2">
        <Textarea
          value={novoComentario}
          onChange={(e) => setNovoComentario(e.target.value)}
          placeholder="Adicionar um comentário..."
          className="resize-none"
          rows={4}
          disabled={carregando}
        />
        <div className="flex justify-end">
          <Button 
            disabled={carregando || !novoComentario.trim()} 
            onClick={enviarComentario}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {carregando ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
