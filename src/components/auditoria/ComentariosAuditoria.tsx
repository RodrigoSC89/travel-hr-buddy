import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarComentarios();
  }, [auditoriaId]);

  const carregarComentarios = async () => {
    try {
      setCarregando(true);
      setErro("");
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
      setCarregando(false);
    }
  };

  const enviarComentario = async () => {
    if (!novoComentario.trim()) {
      setErro("Por favor, digite um comentário.");
      return;
    }

    try {
      setEnviando(true);
      setErro("");
      
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
      // Aguardar um momento para a IA responder
      setTimeout(() => {
        carregarComentarios();
      }, 2000);
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      setErro(error instanceof Error ? error.message : "Erro ao enviar comentário. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isIA = (userId: string) => userId === "ia-auto-responder";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Comentários da Auditoria</span>
          {comentarios.length > 0 && (
            <ExportarComentariosPDF comentarios={comentarios} />
          )}
        </CardTitle>
        <CardDescription>
          Adicione comentários e receba respostas técnicas do Auditor IA (IMCA)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área de Comentários */}
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          {carregando ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-muted-foreground">Carregando comentários...</span>
            </div>
          ) : comentarios.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Seja o primeiro a comentar! 💬
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comentarios.map((comentario) => (
                <Card
                  key={comentario.id}
                  className={`${
                    isIA(comentario.user_id)
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-full p-2 ${
                          isIA(comentario.user_id)
                            ? "bg-blue-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {isIA(comentario.user_id) ? (
                          <Bot className="h-4 w-4 text-blue-600" />
                        ) : (
                          <User className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">
                            {isIA(comentario.user_id) ? (
                              <span className="text-blue-700">
                                🤖 Auditor IA (IMCA)
                              </span>
                            ) : (
                              <span className="text-gray-700">
                                👤 {comentario.user_id}
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatarData(comentario.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {comentario.comentario}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Formulário de Novo Comentário */}
        <div className="space-y-2">
          <Textarea
            placeholder="Digite seu comentário sobre a auditoria..."
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            disabled={enviando}
            className="min-h-[100px]"
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Comentário"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
