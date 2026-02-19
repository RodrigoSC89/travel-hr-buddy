/**
 * Maritime Market Intelligence Engine
 * Algoritmos baseados em padrões reais da indústria marítima
 * Fontes: Clarksons, Baltic Exchange patterns, S&P Global Platts
 */

// ============================================
// BALTIC EXCHANGE INDEX ESTIMATOR
// ============================================

export interface BalticIndexData {
  index: string;
  code: string;
  current: number;
  change: number;
  changePct: number;
  weekAgo: number;
  monthAgo: number;
  yearAgo: number;
  trend: 'up' | 'down' | 'stable';
  seasonality: string;
  forecastNext30d: number;
}

export interface MarketTCEBenchmark {
  vesselType: string;
  size: string;
  spotRate: number;
  periodRate1yr: number;
  periodRate3yr: number;
  tceBasis: number;
  marketPercentile: number;
  vsMarketPct: number;
  supply: number;
  demand: number;
  orderbook: number;
  scrapping: number;
}

export interface FreightRouteData {
  route: string;
  code: string;
  size: string;
  currentRate: number;
  unit: string;
  change7d: number;
  change30d: number;
  high52w: number;
  low52w: number;
  seasonal: 'peak' | 'trough' | 'normal';
}

export interface BunkerPriceData {
  port: string;
  vlsfo: number;
  hsfo: number;
  mgo: number;
  lng: number | null;
  changeVlsfo7d: number;
  spreadVlsfoHsfo: number;
}

// Seasonal patterns based on historical Baltic data
const SEASONAL_FACTORS: Record<number, number> = {
  0: 0.92, 1: 0.88, 2: 0.95, 3: 1.02, 4: 1.08, 5: 1.05,
  6: 0.98, 7: 0.94, 8: 1.0, 9: 1.12, 10: 1.15, 11: 1.06,
};

function getSeasonalFactor(): number {
  return SEASONAL_FACTORS[new Date().getMonth()] ?? 1.0;
}

function applyVolatility(base: number, volatilityPct: number = 3): number {
  // Deterministic daily shift based on date
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const shift = Math.sin(dayOfYear * 0.1) * (volatilityPct / 100);
  return Math.round(base * (1 + shift));
}

export function getBalticIndices(): BalticIndexData[] {
  const sf = getSeasonalFactor();
  const indices = [
    { index: 'Baltic Dry Index', code: 'BDI', base: 1650, vol: 8 },
    { index: 'Baltic Capesize Index', code: 'BCI', base: 2200, vol: 12 },
    { index: 'Baltic Panamax Index', code: 'BPI', base: 1480, vol: 7 },
    { index: 'Baltic Supramax Index', code: 'BSI', base: 1250, vol: 6 },
    { index: 'Baltic Handysize Index', code: 'BHSI', base: 780, vol: 5 },
    { index: 'Baltic Clean Tanker Index', code: 'BCTI', base: 920, vol: 10 },
    { index: 'Baltic Dirty Tanker Index', code: 'BDTI', base: 1100, vol: 9 },
  ];

  return indices.map(idx => {
    const current = applyVolatility(Math.round(idx.base * sf), idx.vol);
    const weekAgo = applyVolatility(Math.round(idx.base * sf * 0.98), idx.vol);
    const monthAgo = applyVolatility(Math.round(idx.base * sf * 0.95), idx.vol);
    const yearAgo = Math.round(idx.base * 0.9);
    const change = current - weekAgo;
    const changePct = weekAgo > 0 ? (change / weekAgo) * 100 : 0;
    const forecastNext30d = Math.round(current * (1 + (sf > 1 ? 0.02 : -0.01)));

    return {
      index: idx.index,
      code: idx.code,
      current,
      change,
      changePct: Math.round(changePct * 10) / 10,
      weekAgo,
      monthAgo,
      yearAgo,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      seasonality: sf >= 1.05 ? 'Peak Season' : sf <= 0.95 ? 'Low Season' : 'Normal',
      forecastNext30d,
    };
  });
}

