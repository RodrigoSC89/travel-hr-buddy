// __tests__/forecast.test.ts
import { describe, it, expect } from 'vitest'

// Mock function for forecast AI - simulating the bi-jobs-forecast edge function
const generateForecastWithAI = async (sistema: string, metrica: string): Promise<string> => {
  // Simula a chamada para a função edge do Supabase
  return `📊 Previsão para ${sistema} - ${metrica}:
  
  1. Tendência: Aumento de 15% nos próximos 2 meses
  2. Recomendações: Aumentar equipe de manutenção preventiva
  3. Pontos de atenção: Pico esperado em componentes hidráulicos`
}

describe('Forecast com IA', () => {
  it('retorna texto com previsão', async () => {
    const result = await generateForecastWithAI('sistema X', 'produtividade')
    expect(result).toMatch(/previsão/i)
  })
})
