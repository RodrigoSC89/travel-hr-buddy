"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Document {
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

export default function DocumentViewPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [authorEmail, setAuthorEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    
    loadDocument();
    loadComments();
    checkAdminStatus();
    
    // Subscribe to real-time comment updates
    const channel = supabase
      .channel(`document-comments-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "document_comments",
          filter: `document_id=eq.${id}`,
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  async function loadDocument() {
    if (!id) return;
    
    const { data, error } = await supabase
      .from("ai_generated_documents")
      .select("title, content, created_at, generated_by")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o documento.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (data) {
      setDoc({
        title: data.title,
        content: data.content,
        created_at: data.created_at,
        user_id: data.generated_by,
      });
      setNewContent(data.content);

      // Load author email if admin
      if (data.generated_by) {
        const { data: userData } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", data.generated_by)
          .single();

        if (!userData) {
          // Try auth.users if profiles doesn't exist
          const { data: authData } = await supabase.auth.admin.getUserById(
            data.generated_by
          );
          if (authData?.user) {
            setAuthorEmail(authData.user.email || null);
          }
        } else {
          setAuthorEmail(userData.email);
        }
      }
    }

    setLoading(false);
  }

  async function loadComments() {
    if (!id) return;

    const { data, error } = await supabase
      .from("document_comments")
      .select("*")
      .eq("document_id", id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setComments(data);
    }
  }

  async function checkAdminStatus() {
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);
  }

  async function saveChanges() {
    if (!id || !doc) return;

    // Save current version to history before updating
    const { error: versionError } = await supabase
      .from("document_versions")
      .insert({
        document_id: id,
        content: doc.content,
        updated_by: user?.id,
      });

    if (versionError) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o histórico de versões.",
        variant: "destructive",
      });
      return;
    }

    // Update document with new content
    const { error } = await supabase
      .from("ai_generated_documents")
      .update({ content: newContent })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
      return;
    }

    setEditing(false);
    setDoc({ ...doc, content: newContent });
    toast({
      title: "Sucesso",
      description: "Documento atualizado com sucesso.",
    });
  }

  async function submitComment() {
    if (!newComment || !id || !user?.id) return;

    const { error } = await supabase.from("document_comments").insert({
      content: newComment,
      document_id: id,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o comentário.",
        variant: "destructive",
      });
      return;
    }

    setNewComment("");
    toast({
      title: "Sucesso",
      description: "Comentário enviado.",
    });
  }

  if (loading)
    return (
      <div className="p-8 text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando documento...
      </div>
    );

  if (!doc)
    return <div className="p-8 text-destructive">Documento não encontrado.</div>;

  const canEdit = isAdmin || user?.id === doc.user_id;

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">📄 {doc.title}</h1>
      <p className="text-sm text-muted-foreground">
        Criado em {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm")}
      </p>
      {isAdmin && authorEmail && (
        <p className="text-sm text-muted-foreground">Autor: {authorEmail}</p>
      )}

      <Card>
        <CardContent className="whitespace-pre-wrap p-4 space-y-4">
          {editing ? (
            <>
              <Textarea
                rows={12}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
              <Button onClick={saveChanges}>
                <Save className="w-4 h-4 mr-2" /> Salvar Alterações
              </Button>
            </>
          ) : (
            <>
              <p>{doc.content}</p>
              {canEdit && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  ✏️ Editar Documento
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">💬 Comentários</h2>
        <div className="space-y-2 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="bg-muted rounded p-2 text-sm">
              {c.content}
              <div className="text-xs text-muted-foreground">
                {format(new Date(c.created_at), "dd/MM/yyyy HH:mm")}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="Escreva um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button onClick={submitComment}>Enviar</Button>
        </div>
      </div>
    </div>
  );
}
