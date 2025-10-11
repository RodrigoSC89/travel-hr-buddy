"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DocumentVersionHistory } from "@/components/documents/DocumentVersionHistory";

interface Document {
  title: string;
  content: string;
  created_at: string;
  generated_by: string | null;
  author_email?: string;
  author_name?: string;
}

export default function DocumentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadDocument();
  }, [id]);

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

      // Transform the data to flatten the profiles object
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
          <h1 className="text-3xl font-bold">📄 {doc.title}</h1>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Criado em {format(new Date(doc.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
            {(doc.author_name || doc.author_email) && (
              <p className="text-sm text-muted-foreground">
                Autor: {doc.author_name || doc.author_email || "Desconhecido"}
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
        </div>
      </div>
    </RoleBasedAccess>
  );
}
