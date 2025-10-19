/**
 * AI Template Generation Utility
 * Provides functions for generating template content using GPT-4 AI
 */

/**
 * Template types supported for AI generation
 */
export type TemplateType = 
  | "certificate"
  | "email"
  | "report"
  | "letter"
  | "contract"
  | "policy"
  | "procedure"
  | "form"
  | "memo"
  | "invoice";

/**
 * Generates template content using AI based on type and context
 * @param type - Type of template to generate
 * @param context - Context information for the template
 * @returns Generated template content
 * @example
 * const content = await generateTemplateWithAI('certificate', 'STCW training completion');
 */
export async function generateTemplateWithAI(
  type: TemplateType | string,
  context: string
): Promise<string> {
  const prompt = `Você é um assistente de documentação técnica. 
Crie um template do tipo: "${type}"
Baseado nesse contexto: ${context}
Use formato estruturado e técnico com espaços reservados {{variavel}} para campos dinâmicos.`;

  return await generateTemplateWithCustomPrompt(prompt);
}

/**
 * Generates template content using a custom AI prompt
 * @param prompt - Custom prompt for AI generation
 * @returns Generated template content
 * @example
 * const content = await generateTemplateWithCustomPrompt(
 *   'Create a professional email template for customer support'
 * );
 */
export async function generateTemplateWithCustomPrompt(prompt: string): Promise<string> {
  try {
    const res = await fetch("/api/ai/generate-template", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to generate template");
    }

    const json = await res.json();
    return json.output || "";
  } catch (error: any) {
    console.error("Error generating template with AI:", error);
    throw new Error(error.message || "Failed to generate template with AI");
  }
}

/**
 * Generates a template with AI and automatically includes common variables
 * @param type - Type of template to generate
 * @param context - Context information for the template
 * @param includeVariables - Additional variables to include in the template
 * @returns Generated template content with variables
 * @example
 * const content = await generateTemplateWithVariables(
 *   'email',
 *   'Welcome message',
 *   ['name', 'company', 'date']
 * );
 */
export async function generateTemplateWithVariables(
  type: TemplateType | string,
  context: string,
  includeVariables: string[] = []
): Promise<string> {
  const variablesText = includeVariables.length > 0
    ? `\nIncluir as seguintes variáveis dinâmicas: ${includeVariables.map(v => `{{${v}}}`).join(", ")}`
    : "";

  const prompt = `Você é um assistente de documentação técnica. 
Crie um template do tipo: "${type}"
Baseado nesse contexto: ${context}
Use formato estruturado e técnico com espaços reservados {{variavel}} para campos dinâmicos.${variablesText}`;

  return await generateTemplateWithCustomPrompt(prompt);
}

/**
 * Rewrite existing template content with AI to improve clarity and structure
 * @param content - Original template content
 * @returns Rewritten template content
 * @example
 * const improved = await rewriteTemplateWithAI(originalContent);
 */
export async function rewriteTemplateWithAI(content: string): Promise<string> {
  const prompt = `Reformule o seguinte template de forma mais clara, profissional e estruturada, mantendo todas as variáveis {{}} intactas:

${content}`;

  return await generateTemplateWithCustomPrompt(prompt);
}
