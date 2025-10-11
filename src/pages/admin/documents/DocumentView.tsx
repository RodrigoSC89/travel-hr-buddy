"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface Comment {
  content: string;
  created_at: string;
}

export default function DocumentViewPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authorEmail, setAuthorEmail] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!id) return;
    loadDocument();
    loadComments();
  }, [id]);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    // Check if user is admin (simplified - you may have a different way to check this)
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setIsAdmin(profile?.role === "admin");
    }
  }

  async function loadDocument() {
    const { data } = await supabase
      .from("ai_generated_documents")
      .select("id, title, content, created_at, generated_by")
      .eq("id", id)
      .single();
    
    if (data) {
      setDoc({
        id: data.id,
        title: data.title,
        content: data.content,
        created_at: data.created_at,
        user_id: data.generated_by
      });
      setNewContent(data.content);

      // Load author email if admin (from profiles table)
      if (data.generated_by && isAdmin) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", data.generated_by)
          .single();
        if (profileData?.email) {
          setAuthorEmail(profileData.email);
        }
      }
    }
    setLoading(false);
  }

  async function loadComments() {
    // Placeholder for comments - you'll need to create a comments table
    setComments([]);
  }

  async function saveChanges() {
    if (!doc || !user) return;

    try {
      // Get current version number
      const { data: versions } = await supabase
        .from("document_versions")
        .select("version_number")
        .eq("document_id", doc.id)
        .order("version_number", { ascending: false })
        .limit(1);

      const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

      // Save current content as a version
      const { error: versionError } = await supabase
        .from("document_versions")
        .insert({
          document_id: doc.id,
          version_number: nextVersion,
          title: doc.title,
          content: newContent,
          edited_by: user.id
        });

      if (versionError) throw versionError;

      // Update the main document
      const { error: updateError } = await supabase
        .from("ai_generated_documents")
        .update({ 
          content: newContent,
          updated_at: new Date().toISOString()
        })
        .eq("id", doc.id);

      if (updateError) throw updateError;

      toast({
        title: "Documento atualizado",
        description: "As alterações foram salvas com sucesso.",
      });

      setEditing(false);
      loadDocument();
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  }

  async function submitComment() {
    // Placeholder for comment submission
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Comentários serão implementados em breve.",
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

      <div className="flex gap-2">
        {canEdit && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            ✏️ Editar Documento
          </Button>
        )}
        <Link to={`/admin/documents/history/${id}`}>
          <Button variant="ghost" size="sm">📜 Ver Histórico</Button>
        </Link>
      </div>

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
            <p>{doc.content}</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">💬 Comentários</h2>
        <div className="space-y-2 mb-4">
          {comments.map((c, i) => (
            <div key={i} className="bg-muted rounded p-2 text-sm">
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