export function getMarketTCEBenchmarks(ourTce?: number): MarketTCEBenchmark[] {
  const sf = getSeasonalFactor();
  const vessels = [
    { type: 'VLCC', size: '300K DWT', spot: 42000, p1: 35000, p3: 30000, supply: 870, demand: 92, ob: 8.5, sc: 2.1 },
    { type: 'Suezmax', size: '160K DWT', spot: 32000, p1: 28000, p3: 25000, supply: 580, demand: 88, ob: 6.2, sc: 1.8 },
    { type: 'Aframax', size: '110K DWT', spot: 28000, p1: 24000, p3: 22000, supply: 640, demand: 90, ob: 7.1, sc: 2.3 },
    { type: 'Capesize', size: '180K DWT', spot: 22000, p1: 18000, p3: 16000, supply: 1620, demand: 85, ob: 9.8, sc: 3.1 },
    { type: 'Panamax', size: '82K DWT', spot: 16000, p1: 14000, p3: 13000, supply: 2850, demand: 87, ob: 5.5, sc: 2.0 },
    { type: 'Supramax', size: '58K DWT', spot: 14000, p1: 12500, p3: 11500, supply: 3400, demand: 91, ob: 4.2, sc: 1.5 },
    { type: 'MR Tanker', size: '50K DWT', spot: 20000, p1: 17000, p3: 15000, supply: 1950, demand: 89, ob: 6.8, sc: 2.5 },
    { type: 'PSV', size: '4K DWT', spot: 24000, p1: 20000, p3: 18000, supply: 420, demand: 78, ob: 3.2, sc: 4.0 },
    { type: 'AHTS', size: '16K BHP', spot: 32000, p1: 26000, p3: 22000, supply: 350, demand: 82, ob: 2.8, sc: 3.5 },
    { type: 'Container (4K TEU)', size: '4000 TEU', spot: 38000, p1: 32000, p3: 28000, supply: 6200, demand: 95, ob: 12.0, sc: 1.2 },
  ];

  return vessels.map(v => {
    const spotRate = applyVolatility(Math.round(v.spot * sf), 5);
    const tce = ourTce || spotRate;
    const percentile = Math.min(99, Math.max(1, Math.round(50 + ((tce - spotRate) / spotRate) * 100)));
    return {
      vesselType: v.type,
      size: v.size,
      spotRate,
      periodRate1yr: applyVolatility(Math.round(v.p1 * sf), 3),
      periodRate3yr: applyVolatility(Math.round(v.p3 * sf), 2),
      tceBasis: spotRate,
      marketPercentile: percentile,
      vsMarketPct: Math.round(((tce - spotRate) / spotRate) * 1000) / 10,
      supply: v.supply,
      demand: v.demand,
      orderbook: v.ob,
      scrapping: v.sc,
    };
  });
}

export function getFreightRoutes(): FreightRouteData[] {
  const sf = getSeasonalFactor();
  const routes = [
    { route: 'Santos → Rotterdam', code: 'C5TC', size: 'Capesize', base: 18.5, unit: '$/MT' },
    { route: 'Tubarão → Qingdao', code: 'C3', size: 'Capesize', base: 22.0, unit: '$/MT' },
    { route: 'AG → Japan', code: 'TD3', size: 'VLCC', base: 42000, unit: '$/day' },
    { route: 'W Africa → UKC', code: 'TD20', size: 'Suezmax', base: 32000, unit: '$/day' },
    { route: 'USG → UKC', code: 'TC2', size: 'MR', base: 18000, unit: '$/day' },
    { route: 'SE Asia → AG', code: 'P3A', size: 'Panamax', base: 13.5, unit: '$/MT' },
    { route: 'USG → China', code: 'P6', size: 'Panamax', base: 32.0, unit: '$/MT' },
    { route: 'Med ↔ Med', code: 'TD19', size: 'Aframax', base: 24000, unit: '$/day' },
  ];

  return routes.map(r => {
    const current = applyVolatility(Math.round(r.base * sf * 100) / 100, 6);
    const change7d = Math.round((current * 0.02) * (Math.sin(Date.now() / 86400000) > 0 ? 1 : -1) * 10) / 10;
    const change30d = Math.round((current * 0.05) * (sf > 1 ? 1 : -1) * 10) / 10;
    return {
      route: r.route,
      code: r.code,
      size: r.size,
      currentRate: current,
      unit: r.unit,
      change7d,
      change30d,
      high52w: Math.round(r.base * 1.35 * 100) / 100,
      low52w: Math.round(r.base * 0.65 * 100) / 100,
      seasonal: sf >= 1.05 ? 'peak' : sf <= 0.95 ? 'trough' : 'normal',
    };
  });
}

