import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface Document {
  id?: string;
  title?: string;
  content: string;
  updated_by?: string;
  updated_at?: string;
  created_at?: string;
}

/**
 * Create a new document in the database
 * @param doc Document data to create
 * @returns Created document or null on error
 */
export async function createDocument(doc: Document): Promise<Document | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.error("User not authenticated");
      return null;
    }

    const { data, error } = await supabase
      .from("documents")
      .insert({
        content: doc.content,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      logger.error("Error creating document:", error);
      return null;
    }

    return data;
  } catch (err) {
    logger.error("Exception creating document:", err);
    return null;
  }
}

/**
 * Get a document by ID
 * @param id Document ID
 * @returns Document or null if not found
 */
export async function getDocument(id: string): Promise<Document | null> {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logger.error("Error fetching document:", error);
      return null;
    }

    return data;
  } catch (err) {
    logger.error("Exception fetching document:", err);
    return null;
  }
}

/**
 * Update a document
 * @param id Document ID
 * @param content New content
 * @returns Updated document or null on error
 */
export async function updateDocument(id: string, content: string): Promise<Document | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.error("User not authenticated");
      return null;
    }

    const { data, error } = await supabase
      .from("documents")
      .update({
        content,
        updated_by: user.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating document:", error);
      return null;
    }

    return data;
  } catch (err) {
    logger.error("Exception updating document:", err);
    return null;
  }
}

/**
 * Delete a document
 * @param id Document ID
 * @returns True if deleted successfully, false otherwise
 */
export async function deleteDocument(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Error deleting document:", error);
      return false;
    }

    return true;
  } catch (err) {
    logger.error("Exception deleting document:", err);
    return false;
  }
}

/**
 * List all documents
 * @returns Array of documents
 */
export async function listDocuments(): Promise<Document[]> {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error listing documents:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    logger.error("Exception listing documents:", err);
    return [];
  }
}
