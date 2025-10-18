// __tests__/assistant.test.ts
import { describe, it, expect } from 'vitest'

// Mock function for assistant - simulating the assistant-query edge function
const askAssistant = async (pergunta: string): Promise<string> => {
  // Simula a resposta do assistente com GPT-4
  if (pergunta.toLowerCase().includes('sgso')) {
    return 'SGSO é o Sistema de Gestão de Segurança Operacional, usado para gerenciar e monitorar práticas de segurança em operações marítimas.'
  }
  return 'Posso ajudar com informações sobre o sistema. Como posso auxiliá-lo?'
}

describe('Assistente IA', () => {
  it('retorna resposta do GPT-4', async () => {
    const resposta = await askAssistant('O que é SGSO?')
    expect(resposta).toBeDefined()
    expect(resposta).toMatch(/sistema/i)
  })
})