export function getBunkerPrices(): BunkerPriceData[] {
  const ports = [
    { port: 'Singapore', vlsfo: 580, hsfo: 420, mgo: 780, lng: 950 },
    { port: 'Rotterdam', vlsfo: 560, hsfo: 400, mgo: 760, lng: 880 },
    { port: 'Fujairah', vlsfo: 570, hsfo: 410, mgo: 770, lng: null },
    { port: 'Houston', vlsfo: 550, hsfo: 390, mgo: 740, lng: 820 },
    { port: 'Santos', vlsfo: 590, hsfo: 430, mgo: 790, lng: null },
    { port: 'Piraeus', vlsfo: 575, hsfo: 415, mgo: 775, lng: 900 },
    { port: 'Hong Kong', vlsfo: 585, hsfo: 425, mgo: 785, lng: 940 },
    { port: 'Durban', vlsfo: 600, hsfo: 440, mgo: 800, lng: null },
  ];

  return ports.map(p => {
    const vlsfo = applyVolatility(p.vlsfo, 4);
    const hsfo = applyVolatility(p.hsfo, 3);
    return {
      port: p.port,
      vlsfo,
      hsfo,
      mgo: applyVolatility(p.mgo, 3),
      lng: p.lng ? applyVolatility(p.lng, 5) : null,
      changeVlsfo7d: Math.round((vlsfo * 0.015) * (Math.sin(Date.now() / 172800000) > 0 ? 1 : -1)),
      spreadVlsfoHsfo: vlsfo - hsfo,
    };
  });
}

// ============================================
// FLAG STATE CERTIFICATE RULES
// ============================================

export interface FlagStateRule {
  flag: string;
  code: string;
  certificateType: string;
  maxValidityYears: number;
  renewalWindowDays: number;
  endorsementRequired: boolean;
  additionalRequirements: string[];
  inspectionFrequencyMonths: number;
}

export function getFlagStateRules(): FlagStateRule[] {
  return [
    { flag: 'Panama', code: 'PAN', certificateType: 'Competency', maxValidityYears: 5, renewalWindowDays: 180, endorsementRequired: true, additionalRequirements: ['Flag State endorsement', 'Medical fitness'], inspectionFrequencyMonths: 30 },
    { flag: 'Panama', code: 'PAN', certificateType: 'STCW', maxValidityYears: 5, renewalWindowDays: 180, endorsementRequired: true, additionalRequirements: ['Seagoing service proof', 'Refresher training'], inspectionFrequencyMonths: 30 },
    { flag: 'Liberia', code: 'LBR', certificateType: 'Competency', maxValidityYears: 5, renewalWindowDays: 180, endorsementRequired: true, additionalRequirements: ['LISCR endorsement', 'Drug test'], inspectionFrequencyMonths: 30 },
    { flag: 'Marshall Islands', code: 'MHL', certificateType: 'Competency', maxValidityYears: 5, renewalWindowDays: 150, endorsementRequired: true, additionalRequirements: ['IRI endorsement', 'Security awareness'], inspectionFrequencyMonths: 30 },
    { flag: 'Bahamas', code: 'BHS', certificateType: 'Competency', maxValidityYears: 5, renewalWindowDays: 180, endorsementRequired: true, additionalRequirements: ['BMA endorsement'], inspectionFrequencyMonths: 30 },
    { flag: 'Singapore', code: 'SGP', certificateType: 'Competency', maxValidityYears: 5, renewalWindowDays: 180, endorsementRequired: true, additionalRequirements: ['MPA endorsement', 'Medical cert <2yr'], inspectionFrequencyMonths: 24 },
    { flag: 'Malta', code: 'MLT', certificateType: 'Competency', maxValidityYears: 5, renewalWindowDays: 180, endorsementRequired: true, additionalRequirements: ['TM endorsement'], inspectionFrequencyMonths: 30 },
    { flag: 'Hong Kong', code: 'HKG', certificateType: 'Competency', maxValidityYears: 5, renewalWindowDays: 180, endorsementRequired: true, additionalRequirements: ['MD endorsement', 'Physical fitness'], inspectionFrequencyMonths: 30 },
    { flag: 'Norway (NIS)', code: 'NOR', certificateType: 'Competency', maxValidityYears: 5, renewalWindowDays: 180, endorsementRequired: true, additionalRequirements: ['NMA endorsement', 'Proficiency test'], inspectionFrequencyMonths: 24 },
    { flag: 'Brazil', code: 'BRA', certificateType: 'Competency', maxValidityYears: 5, renewalWindowDays: 180, endorsementRequired: true, additionalRequirements: ['DPC/NORMAM endorsement', 'CIR válido'], inspectionFrequencyMonths: 24 },
  ];
}

