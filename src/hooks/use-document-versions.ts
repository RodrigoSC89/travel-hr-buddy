import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type DocumentVersion = Database["public"]["Tables"]["document_versions"]["Row"];

export function useDocumentVersions(documentId: string | undefined) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) return;

    const fetchVersions = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("document_versions")
          .select("*")
          .eq("document_id", documentId)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;
        setVersions(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [documentId]);

  return { versions, loading, error };
}
