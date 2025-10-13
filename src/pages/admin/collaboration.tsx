import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
 * Collaboration Page with Emoji Reactions and Threaded Replies
 */
export default function CollaborationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchComments();
    setupRealtimeSubscriptions();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchComments = async () => {
    try {
      const { data: commentsData, error } = await supabase
        .from("colab_comments")
        .select(`
          *,
          profiles:author_id (email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedComments = commentsData?.map((comment) => ({
        id: comment.id,
        author_id: comment.author_id,
        text: comment.text,
        created_at: comment.created_at,
        author_email: comment.profiles?.email,
        reactions: comment.reactions || {},
      })) || [];

      setComments(formattedComments);

      // Fetch replies for each comment
      for (const comment of formattedComments) {
        await fetchReplies(comment.id);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Erro ao carregar comentários",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (commentId: string) => {
    try {
      const { data: repliesData, error } = await supabase
        .from("colab_replies")
        .select(`
          *,
          profiles:author_id (email)
        `)
        .eq("comment_id", commentId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formattedReplies = repliesData?.map((reply) => ({
        id: reply.id,
        comment_id: reply.comment_id,
        author_id: reply.author_id,
        text: reply.text,
        created_at: reply.created_at,
        author_email: reply.profiles?.email,
      })) || [];

      setReplies(prev => ({ ...prev, [commentId]: formattedReplies }));
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to comments changes
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

    // Subscribe to replies changes
    const repliesChannel = supabase
      .channel("colab_replies_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "colab_replies" },
        (payload) => {
          const newReply = payload.new as Reply | null;
          if (newReply?.comment_id) {
            fetchReplies(newReply.comment_id);
          }
        }
      )
      .subscribe();

    return () => {
      commentsChannel.unsubscribe();
      repliesChannel.unsubscribe();
    };
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!currentUserId) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para comentar",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("colab_comments").insert({
        author_id: currentUserId,
        text: newComment,
      });

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Sucesso",
        description: "Comentário adicionado com sucesso",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Erro ao adicionar comentário",
        description: error instanceof Error ? error.message : "Erro desconhecido",
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
      console.error("Error adding reaction:", error);
      toast({
        title: "Erro ao adicionar reação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const submitReply = async (commentId: string) => {
    const replyText = replyTexts[commentId];
    if (!replyText?.trim()) return;
    if (!currentUserId) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para responder",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("colab_replies").insert({
        comment_id: commentId,
        author_id: currentUserId,
        text: replyText,
      });

      if (error) throw error;

      setReplyTexts(prev => ({ ...prev, [commentId]: "" }));
      toast({
        title: "Sucesso",
        description: "Resposta adicionada com sucesso",
      });
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast({
        title: "Erro ao adicionar resposta",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => navigate("/admin")} className="mb-4">
          ← Voltar
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Colaboração</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Carregando comentários...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button variant="outline" onClick={() => navigate("/admin")} className="mb-4">
        ← Voltar
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Colaboração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Escreva um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Adicionar Comentário
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">
                      {comment.author_email || "Usuário"} • {new Date(comment.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <p className="text-base">{comment.text}</p>
                </div>

                {/* Reactions */}
                <div className="flex items-center gap-2 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addReaction(comment.id, "👍")}
                    className="hover:bg-primary/10"
                  >
                    👍 {comment.reactions["👍"] || 0}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addReaction(comment.id, "❤️")}
                    className="hover:bg-primary/10"
                  >
                    ❤️ {comment.reactions["❤️"] || 0}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addReaction(comment.id, "👏")}
                    className="hover:bg-primary/10"
                  >
                    👏 {comment.reactions["👏"] || 0}
                  </Button>
                </div>

                {/* Replies Section */}
                {replies[comment.id] && replies[comment.id].length > 0 && (
                  <div className="ml-6 mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
                    <p className="text-sm font-medium">💬 Respostas:</p>
                    {replies[comment.id].map((reply) => (
                      <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          🕒 {new Date(reply.created_at).toLocaleString("pt-BR")}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          👤 {reply.author_email || "Usuário"}:
                        </p>
                        <p className="text-sm">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                <div className="ml-6 mt-4 space-y-2 border-l-2 border-gray-200 pl-4">
                  <Textarea
                    placeholder="Escrever uma resposta..."
                    value={replyTexts[comment.id] || ""}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                    className="min-h-[80px]"
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
