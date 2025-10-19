import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface CreateDocumentParams {
  title: string;
  content: string | object;
  prompt?: string;
}

/**
 * Creates a new document in the Supabase database
 * @param params - Document parameters including title and content
 * @returns The created document ID
 */
export async function createDocument(params: CreateDocumentParams): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User must be authenticated to create documents");
    }

    // Convert content to string if it's an object
    const contentString = typeof params.content === "object" 
      ? JSON.stringify(params.content) 
      : params.content;

    const { data, error } = await supabase
      .from("ai_generated_documents")
      .insert({
        title: params.title,
        content: contentString,
        prompt: params.prompt || "Created from template",
        generated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      logger.error("Error creating document:", error);
      throw error;
    }

    return data?.id || null;
  } catch (error) {
    logger.error("Error in createDocument:", error);
    throw error;
  }
}

/**
 * Updates an existing document in the Supabase database
 * @param documentId - The ID of the document to update
 * @param params - Document parameters to update
 */
export async function updateDocument(
  documentId: string, 
  params: Partial<CreateDocumentParams>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User must be authenticated to update documents");
    }

    const updateData: Record<string, unknown> = {
      updated_by: user.id,
    };

    if (params.title) {
      updateData.title = params.title;
    }

    if (params.content) {
      updateData.content = typeof params.content === "object" 
        ? JSON.stringify(params.content) 
        : params.content;
    }

    const { error } = await supabase
      .from("ai_generated_documents")
      .update(updateData)
      .eq("id", documentId);

    if (error) {
      logger.error("Error updating document:", error);
      throw error;
    }
  } catch (error) {
    logger.error("Error in updateDocument:", error);
    throw error;
  }
}

/**
 * Fetches a document by ID from the Supabase database
 * @param documentId - The ID of the document to fetch
 * @returns The document data
 */
export async function getDocument(documentId: string) {
  try {
    const { data, error } = await supabase
      .from("ai_generated_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (error) {
      logger.error("Error fetching document:", error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error("Error in getDocument:", error);
    throw error;
  }
}
