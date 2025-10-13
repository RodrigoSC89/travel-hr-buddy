import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthProfile } from "@/hooks/use-auth-profile";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  author?: {
    email: string;
  };
  reactions?: Record<string, number>;
}

interface Reply {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  comment_id: string;
  author?: {
    email: string;
  };
}

/**
 * Collaboration Page with Permissions and Admin Panel
 * 
 * Features:
 * - Comments with author identification
 * - Threaded replies to comments
 * - Emoji reactions (👍, ❤️, 👏)
 * - Role-based access control (admin/user)
 * - Admin panel with special UI
 */
export default function CollaborationPage() {
  const navigate = useNavigate();
  const { profile } = useAuthProfile();
  const { toast } = useToast();
  
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const role = profile?.role || "user";

  // Fetch comments
  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("colab_comments")
        .select("id, text, created_at, author_id, author:profiles(email)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch reactions for each comment
      const commentsWithReactions = await Promise.all(
        (data || []).map(async (c) => {
          const { data: reactionsData } = await supabase
            .from("colab_reactions")
            .select("emoji")
            .eq("comment_id", c.id);

          const reactions: Record<string, number> = {};
          reactionsData?.forEach((r) => {
            reactions[r.emoji] = (reactions[r.emoji] || 0) + 1;
          });

          return { ...c, reactions };
        })
      );

      setComments(commentsWithReactions);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os comentários",
        variant: "destructive",
      });
    }
  };

  // Fetch replies for a specific comment
  const fetchReplies = async (commentId: string) => {
    try {
      const { data, error } = await supabase
        .from("colab_replies")
        .select("id, text, created_at, author_id, comment_id, author:profiles(email)")
        .eq("comment_id", commentId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setReplies((prev) => ({
        ...prev,
        [commentId]: data || [],
      }));
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  // Fetch all replies for all comments
  const fetchAllReplies = async () => {
    for (const comment of comments) {
      await fetchReplies(comment.id);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchComments();
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (comments.length > 0) {
      fetchAllReplies();
    }
  }, [comments.length]);

  // Submit a new comment
  const submitComment = async () => {
    if (!profile || !comment.trim()) return;

    try {
      const { error } = await supabase
        .from("colab_comments")
        .insert({ text: comment, author_id: profile.id });

      if (error) throw error;

      setComment("");
      toast({
        title: "Sucesso",
        description: "Comentário enviado com sucesso!",
      });
      await fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o comentário",
        variant: "destructive",
      });
    }
  };

  // Submit a reply to a comment
  const submitReply = async (commentId: string) => {
    if (!profile || !replyText[commentId]?.trim()) return;

    try {
      const { error } = await supabase
        .from("colab_replies")
        .insert({
          comment_id: commentId,
          author_id: profile.id,
          text: replyText[commentId],
        });

      if (error) throw error;

      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      toast({
        title: "Sucesso",
        description: "Resposta enviada com sucesso!",
      });
      await fetchReplies(commentId);
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a resposta",
        variant: "destructive",
      });
    }
  };

  // Add or toggle a reaction
  const addReaction = async (commentId: string, emoji: string) => {
    if (!profile) return;

    try {
      // Check if user already reacted with this emoji
      const { data: existing } = await supabase
        .from("colab_reactions")
        .select("id")
        .eq("comment_id", commentId)
        .eq("user_id", profile.id)
        .eq("emoji", emoji)
        .maybeSingle();

      if (existing) {
        // Remove reaction
        await supabase
          .from("colab_reactions")
          .delete()
          .eq("id", existing.id);
      } else {
        // Add reaction
        await supabase
          .from("colab_reactions")
          .insert({
            comment_id: commentId,
            user_id: profile.id,
            emoji,
          });
      }

      await fetchComments();
    } catch (error) {
      console.error("Error adding reaction:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a reação",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
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
          <CardContent className="p-6">
            <p>Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/admin")}
        >
          ← Voltar
        </Button>
        <h1 className="text-2xl font-bold">🤝 Colaboração com Permissões e Modo Admin</h1>
      </div>

      {role === "admin" && (
        <div className="bg-yellow-50 border p-4 rounded-md">
          <h2 className="font-semibold">🔐 Acesso Administrativo</h2>
          <p>Você tem acesso para visualizar todas as interações e estatísticas.</p>
        </div>
      )}

      <Card className="p-4 space-y-2">
        <Textarea
          placeholder="💬 Deixe seu comentário ou sugestão..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button onClick={submitComment} disabled={!comment.trim()}>
          ✉️ Enviar Comentário
        </Button>
      </Card>

      <ScrollArea className="h-[65vh] border rounded-md p-4 bg-white">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        ) : (
          comments.map((c) => (
            <Card key={c.id} className="mb-4 p-4">
              <p className="text-xs text-muted-foreground">🕒 {new Date(c.created_at).toLocaleString()}</p>
              <p><strong>👤 {c.author?.email || "Anônimo"}</strong></p>
              <p className="mt-1">{c.text}</p>
              <div className="mt-2 flex gap-2">
                {["👍", "❤️", "👏"].map((emoji) => (
                  <button
                    key={emoji}
                    className="text-xl hover:scale-110 transition"
                    onClick={() => addReaction(c.id, emoji)}>
                    {emoji} {c.reactions?.[emoji] || 0}
                  </button>
                ))}
              </div>
              <div className="ml-4 mt-4 border-l pl-4">
                <p className="text-sm font-semibold mb-2">💬 Respostas:</p>
                {(replies[c.id] || []).map((r) => (
                  <div key={r.id} className="mb-2">
                    <p className="text-xs text-muted-foreground">🕒 {new Date(r.created_at).toLocaleString()}</p>
                    <p><strong>👤 {r.author?.email || "Anônimo"}</strong>: {r.text}</p>
                  </div>
                ))}
                <Textarea
                  className="mt-2"
                  placeholder="Responder..."
                  value={replyText[c.id] || ""}
                  onChange={(e) => setReplyText((prev) => ({ ...prev, [c.id]: e.target.value }))}
                />
                <Button className="mt-1" onClick={() => submitReply(c.id)} disabled={!replyText[c.id]?.trim()}>
                  ➕ Responder
                </Button>
              </div>
            </Card>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
