/**
 * PATCH 409: Template Application Service
 * Service for applying templates to documents with variable substitution
 */

export interface TemplateVariable {
  name: string;
  value: string;
  required?: boolean;
}

export interface TemplateApplicationResult {
  success: boolean;
  content: string;
  appliedVariables: string[];
  missingVariables: string[];
  errors: string[];
}

export interface ExportOptions {
  format: 'PDF' | 'DOCX' | 'HTML' | 'TXT';
  filename?: string;
  metadata?: Record<string, any>;
}

export class TemplateApplicationService {
  /**
   * Extract variable names from template content
   * Matches patterns like {{variable_name}}
   */
  static extractVariables(content: string): string[] {
    const variableRegex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
    const matches = content.matchAll(variableRegex);
    const variables = new Set<string>();
    
    for (const match of matches) {
      variables.add(match[1]);
    }
    
    return Array.from(variables);
  }

  /**
   * Apply template with variable substitution
   */
  static applyTemplate(
    templateContent: string,
    variables: Record<string, string>,
    options?: { strictMode?: boolean }
  ): TemplateApplicationResult {
    const errors: string[] = [];
    const appliedVariables: string[] = [];
    const extractedVars = this.extractVariables(templateContent);
    const missingVariables: string[] = [];

    // Check for missing variables
    for (const varName of extractedVars) {
      if (!(varName in variables)) {
        missingVariables.push(varName);
        if (options?.strictMode) {
          errors.push(`Missing required variable: ${varName}`);
        }
      }
    }

    // If strict mode and missing variables, return early
    if (options?.strictMode && missingVariables.length > 0) {
      return {
        success: false,
        content: templateContent,
        appliedVariables: [],
        missingVariables,
        errors,
      };
    }

    // Apply variable substitution
    let result = templateContent;
    for (const [varName, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
      if (regex.test(result)) {
        result = result.replace(regex, value);
        appliedVariables.push(varName);
      }
    }

    // Replace remaining variables with empty string or placeholder
    const remainingVars = this.extractVariables(result);
    for (const varName of remainingVars) {
      const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
      result = result.replace(regex, options?.strictMode ? '' : `[${varName}]`);
    }

    return {
      success: true,
      content: result,
      appliedVariables,
      missingVariables,
      errors,
    };
  }

  /**
   * Validate template content
   */
  static validateTemplate(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for balanced braces
    const openBraces = (content.match(/\{\{/g) || []).length;
    const closeBraces = (content.match(/\}\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push('Unbalanced template braces');
    }

    // Check for nested variables (not supported)
    if (/\{\{[^}]*\{\{/.test(content)) {
      errors.push('Nested variables are not supported');
    }

    // Check for empty variable names
    if (/\{\{\s*\}\}/.test(content)) {
      errors.push('Empty variable names are not allowed');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export document to specified format
   */
  static async exportDocument(
    content: string,
    options: ExportOptions
  ): Promise<{ success: boolean; data?: Blob; error?: string }> {
    try {
      let blob: Blob;
      const filename = options.filename || `document.${options.format.toLowerCase()}`;

      switch (options.format) {
        case 'TXT':
          blob = new Blob([content], { type: 'text/plain' });
          break;

        case 'HTML':
          const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.metadata?.title || 'Document'}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 { color: #333; }
    p { margin: 10px 0; }
  </style>
</head>
<body>
${content.split('\n').map(line => `  <p>${line}</p>`).join('\n')}
</body>
</html>`;
          blob = new Blob([htmlContent], { type: 'text/html' });
          break;

        case 'PDF':
          // For PDF, we'd typically use a library like jsPDF
          // For now, return HTML that can be printed to PDF
          return {
            success: false,
            error: 'PDF export requires additional library. Use HTML format and print to PDF.',
          };

        case 'DOCX':
          // For DOCX, we'd typically use a library like docx
          // For now, return error
          return {
            success: false,
            error: 'DOCX export requires additional library. Use HTML or TXT format.',
          };

        default:
          return {
            success: false,
            error: `Unsupported format: ${options.format}`,
          };
      }

      return {
        success: true,
        data: blob,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  /**
   * Download exported document
   */
  static downloadDocument(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Common variable definitions
   */
  static readonly COMMON_VARIABLES = {
    // Personal information
    nome: 'Name',
    nome_completo: 'Full Name',
    cargo: 'Position/Role',
    email: 'Email',
    telefone: 'Phone',
    cpf: 'CPF/ID',
    
    // Dates
    data: 'Date',
    data_atual: 'Current Date',
    data_inicio: 'Start Date',
    data_fim: 'End Date',
    
    // Company information
    empresa: 'Company',
    departamento: 'Department',
    setor: 'Sector',
    
    // Document information
    numero_documento: 'Document Number',
    versao: 'Version',
    autor: 'Author',
    
    // Other
    local: 'Location',
    valor: 'Value',
    quantidade: 'Quantity',
  };

  /**
   * Get auto-fill suggestions based on context
   */
  static getAutoFillSuggestions(context?: {
    user?: { name?: string; email?: string; role?: string };
    organization?: { name?: string };
  }): Record<string, string> {
    const suggestions: Record<string, string> = {
      data_atual: new Date().toLocaleDateString('pt-BR'),
      data: new Date().toLocaleDateString('pt-BR'),
    };

    if (context?.user) {
      if (context.user.name) {
        suggestions.nome = context.user.name;
        suggestions.nome_completo = context.user.name;
        suggestions.autor = context.user.name;
      }
      if (context.user.email) {
        suggestions.email = context.user.email;
      }
      if (context.user.role) {
        suggestions.cargo = context.user.role;
      }
    }

    if (context?.organization?.name) {
      suggestions.empresa = context.organization.name;
    }

    return suggestions;
  }
}
