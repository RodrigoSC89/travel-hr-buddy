/**
 * 🌱 ENVIRONMENTAL - Types & Logic
 * Emissions tracking, decarbonization, ballast water, waste management
 */

export interface EmissionsData {
  vesselId: string;
  period: { start: Date; end: Date };
  co2: number;
  nox: number;
  sox: number;
  cii: { rating: 'A' | 'B' | 'C' | 'D' | 'E'; value: number };
  eexi: number;
  fuelConsumption: { type: string; quantity: number; co2Factor: number }[];
}

export interface DecarbonizationPlan {
  vesselId: string;
  currentIntensity: number;
  targetIntensity: number;
  targetYear: number;
  measures: DecarbonizationMeasure[];
  estimatedInvestment: number;
  estimatedSavings: number;
}

export interface DecarbonizationMeasure {
  id: string;
  name: string;
  type: 'operational' | 'technical' | 'fuel';
  reduction: number;
  cost: number;
  paybackYears: number;
  status: 'planned' | 'in_progress' | 'completed';
}

export class EnvironmentalEngine {
  private static instance: EnvironmentalEngine;
  static getInstance() { return this.instance || (this.instance = new EnvironmentalEngine()); }

  calculateCII(emissions: EmissionsData): { rating: 'A' | 'B' | 'C' | 'D' | 'E'; value: number } {
    const value = emissions.co2 / 1000;
    const rating = value < 5 ? 'A' : value < 10 ? 'B' : value < 15 ? 'C' : value < 20 ? 'D' : 'E';
    return { rating, value };
  }

  createDecarbonizationPlan(vesselId: string, currentIntensity: number): DecarbonizationPlan {
    return {
      vesselId,
      currentIntensity,
      targetIntensity: currentIntensity * 0.7,
      targetYear: 2030,
      measures: [
        { id: '1', name: 'Speed optimization', type: 'operational', reduction: 15, cost: 10000, paybackYears: 0.5, status: 'planned' },
        { id: '2', name: 'Hull coating', type: 'technical', reduction: 5, cost: 100000, paybackYears: 2, status: 'planned' },
      ],
      estimatedInvestment: 110000,
      estimatedSavings: 200000,
    };
  }
}

export const environmental = EnvironmentalEngine.getInstance();