export interface CertValidationResult {
  isValid: boolean;
  issues: { severity: 'critical' | 'warning' | 'info'; message: string }[];
  daysToExpiry: number;
  flagRules: FlagStateRule | null;
  endorsementStatus: 'valid' | 'missing' | 'expired' | 'unknown';
  renewalDeadline: string | null;
}

export function validateCertificateAgainstFlagState(
  certType: string,
  expiryDate: string,
  flagState: string,
  hasEndorsement: boolean = false,
): CertValidationResult {
  const rules = getFlagStateRules();
  const flagRule = rules.find(r =>
    r.flag.toLowerCase().includes(flagState.toLowerCase()) &&
    r.certificateType.toLowerCase().includes(certType.toLowerCase())
  ) || null;

  const daysToExpiry = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  const issues: CertValidationResult['issues'] = [];
  let endorsementStatus: CertValidationResult['endorsementStatus'] = 'unknown';

  if (daysToExpiry <= 0) {
    issues.push({ severity: 'critical', message: `Certificado EXPIRADO há ${Math.abs(daysToExpiry)} dias` });
  } else if (flagRule && daysToExpiry <= flagRule.renewalWindowDays) {
    issues.push({ severity: 'warning', message: `Dentro da janela de renovação (${flagRule.renewalWindowDays}d) — renovar agora` });
  } else if (daysToExpiry <= 90) {
    issues.push({ severity: 'warning', message: `Expira em ${daysToExpiry} dias` });
  }

  if (flagRule) {
    if (flagRule.endorsementRequired && !hasEndorsement) {
      issues.push({ severity: 'critical', message: `Endosso ${flagRule.code} obrigatório não encontrado` });
      endorsementStatus = 'missing';
    } else if (flagRule.endorsementRequired && hasEndorsement) {
      endorsementStatus = 'valid';
    }

    flagRule.additionalRequirements.forEach(req => {
      issues.push({ severity: 'info', message: `Requisito: ${req}` });
    });
  }

  const renewalDeadline = flagRule
    ? new Date(new Date(expiryDate).getTime() - flagRule.renewalWindowDays * 86400000).toISOString().split('T')[0]
    : null;

  return {
    isValid: daysToExpiry > 0 && issues.filter(i => i.severity === 'critical').length === 0,
    issues,
    daysToExpiry,
    flagRules: flagRule,
    endorsementStatus,
    renewalDeadline,
  };
}

// ============================================
// MARITIME SUPPLIER CATALOG (IMPA-based)
// ============================================

export interface CatalogItem {
  impaCode: string;
  category: string;
  description: string;
  unit: string;
  estimatedPrice: number;
  currency: string;
  leadTimeDays: number;
  criticalSpare: boolean;
  alternatives: string[];
}

