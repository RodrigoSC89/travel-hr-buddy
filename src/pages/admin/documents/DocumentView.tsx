"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, ArrowLeft, MessageSquare, Send, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DocumentVersionHistory } from "@/components/documents/DocumentVersionHistory";
import { useAuthProfile } from "@/hooks/use-auth-profile";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Document {
  title: string;
  content: string;
  created_at: string;
  generated_by: string | null;
  author_email?: string;
  author_name?: string;
}

interface DocumentComment {
  id: string;
  document_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
  user_email?: string;
}

export default function DocumentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthProfile();
  const [doc, setDoc] = useState<Document | null>(null);
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  // Check if current user is admin
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!id) return;
    loadDocument();
    loadCurrentUser();
  }, [id]);

  // Cleanup realtime subscription on unmount
  useEffect(() => {
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [realtimeChannel]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const fetchUserEmail = async (userId: string | null): Promise<string> => {
    if (!userId) {
      return "Usuário desconhecido";
    }
    
    try {
      const { data: userData } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();
      
      return userData?.email || "Usuário desconhecido";
    } catch (error) {
      console.error("Error fetching user email:", error);
      return "Usuário desconhecido";
    }
  };

  const loadDocument = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_generated_documents")
        .select(`
          title, 
          content, 
          created_at, 
          generated_by,
          profiles:generated_by (
            email,
            full_name
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        author_email: data.profiles?.email,
        author_name: data.profiles?.full_name,
      };

      setDoc(transformedData);
    } catch (error) {
      console.error("Error loading document:", error);
      toast({
        title: "Erro ao carregar documento",
        description: "Não foi possível carregar o documento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!id) return;
    
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("document_comments")
        .select(`
          id,
          document_id,
          user_id,
          content,
          created_at
        `)
        .eq("document_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch user emails for comments
      const commentsWithEmails = await Promise.all(
        (data || []).map(async (comment) => ({
          ...comment,
          user_email: await fetchUserEmail(comment.user_id)
        }))
      );

      setComments(commentsWithEmails);
      setShowComments(true);

      // Subscribe to real-time updates
      subscribeToComments();
    } catch (error) {
      console.error("Error loading comments:", error);
      toast({
        title: "Erro ao carregar comentários",
        description: "Não foi possível carregar os comentários.",
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const subscribeToComments = () => {
    if (!id || realtimeChannel) return;

    const channel = supabase
      .channel(`document_comments:${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "document_comments",
          filter: `document_id=eq.${id}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newComment = payload.new as DocumentComment;
            
            // Fetch user email
            newComment.user_email = await fetchUserEmail(newComment.user_id);

            setComments((prev) => [...prev, newComment]);
          } else if (payload.eventType === "DELETE") {
            setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            const updatedComment = payload.new as DocumentComment;
            
            // Fetch user email
            updatedComment.user_email = await fetchUserEmail(updatedComment.user_id);

            setComments((prev) =>
              prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
            );
          }
        }
      )
      .subscribe();

    setRealtimeChannel(channel);
  };

  const addComment = async () => {
    if (!id || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("document_comments")
        .insert({
          document_id: id,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment("");
      
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi adicionado com sucesso.",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Erro ao adicionar comentário",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);
    try {
      const { error } = await supabase
        .from("document_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "Comentário excluído",
        description: "O comentário foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Erro ao excluir comentário",
        description: "Não foi possível excluir o comentário.",
        variant: "destructive",
      });
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (loading)
    return (
      <RoleBasedAccess roles={["admin", "hr_manager"]}>
        <div className="p-8 text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando documento...
        </div>
      </RoleBasedAccess>
    );

  if (!doc)
    return (
      <RoleBasedAccess roles={["admin", "hr_manager"]}>
        <div className="p-8 text-destructive">Documento não encontrado.</div>
      </RoleBasedAccess>
    );

  return (
    <RoleBasedAccess roles={["admin", "hr_manager"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/documents")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadComments}
            disabled={loadingComments}
          >
            {loadingComments ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4 mr-2" />
            )}
            {showComments ? "Atualizar Comentários" : "Ver Comentários"}
          </Button>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">📄 {doc.title}</h1>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Criado em {format(new Date(doc.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
            {/* Author information - name shown to all, email only to admins */}
            {(doc.author_name || (isAdmin && doc.author_email)) && (
              <p className="text-sm text-muted-foreground">
                Autor: {doc.author_name || "Desconhecido"}
                {isAdmin && doc.author_email && (
                  <span className="ml-2 text-xs font-mono">
                    ({doc.author_email})
                  </span>
                )}
              </p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Conteúdo Atual</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap">
              {doc.content}
            </CardContent>
          </Card>

          {/* Version History Component */}
          <DocumentVersionHistory 
            documentId={id!} 
            onRestore={loadDocument}
          />

          {/* Comments Section */}
          {showComments && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comentários em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Comment List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Nenhum comentário ainda. Seja o primeiro a comentar!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <Card key={comment.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {comment.user_email?.charAt(0).toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {comment.user_email || "Usuário desconhecido"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(comment.created_at), "dd/MM/yyyy 'às' HH:mm", {
                                      locale: ptBR,
                                    })}
                                  </span>
                                </div>
                                {comment.user_id === currentUserId && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteComment(comment.id)}
                                    disabled={deletingCommentId === comment.id}
                                  >
                                    {deletingCommentId === comment.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    )}
                                  </Button>
                                )}
                              </div>
                              <p className="text-sm whitespace-pre-wrap">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <Separator />

                {/* Add Comment Form */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Adicione um comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submittingComment}
                    className="min-h-20"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={addComment}
                      disabled={submittingComment || !newComment.trim()}
                      size="sm"
                    >
                      {submittingComment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Comentar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </RoleBasedAccess>
  );
}
