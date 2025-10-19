import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface Document {
  id?: string;
  title?: string;
  content: string;
  prompt?: string;
  updated_by?: string;
  updated_at?: string;
  created_at?: string;
}

/**
 * Create a new document in the database
 * If title and/or prompt are provided, saves to ai_generated_documents table
 * Otherwise saves to documents table for collaborative editing
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

    // If title or prompt is provided, use ai_generated_documents table
    if (doc.title || doc.prompt) {
      const { data, error } = await supabase
        .from("ai_generated_documents")
        .insert({
          title: doc.title || "Untitled Document",
          content: doc.content,
          prompt: doc.prompt || "",
          generated_by: user.id,
        })
        .select()
        .single();

      if (error) {
        logger.error("Error creating AI document:", error);
        return null;
      }

      return data;
    }

    // Otherwise use documents table for collaborative editing
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
 * @param updates Document fields to update
 * @returns Updated document or null on error
 */
export async function updateDocument(id: string, updates: Partial<Document>): Promise<Document | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.error("User not authenticated");
      return null;
    }

    // Try to update in ai_generated_documents first
    if (updates.title !== undefined || updates.prompt !== undefined) {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.prompt !== undefined) updateData.prompt = updates.prompt;

      const { data, error } = await supabase
        .from("ai_generated_documents")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    }

    // Otherwise update in documents table
    const { data, error } = await supabase
      .from("documents")
      .update({
        content: updates.content,
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
