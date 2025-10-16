import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExportarComentariosPDF } from "@/components/sgso/ExportarComentariosPDF";
import { Send, MessageSquare, User, Bot } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar comentários
  const buscarComentarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/auditoria/${auditoriaId}/comentarios`);
      if (!response.ok) {
        throw new Error("Erro ao buscar comentários");
      }
      const data = await response.json();
      setComentarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Enviar novo comentário
  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;

    setEnviando(true);
    setError(null);
    try {
      const response = await fetch(`/api/auditoria/${auditoriaId}/comentarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comentario: novoComentario }),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar comentário");
      }

      setNovoComentario("");
      // Aguardar um pouco para a IA responder
      setTimeout(() => {
        buscarComentarios();
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar");
    } finally {
      setEnviando(false);
    }
  };

  // Carregar comentários ao montar
  useEffect(() => {
    buscarComentarios();
  }, [auditoriaId]);

  const isAIComment = (userId: string) => userId === "ia-auto-responder";

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Comentários da Auditoria</h3>
          <span className="text-sm text-muted-foreground">
            ({comentarios.length} {comentarios.length === 1 ? "comentário" : "comentários"})
          </span>
        </div>
        <ExportarComentariosPDF comentarios={comentarios} />
      </div>

      {/* Área de comentários */}
      <div className="flex-1 border rounded-lg bg-white">
        <ScrollArea className="h-96 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Carregando comentários...</p>
              </div>
            </div>
          ) : comentarios.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum comentário ainda.</p>
                <p className="text-sm">Seja o primeiro a comentar!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {comentarios.map((comentario) => (
                <div
                  key={comentario.id}
                  className={`p-4 rounded-lg border ${
                    isAIComment(comentario.user_id)
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start space-x-2 mb-2">
                    {isAIComment(comentario.user_id) ? (
                      <Bot className="w-4 h-4 text-blue-600 mt-1" />
                    ) : (
                      <User className="w-4 h-4 text-gray-600 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {isAIComment(comentario.user_id) ? (
                            <span className="text-blue-600">🤖 Auditor IA (IMCA)</span>
                          ) : (
                            <span className="text-gray-700">👤 {comentario.user_id}</span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comentario.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                        {comentario.comentario}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Formulário de novo comentário */}
      <div className="space-y-2">
        <Textarea
          placeholder="Digite seu comentário sobre a auditoria..."
          value={novoComentario}
          onChange={(e) => setNovoComentario(e.target.value)}
          className="min-h-[80px] resize-none"
          disabled={enviando}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <div className="flex justify-end">
          <Button
            onClick={enviarComentario}
            disabled={!novoComentario.trim() || enviando}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {enviando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
