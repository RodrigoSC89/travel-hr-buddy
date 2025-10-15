/**
 * MMI Copilot API - Simulates /api/mmi/copilot endpoint
 * In production, this would be a real backend endpoint
 */

import { generateCopilotSuggestion, formatSuggestionAsText } from './copilotService';

export interface CopilotRequest {
  prompt: string;
}

export interface CopilotResponse {
  statusCode: number;
  text: string;
  data?: {
    similar_jobs_found: number;
    historical_context: string;
    recommended_action: string;
    estimated_time: string;
    confidence: number;
  };
}

/**
 * Simulates POST /api/mmi/copilot
 * Accepts a prompt and returns AI suggestion based on historical data
 */
export async function copilotAPI(request: CopilotRequest): Promise<CopilotResponse> {
  try {
    // Validate request
    if (!request.prompt || typeof request.prompt !== 'string') {
      return {
        statusCode: 400,
        text: 'Prompt inválido',
      };
    }

    if (request.prompt.trim().length < 5) {
      return {
        statusCode: 400,
        text: 'Prompt muito curto. Por favor, forneça mais detalhes.',
      };
    }

    // Generate suggestion using copilot service
    const suggestion = await generateCopilotSuggestion(request.prompt);
    const formattedText = formatSuggestionAsText(suggestion);

    return {
      statusCode: 200,
      text: formattedText,
      data: suggestion,
    };
  } catch (error) {
    console.error('Copilot API error:', error);
    return {
      statusCode: 500,
      text: 'Erro ao processar solicitação',
    };
  }
}

/**
 * Mock Express-like request handler for testing
 * This simulates the actual Express endpoint
 */
export const copilotEndpoint = {
  async post(body: CopilotRequest): Promise<CopilotResponse> {
    return copilotAPI(body);
  },
};
