"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, ArrowLeft, History, MessageSquare, Send, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Document {
  title: string;
  content: string;
  created_at: string;
}

interface DocumentVersion {
  id: string;
  content: string;
  created_at: string;
  updated_by: string | null;
}

interface DocumentComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

export default function DocumentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadDocument();
    loadVersions();
    loadComments();
    getCurrentUser();
    subscribeToComments();
  }, [id]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadDocument = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_generated_documents")
        .select("title, content, created_at")
        .eq("id", id)
        .single();

      if (error) throw error;

      setDoc(data);
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

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from("document_versions")
        .select("*")
        .eq("document_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error("Error loading versions:", error);
    }
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from("document_comments")
        .select("*")
        .eq("document_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const subscribeToComments = () => {
    const subscription = supabase
      .channel(`comments:${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "document_comments",
          filter: `document_id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setComments((prev) => [payload.new as DocumentComment, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setComments((prev) => 
              prev.filter((c) => c.id !== (payload.old as DocumentComment).id)
            );
          } else if (payload.eventType === "UPDATE") {
            setComments((prev) =>
              prev.map((c) => (c.id === (payload.new as DocumentComment).id ? payload.new as DocumentComment : c))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId) return;

    setSubmittingComment(true);
    try {
      const { error } = await supabase
        .from("document_comments")
        .insert({
          document_id: id,
          user_id: currentUserId,
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

  const handleRestoreVersion = async (versionId: string) => {
    try {
      // Get the version content
      const { data: version, error: versionError } = await supabase
        .from("document_versions")
        .select("content")
        .eq("id", versionId)
        .single();

      if (versionError) throw versionError;

      // Update the document
      const { error: updateError } = await supabase
        .from("ai_generated_documents")
        .update({ content: version.content })
        .eq("id", id);

      if (updateError) throw updateError;

      toast({
        title: "Versão restaurada",
        description: "A versão anterior foi restaurada com sucesso.",
      });

      // Reload document and versions
      loadDocument();
      loadVersions();
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Erro ao restaurar versão",
        description: "Não foi possível restaurar a versão.",
        variant: "destructive",
      });
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
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">📄 {doc.title}</h1>
            <p className="text-sm text-muted-foreground">
              Criado em {format(new Date(doc.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>

          <Tabs defaultValue="document" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="document">
                Documento
              </TabsTrigger>
              <TabsTrigger value="versions">
                <History className="w-4 h-4 mr-2" />
                Histórico ({versions.length})
              </TabsTrigger>
              <TabsTrigger value="comments">
                <MessageSquare className="w-4 h-4 mr-2" />
                Comentários ({comments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="document" className="mt-4">
              <Card>
                <CardContent className="whitespace-pre-wrap p-6">
                  {doc.content}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="versions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Versões</CardTitle>
                </CardHeader>
                <CardContent>
                  {versions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma versão anterior disponível.
                    </p>
                  ) : (
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {versions.map((version, index) => (
                          <div key={version.id} className="border rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant={index === 0 ? "default" : "secondary"}>
                                  {index === 0 ? "Versão Atual" : `Versão ${versions.length - index}`}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(version.created_at), "dd/MM/yyyy 'às' HH:mm", {
                                    locale: ptBR,
                                  })}
                                </span>
                              </div>
                              {index > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestoreVersion(version.id)}
                                >
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Restaurar
                                </Button>
                              )}
                            </div>
                            <Separator />
                            <div className="text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                              {version.content.substring(0, 300)}
                              {version.content.length > 300 && "..."}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="mt-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Adicionar Comentário</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Escreva seu comentário aqui..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submittingComment}
                    >
                      {submittingComment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Comentário
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Comentários ({comments.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum comentário ainda. Seja o primeiro a comentar!
                      </p>
                    ) : (
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-4">
                          {comments.map((comment) => (
                            <div key={comment.id} className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {comment.user_id === currentUserId ? "Você" : "Usuário"}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {format(new Date(comment.created_at), "dd/MM/yyyy 'às' HH:mm", {
                                      locale: ptBR,
                                    })}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleBasedAccess>
  );
}
