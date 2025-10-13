import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Handshake, Mail, Clock } from "lucide-react";

interface Reply {
  id: string;
  comment_id: string;
  author_id: string;
  text: string;
  created_at: string;
  author?: { email: string };
}

interface Comment {
  id: string;
  author_id: string;
  text: string;
  created_at: string;
  reactions?: Record<string, number>;
  author?: { email: string };
}

export default function CollaborationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [newComment, setNewComment] = useState("");
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const emojis = ["👍", "❤️", "👏"];

  useEffect(() => {
    fetchComments();
    
    // Subscribe to comment changes
    const commentsChannel = supabase
      .channel("colab_comments_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "colab_comments" },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    // Subscribe to reply changes
    const repliesChannel = supabase
      .channel("colab_replies_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "colab_replies" },
        () => {
          fetchAllReplies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(repliesChannel);
    };
  }, []);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("colab_comments")
        .select("id, text, created_at, author_id, reactions, author:profiles(email)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
      
      // Fetch replies for all comments
      if (data && data.length > 0) {
        fetchAllReplies();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao carregar comentários",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReplies = async () => {
    try {
      const { data, error } = await supabase
        .from("colab_replies")
        .select("id, comment_id, author_id, text, created_at, author:profiles(email)")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group replies by comment_id
      const groupedReplies: Record<string, Reply[]> = {};
      (data || []).forEach((reply) => {
        if (!groupedReplies[reply.comment_id]) {
          groupedReplies[reply.comment_id] = [];
        }
        groupedReplies[reply.comment_id].push(reply);
      });

      setReplies(groupedReplies);
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("colab_comments").insert({
        text: newComment,
        author_id: user.id,
        reactions: {},
      });

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Sucesso",
        description: "Comentário enviado!",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao enviar comentário",
        description: message,
        variant: "destructive",
      });
    }
  };

  const addReaction = async (commentId: string, emoji: string) => {
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      const currentReactions = comment.reactions || {};
      const newReactions = {
        ...currentReactions,
        [emoji]: (currentReactions[emoji] || 0) + 1,
      };

      const { error } = await supabase
        .from("colab_comments")
        .update({ reactions: newReactions })
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "Reação adicionada",
        description: `Você reagiu com ${emoji}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao adicionar reação",
        description: message,
        variant: "destructive",
      });
    }
  };

  const submitReply = async (commentId: string) => {
    const replyText = replyTexts[commentId];
    if (!replyText?.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("colab_replies").insert({
        comment_id: commentId,
        text: replyText,
        author_id: user.id,
      });

      if (error) throw error;

      setReplyTexts({ ...replyTexts, [commentId]: "" });
      toast({
        title: "Sucesso",
        description: "Resposta enviada!",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao enviar resposta",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="outline"
        onClick={() => navigate("/admin")}
        className="mb-4"
      >
        ← Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="w-5 h-5" />
            Colaboração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Comment Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Escreva seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              onClick={submitComment}
              disabled={!newComment.trim()}
              className="w-full sm:w-auto"
            >
              ✉️ Enviar Comentário
            </Button>
          </div>

          {/* Comments List */}
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </p>
              ) : (
                comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-6 space-y-3">
                      {/* Comment Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{comment.author?.email || "Usuário"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(comment.created_at).toLocaleString("pt-BR")}
                        </div>
                      </div>

                      {/* Comment Text */}
                      <p className="text-sm">{comment.text}</p>

                      {/* Reactions */}
                      <div className="flex gap-2 pt-2">
                        {emojis.map((emoji) => (
                          <Button
                            key={emoji}
                            variant="outline"
                            size="sm"
                            onClick={() => addReaction(comment.id, emoji)}
                            className="h-8 px-3"
                          >
                            {emoji} {comment.reactions?.[emoji] || 0}
                          </Button>
                        ))}
                      </div>

                      {/* Replies Section */}
                      {replies[comment.id] && replies[comment.id].length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            💬 Respostas:
                          </p>
                          {replies[comment.id].map((reply) => (
                            <div
                              key={reply.id}
                              className="bg-gray-50 p-3 rounded-md space-y-1"
                            >
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(reply.created_at).toLocaleString("pt-BR")}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {reply.author?.email || "Usuário"}:
                              </div>
                              <p className="text-sm">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      <div className="mt-3 space-y-2">
                        <Textarea
                          placeholder="Responder..."
                          value={replyTexts[comment.id] || ""}
                          onChange={(e) =>
                            setReplyTexts({
                              ...replyTexts,
                              [comment.id]: e.target.value,
                            })
                          }
                          className="min-h-[60px]"
                        />
                        <Button
                          onClick={() => submitReply(comment.id)}
                          disabled={!replyTexts[comment.id]?.trim()}
                          size="sm"
                        >
                          ➕ Responder
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
