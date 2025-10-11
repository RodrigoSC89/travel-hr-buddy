"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/contexts/AuthContext";

interface Document {
  title: string;
  content: string;
  created_at: string;
  generated_by: string;
}

export default function DocumentViewPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { userRole, isLoading: isLoadingRole } = usePermissions();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!id || !user || isLoadingRole) return;

    const fetchDocument = async () => {
      try {
        const { data, error } = await supabase
          .from("ai_generated_documents")
          .select("title, content, created_at, generated_by")
          .eq("id", id)
          .single();

        if (error) {
          setDoc(null);
          setLoading(false);
          return;
        }

        // Check access: admin/hr_manager can view all, others only their own
        const isAdmin = userRole === "admin" || userRole === "hr_manager";
        const isOwner = data.generated_by === user.id;

        if (!isAdmin && !isOwner) {
          setAccessDenied(true);
          setDoc(null);
        } else {
          setDoc(data);
        }
      } catch (err) {
        setDoc(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, user, userRole, isLoadingRole]);

  if (loading || isLoadingRole) {
    return (
      <div className="p-8 text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando documento...
      </div>
    );
  }

  if (accessDenied) {
    return (
      <RoleBasedAccess roles={["admin", "hr_manager"]}>
        <div className="p-8 space-y-4">
          <h1 className="text-2xl font-bold">📄 Documento</h1>
        </div>
      </RoleBasedAccess>
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

      <Card>
        <CardContent className="whitespace-pre-wrap p-4">
          {doc.content}
        </CardContent>
      </Card>
    </div>
  );
}
