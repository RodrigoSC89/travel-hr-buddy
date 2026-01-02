/**
 * AI Prompts Test Suite - Nautilus One
 * Testes automatizados para validar as 16 IAs especializadas
 * PATCH AI-TRAINING v1.1 - Fixed type compatibility
 */

import { describe, it, expect, vi } from 'vitest';

// Import all AI configs
import { PEOTRAM_AI_CONFIG } from '../peotram-ai-prompt';
import { PEODP_AI_CONFIG } from '../peodp-ai-prompt';
import { COMMAND_AI_CONFIG } from '../command-ai-prompt';
import { VOICE_AI_CONFIG } from '../voice-ai-prompt';
import { BUNKER_AI_CONFIG } from '../bunker-ai-prompt';
import { SAFETY_AI_CONFIG } from '../safety-ai-prompt';
import { COMPLIANCE_AI_CONFIG } from '../compliance-ai-prompt';
import { FLEET_AI_CONFIG } from '../fleet-ai-prompt';
import { CREW_AI_CONFIG } from '../crew-ai-prompt';
import { WEATHER_AI_CONFIG } from '../weather-ai-prompt';
import { MAINTENANCE_AI_CONFIG } from '../maintenance-ai-prompt';
import { CARGO_AI_CONFIG } from '../cargo-ai-prompt';
import { TRAINING_AI_CONFIG } from '../training-ai-prompt';
import { VOYAGE_AI_CONFIG } from '../voyage-ai-prompt';
import { CHARTER_AI_CONFIG } from '../charter-ai-prompt';
import { MLC_AI_CONFIG } from '../mlc-ai-prompt';

// Helper to get max tokens from either format
function getMaxTokens(config: Record<string, unknown>): number {
  return (config.maxTokens as number) || (config.max_tokens as number) || 0;
}

// Helper to check if contextBuilder exists
function hasContextBuilder(config: Record<string, unknown>): boolean {
  return typeof config.contextBuilder === 'string' && config.contextBuilder.length > 0;
}

// All AI configs array for bulk tests
const ALL_AI_CONFIGS = [
  { name: 'PEOTRAM', config: PEOTRAM_AI_CONFIG },
  { name: 'PEO-DP', config: PEODP_AI_CONFIG },
  { name: 'Command', config: COMMAND_AI_CONFIG },
  { name: 'Voice', config: VOICE_AI_CONFIG },
  { name: 'Bunker', config: BUNKER_AI_CONFIG },
  { name: 'Safety', config: SAFETY_AI_CONFIG },
  { name: 'Compliance', config: COMPLIANCE_AI_CONFIG },
  { name: 'Fleet', config: FLEET_AI_CONFIG },
  { name: 'Crew', config: CREW_AI_CONFIG },
  { name: 'Weather', config: WEATHER_AI_CONFIG },
  { name: 'Maintenance', config: MAINTENANCE_AI_CONFIG },
  { name: 'Cargo', config: CARGO_AI_CONFIG },
  { name: 'Training', config: TRAINING_AI_CONFIG },
  { name: 'Voyage', config: VOYAGE_AI_CONFIG },
  { name: 'Charter', config: CHARTER_AI_CONFIG },
  { name: 'MLC', config: MLC_AI_CONFIG },
];

describe('AI Prompts - Structure Validation', () => {
  it.each(ALL_AI_CONFIGS)('$name AI config has required fields', ({ config }) => {
    expect(config).toHaveProperty('name');
    expect(config).toHaveProperty('model');
    expect(config).toHaveProperty('temperature');
    expect(config).toHaveProperty('systemPrompt');
    // Check for either maxTokens or max_tokens
    const tokens = getMaxTokens(config as Record<string, unknown>);
    expect(tokens).toBeGreaterThan(0);
  });

  it.each(ALL_AI_CONFIGS)('$name AI has valid temperature (0-1)', ({ config }) => {
    expect(config.temperature).toBeGreaterThanOrEqual(0);
    expect(config.temperature).toBeLessThanOrEqual(1);
  });

  it.each(ALL_AI_CONFIGS)('$name AI has reasonable maxTokens', ({ config }) => {
    const tokens = getMaxTokens(config as Record<string, unknown>);
    expect(tokens).toBeGreaterThanOrEqual(1000);
    expect(tokens).toBeLessThanOrEqual(8000);
  });

  it.each(ALL_AI_CONFIGS)('$name AI system prompt has minimum length', ({ config }) => {
    expect(config.systemPrompt.length).toBeGreaterThan(1000);
  });
});

describe('AI Prompts - Content Validation', () => {
  it.each(ALL_AI_CONFIGS)('$name AI has identity section', ({ config }) => {
    expect(config.systemPrompt).toContain('VOCÊ É');
    expect(config.systemPrompt).toContain('SUA IDENTIDADE');
  });

  it.each(ALL_AI_CONFIGS)('$name AI has purpose section', ({ config }) => {
    expect(config.systemPrompt).toContain('PROPÓSITO');
  });

  it.each(ALL_AI_CONFIGS)('$name AI has voice mode section', ({ config }) => {
    expect(config.systemPrompt).toContain('VOICE');
  });

  it.each(ALL_AI_CONFIGS)('$name AI has examples section', ({ config }) => {
    expect(config.systemPrompt).toMatch(/EXEMPLO|Exemplo/i);
  });

  it.each(ALL_AI_CONFIGS)('$name AI has alerts or critical section', ({ config }) => {
    expect(config.systemPrompt).toMatch(/ALERTA|CRÍTICO|EMERGÊNCIA|Urgente|Critical/i);
  });
});

