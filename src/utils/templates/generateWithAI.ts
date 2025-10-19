/**
 * Generate template content using GPT-4 via API
 * @param type - Type of template to generate (e.g., "report", "email", "certificate")
 * @param context - Context or description for the template
 * @returns Generated template content
 */
export async function generateTemplateWithAI(
  type: string,
  context: string
): Promise<string> {
  const prompt = `
Você é um assistente de documentação técnica.
Crie um template do tipo: "${type}"
Baseado nesse contexto: ${context}
Formato estruturado e técnico.
  `.trim();

  const res = await fetch('/api/ai/generate-template', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error(`Erro ao gerar template: ${res.statusText}`);
  }

  const json = await res.json();
  return json.output || '';
}

/**
 * Generate template with custom prompt
 * @param prompt - Custom prompt for template generation
 * @returns Generated template content
 */
export async function generateTemplateWithCustomPrompt(
  prompt: string
): Promise<string> {
  const res = await fetch('/api/ai/generate-template', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error(`Erro ao gerar template: ${res.statusText}`);
  }

  const json = await res.json();
  return json.output || '';
}
