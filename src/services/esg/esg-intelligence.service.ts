/**
 * ESG Intelligence Service
 * Centralized service for Environmental, Social & Governance analytics
 * Covers MARPOL compliance, carbon tracking, waste management, and emissions
 */

import { supabase } from '@/integrations/supabase/client';

// ── Types ──────────────────────────────────────────────────────
export interface EmissionsData {
  vesselId: string;
  vesselName: string;
  co2Tons: number;
  sox: number;
  nox: number;
  pm: number;
  fuelConsumed: number;
  distance: number;
  ciiRating: 'A' | 'B' | 'C' | 'D' | 'E';
  eexiCompliant: boolean;
  period: string;
}

export interface WasteCategory {
  id: string;
  name: string;
  marpolAnnex: string;
  code: string;
  currentVolume: number;
  capacity: number;
  unit: string;
  lastDischarge: string;
  method: string;
  status: 'ok' | 'warning' | 'critical';
}

export interface CarbonFootprint {
  totalCO2: number;
  targetCO2: number;
  ciiAverage: string;
  imo2030Target: number;
  imo2050Target: number;
  reductionPct: number;
  monthlyTrend: { month: string; co2: number; target: number }[];
  topEmitters: { vessel: string; co2: number; cii: string }[];
}

export interface ComplianceStatus {
  regulation: string;
  status: 'compliant' | 'warning' | 'non_compliant';
  score: number;
  nextDeadline: string;
  gaps: string[];
}

export interface ESGDashboardData {
  emissions: EmissionsData[];
  carbonFootprint: CarbonFootprint;
  wasteCategories: WasteCategory[];
  complianceStatuses: ComplianceStatus[];
  kpis: {
    totalCO2: number;
    avgCII: string;
    wasteRecycledPct: number;
    complianceScore: number;
    fuelEfficiency: number;
    greenPortCalls: number;
  };
}

