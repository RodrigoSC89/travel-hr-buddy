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
import { logger } from "@/lib/logger";

interface Reply {
  id: string;
  comment_id: string;
  author_id: string;
  text: string;
  created_at: string;
  author_email?: string;
}

interface Comment {
  id: string;
  author_id: string;
  text: string;
  created_at: string;
  author_email?: string;
  reactions: Record<string, number>;
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
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchComments();

    // Set up real-time subscription for comments
    const commentsChannel = supabase
      .channel("colab-comments-changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "colab_comments"
      }, (payload) => {
        logger.info("Real-time comment update received:", payload);
        fetchComments(); // Auto-refresh when changes detected
      })
      .subscribe();

    // Set up real-time subscription for replies
    const repliesChannel = supabase
      .channel("colab-replies-changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "colab_replies"
      }, (payload) => {
        logger.info("Real-time reply update received:", payload);
        // Refresh replies for the affected comment
        if (payload.new && "comment_id" in payload.new) {
          fetchReplies(payload.new.comment_id as string);
        } else if (payload.old && "comment_id" in payload.old) {
          fetchReplies(payload.old.comment_id as string);
        }
      })
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      if (commentsChannel) {
        supabase.removeChannel(commentsChannel);
      }
      if (repliesChannel) {
        supabase.removeChannel(repliesChannel);
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
          created_at,
          reactions
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

          // Fetch replies for each comment
          await fetchReplies(comment.id);

          return {
            ...comment,
            author_email: profile?.email || "Usuário desconhecido",
            reactions: comment.reactions || {}
          };
        })
      );

      setComments(commentsWithEmails);
    } catch (error) {
      logger.error("Error fetching comments:", error);
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
      logger.error("Error submitting comment:", error);
      toast({
        title: "Erro ao enviar comentário",
        description: "Não foi possível enviar o comentário.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchReplies = async (commentId: string) => {
    try {
      const { data, error } = await supabase
        .from("colab_replies")
        .select(`
          id,
          comment_id,
          author_id,
          text,
          created_at
        `)
        .eq("comment_id", commentId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch author emails for replies
      const repliesWithEmails = await Promise.all(
        (data || []).map(async (reply) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", reply.author_id)
            .single();

          return {
            ...reply,
            author_email: profile?.email || "Usuário desconhecido"
          };
        })
      );

      setReplies((prev) => ({ ...prev, [commentId]: repliesWithEmails }));
    } catch (error) {
      logger.error("Error fetching replies:", error);
    }
  };

  const addReaction = async (commentId: string, emoji: string) => {
    try {
      // Find the current comment
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      // Update reaction count
      const currentReactions = comment.reactions || {};
      const newReactions = {
        ...currentReactions,
        [emoji]: (currentReactions[emoji] || 0) + 1
      };

      const { error } = await supabase
        .from("colab_comments")
        .update({ reactions: newReactions })
        .eq("id", commentId);

      if (error) throw error;

      // Optimistically update local state
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, reactions: newReactions } : c
        )
      );
    } catch (error) {
      logger.error("Error adding reaction:", error);
      toast({
        title: "Erro ao adicionar reação",
        description: "Não foi possível adicionar a reação.",
        variant: "destructive",
      });
    }
  };

  const submitReply = async (commentId: string) => {
    const replyText = replyTexts[commentId];
    if (!replyText?.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, escreva uma resposta.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from("colab_replies")
        .insert({
          comment_id: commentId,
          author_id: user.id,
          text: replyText.trim(),
        });

      if (error) throw error;

      // Clear the reply text
      setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));

      toast({
        title: "Sucesso",
        description: "Resposta enviada com sucesso!",
      });
    } catch (error) {
      logger.error("Error submitting reply:", error);
      toast({
        title: "Erro ao enviar resposta",
        description: "Não foi possível enviar a resposta.",
        variant: "destructive",
      });
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
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>👤 {comment.author_email}</span>
                            <span>🕒 {format(new Date(comment.created_at), "dd/MM/yyyy, HH:mm", { locale: ptBR })}</span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                          
                          {/* Emoji Reactions */}
                          <div className="flex gap-2 items-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addReaction(comment.id, "👍")}
                              className="h-8 px-3"
                            >
                              👍 {comment.reactions?.["👍"] || 0}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addReaction(comment.id, "❤️")}
                              className="h-8 px-3"
                            >
                              ❤️ {comment.reactions?.["❤️"] || 0}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addReaction(comment.id, "👏")}
                              className="h-8 px-3"
                            >
                              👏 {comment.reactions?.["👏"] || 0}
                            </Button>
                          </div>

                          {/* Replies Section */}
                          <div className="space-y-3 mt-4">
                            <h4 className="text-sm font-semibold">💬 Respostas:</h4>
                            {replies[comment.id] && replies[comment.id].length > 0 && (
                              <div className="space-y-2 border-l-2 border-gray-200 pl-4">
                                {replies[comment.id].map((reply) => (
                                  <div key={reply.id} className="bg-gray-50 p-3 rounded">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                      <span>👤 {reply.author_email}</span>
                                      <span>🕒 {format(new Date(reply.created_at), "dd/MM/yyyy, HH:mm", { locale: ptBR })}</span>
                                    </div>
                                    <p className="text-sm">{reply.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Reply Input */}
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Escreva uma resposta..."
                                value={replyTexts[comment.id] || ""}
                                onChange={(e) => setReplyTexts((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                                rows={2}
                                className="text-sm"
                              />
                              <Button
                                size="sm"
                                onClick={() => submitReply(comment.id)}
                                disabled={!replyTexts[comment.id]?.trim()}
                              >
                                ➕ Responder
                              </Button>
                            </div>
                          </div>
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
