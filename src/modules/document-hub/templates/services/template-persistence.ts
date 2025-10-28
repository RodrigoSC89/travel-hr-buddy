/**
 * PATCH 275 - Document Templates Persistence Service
 */

import { supabase } from "@/integrations/supabase/client";

export interface DocumentTemplate {
  id?: string;
  userId?: string;
  organizationId?: string | null;
  name: string;
  description?: string;
  content: string;
  variables: string[];
  isPublic?: boolean;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export class TemplatePersistence {
  
  async saveTemplate(template: DocumentTemplate): Promise<DocumentTemplate> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("document_templates")
        .insert({
          user_id: user.id,
          organization_id: template.organizationId,
          name: template.name,
          description: template.description,
          content: template.content,
          variables: template.variables,
          is_public: template.isPublic || false,
          category: template.category,
          tags: template.tags,
          metadata: template.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapToTemplate(data);
    } catch (error) {
      console.error("Error saving template:", error);
      throw error;
    }
  }

  async updateTemplate(id: string, template: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    try {
      const updateData: any = {};
      
      if (template.name !== undefined) updateData.name = template.name;
      if (template.description !== undefined) updateData.description = template.description;
      if (template.content !== undefined) updateData.content = template.content;
      if (template.variables !== undefined) updateData.variables = template.variables;
      if (template.isPublic !== undefined) updateData.is_public = template.isPublic;
      if (template.category !== undefined) updateData.category = template.category;
      if (template.tags !== undefined) updateData.tags = template.tags;
      if (template.metadata !== undefined) updateData.metadata = template.metadata;

      const { data, error } = await supabase
        .from("document_templates")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return this.mapToTemplate(data);
    } catch (error) {
      console.error("Error updating template:", error);
      throw error;
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("document_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting template:", error);
      throw error;
    }
  }

  async getTemplates(): Promise<DocumentTemplate[]> {
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapToTemplate);
    } catch (error) {
      console.error("Error fetching templates:", error);
      return [];
    }
  }

  async getTemplate(id: string): Promise<DocumentTemplate | null> {
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return data ? this.mapToTemplate(data) : null;
    } catch (error) {
      console.error("Error fetching template:", error);
      return null;
    }
  }

  private mapToTemplate(data: any): DocumentTemplate {
    return {
      id: data.id,
      userId: data.user_id,
      organizationId: data.organization_id,
      name: data.name,
      description: data.description,
      content: data.content,
      variables: data.variables || [],
      isPublic: data.is_public,
      category: data.category,
      tags: data.tags || [],
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export const templatePersistence = new TemplatePersistence();