describe('AI Prompts - Maritime Domain Knowledge', () => {
  it('PEOTRAM AI contains Petrobras-specific knowledge', () => {
    expect(PEOTRAM_AI_CONFIG.systemPrompt).toContain('PEOTRAM');
    expect(PEOTRAM_AI_CONFIG.systemPrompt).toContain('Petrobras');
    expect(PEOTRAM_AI_CONFIG.systemPrompt).toContain('elemento');
  });

  it('PEO-DP AI contains DP-specific knowledge', () => {
    expect(PEODP_AI_CONFIG.systemPrompt).toContain('Posicionamento Dinâmico');
    expect(PEODP_AI_CONFIG.systemPrompt).toContain('IMCA');
    expect(PEODP_AI_CONFIG.systemPrompt).toContain('Class');
  });

  it('Bunker AI contains fuel management knowledge', () => {
    expect(BUNKER_AI_CONFIG.systemPrompt).toContain('combustível');
    expect(BUNKER_AI_CONFIG.systemPrompt).toMatch(/VLSFO|combustível|consumo/i);
  });

  it('Safety AI contains HSEQ knowledge', () => {
    expect(SAFETY_AI_CONFIG.systemPrompt).toMatch(/ISM|SOLAS|segurança/i);
    expect(SAFETY_AI_CONFIG.systemPrompt).toContain('risco');
  });

  it('Compliance AI contains regulatory knowledge', () => {
    expect(COMPLIANCE_AI_CONFIG.systemPrompt).toMatch(/IMO|certificado|regulatória/i);
    expect(COMPLIANCE_AI_CONFIG.systemPrompt).toMatch(/PSC|inspeção|auditoria/i);
  });

  it('MLC AI contains labor convention knowledge', () => {
    expect(MLC_AI_CONFIG.systemPrompt).toContain('MLC 2006');
    expect(MLC_AI_CONFIG.systemPrompt).toMatch(/horas|descanso|trabalho/i);
  });

  it('Weather AI contains meteorology knowledge', () => {
    expect(WEATHER_AI_CONFIG.systemPrompt).toMatch(/Beaufort|ondas|vento|meteorolog/i);
  });

  it('Cargo AI contains stability knowledge', () => {
    expect(CARGO_AI_CONFIG.systemPrompt).toMatch(/GM|estabilidade|carga/i);
    expect(CARGO_AI_CONFIG.systemPrompt).toMatch(/IMDG|segregação|perigosa/i);
  });

  it('Charter AI contains commercial knowledge', () => {
    expect(CHARTER_AI_CONFIG.systemPrompt).toMatch(/demurrage|laytime|charter/i);
  });
});

describe('AI Prompts - Voice Mode Validation', () => {
  it.each(ALL_AI_CONFIGS)('$name AI has voice configuration', ({ config }) => {
    expect(config.systemPrompt).toMatch(/VOICE|voz|Voice/i);
  });

  it.each(ALL_AI_CONFIGS)('$name AI voice responses mention conciseness', ({ config }) => {
    expect(config.systemPrompt).toMatch(/palavras|conciso|máximo|VOICE_MODE|breve/i);
  });
});

describe('AI Prompts - Response Format Validation', () => {
  it.each(ALL_AI_CONFIGS)('$name AI has structured response format', ({ config }) => {
    expect(config.systemPrompt).toMatch(/FORMATO|Formato|formato/i);
  });

  it.each(ALL_AI_CONFIGS)('$name AI uses visual formatting', ({ config }) => {
    // Check for emoji or box drawing characters or markdown headers
    expect(config.systemPrompt).toMatch(/[📋🔴🟡🟢⚠️✅❌━#\*]/);
  });
});

describe('AI Prompts - Integration Validation', () => {
  it.each(ALL_AI_CONFIGS)('$name AI mentions module integration or context', ({ config }) => {
    expect(config.systemPrompt).toMatch(/INTEGRAÇÃO|busca|dados|módulo|contexto|sistema/i);
  });

  // Only test contextBuilder for configs that should have it
  it('Most AI configs have context builder', () => {
    const configsWithBuilder = ALL_AI_CONFIGS.filter(({ config }) => 
      hasContextBuilder(config as Record<string, unknown>)
    );
    // At least 12 of 16 should have contextBuilder
    expect(configsWithBuilder.length).toBeGreaterThanOrEqual(12);
  });
});

describe('AI Prompts - Safety Validation', () => {
  it.each(ALL_AI_CONFIGS)('$name AI has escalation or safety rules', ({ config }) => {
    expect(config.systemPrompt).toMatch(/ESCALAR|humano|supervisor|segurança|CRÍTICO|emergência/i);
  });

  it('Safety AI prioritizes safety', () => {
    expect(SAFETY_AI_CONFIG.systemPrompt).toMatch(/SEGURANÇA|prioridade|primeiro/i);
  });

  it('Command AI has autonomy levels', () => {
    expect(COMMAND_AI_CONFIG.systemPrompt).toMatch(/Nível|autonomia|autônom/i);
  });
});

describe('AI Prompts - Interaction Examples', () => {
  it.each(ALL_AI_CONFIGS)('$name AI has common scenario example', ({ config }) => {
    expect(config.systemPrompt).toMatch(/Cenário|CENÁRIO|Exemplo|USER:|YOU:/i);
  });

  it.each(ALL_AI_CONFIGS)('$name AI has emergency scenario', ({ config }) => {
    expect(config.systemPrompt).toMatch(/EMERGÊNCIA|Urgente|CRÍTICO|emergência|alerta/i);
  });
});

describe('AI Prompts - Count Validation', () => {
  it('Should have exactly 16 AI configs', () => {
    expect(ALL_AI_CONFIGS.length).toBe(16);
  });

  it('All configs have unique names', () => {
    const names = ALL_AI_CONFIGS.map(c => c.config.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(ALL_AI_CONFIGS.length);
  });
});
