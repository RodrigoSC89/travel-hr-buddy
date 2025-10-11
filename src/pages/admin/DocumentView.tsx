import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [doc, setDoc] = useState<Document | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authorEmail, setAuthorEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) return;

      // Check if user is admin using user_roles table
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData?.role === "admin") {
        setIsAdmin(true);
      }
    };

    checkAdminRole();
  }, [user]);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;

      try {
        // Fetch document
        const { data: docData, error: docError } = await supabase
          .from("documents")
          .select("id, title, content, created_at, user_id")
          .eq("id", id)
          .single();

        if (docError) {
          console.error("Error fetching document:", docError);
          setLoading(false);
          return;
        }

        setDoc(docData);

        // If admin, fetch author email from profiles
        if (isAdmin && docData?.user_id) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", docData.user_id)
            .single();

          setAuthorEmail(profileData?.email || null);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error in fetchDocument:", error);
        setLoading(false);
      }
    };

    // Only fetch document if we've checked admin status
    if (user !== undefined) {
      fetchDocument();
    }
  }, [id, isAdmin, user]);

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
        <CardContent className="whitespace-pre-wrap p-4">
          {doc.content}
        </CardContent>
      </Card>
    </div>
  );
}
