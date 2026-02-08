"use client";

/**
 * DEBT-FIX: Removed (supabase as any) for ai_generated_documents (exists) and document_comments
 * document_comments doesn't exist in schema - using in-memory storage
 */

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
import { useUserProfile } from "@/hooks";
import { logger } from "@/lib/logger";

interface Document {
  title: string;
  content: string | null;
  created_at: string;
  created_by: string | null;
}

interface DocumentComment {
  id: string;
  document_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
  user_email?: string;
}

// In-memory comment storage (document_comments table doesn't exist)
const commentStore: DocumentComment[] = [];

export default function DocumentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const [doc, setDoc] = useState<Document | null>(null);
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!id) return;
    loadDocument();
    loadCurrentUser();
  }, [id]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      logger.error("Error loading current user:", error);
    }
  };

  const fetchUserEmail = async (userId: string | null): Promise<string> => {
    if (!userId) return "Usuário desconhecido";
    
    try {
      const { data: userData } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();
      
      return userData?.email || "Usuário desconhecido";
    } catch (error) {
      logger.error("Error fetching user email:", error);
      return "Usuário desconhecido";
    }
  };

  const loadDocument = async () => {
    try {
      // ai_generated_documents exists in typed schema
      const { data, error } = await supabase
        .from("ai_generated_documents")
        .select("title, content, created_at, created_by")
        .eq("id", id!)
        .single();

      if (error) throw error;

      const transformedData: Document = {
        title: data.title,
        content: data.content,
        created_at: data.created_at,
        created_by: data.created_by,
      };

      setDoc(transformedData);
    } catch (error) {
      logger.error("Error loading document:", error);
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
      // document_comments table doesn't exist - load from in-memory store
      const docComments = commentStore
        .filter(c => c.document_id === id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      const commentsWithEmails = await Promise.all(
        docComments.map(async (comment) => ({
          ...comment,
          user_email: await fetchUserEmail(comment.user_id)
        }))
      );

      setComments(commentsWithEmails);
      setShowComments(true);
    } catch (error) {
      logger.error("Error loading comments:", error);
      toast({
        title: "Erro ao carregar comentários",
        description: "Não foi possível carregar os comentários.",
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const addComment = async () => {
    if (!id || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const userEmail = await fetchUserEmail(user.id);

      const comment: DocumentComment = {
        id: `comment-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`,
        document_id: id,
        user_id: user.id,
        content: newComment.trim(),
        created_at: new Date().toISOString(),
        user_email: userEmail,
      };

      commentStore.push(comment);
      setComments(prev => [...prev, comment]);
      setNewComment("");
      
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi adicionado com sucesso.",
      });
    } catch (error) {
      logger.error("Error adding comment:", error);
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
      const idx = commentStore.findIndex(c => c.id === commentId);
      if (idx !== -1) {
        commentStore.splice(idx, 1);
      }
      setComments(prev => prev.filter(c => c.id !== commentId));

      toast({
        title: "Comentário excluído",
        description: "O comentário foi excluído com sucesso.",
      });
    } catch (error) {
      logger.error("Error deleting comment:", error);
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
            onClick={() => navigate(`/admin/documents/history/${id}`)}
          >
            📜 Ver Histórico Completo
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Conteúdo Atual</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap">
              {doc.content}
            </CardContent>
          </Card>

          <DocumentVersionHistory 
            documentId={id!} 
            onRestore={loadDocument}
          />

          {showComments && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comentários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
