import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, RefreshCw, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Comment {
  id: string;
  author_id: string;
  text: string;
  created_at: string;
  author_email?: string;
}

/**
 * Collaboration Page
 * 
 * Real-time collaboration module with automatic comment synchronization
 * and manual refresh capability
 */
export default function CollaborationPage() {
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchComments();

    // Set up real-time subscription
    const channel = supabase
      .channel("colab-comments-changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "colab_comments"
      }, (payload) => {
        console.log("Real-time update received:", payload);
        fetchComments(); // Auto-refresh when changes detected
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("colab_comments")
        .select(`
          id,
          author_id,
          text,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch author emails
      const commentsWithEmails = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", comment.author_id)
            .single();

          return {
            ...comment,
            author_email: profile?.email || "Usuário desconhecido"
          };
        })
      );

      setComments(commentsWithEmails);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Erro ao carregar comentários",
        description: "Não foi possível carregar os comentários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComments();
    setRefreshing(false);
    toast({
      title: "Atualizado",
      description: "Comentários atualizados com sucesso.",
    });
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, escreva um comentário.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from("colab_comments")
        .insert({
          author_id: user.id,
          text: newComment.trim(),
        });

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Sucesso",
        description: "Comentário enviado com sucesso!",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Erro ao enviar comentário",
        description: "Não foi possível enviar o comentário.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🤝 Colaboração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Input */}
          <div className="space-y-4">
            <Textarea
              placeholder="💬 Deixe seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
              rows={4}
            />
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !newComment.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Enviando..." : "✉️ Enviar Comentário"}
            </Button>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Comentários da Equipe</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </div>
            ) : (
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>👤 {comment.author_email}</span>
                            <span>🕒 {format(new Date(comment.created_at), "dd/MM/yyyy, HH:mm", { locale: ptBR })}</span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
