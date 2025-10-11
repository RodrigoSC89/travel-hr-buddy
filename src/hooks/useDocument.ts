import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Document {
  title: string;
  content: string;
  created_at: string;
}

interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  created_at: string;
  updated_by: string | null;
}

export function useDocument(id: string | undefined) {
  const [doc, setDoc] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);

  const loadDocument = async () => {
    if (!id) return;

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
    if (!id) return;

    setLoadingVersions(true);
    try {
      const { data, error } = await supabase
        .from("document_versions")
        .select("*")
        .eq("document_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVersions(data || []);
      setShowVersions(true);
    } catch (error) {
      console.error("Error loading versions:", error);
      toast({
        title: "Erro ao carregar versões",
        description: "Não foi possível carregar o histórico de versões.",
        variant: "destructive",
      });
    } finally {
      setLoadingVersions(false);
    }
  };

  const restoreVersion = async (versionId: string, versionContent: string) => {
    if (!id) return;

    setRestoringVersionId(versionId);
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update the document (this will automatically create a new version via trigger)
      const { error: updateError } = await supabase
        .from("ai_generated_documents")
        .update({ content: versionContent })
        .eq("id", id);

      if (updateError) throw updateError;

      // Log the restoration
      const { error: logError } = await supabase
        .from("document_restore_logs")
        .insert({
          document_id: id,
          version_id: versionId,
          restored_by: user.id,
        });

      if (logError) {
        console.error("Error logging restoration:", logError);
        // Don't fail the operation if logging fails
      }

      toast({
        title: "Versão restaurada",
        description: "A versão anterior foi restaurada com sucesso.",
      });

      // Reload document
      await loadDocument();

      // Reload versions to show the new version created by restoration
      await loadVersions();
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Erro ao restaurar versão",
        description: "Não foi possível restaurar a versão anterior.",
        variant: "destructive",
      });
    } finally {
      setRestoringVersionId(null);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadDocument();
  }, [id]);

  return {
    doc,
    versions,
    loading,
    loadingVersions,
    showVersions,
    restoringVersionId,
    loadVersions,
    restoreVersion,
  };
}
