/**
 * Centralized API module for template operations
 * Provides abstraction layer over Supabase calls for template management
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface Template {
  id: string;
  title: string;
  content: string | object;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_favorite?: boolean;
  is_private?: boolean;
}

export interface CreateTemplateData {
  title: string;
  content: string | object;
  is_favorite?: boolean;
  is_private?: boolean;
}

export interface UpdateTemplateData {
  id: string;
  title?: string;
  content?: string | object;
  is_favorite?: boolean;
  is_private?: boolean;
}

/**
 * Fetch all templates for the current user
 */
export async function fetchTemplates(): Promise<Template[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (err) {
    logger.error("Error fetching templates:", err);
    throw err;
  }
}

/**
 * Fetch a single template by ID
 */
export async function fetchTemplate(id: string): Promise<Template | null> {
  try {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    logger.error("Error fetching template:", err);
    throw err;
  }
}

/**
 * Create a new template
 */
export async function createTemplate(templateData: CreateTemplateData): Promise<Template> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("templates")
      .insert({
        title: templateData.title,
        content: templateData.content,
        is_favorite: templateData.is_favorite || false,
        is_private: templateData.is_private || false,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    logger.error("Error creating template:", err);
    throw err;
  }
}

/**
 * Update an existing template
 */
export async function updateTemplate(templateData: UpdateTemplateData): Promise<Template> {
  try {
    const updateData: Record<string, any> = {};
    
    if (templateData.title !== undefined) updateData.title = templateData.title;
    if (templateData.content !== undefined) updateData.content = templateData.content;
    if (templateData.is_favorite !== undefined) updateData.is_favorite = templateData.is_favorite;
    if (templateData.is_private !== undefined) updateData.is_private = templateData.is_private;

    const { data, error } = await supabase
      .from("templates")
      .update(updateData)
      .eq("id", templateData.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    logger.error("Error updating template:", err);
    throw err;
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    logger.error("Error deleting template:", err);
    throw err;
  }
}

/**
 * Toggle favorite status of a template
 */
export async function toggleFavorite(id: string, isFavorite: boolean): Promise<Template> {
  try {
    const { data, error } = await supabase
      .from("templates")
      .update({ is_favorite: !isFavorite })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    logger.error("Error toggling favorite:", err);
    throw err;
  }
}

/**
 * Toggle private status of a template
 */
export async function togglePrivate(id: string, isPrivate: boolean): Promise<Template> {
  try {
    const { data, error } = await supabase
      .from("templates")
      .update({ is_private: !isPrivate })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    logger.error("Error toggling private:", err);
    throw err;
  }
}

/**
 * Generate template content with AI
 */
export async function generateTemplateWithAI(
  title: string,
  prompt?: string
): Promise<string> {
  try {
    const aiPrompt = prompt || `Crie um template de documento com o título: ${title}`;
    
    const { data, error } = await supabase.functions.invoke("generate-document", {
      body: { prompt: aiPrompt },
    });

    if (error) throw error;

    return data?.content || "";
  } catch (err) {
    logger.error("Error generating template with AI:", err);
    throw err;
  }
}

/**
 * Rewrite template content with AI
 */
export async function rewriteTemplateWithAI(content: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke("rewrite-document", {
      body: { content },
    });

    if (error) throw error;

    return data?.rewritten || "";
  } catch (err) {
    logger.error("Error rewriting template with AI:", err);
    throw err;
  }
}

/**
 * Generate a title suggestion based on content
 */
export async function suggestTitle(content: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke("generate-document", {
      body: { 
        prompt: `Com base no seguinte conteúdo, sugira um título curto e descritivo (máximo 60 caracteres):\n\n${content.substring(0, 500)}` 
      },
    });

    if (error) throw error;

    const suggestedTitle = data?.content?.substring(0, 100) || "";
    return suggestedTitle.trim();
  } catch (err) {
    logger.error("Error suggesting title:", err);
    throw err;
  }
}
