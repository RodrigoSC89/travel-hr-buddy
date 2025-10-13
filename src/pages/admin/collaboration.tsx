"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface Profile {
  email: string;
}

interface Reply {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  author?: Profile;
}

interface Comment {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  reactions?: Record<string, number>;
  author?: Profile;
}

/**
 * Collaboration Page with Real-time Comments, Reactions, and Threaded Replies
 */
export default function CollaborationPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [comment, setComment] = useState("");
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchComments();
    const commentsChannel = supabase
      .channel("colab-comments-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "colab_comments" }, fetchComments)
      .on("postgres_changes", { event: "*", schema: "public", table: "colab_replies" }, fetchComments)
      .subscribe();
    return () => {
      supabase.removeChannel(commentsChannel);
    };
  }, []);

  async function fetchComments() {
    try {
      // Fetch comments with author information
      const { data: commentsData, error: commentsError } = await supabase
        .from("colab_comments")
        .select("id, text, created_at, author_id, reactions, author:profiles!colab_comments_author_id_fkey(email)")
        .order("created_at", { ascending: false });

      if (commentsError) throw commentsError;

      // Fetch all replies with author information
      const { data: repliesData, error: repliesError } = await supabase
        .from("colab_replies")
        .select("id, comment_id, text, created_at, author_id, author:profiles!colab_replies_author_id_fkey(email)")
        .order("created_at", { ascending: true });

      if (repliesError) throw repliesError;

      // Group replies by comment_id
      const repliesByComment: Record<string, Reply[]> = {};
      repliesData?.forEach((reply: Reply & { comment_id: string }) => {
        const commentId = reply.comment_id;
        if (!repliesByComment[commentId]) {
          repliesByComment[commentId] = [];
        }
        repliesByComment[commentId].push(reply);
      });

      setComments(commentsData || []);
      setReplies(repliesByComment);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Erro ao carregar comentários");
    }
  }

  async function submitComment() {
    if (!comment.trim()) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar autenticado");
        return;
      }

      const { error } = await supabase
        .from("colab_comments")
        .insert({ text: comment, author_id: user.id });

      if (!error) {
        toast.success("✅ Comentário enviado");
        setComment("");
      } else {
        toast.error("Erro ao enviar");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Erro ao enviar");
    }
  }

  async function addReaction(id: string, emoji: string) {
    try {
      const comment = comments.find((c) => c.id === id);
      const current = comment?.reactions || {};
      const count = current[emoji] || 0;
      const updated = { ...current, [emoji]: count + 1 };

      await supabase.from("colab_comments").update({ reactions: updated }).eq("id", id);
    } catch (error) {
      console.error("Error adding reaction:", error);
      toast.error("Erro ao adicionar reação");
    }
  }

  async function submitReply(commentId: string) {
    const text = replyText[commentId];
    if (!text?.trim()) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar autenticado");
        return;
      }

      const { error } = await supabase
        .from("colab_replies")
        .insert({ text, comment_id: commentId, author_id: user.id });

      if (!error) {
        setReplyText((prev) => ({ ...prev, [commentId]: "" }));
        toast.success("✉️ Resposta enviada");
      } else {
        toast.error("Erro ao responder");
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error("Erro ao responder");
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">🤝 Colaboração em Tempo Real com Notificações</h1>
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
        {comments.map((c) => (
          <Card key={c.id} className="mb-4 p-4">
            <p className="text-xs text-muted-foreground">🕒 {new Date(c.created_at).toLocaleString()}</p>
            <p>
              <strong>👤 {c.author?.email || "Anônimo"}</strong>
            </p>
            <p className="mt-1">{c.text}</p>
            <div className="mt-2 flex gap-2">
              {["👍", "❤️", "👏"].map((emoji) => (
                <button
                  key={emoji}
                  className="text-xl hover:scale-110 transition"
                  onClick={() => addReaction(c.id, emoji)}
                >
                  {emoji} {c.reactions?.[emoji] || 0}
                </button>
              ))}
            </div>

            <div className="ml-4 mt-4 border-l pl-4">
              <p className="text-sm font-semibold mb-2">💬 Respostas:</p>
              {(replies[c.id] || []).map((r) => (
                <div key={r.id} className="mb-2">
                  <p className="text-xs text-muted-foreground">🕒 {new Date(r.created_at).toLocaleString()}</p>
                  <p>
                    <strong>👤 {r.author?.email || "Anônimo"}</strong>: {r.text}
                  </p>
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
        ))}
      </ScrollArea>
    </div>
  );
}