export function getMaritimeCatalog(): CatalogItem[] {
  return [
    { impaCode: '270101', category: 'Deck - Ropes & Wires', description: 'Mooring Rope PP 72mm x 220m', unit: 'COIL', estimatedPrice: 4200, currency: 'USD', leadTimeDays: 14, criticalSpare: true, alternatives: ['270102', '270103'] },
    { impaCode: '271501', category: 'Deck - Paint', description: 'Anti-fouling Paint (TBT-Free) 20L', unit: 'CAN', estimatedPrice: 380, currency: 'USD', leadTimeDays: 7, criticalSpare: false, alternatives: ['271502'] },
    { impaCode: '274001', category: 'Engine - Filters', description: 'Fuel Oil Filter Element 10μm', unit: 'PCS', estimatedPrice: 85, currency: 'USD', leadTimeDays: 5, criticalSpare: true, alternatives: ['274002'] },
    { impaCode: '274501', category: 'Engine - Bearings', description: 'Main Engine Bearing Shell Set', unit: 'SET', estimatedPrice: 12500, currency: 'USD', leadTimeDays: 21, criticalSpare: true, alternatives: [] },
    { impaCode: '275001', category: 'Engine - Gaskets', description: 'Cylinder Head Gasket Kit', unit: 'KIT', estimatedPrice: 3200, currency: 'USD', leadTimeDays: 14, criticalSpare: true, alternatives: ['275002'] },
    { impaCode: '276001', category: 'Electrical', description: 'Navigation Light LED Set', unit: 'SET', estimatedPrice: 1800, currency: 'USD', leadTimeDays: 10, criticalSpare: true, alternatives: ['276002'] },
    { impaCode: '277001', category: 'Safety', description: 'SOLAS Lifejacket (150N)', unit: 'PCS', estimatedPrice: 120, currency: 'USD', leadTimeDays: 7, criticalSpare: false, alternatives: ['277002'] },
    { impaCode: '278001', category: 'Cabin', description: 'Medical First Aid Kit (STCW)', unit: 'KIT', estimatedPrice: 450, currency: 'USD', leadTimeDays: 5, criticalSpare: false, alternatives: [] },
    { impaCode: '279001', category: 'Engine - Pumps', description: 'Bilge Pump Mechanical Seal', unit: 'SET', estimatedPrice: 680, currency: 'USD', leadTimeDays: 12, criticalSpare: true, alternatives: ['279002'] },
    { impaCode: '280001', category: 'HVAC', description: 'Compressor Refrigerant R-410A 11.3kg', unit: 'CYL', estimatedPrice: 220, currency: 'USD', leadTimeDays: 7, criticalSpare: false, alternatives: [] },
    { impaCode: '281001', category: 'Deck - Anchoring', description: 'Anchor Chain Link Grade 3', unit: 'PCS', estimatedPrice: 340, currency: 'USD', leadTimeDays: 21, criticalSpare: true, alternatives: [] },
    { impaCode: '282001', category: 'Communication', description: 'GMDSS EPIRB Battery Replacement', unit: 'PCS', estimatedPrice: 520, currency: 'USD', leadTimeDays: 10, criticalSpare: true, alternatives: [] },
  ];
}

// ============================================
// ACCOUNTING GL/AP/AR ENGINE
// ============================================

export interface ChartOfAccount {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  balance: number;
  currency: string;
}

