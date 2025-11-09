/**
 * MMI Forecast Service
 * Real GPT-4 integration for maintenance forecasting
 */

import OpenAI from "openai";
import type { AIForecast, MMIComponent, MMIHistory } from "@/types/mmi";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, use server-side API
});

interface ForecastInput {
  system_name: string;
  component: MMIComponent;
  maintenance_history: MMIHistory[];
}

/**
 * Generate AI forecast for a component based on its hourometer and history
 */
export async function generateForecast(input: ForecastInput): Promise<AIForecast> {
  try {
    const { system_name, component, maintenance_history } = input;

    // Calculate maintenance progress
    const progressPercentage = (component.current_hours / component.maintenance_interval_hours) * 100;
    const hoursUntilMaintenance = component.maintenance_interval_hours - component.current_hours;

    // Format maintenance history for AI
    const historyText = maintenance_history
      .slice(0, 5) // Last 5 maintenance records
      .map((h) => `- ${h.executed_at ? new Date(h.executed_at).toLocaleDateString("pt-BR") : "Data não registrada"} (${h.task_description})`)
      .join("\n");

    // Create the AI prompt
    const prompt = `
Você é um engenheiro de manutenção preventiva offshore especializado em sistemas náuticos.
Com base nas informações abaixo, gere uma previsão técnica de manutenção.

Sistema: ${system_name}
Componente: ${component.component_name}
Tipo: ${component.component_type || "Não especificado"}
Fabricante: ${component.manufacturer || "Não especificado"}
Modelo: ${component.model || "Não especificado"}

Horímetro atual: ${component.current_hours}h
Intervalo de manutenção: ${component.maintenance_interval_hours}h
Progresso: ${progressPercentage.toFixed(1)}%
Horas até manutenção: ${hoursUntilMaintenance.toFixed(1)}h

Últimas manutenções:
${historyText || "Nenhum histórico disponível"}

Última manutenção registrada: ${component.last_maintenance_date ? new Date(component.last_maintenance_date).toLocaleDateString("pt-BR") : "Não registrada"}

Por favor, forneça:
1. A próxima intervenção prevista (descrição técnica detalhada)
2. Por que ela é necessária (justificativa baseada em horas operadas e histórico)
3. Impacto de não executá-la (consequências operacionais e de segurança)
4. Prioridade sugerida (low, medium, high, ou critical)
5. Data sugerida para execução (considere o progresso atual)

Formate sua resposta como JSON com esta estrutura:
{
  "next_intervention": "descrição da intervenção",
  "reasoning": "justificativa técnica",
  "impact": "impacto de não executar",
  "priority": "low|medium|high|critical",
  "suggested_date": "YYYY-MM-DD"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em manutenção preventiva de sistemas náuticos. Responda sempre em português brasileiro com linguagem técnica apropriada.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || "";
    
    // Try to parse JSON from the response
    let forecast: AIForecast;
    
    try {
      // Extract JSON from response (handling markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        forecast = {
          next_intervention: parsedData.next_intervention,
          reasoning: parsedData.reasoning,
          impact: parsedData.impact,
          priority: parsedData.priority,
          suggested_date: parsedData.suggested_date,
          hourometer_current: component.current_hours,
          maintenance_history: maintenance_history.slice(0, 5).map((h) => ({
            date: h.executed_at ? new Date(h.executed_at).toLocaleDateString("pt-BR") : "N/A",
            action: h.task_description,
          })),
        };
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      // Fallback: create structured response from unstructured text
      console.warn("Failed to parse JSON response, using fallback structure:", parseError);
      
      forecast = {
        next_intervention: extractSection(content, "próxima intervenção", "por que") || "Manutenção preventiva necessária",
        reasoning: extractSection(content, "necessária", "impacto") || content.slice(0, 200),
        impact: extractSection(content, "impacto", "prioridade") || "Risco de falha operacional",
        priority: determinePriority(progressPercentage),
        suggested_date: calculateSuggestedDate(hoursUntilMaintenance),
        hourometer_current: component.current_hours,
        maintenance_history: maintenance_history.slice(0, 5).map((h) => ({
          date: h.executed_at ? new Date(h.executed_at).toLocaleDateString("pt-BR") : "N/A",
          action: h.task_description,
        })),
      };
    }

    return forecast;
  } catch (error) {
    console.error("Error generating forecast:", error);
    
    // Return a fallback forecast in case of API failure
    return {
      next_intervention: `Manutenção preventiva de ${input.component.component_name}`,
      reasoning: `Componente atingiu ${((input.component.current_hours / input.component.maintenance_interval_hours) * 100).toFixed(1)}% do intervalo de manutenção`,
      impact: "Execução da manutenção preventiva conforme programação para garantir operação segura",
      priority: determinePriority((input.component.current_hours / input.component.maintenance_interval_hours) * 100),
      suggested_date: calculateSuggestedDate(input.component.maintenance_interval_hours - input.component.current_hours),
      hourometer_current: input.component.current_hours,
      maintenance_history: input.maintenance_history.slice(0, 5).map((h) => ({
        date: h.executed_at ? new Date(h.executed_at).toLocaleDateString("pt-BR") : "N/A",
        action: h.task_description,
      })),
    };
  }
}

/**
 * Helper function to extract section from text
 */
function extractSection(text: string, startMarker: string, endMarker: string): string | null {
  const lowerText = text.toLowerCase();
  const startIndex = lowerText.indexOf(startMarker);
  const endIndex = lowerText.indexOf(endMarker, startIndex);
  
  if (startIndex === -1) return null;
  
  const section = text.slice(
    startIndex,
    endIndex === -1 ? text.length : endIndex
  );
  
  return section
    .replace(/^\d+\.\s*/, "") // Remove leading numbers
    .replace(new RegExp(startMarker, "i"), "") // Remove start marker
    .trim();
}

/**
 * Determine priority based on maintenance progress
 */
function determinePriority(progressPercentage: number): "low" | "medium" | "high" | "critical" {
  if (progressPercentage >= 100) return "critical";
  if (progressPercentage >= 95) return "high";
  if (progressPercentage >= 80) return "medium";
  return "low";
}

/**
 * Calculate suggested maintenance date based on hours until maintenance
 */
function calculateSuggestedDate(hoursUntilMaintenance: number): string {
  // Assume average 8 hours operation per day
  const daysUntilMaintenance = Math.max(1, Math.floor(hoursUntilMaintenance / 8));
  const suggestedDate = new Date();
  suggestedDate.setDate(suggestedDate.getDate() + daysUntilMaintenance);
  
  return suggestedDate.toISOString().split("T")[0];
}
