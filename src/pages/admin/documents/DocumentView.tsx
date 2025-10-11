"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, ArrowLeft, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Document {
  title: string;
  content: string;
  created_at: string;
  generated_by: string;
}

export default function DocumentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userRole, isLoading: isLoadingPermissions } = usePermissions();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadDocument();
  }, [id]);

  useEffect(() => {
    // Check access after document is loaded and permissions are ready
    if (doc && !isLoadingPermissions && user) {
      checkAccess();
    }
  }, [doc, userRole, user, isLoadingPermissions]);

  const checkAccess = () => {
    if (!doc || !user) {
      setHasAccess(false);
      return;
    }

    // Admins and HR managers can view all documents
    if (userRole === "admin" || userRole === "hr_manager") {
      setHasAccess(true);
      return;
    }

    // Authors can view their own documents
    if (doc.generated_by === user.id) {
      setHasAccess(true);
      return;
    }

    setHasAccess(false);
  };

  const loadDocument = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_generated_documents")
        .select("title, content, created_at, generated_by")
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

  if (loading || isLoadingPermissions)
    return (
      <div className="p-8 text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando documento...
      </div>
    );

  if (!doc)
    return (
      <div className="p-8 text-destructive">Documento não encontrado.</div>
    );

  if (!hasAccess)
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive/20">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center space-y-2">
              <User className="w-8 h-8 text-destructive mx-auto" />
              <h3 className="font-semibold text-destructive">Acesso Negado</h3>
              <p className="text-sm text-muted-foreground">
                Você não tem permissão para visualizar este documento.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/documents")}
                className="mt-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );

  return (
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">📄 {doc.title}</h1>
          {user && doc.generated_by === user.id && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Seu Documento
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Criado em {format(new Date(doc.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
            locale: ptBR,
          })}
        </p>

        <Card>
          <CardContent className="whitespace-pre-wrap p-6">
            {doc.content}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
