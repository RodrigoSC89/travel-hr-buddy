import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExportarComentariosPDF } from "@/components/sgso/ExportarComentariosPDF";
import { MessageCircle, Send, Loader2 } from "lucide-react";

interface Comentario {
  id: string;
  comentario: string;
  user_id: string;
  created_at: string;
}

interface ComentariosAuditoriaProps {
  auditoriaId: string;
}

export function ComentariosAuditoria({ auditoriaId }: ComentariosAuditoriaProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarComentarios = async () => {
    try {
      const res = await fetch(`/api/auditoria/${auditoriaId}/comentarios`);
      if (!res.ok) throw new Error("Erro ao carregar comentários");
      const data = await res.json();
      setComentarios(data);
      setErro(null);
    } catch (error) {
      setErro("Erro ao carregar comentários. Tente novamente.");
      console.error(error);
    }
  };

  useEffect(() => {
    carregarComentarios();
    // Polling para atualizar comentários a cada 10 segundos
    const interval = setInterval(carregarComentarios, 10000);
    return () => clearInterval(interval);
  }, [auditoriaId]);

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;

    setCarregando(true);
    setErro(null);

    try {
      const res = await fetch(`/api/auditoria/${auditoriaId}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comentario: novoComentario }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao enviar comentário");
      }

      setNovoComentario("");
      
      // Aguardar um pouco para a IA responder antes de recarregar
      setTimeout(() => {
        carregarComentarios();
      }, 2000);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao enviar comentário");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarComentario();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header com contador e botão de exportação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">
            Comentários da Auditoria ({comentarios.length})
          </h3>
        </div>
        <ExportarComentariosPDF comentarios={comentarios} />
      </div>

      {/* Lista de comentários */}
      <ScrollArea className="h-[400px] rounded-md border p-4">
        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {erro}
          </div>
        )}

        {comentarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mb-2 opacity-30" />
            <p>Nenhum comentário ainda.</p>
            <p className="text-sm">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comentarios.map((comentario) => {
              const isIA = comentario.user_id === "ia-auto-responder";
              return (
                <div
                  key={comentario.id}
                  className={`p-4 rounded-lg border ${
                    isIA
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {isIA ? "🤖" : "👤"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {isIA ? "IA Auditor IMCA" : "Usuário"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comentario.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {comentario.comentario}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Área de novo comentário */}
      <div className="space-y-2">
        <Textarea
          value={novoComentario}
          onChange={(e) => setNovoComentario(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Adicione um comentário sobre a auditoria... (Pressione Enter para enviar, Shift+Enter para nova linha)"
          className="min-h-[100px] resize-none"
          disabled={carregando}
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {carregando
              ? "Enviando comentário e aguardando resposta da IA..."
              : "A IA gerará automaticamente uma resposta técnica baseada nas normas IMCA"}
          </p>
          <Button
            onClick={enviarComentario}
            disabled={carregando || !novoComentario.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {carregando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Comentário
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