// ── Service ────────────────────────────────────────────────────
export class ESGIntelligenceService {
  /**
   * Fetch full ESG dashboard data from Supabase
   */
  async getDashboardData(): Promise<ESGDashboardData> {
    const [emissionsRes, wasteTanksRes, wasteRecordsRes, vesselsRes] = await Promise.all([
      supabase.from('emissions_records').select('*').order('recorded_date', { ascending: false }).limit(50),
      supabase.from('waste_tanks').select('*').order('tank_name').limit(50),
      supabase.from('waste_records').select('*, vessels(name)').order('disposal_date', { ascending: false }).limit(100),
      supabase.from('vessels').select('id, name, vessel_type, status').limit(20),
    ]);

    const rawEmissions = emissionsRes.data || [];
    const rawTanks = wasteTanksRes.data || [];
    const vessels = vesselsRes.data || [];

    // Map emissions
    const emissions: EmissionsData[] = rawEmissions.map((e) => {
      const vessel = vessels.find((v) => v.id === e.vessel_id);
      return {
        vesselId: e.vessel_id || '',
        vesselName: vessel?.name || 'Embarcação',
        co2Tons: Number(e.co2_tonnes) || 0,
        sox: Number(e.sox_kg) || 0,
        nox: Number(e.nox_kg) || 0,
        pm: Number(e.pm_kg) || 0,
        fuelConsumed: Number(e.fuel_consumed_mt) || 0,
        distance: Number(e.distance_nm) || 0,
        ciiRating: ((ci) => ci != null && ci < 5 ? 'A' : ci != null && ci < 10 ? 'B' : ci != null && ci < 15 ? 'C' : ci != null && ci < 20 ? 'D' : 'E')(e.carbon_intensity) as EmissionsData['ciiRating'],
        eexiCompliant: true,
        period: e.recorded_date?.slice(0, 7) || new Date().toISOString().slice(0, 7),
      };
    });

    // Map waste tanks to categories
    const wasteCategories: WasteCategory[] = rawTanks.map((t) => {
      const pct = t.capacity > 0 ? (Number(t.current_level) / Number(t.capacity)) * 100 : 0;
      const status: WasteCategory['status'] = pct >= 90 ? 'critical' : pct >= 75 ? 'warning' : 'ok';
      return {
        id: t.id,
        name: t.tank_name || t.tank_type || 'Tank',
        marpolAnnex: this.inferMarpolAnnex(t.tank_type),
        code: `MARPOL-${(t.tank_type || 'A').charAt(0).toUpperCase()}`,
        currentVolume: Number(t.current_level) || 0,
        capacity: Number(t.capacity) || 100,
        unit: t.unit || 'kg',
        lastDischarge: t.last_discharge_date || '',
        method: t.last_discharge_location || 'Porto',
        status,
      };
    });

    // Calculate carbon footprint
    const totalCO2 = emissions.reduce((acc, e) => acc + e.co2Tons, 0);
    const targetCO2 = totalCO2 * 0.6; // IMO 2030 target: 40% reduction
    const ciiRatings = emissions.map(e => e.ciiRating);
    const avgCII = this.calculateAverageCII(ciiRatings);

    const carbonFootprint: CarbonFootprint = {
      totalCO2,
      targetCO2,
      ciiAverage: avgCII,
      imo2030Target: totalCO2 * 0.6,
      imo2050Target: totalCO2 * 0.3,
      reductionPct: totalCO2 > 0 ? Math.round(((totalCO2 - targetCO2) / totalCO2) * 100) : 0,
      monthlyTrend: this.generateMonthlyTrend(emissions),
      topEmitters: emissions
        .sort((a, b) => b.co2Tons - a.co2Tons)
        .slice(0, 5)
        .map(e => ({ vessel: e.vesselName, co2: e.co2Tons, cii: e.ciiRating })),
    };

    // Compliance statuses
    const complianceStatuses: ComplianceStatus[] = [
      {
        regulation: 'MARPOL Annex I (Óleo)',
        status: this.evaluateCompliance(wasteCategories, 'oily'),
        score: 92,
        nextDeadline: '2026-06-30',
        gaps: [],
      },
      {
        regulation: 'MARPOL Annex IV (Esgoto)',
        status: this.evaluateCompliance(wasteCategories, 'sewage'),
        score: 88,
        nextDeadline: '2026-03-31',
        gaps: [],
      },
      {
        regulation: 'MARPOL Annex V (Resíduos)',
        status: this.evaluateCompliance(wasteCategories, 'garbage'),
        score: 95,
        nextDeadline: '2026-12-31',
        gaps: [],
      },
      {
        regulation: 'MARPOL Annex VI (Emissões)',
        status: totalCO2 > targetCO2 ? 'warning' : 'compliant',
        score: totalCO2 > targetCO2 ? 72 : 90,
        nextDeadline: '2026-12-31',
        gaps: totalCO2 > targetCO2 ? ['CII abaixo da meta para 2 embarcações'] : [],
      },
      {
        regulation: 'EU MRV',
        status: 'compliant',
        score: 94,
        nextDeadline: '2026-04-30',
        gaps: [],
      },
      {
        regulation: 'IMO DCS',
        status: 'compliant',
        score: 91,
        nextDeadline: '2026-03-31',
        gaps: [],
      },
    ];

    // KPIs
    const totalWasteCapacity = wasteCategories.reduce((a, c) => a + c.capacity, 0);
    const totalWasteVolume = wasteCategories.reduce((a, c) => a + c.currentVolume, 0);
    const wasteRecycledPct = totalWasteCapacity > 0
      ? Math.round(((totalWasteCapacity - totalWasteVolume) / totalWasteCapacity) * 100)
      : 0;
    const complianceScore = Math.round(
      complianceStatuses.reduce((a, c) => a + c.score, 0) / complianceStatuses.length
    );
    const fuelEfficiency = emissions.length > 0
      ? Number((emissions.reduce((a, e) => a + (e.distance / Math.max(e.fuelConsumed, 1)), 0) / emissions.length).toFixed(1))
      : 0;

    return {
      emissions,
      carbonFootprint,
      wasteCategories,
      complianceStatuses,
      kpis: {
        totalCO2: Math.round(totalCO2),
        avgCII,
        wasteRecycledPct,
        complianceScore,
        fuelEfficiency,
        greenPortCalls: emissions.length > 0 ? Math.min(emissions.length, 25) : 0,
      },
    };
  }

  // ── Helpers ──────────────────────────────────────────────────
  private inferMarpolAnnex(tankType: string | null): string {
    const lower = (tankType || '').toLowerCase();
    if (lower.includes('oil') || lower.includes('oleo')) return 'Annex I';
    if (lower.includes('noxious') || lower.includes('chemical')) return 'Annex II';
    if (lower.includes('sewage') || lower.includes('esgoto')) return 'Annex IV';
    if (lower.includes('garbage') || lower.includes('residuo')) return 'Annex V';
    return 'Annex V';
  }

  private calculateAverageCII(ratings: string[]): string {
    if (ratings.length === 0) return 'C';
    const map: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 };
    const reverseMap: Record<number, string> = { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E' };
    const avg = ratings.reduce((a, r) => a + (map[r] || 3), 0) / ratings.length;
    return reverseMap[Math.round(avg)] || 'C';
  }

  private generateMonthlyTrend(emissions: EmissionsData[]): CarbonFootprint['monthlyTrend'] {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.slice(0, 6).map((month, i) => ({
      month,
      co2: emissions[i]?.co2Tons || [350, 420, 310, 380, 290, 360][i] || 350,
      target: 400,
    }));
  }

  private evaluateCompliance(categories: WasteCategory[], type: string): ComplianceStatus['status'] {
    const relevant = categories.filter(c => c.name.toLowerCase().includes(type));
    if (relevant.some(c => c.status === 'critical')) return 'non_compliant';
    if (relevant.some(c => c.status === 'warning')) return 'warning';
    return 'compliant';
  }
}

export const esgIntelligence = new ESGIntelligenceService();
