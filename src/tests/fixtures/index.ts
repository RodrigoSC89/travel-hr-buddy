/**
 * Test Fixtures Index
 * 
 * Centraliza todos os fixtures para testes unitários e de integração
 * 
 * ⚠️ ATENÇÃO: Estes fixtures são SOMENTE para testes
 * Em produção, use as APIs reais configurando as feature flags
 * 
 * @example
 * import { TerrastarFixtures, StarFixFixtures } from '@/tests/fixtures';
 * 
 * const mockData = TerrastarFixtures.fullDataset();
 */

export { TerrastarFixtures, createMockIonosphereData, createMockCorrection, createMockAlerts } from './terrastar.fixture';
export { StarFixFixtures, createMockVessel, createMockInspection, createMockDeficiency, createMockPerformanceMetrics } from './starfix.fixture';

/**
 * Verifica se estamos em ambiente de teste
 */
export function isTestEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.VITEST === 'true' ||
    typeof (globalThis as Record<string, unknown>).vi !== 'undefined'
  );
}

/**
 * Verifica se devemos usar mocks (dev/test)
 */
export function shouldUseMocks(): boolean {
  const env = import.meta.env;
  return (
    env.DEV ||
    env.MODE === 'development' ||
    env.MODE === 'test' ||
    isTestEnvironment()
  );
}
