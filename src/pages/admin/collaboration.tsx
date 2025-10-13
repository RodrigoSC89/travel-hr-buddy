"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  reactions?: Record<string, number>;
  author?: {
    email: string;
  };
}

interface Reply {
  id: string;
  comment_id: string;
  author_id: string;
  text: string;
  created_at: string;
  author?: {
    email: string;
  };
}

export default function CollaborationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  async function fetchComments() {
    try {
      const { data, error } = await supabase
        .from("colab_comments")
        .select("id, text, created_at, author_id, reactions, author:profiles(email)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setComments(data || []);
      
      // Fetch replies for all comments
      if (data && data.length > 0) {
        await fetchReplies();
      }
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
  }

  async function fetchReplies() {
    try {
      const { data, error } = await supabase
        .from("colab_replies")
        .select("id, comment_id, author_id, text, created_at, author:profiles(email)")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group replies by comment_id
      const repliesByComment: Record<string, Reply[]> = {};
      data?.forEach((reply) => {
        if (!repliesByComment[reply.comment_id]) {
          repliesByComment[reply.comment_id] = [];
        }
        repliesByComment[reply.comment_id].push(reply);
      });
      
      setReplies(repliesByComment);
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  }

  async function addReaction(id: string, emoji: string) {
    try {
      const comment = comments.find((c) => c.id === id);
      if (!comment) return;

      const current = comment.reactions || {};
      const count = current[emoji] || 0;
      const updated = { ...current, [emoji]: count + 1 };

      const { error } = await supabase
        .from("colab_comments")
        .update({ reactions: updated })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, reactions: updated } : c))
      );
    } catch (error) {
      console.error("Error adding reaction:", error);
      toast({
        title: "Erro ao adicionar reação",
        description: "Não foi possível adicionar a reação.",
        variant: "destructive",
      });
    }
  }

  async function submitReply(commentId: string) {
    const text = replyText[commentId];
    if (!text?.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar autenticado para responder.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("colab_replies")
        .insert({ 
          text, 
          comment_id: commentId,
          author_id: user.id 
        });

      if (error) throw error;

      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      await fetchReplies();
      
      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi publicada com sucesso.",
      });
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast({
        title: "Erro ao enviar resposta",
        description: "Não foi possível enviar sua resposta.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    fetchComments();

    // Subscribe to real-time updates for comments
    const commentsChannel = supabase
      .channel("colab_comments_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "colab_comments",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            fetchComments();
          } else if (payload.eventType === "UPDATE") {
            setComments((prev) =>
              prev.map((c) =>
                c.id === payload.new.id ? { ...c, ...payload.new } : c
              )
            );
          } else if (payload.eventType === "DELETE") {
            setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to real-time updates for replies
    const repliesChannel = supabase
      .channel("colab_replies_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "colab_replies",
        },
        () => {
          fetchReplies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(repliesChannel);
    };
  }, []);

  async function submitComment() {
    if (!comment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar autenticado para comentar.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("colab_comments")
        .insert({ 
          text: comment,
          author_id: user.id 
        });

      if (error) throw error;

      setComment("");
      await fetchComments();
      
      toast({
        title: "Comentário enviado",
        description: "Seu comentário foi publicado com sucesso.",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Erro ao enviar comentário",
        description: "Não foi possível enviar seu comentário.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/admin")}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">🤝 Colaboração em Tempo Real</h1>
      </div>

      {/* Comment Input */}
      <Card className="p-4 space-y-2">
        <Textarea
          placeholder="💬 Deixe seu comentário ou sugestão..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
        />
        <Button 
          onClick={submitComment} 
          disabled={!comment.trim()}
          className="w-full sm:w-auto"
        >
          ✉️ Enviar Comentário
        </Button>
      </Card>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle>Comentários da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Carregando...</p>
                </div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <Card key={c.id} className="p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      🕒 {new Date(c.created_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="font-semibold mb-2">
                      👤 {c.author?.email || "Anônimo"}
                    </p>
                    <p className="text-sm whitespace-pre-wrap mb-3">{c.text}</p>
                    
                    {/* Reactions */}
                    <div className="flex gap-2 mb-4">
                      {["👍", "❤️", "👏"].map((emoji) => (
                        <button
                          key={emoji}
                          className="text-xl hover:scale-110 transition-transform px-2 py-1 rounded hover:bg-gray-100"
                          onClick={() => addReaction(c.id, emoji)}
                        >
                          {emoji} {c.reactions?.[emoji] || 0}
                        </button>
                      ))}
                    </div>

                    {/* Replies Section */}
                    <div className="ml-4 mt-4 border-l-2 border-gray-200 pl-4">
                      <p className="text-sm font-semibold mb-2">💬 Respostas:</p>
                      {(replies[c.id] || []).map((r) => (
                        <div key={r.id} className="mb-2 p-2 bg-gray-50 rounded">
                          <p className="text-xs text-muted-foreground">
                            🕒 {new Date(r.created_at).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-sm">
                            <strong>👤 {r.author?.email || "Anônimo"}</strong>: {r.text}
                          </p>
                        </div>
                      ))}
                      <Textarea
                        className="mt-2"
                        placeholder="Responder..."
                        value={replyText[c.id] || ""}
                        onChange={(e) =>
                          setReplyText((prev) => ({ ...prev, [c.id]: e.target.value }))
                        }
                      />
                      <Button
                        className="mt-1"
                        onClick={() => submitReply(c.id)}
                        disabled={!replyText[c.id]?.trim()}
                      >
                        ➕ Responder
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
