/**
 * AI Prompts Test Suite - Nautilus One
 * Testes automatizados para validar as 16 IAs especializadas
 * PATCH AI-TRAINING v1.0
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
    expect(config).toHaveProperty('description');
    expect(config).toHaveProperty('model');
    expect(config).toHaveProperty('temperature');
    expect(config).toHaveProperty('maxTokens');
    expect(config).toHaveProperty('systemPrompt');
  });

  it.each(ALL_AI_CONFIGS)('$name AI has valid temperature (0-1)', ({ config }) => {
    expect(config.temperature).toBeGreaterThanOrEqual(0);
    expect(config.temperature).toBeLessThanOrEqual(1);
  });

  it.each(ALL_AI_CONFIGS)('$name AI has reasonable maxTokens', ({ config }) => {
    expect(config.maxTokens).toBeGreaterThanOrEqual(1000);
    expect(config.maxTokens).toBeLessThanOrEqual(8000);
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
    expect(config.systemPrompt).toContain('VOICE MODE');
  });

  it.each(ALL_AI_CONFIGS)('$name AI has examples section', ({ config }) => {
    expect(config.systemPrompt).toContain('EXEMPLOS');
  });

  it.each(ALL_AI_CONFIGS)('$name AI has alerts section', ({ config }) => {
    expect(config.systemPrompt).toMatch(/ALERTA|CRÍTICO|EMERGÊNCIA/i);
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
    expect(BUNKER_AI_CONFIG.systemPrompt).toContain('VLSFO');
    expect(BUNKER_AI_CONFIG.systemPrompt).toContain('consumo');
  });

  it('Safety AI contains HSEQ knowledge', () => {
    expect(SAFETY_AI_CONFIG.systemPrompt).toContain('ISM');
    expect(SAFETY_AI_CONFIG.systemPrompt).toContain('SOLAS');
    expect(SAFETY_AI_CONFIG.systemPrompt).toContain('risco');
  });

  it('Compliance AI contains regulatory knowledge', () => {
    expect(COMPLIANCE_AI_CONFIG.systemPrompt).toContain('IMO');
    expect(COMPLIANCE_AI_CONFIG.systemPrompt).toContain('certificado');
    expect(COMPLIANCE_AI_CONFIG.systemPrompt).toContain('PSC');
  });

  it('MLC AI contains labor convention knowledge', () => {
    expect(MLC_AI_CONFIG.systemPrompt).toContain('MLC 2006');
    expect(MLC_AI_CONFIG.systemPrompt).toContain('horas');
    expect(MLC_AI_CONFIG.systemPrompt).toContain('descanso');
  });

  it('Weather AI contains meteorology knowledge', () => {
    expect(WEATHER_AI_CONFIG.systemPrompt).toContain('Beaufort');
    expect(WEATHER_AI_CONFIG.systemPrompt).toContain('ondas');
    expect(WEATHER_AI_CONFIG.systemPrompt).toContain('furacão');
  });

  it('Cargo AI contains stability knowledge', () => {
    expect(CARGO_AI_CONFIG.systemPrompt).toContain('GM');
    expect(CARGO_AI_CONFIG.systemPrompt).toContain('estabilidade');
    expect(CARGO_AI_CONFIG.systemPrompt).toContain('IMDG');
  });

  it('Charter AI contains commercial knowledge', () => {
    expect(CHARTER_AI_CONFIG.systemPrompt).toContain('demurrage');
    expect(CHARTER_AI_CONFIG.systemPrompt).toContain('laytime');
    expect(CHARTER_AI_CONFIG.systemPrompt).toContain('charter party');
  });
});

describe('AI Prompts - Voice Mode Validation', () => {
  it.each(ALL_AI_CONFIGS)('$name AI has voice command examples', ({ config }) => {
    expect(config.systemPrompt).toContain('USER (voz)');
    expect(config.systemPrompt).toContain('YOU (voz)');
  });

  it.each(ALL_AI_CONFIGS)('$name AI voice responses are concise', ({ config }) => {
    // Voice responses should mention word limits
    expect(config.systemPrompt).toMatch(/60 palavras|conciso|máximo/i);
  });
});

describe('AI Prompts - Response Format Validation', () => {
  it.each(ALL_AI_CONFIGS)('$name AI has structured response format', ({ config }) => {
    expect(config.systemPrompt).toContain('FORMATO');
  });

  it.each(ALL_AI_CONFIGS)('$name AI uses visual formatting', ({ config }) => {
    // Check for emoji or box drawing characters
    expect(config.systemPrompt).toMatch(/[📋🔴🟡🟢⚠️✅❌━]/);
  });
});

describe('AI Prompts - Integration Validation', () => {
  it.each(ALL_AI_CONFIGS)('$name AI mentions module integration', ({ config }) => {
    expect(config.systemPrompt).toMatch(/INTEGRAÇÃO|busca dados|módulo/i);
  });

  it.each(ALL_AI_CONFIGS)('$name AI has context builder', ({ config }) => {
    expect(config).toHaveProperty('contextBuilder');
    expect(config.contextBuilder.length).toBeGreaterThan(50);
  });
});

describe('AI Prompts - Safety Validation', () => {
  it.each(ALL_AI_CONFIGS)('$name AI has escalation rules', ({ config }) => {
    expect(config.systemPrompt).toMatch(/ESCALAR|humano|supervisor/i);
  });

  it('Safety AI prioritizes safety over cost', () => {
    expect(SAFETY_AI_CONFIG.systemPrompt).toContain('SEGURANÇA SEMPRE EM PRIMEIRO LUGAR');
  });

  it('Command AI has autonomy levels', () => {
    expect(COMMAND_AI_CONFIG.systemPrompt).toContain('Nível');
    expect(COMMAND_AI_CONFIG.systemPrompt).toContain('autonomia');
  });
});
