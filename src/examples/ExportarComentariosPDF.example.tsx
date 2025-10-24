/**
 * Example integration of ExportarComentariosPDF component
 * 
 * This example shows how to use the ExportarComentariosPDF component
 * in a real audit comments page with Supabase integration.
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ExportarComentariosPDF } from "./ExportarComentariosPDF";
import { MessageSquare, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface AuditComment {
  user_id: string;
  created_at: string;
  comentario: string;
}

export function AuditCommentsExample() {
  const [comments, setComments] = useState<AuditComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditComments();
  }, []);

  const fetchAuditComments = async () => {
    try {
      // Example query - adjust table name and columns as needed
      const { data, error } = await supabase
        .from("audit_comments") // Replace with your actual table name
        .select("user_id, created_at, comentario")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Erro ao carregar comentários");
        console.error(error);
        return;
      }

      if (data) {
        setComments(data);
      }
    } catch (err) {
      toast.error("Erro ao buscar comentários");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comentários da Auditoria
              </CardTitle>
              <CardDescription>
                {comments.length} comentário{comments.length !== 1 ? "s" : ""} registrado{comments.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <ExportarComentariosPDF comentarios={comments} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando comentários...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum comentário registrado ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div
                  key={index}
                  className="border-l-4 border-l-blue-500 bg-secondary/50 p-4 rounded-lg"
                >
                  <div className="flex items-center gap-4 mb-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{comment.user_id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(comment.created_at), "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.comentario}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Example 2: Integration with SystemAuditor component
 * 
 * This shows how to add the PDF export to an existing audit page
 */

export function SystemAuditorWithExport() {
  // Mock comments - in real scenario, fetch from Supabase
  const mockComments: AuditComment[] = [
    {
      user_id: "auditor@company.com",
      created_at: new Date().toISOString(),
      comentario: "Sistema de autenticação validado com sucesso. Todos os testes passaram."
    },
    {
      user_id: "admin@company.com",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      comentario: "Módulos principais funcionando corretamente. Recomenda-se monitoramento contínuo."
    },
    {
      user_id: "tech-lead@company.com",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      comentario: "Performance otimizada. Tempo de resposta médio: 150ms. Aprovado para produção."
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Relatório de Auditoria Técnica</CardTitle>
              <CardDescription>
                Comentários e observações do processo de homologação
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <ExportarComentariosPDF comentarios={mockComments} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Your audit content here */}
          <div className="grid gap-4">
            {mockComments.map((comment, idx) => (
              <div key={idx} className="p-4 border rounded-lg bg-card">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium">{comment.user_id}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{comment.comentario}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
