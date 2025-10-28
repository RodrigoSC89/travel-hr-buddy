/**
 * PATCH 409: Enhanced Template Application Service
 * Handles variable substitution and document integration
 */

export interface TemplateVariable {
  name: string;
  type: 'text' | 'date' | 'number' | 'select';
  label: string;
  required: boolean;
  options?: string[]; // For select type
  defaultValue?: string;
}

export interface TemplateData {
  id: string;
  title: string;
  content: string;
  variables?: TemplateVariable[];
  created_at?: string;
}

export interface DocumentData {
  id: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

export class TemplateApplicationService {
  /**
   * Extract variables from template content
   */
  static extractVariables(content: string): string[] {
    const variableRegex = /{{(.*?)}}/g;
    const matches = content.match(variableRegex) || [];
    
    // Get unique variable names
    return [...new Set(matches.map(match => match.slice(2, -2).trim()))];
  }

  /**
   * Apply template with data substitution
   */
  static applyTemplate(
    templateContent: string,
    data: Record<string, string>
  ): string {
    let result = templateContent;

    // Replace each variable with its value
    for (const [key, value] of Object.entries(data)) {
      const variablePattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(variablePattern, value);
    }

    return result;
  }

  /**
   * Validate that all required variables are provided
   */
  static validateTemplateData(
    templateContent: string,
    data: Record<string, string>,
    requiredVars?: string[]
  ): { valid: boolean; missing: string[] } {
    const variables = this.extractVariables(templateContent);
    const required = requiredVars || variables;
    
    const missing = required.filter(varName => !data[varName]);

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Get common variable data from user profile or context
   */
  static getCommonVariables(user?: any): Record<string, string> {
    return {
      nome: user?.name || user?.full_name || '',
      email: user?.email || '',
      cargo: user?.role || user?.position || '',
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR'),
      data_hora: new Date().toLocaleString('pt-BR'),
      empresa: 'Nautilus One',
      ano: new Date().getFullYear().toString(),
      mes: new Date().toLocaleDateString('pt-BR', { month: 'long' }),
      dia: new Date().getDate().toString()
    };
  }

  /**
   * Apply template to an existing document
   */
  static applyToDocument(
    document: DocumentData,
    template: TemplateData,
    data: Record<string, string>
  ): DocumentData {
    const appliedContent = this.applyTemplate(template.content, data);

    return {
      ...document,
      content: appliedContent,
      title: document.title || template.title,
      metadata: {
        ...document.metadata,
        appliedTemplate: template.id,
        appliedAt: new Date().toISOString(),
        templateVariables: data
      }
    };
  }

  /**
   * Create new document from template
   */
  static createDocumentFromTemplate(
    template: TemplateData,
    data: Record<string, string>,
    title?: string
  ): Omit<DocumentData, 'id'> {
    const appliedContent = this.applyTemplate(template.content, data);

    return {
      title: title || `${template.title} - ${new Date().toLocaleDateString('pt-BR')}`,
      content: appliedContent,
      metadata: {
        sourceTemplate: template.id,
        createdAt: new Date().toISOString(),
        templateVariables: data
      }
    };
  }

  /**
   * Preview template with data (for UI display)
   */
  static previewTemplate(
    templateContent: string,
    data: Partial<Record<string, string>>
  ): string {
    const variables = this.extractVariables(templateContent);
    let preview = templateContent;

    // Replace provided values
    for (const [key, value] of Object.entries(data)) {
      if (value) {
        const variablePattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        preview = preview.replace(variablePattern, value);
      }
    }

    // Highlight remaining variables
    variables.forEach(varName => {
      if (!data[varName]) {
        const variablePattern = new RegExp(`{{\\s*${varName}\\s*}}`, 'g');
        preview = preview.replace(
          variablePattern,
          `<mark style="background-color: yellow;">{{${varName}}}</mark>`
        );
      }
    });

    return preview;
  }

  /**
   * Convert template variable definitions to form fields
   */
  static getVariableFields(variables: TemplateVariable[]): any[] {
    return variables.map(variable => ({
      name: variable.name,
      type: variable.type,
      label: variable.label,
      required: variable.required,
      options: variable.options,
      defaultValue: variable.defaultValue
    }));
  }

  /**
   * Export document with applied template to various formats
   */
  static async exportDocument(
    document: DocumentData,
    format: 'pdf' | 'docx' | 'html' | 'txt'
  ): Promise<Blob> {
    switch (format) {
      case 'pdf':
        return this.exportToPDF(document);
      case 'docx':
        return this.exportToDOCX(document);
      case 'html':
        return new Blob([document.content], { type: 'text/html' });
      case 'txt':
        return new Blob([this.stripHTML(document.content)], { type: 'text/plain' });
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Export to PDF (placeholder - would use html2pdf or similar)
   */
  private static async exportToPDF(document: DocumentData): Promise<Blob> {
    // This would use a library like html2pdf.js
    // For now, return a simple implementation
    const content = `
      <html>
        <head>
          <title>${document.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>${document.title}</h1>
          <div>${document.content}</div>
        </body>
      </html>
    `;
    return new Blob([content], { type: 'application/pdf' });
  }

  /**
   * Export to DOCX (placeholder - would use docx library)
   */
  private static async exportToDOCX(document: DocumentData): Promise<Blob> {
    // This would use the docx library
    // For now, return a simple implementation
    return new Blob([document.content], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  }

  /**
   * Strip HTML tags from content
   */
  private static stripHTML(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}
