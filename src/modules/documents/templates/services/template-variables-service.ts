/**
 * PATCH 270 - Template Variables Service
 */

import { supabase } from "@/integrations/supabase/client";

export interface TemplateVariable {
  id?: string;
  templateId: string;
  variableName: string;
  variableType: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'url';
  defaultValue?: string;
  isRequired?: boolean;
  description?: string;
  createdAt?: string;
}

export class TemplateVariablesService {
  
  async createVariable(variable: TemplateVariable): Promise<TemplateVariable> {
    try {
      const { data, error } = await supabase
        .from('template_variables')
        .insert({
          template_id: variable.templateId,
          variable_name: variable.variableName,
          variable_type: variable.variableType,
          default_value: variable.defaultValue,
          is_required: variable.isRequired || false,
          description: variable.description
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapToVariable(data);
    } catch (error) {
      console.error('Error creating template variable:', error);
      throw error;
    }
  }

  async updateVariable(id: string, variable: Partial<TemplateVariable>): Promise<TemplateVariable> {
    try {
      const updateData: any = {};
      if (variable.variableName) updateData.variable_name = variable.variableName;
      if (variable.variableType) updateData.variable_type = variable.variableType;
      if (variable.defaultValue !== undefined) updateData.default_value = variable.defaultValue;
      if (variable.isRequired !== undefined) updateData.is_required = variable.isRequired;
      if (variable.description !== undefined) updateData.description = variable.description;

      const { data, error } = await supabase
        .from('template_variables')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.mapToVariable(data);
    } catch (error) {
      console.error('Error updating template variable:', error);
      throw error;
    }
  }

  async deleteVariable(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('template_variables')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting template variable:', error);
      throw error;
    }
  }

  async getVariables(templateId: string): Promise<TemplateVariable[]> {
    try {
      const { data, error } = await supabase
        .from('template_variables')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(this.mapToVariable);
    } catch (error) {
      console.error('Error fetching template variables:', error);
      return [];
    }
  }

  async getVariable(id: string): Promise<TemplateVariable | null> {
    try {
      const { data, error } = await supabase
        .from('template_variables')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? this.mapToVariable(data) : null;
    } catch (error) {
      console.error('Error fetching template variable:', error);
      return null;
    }
  }

  extractVariablesFromContent(content: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = content.matchAll(regex);
    const variables = new Set<string>();
    
    for (const match of matches) {
      variables.add(match[1]);
    }
    
    return Array.from(variables);
  }

  fillTemplate(content: string, values: Record<string, any>): string {
    let filledContent = content;
    
    for (const [key, value] of Object.entries(values)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      filledContent = filledContent.replace(regex, String(value ?? ''));
    }
    
    return filledContent;
  }

  validateTemplateVariables(content: string, variables: TemplateVariable[], values: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for required variables
    for (const variable of variables) {
      if (variable.isRequired && !values[variable.variableName]) {
        errors.push(`Required variable '${variable.variableName}' is missing`);
      }
    }
    
    // Check for variables in content that don't exist in variables list
    const contentVars = this.extractVariablesFromContent(content);
    for (const varName of contentVars) {
      if (!variables.find(v => v.variableName === varName)) {
        errors.push(`Variable '${varName}' found in template but not defined`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private mapToVariable(data: any): TemplateVariable {
    return {
      id: data.id,
      templateId: data.template_id,
      variableName: data.variable_name,
      variableType: data.variable_type,
      defaultValue: data.default_value,
      isRequired: data.is_required,
      description: data.description,
      createdAt: data.created_at
    };
  }
}

export const templateVariablesService = new TemplateVariablesService();
