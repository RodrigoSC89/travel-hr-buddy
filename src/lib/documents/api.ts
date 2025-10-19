/**
 * API functions for document operations
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface Document {
  id: string;
  title: string;
  content: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDocumentData {
  title: string;
  content: string;
}

/**
 * Create a new document
 */
export async function createDocument(documentData: CreateDocumentData): Promise<Document> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("ai_generated_documents")
      .insert({
        title: documentData.title,
        content: documentData.content,
        generated_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    logger.info("Document created successfully:", data.id);
    return data;
  } catch (err) {
    logger.error("Error creating document:", err);
    throw err;
  }
}

/**
 * Update an existing document
 */
export async function updateDocument(id: string, documentData: Partial<CreateDocumentData>): Promise<Document> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const updateData: Record<string, any> = {
      updated_by: user.id,
    };
    
    if (documentData.title !== undefined) updateData.title = documentData.title;
    if (documentData.content !== undefined) updateData.content = documentData.content;

    const { data, error } = await supabase
      .from("ai_generated_documents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    logger.info("Document updated successfully:", id);
    return data;
  } catch (err) {
    logger.error("Error updating document:", err);
    throw err;
  }
}

/**
 * Fetch a single document by ID
 */
export async function fetchDocument(id: string): Promise<Document | null> {
  try {
    const { data, error } = await supabase
      .from("ai_generated_documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    logger.error("Error fetching document:", err);
    throw err;
  }
}

/**
 * Fetch all documents for the current user
 */
export async function fetchDocuments(): Promise<Document[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("ai_generated_documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (err) {
    logger.error("Error fetching documents:", err);
    throw err;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("ai_generated_documents")
      .delete()
      .eq("id", id);

    if (error) throw error;

    logger.info("Document deleted successfully:", id);
  } catch (err) {
    logger.error("Error deleting document:", err);
    throw err;
  }
}
