import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, User, Bot } from "lucide-react";
import { ExportarComentariosPDF } from "@/components/sgso/ExportarComentariosPDF";

interface Comentario {
  id: string;
  comentario: string;
  created_at: string;
  user_id: string;
}

interface ComentariosAuditoriaProps {
  auditoriaId: string;
}

export function ComentariosAuditoria({ auditoriaId }: ComentariosAuditoriaProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarComentarios();
  }, [auditoriaId]);

  const carregarComentarios = async () => {
    try {
      setLoading(true);
      setErro(null);
      const response = await fetch(`/api/auditoria/${auditoriaId}/comentarios`);
      
      if (!response.ok) {
        throw new Error("Erro ao carregar comentários");
      }
      
      const data = await response.json();
      setComentarios(data);
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
      setErro("Erro ao carregar comentários. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const enviarComentario = async () => {
    if (!novoComentario.trim()) {
      setErro("Digite um comentário antes de enviar.");
      return;
    }

    try {
      setEnviando(true);
      setErro(null);
      
      const response = await fetch(`/api/auditoria/${auditoriaId}/comentarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comentario: novoComentario }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao enviar comentário");
      }

      setNovoComentario("");
      
      // Aguardar um pouco para a IA responder
      setTimeout(() => {
        carregarComentarios();
      }, 2500);
    } catch (error: any) {
      console.error("Erro ao enviar comentário:", error);
      setErro(error.message || "Erro ao enviar comentário. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isIA = (userId: string) => userId === "ia-auto-responder";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Comentários ({comentarios.length})
        </h3>
        {comentarios.length > 0 && (
          <ExportarComentariosPDF comentarios={comentarios} />
        )}
      </div>

      {/* Lista de comentários */}
      <ScrollArea className="h-[400px] rounded-md border p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Carregando comentários...
            </span>
          </div>
        ) : comentarios.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              Seja o primeiro a comentar! 💬
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {comentarios.map((comentario) => (
              <div
                key={comentario.id}
                className={`p-4 rounded-lg border ${
                  isIA(comentario.user_id)
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isIA(comentario.user_id) ? (
                    <>
                      <Bot className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">
                        Auditor IA (IMCA)
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">
                        {comentario.user_id}
                      </span>
                    </>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {formatarData(comentario.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comentario.comentario}
                </p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Formulário de novo comentário */}
      <div className="space-y-2">
        <Textarea
          placeholder="Digite seu comentário..."
          value={novoComentario}
          onChange={(e) => setNovoComentario(e.target.value)}
          disabled={enviando}
          rows={3}
          className="resize-none"
        />
        {erro && (
          <p className="text-sm text-red-600">{erro}</p>
        )}
        <Button
          onClick={enviarComentario}
          disabled={enviando || !novoComentario.trim()}
          className="w-full"
        >
          {enviando ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Comentário"
          )}
        </Button>
      </div>
    </div>
  );
}
