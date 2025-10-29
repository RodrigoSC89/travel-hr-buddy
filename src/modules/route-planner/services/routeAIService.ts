/**
 * PATCH 502: Route Planner AI Service
 * Enhanced AI-powered route suggestions using OpenAI
 */

import OpenAI from 'openai';

interface RouteAISuggestion {
  recommendedSpeed: number;
  fuelOptimization: string;
  safetyRecommendations: string[];
  weatherConsiderations: string;
  estimatedSavings: {
    time: string;
    fuel: string;
  };
  alternativeRoutes: string[];
}

class RouteAIService {
  private openai: OpenAI | null = null;

  constructor() {
    // NOTE: In production, OpenAI API calls should be made from a secure backend service
    // This is a demonstration implementation. For production use, create an API route:
    // e.g., /api/route-suggestions that calls OpenAI server-side
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // SECURITY WARNING: Only for development/demo
      });
    }
  }

  async generateRouteSuggestions(params: {
    origin: string;
    destination: string;
    distance: number; // nautical miles
    weatherConditions: any[];
    currentSpeed: number;
    fuelConsumption: number;
  }): Promise<RouteAISuggestion> {
    if (!this.openai) {
      return this.getFallbackSuggestions(params);
    }

    try {
      const prompt = `
Como especialista em navegação marítima, analise a seguinte rota e forneça recomendações detalhadas:

Origem: ${params.origin}
Destino: ${params.destination}
Distância: ${params.distance} milhas náuticas
Velocidade Atual: ${params.currentSpeed} nós
Consumo de Combustível: ${params.fuelConsumption} L/h

Condições Meteorológicas:
${params.weatherConditions.map(w => `- ${w.location}: ${w.description}`).join('\n')}

Por favor, forneça:
1. Velocidade recomendada para otimização de combustível
2. Estratégias de otimização de combustível
3. Recomendações de segurança específicas
4. Considerações meteorológicas importantes
5. Economia estimada (tempo e combustível)
6. Rotas alternativas sugeridas

Formato JSON:
{
  "recommendedSpeed": número,
  "fuelOptimization": "string",
  "safetyRecommendations": ["string"],
  "weatherConsiderations": "string",
  "estimatedSavings": {
    "time": "string",
    "fuel": "string"
  },
  "alternativeRoutes": ["string"]
}
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em navegação marítima e otimização de rotas. Forneça respostas precisas e práticas em português.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return this.getFallbackSuggestions(params);
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.getFallbackSuggestions(params);
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
      return this.getFallbackSuggestions(params);
    }
  }

  private getFallbackSuggestions(params: {
    distance: number;
    currentSpeed: number;
    fuelConsumption: number;
  }): RouteAISuggestion {
    // Calculate optimal speed (typically 80-85% of max speed for fuel efficiency)
    const optimalSpeed = Math.round(params.currentSpeed * 0.82);
    const timeSavings = ((params.distance / params.currentSpeed) - (params.distance / optimalSpeed)).toFixed(1);
    const fuelSavings = (params.fuelConsumption * 0.15).toFixed(1);

    return {
      recommendedSpeed: optimalSpeed,
      fuelOptimization: `Reduzir velocidade para ${optimalSpeed} nós pode economizar aproximadamente 15% de combustível.`,
      safetyRecommendations: [
        'Monitore as condições meteorológicas continuamente',
        'Mantenha comunicação regular com portos de destino',
        'Verifique sistemas de navegação a cada 4 horas'
      ],
      weatherConsiderations: 'Condições meteorológicas favoráveis previstas. Monitore previsões atualizadas.',
      estimatedSavings: {
        time: `${timeSavings} horas`,
        fuel: `${fuelSavings} litros`
      },
      alternativeRoutes: [
        'Rota costeira alternativa (+ 5% distância, - 20% risco)',
        'Rota direta (- 2% distância, + 10% risco)'
      ]
    };
  }

  async analyzeWeatherImpact(params: {
    route: any;
    weatherData: any[];
  }): Promise<{
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
    alternativeTiming?: string;
  }> {
    const criticalWeather = params.weatherData.filter(w => 
      w.severity === 'high' || w.severity === 'critical'
    );

    if (criticalWeather.length > 0) {
      return {
        overallRisk: 'high',
        recommendation: 'Considere adiar a viagem ou escolher rota alternativa devido a condições meteorológicas adversas.',
        alternativeTiming: '12-24 horas'
      };
    }

    return {
      overallRisk: 'low',
      recommendation: 'Condições meteorológicas favoráveis para navegação.'
    };
  }
}

export const routeAIService = new RouteAIService();
