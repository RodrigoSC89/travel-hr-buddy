/**
 * AI Template Generation Utility
 * Provides functions for generating template content using Edge Functions
 */

import { supabase } from "@/integrations/supabase/client";

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

export async function generateTemplateWithCustomPrompt(prompt: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("generate-template", {
    body: { prompt },
  });

  if (error) {
    throw new Error(error.message || "Failed to generate template");
  }

  return data?.output || data?.content || "";
}

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

export async function rewriteTemplateWithAI(content: string): Promise<string> {
  const prompt = `Reformule o seguinte template de forma mais clara, profissional e estruturada, mantendo todas as variáveis {{}} intactas:

${content}`;

  return await generateTemplateWithCustomPrompt(prompt);
}
