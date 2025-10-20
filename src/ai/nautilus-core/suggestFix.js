import OpenAI from "openai";

/**
 * Usa LLM (Copilot ou OpenAI) para sugerir correções automáticas com base nas falhas detectadas
 */
export async function suggestFix(findings) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `
  Você é o engenheiro sênior do sistema Nautilus One.
  Analise os seguintes problemas encontrados em pipelines CI/CD:
  ${findings.join("\n")}
  - Sugira uma correção técnica específica (com ação direta).
  - Gere um título e descrição para uma Pull Request.
  - Seja objetivo e técnico, no estilo de um commit message real.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const text = response.choices[0].message.content || "fix: ajustes automáticos de CI/CD";

  const [titleLine, ...rest] = text.split("\n");

  return { title: titleLine.replace(/^#+\s*/, ""), body: rest.join("\n") };
}
