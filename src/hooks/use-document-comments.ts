import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type DocumentComment = Database["public"]["Tables"]["document_comments"]["Row"];

export function useDocumentComments(documentId: string | undefined) {
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) return;

    // Fetch initial comments
    const fetchComments = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("document_comments")
          .select("*")
          .eq("document_id", documentId)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;
        setComments(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`comments:${documentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "document_comments",
          filter: `document_id=eq.${documentId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setComments((prev) => [payload.new as DocumentComment, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setComments((prev) =>
              prev.filter((c) => c.id !== (payload.old as DocumentComment).id)
            );
          } else if (payload.eventType === "UPDATE") {
            setComments((prev) =>
              prev.map((c) =>
                c.id === (payload.new as DocumentComment).id ? (payload.new as DocumentComment) : c
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [documentId]);

  const addComment = async (content: string) => {
    if (!documentId) return null;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error: insertError } = await supabase
      .from("document_comments")
      .insert({
        document_id: documentId,
        user_id: user?.id,
        content: content,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return data;
  };

  const deleteComment = async (commentId: string) => {
    const { error: deleteError } = await supabase
      .from("document_comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) throw deleteError;
  };

  return { comments, loading, error, addComment, deleteComment };
}
