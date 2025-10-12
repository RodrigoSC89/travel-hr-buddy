"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
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
  author?: {
    email: string;
  };
}

export default function CollaborationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchComments() {
    try {
      const { data, error } = await supabase
        .from("colab_comments")
        .select("id, text, created_at, author_id, author:profiles(email)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setComments(data || []);
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

  useEffect(() => {
    fetchComments();
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
                    <p className="text-sm whitespace-pre-wrap">{c.text}</p>
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