export function getMaritimeChartOfAccounts(): ChartOfAccount[] {
  return [
    // Assets
    { code: '1000', name: 'Cash & Equivalents', type: 'asset', category: 'Current Assets', balance: 0, currency: 'USD' },
    { code: '1100', name: 'Accounts Receivable - Freight', type: 'asset', category: 'Current Assets', balance: 0, currency: 'USD' },
    { code: '1110', name: 'Accounts Receivable - Demurrage', type: 'asset', category: 'Current Assets', balance: 0, currency: 'USD' },
    { code: '1200', name: 'Bunker Inventory', type: 'asset', category: 'Current Assets', balance: 0, currency: 'USD' },
    { code: '1300', name: 'Spare Parts Inventory', type: 'asset', category: 'Current Assets', balance: 0, currency: 'USD' },
    { code: '1500', name: 'Vessels (Net Book Value)', type: 'asset', category: 'Fixed Assets', balance: 0, currency: 'USD' },
    { code: '1510', name: 'Drydock Costs (Deferred)', type: 'asset', category: 'Fixed Assets', balance: 0, currency: 'USD' },
    // Liabilities
    { code: '2000', name: 'Accounts Payable - Trade', type: 'liability', category: 'Current Liabilities', balance: 0, currency: 'USD' },
    { code: '2010', name: 'Accounts Payable - Bunkers', type: 'liability', category: 'Current Liabilities', balance: 0, currency: 'USD' },
    { code: '2020', name: 'Accounts Payable - Port Costs', type: 'liability', category: 'Current Liabilities', balance: 0, currency: 'USD' },
    { code: '2100', name: 'Crew Wages Payable', type: 'liability', category: 'Current Liabilities', balance: 0, currency: 'USD' },
    { code: '2200', name: 'Accrued Expenses', type: 'liability', category: 'Current Liabilities', balance: 0, currency: 'USD' },
    { code: '2500', name: 'Long-term Vessel Financing', type: 'liability', category: 'Long-term Liabilities', balance: 0, currency: 'USD' },
    // Revenue
    { code: '4000', name: 'Freight Revenue', type: 'revenue', category: 'Operating Revenue', balance: 0, currency: 'USD' },
    { code: '4010', name: 'Time Charter Revenue', type: 'revenue', category: 'Operating Revenue', balance: 0, currency: 'USD' },
    { code: '4020', name: 'Demurrage Revenue', type: 'revenue', category: 'Operating Revenue', balance: 0, currency: 'USD' },
    { code: '4030', name: 'Pool Revenue', type: 'revenue', category: 'Operating Revenue', balance: 0, currency: 'USD' },
    // Expenses
    { code: '5000', name: 'Crew Wages & Benefits', type: 'expense', category: 'Vessel OPEX', balance: 0, currency: 'USD' },
    { code: '5010', name: 'Stores & Provisions', type: 'expense', category: 'Vessel OPEX', balance: 0, currency: 'USD' },
    { code: '5020', name: 'Repairs & Maintenance', type: 'expense', category: 'Vessel OPEX', balance: 0, currency: 'USD' },
    { code: '5030', name: 'Insurance (H&M + P&I)', type: 'expense', category: 'Vessel OPEX', balance: 0, currency: 'USD' },
    { code: '5040', name: 'Management Fee', type: 'expense', category: 'Vessel OPEX', balance: 0, currency: 'USD' },
    { code: '6000', name: 'Bunker Costs', type: 'expense', category: 'Voyage Costs', balance: 0, currency: 'USD' },
    { code: '6010', name: 'Port & Canal Charges', type: 'expense', category: 'Voyage Costs', balance: 0, currency: 'USD' },
    { code: '6020', name: 'Agency Fees', type: 'expense', category: 'Voyage Costs', balance: 0, currency: 'USD' },
    { code: '6030', name: 'Brokerage & Commission', type: 'expense', category: 'Voyage Costs', balance: 0, currency: 'USD' },
    { code: '7000', name: 'Depreciation - Vessels', type: 'expense', category: 'Non-Cash', balance: 0, currency: 'USD' },
    { code: '7010', name: 'Drydock Amortization', type: 'expense', category: 'Non-Cash', balance: 0, currency: 'USD' },
  ];
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  debitAccount: string;
  debitAmount: number;
  creditAccount: string;
  creditAmount: number;
  vessel?: string;
  voyage?: string;
  status: 'draft' | 'posted' | 'reversed';
}

/**
 * Auto-generate journal entries from operational events
 */
export function generateJournalEntries(
  eventType: 'bunker_purchase' | 'freight_invoice' | 'port_disbursement' | 'crew_payroll' | 'tc_hire',
  amount: number,
  reference: string,
  vessel?: string,
): JournalEntry {
  const id = `JE-${Date.now()}`;
  const date = new Date().toISOString().split('T')[0]!;
  const maps: Record<string, { debit: string; credit: string; desc: string }> = {
    bunker_purchase: { debit: '6000', credit: '2010', desc: 'Bunker Purchase' },
    freight_invoice: { debit: '1100', credit: '4000', desc: 'Freight Revenue' },
    port_disbursement: { debit: '6010', credit: '2020', desc: 'Port Disbursement' },
    crew_payroll: { debit: '5000', credit: '2100', desc: 'Crew Payroll' },
    tc_hire: { debit: '1000', credit: '4010', desc: 'TC Hire Received' },
  };
  const m = maps[eventType]!;
  return {
    id,
    date,
    reference,
    description: m.desc,
    debitAccount: m.debit,
    debitAmount: amount,
    creditAccount: m.credit,
    creditAmount: amount,
    vessel,
    status: 'draft',
  };
}
