"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DocumentVersionHistory } from "@/components/documents/DocumentVersionHistory";
import { DocumentHeader } from "@/components/documents/DocumentHeader";
import { DocumentContent } from "@/components/documents/DocumentContent";
import { BackButton } from "@/components/documents/BackButton";

interface Document {
  title: string;
  content: string;
  created_at: string;
}

export default function DocumentViewPage() {
  const { id } = useParams();
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
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <BackButton />
        </div>

        <div className="space-y-4">
          {/* Document Title and Metadata */}
          <DocumentHeader title={doc.title} createdAt={doc.created_at} />

          {/* Document Content */}
          <DocumentContent content={doc.content} />

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
