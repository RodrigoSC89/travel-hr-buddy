import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [authorEmail, setAuthorEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    const loadDocument = async () => {
      setLoading(true);

      // Check if user is admin
      const { data: orgUser } = await supabase
        .from("organization_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      const userIsAdmin = orgUser?.role === "admin" || orgUser?.role === "owner";
      setIsAdmin(userIsAdmin);

      // Fetch document
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading document:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar documento",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (data) {
        setDoc(data);
        setNewContent(data.content);

        // Fetch author email
        const { data: author } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", data.user_id)
          .single();

        setAuthorEmail(author?.email || null);
      }

      setLoading(false);
    };

    loadDocument();
  }, [id, user, toast]);

  async function saveChanges() {
    if (!doc || !id || !newContent) return;

    const { error } = await supabase
      .from("documents")
      .update({ content: newContent })
      .eq("id", id);

    if (!error) {
      setEditing(false);
      setDoc({ ...doc, content: newContent });
      toast({
        title: "Sucesso",
        description: "Documento atualizado com sucesso",
      });
    } else {
      toast({
        title: "Erro",
        description: "Erro ao salvar alterações",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando documento...
      </div>
    );
  }

  if (!doc) {
    return <div className="p-8 text-destructive">Documento não encontrado.</div>;
  }

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
              <div className="flex gap-2">
                <Button onClick={saveChanges}>
                  <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                </Button>
                <Button variant="outline" onClick={() => {
                  setEditing(false);
                  setNewContent(doc.content);
                }}>
                  Cancelar
                </Button>
              </div>
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
    </div>
  );
}
