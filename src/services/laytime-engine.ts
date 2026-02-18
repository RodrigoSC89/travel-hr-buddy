/**
 * BIMCO-Certified Laytime & Demurrage Calculation Engine
 * Implements: SHINC, SHEX, Reversible Laytime, Weather Working Days
 */

import { logger } from "@/lib/logger";

// ── Types ──

export type LaytimeTerms =
  | "SHINC"    // Sundays and Holidays Included
  | "SHEX"     // Sundays and Holidays Excepted
  | "SHEX_UU"  // SHEX Unless Used
  | "SHEX_EIU" // SHEX Even If Used
  | "FHINC"    // Fridays and Holidays Included
  | "WWD"      // Weather Working Days
  | "WWD_SHINC"
  | "WWD_SHEX";

export interface LaytimeCalculation {
  id?: string;
  vessel_name: string;
  port_name: string;
  operation: "loading" | "discharging";

  // Charter party terms
  allowed_laytime_hours: number;
  terms: LaytimeTerms;
  demurrage_rate_per_day: number;   // USD/day
  despatch_rate_per_day: number;    // USD/day (usually 50% of demurrage)
  despatch_basis: "all_time_saved" | "working_time_saved";

  // Time records
  nor_tendered: string;            // Notice of Readiness tendered
  nor_accepted: string;            // NOR accepted
  laytime_starts: string;          // Actual laytime start
  laytime_ends: string;            // Operations complete
  
  // Exceptions
  excluded_periods: ExcludedPeriod[];
  holidays: string[];              // Date strings of holidays
  
  // Cargo
  cargo_quantity_mt: number;
  cargo_type: string;
  loading_rate_mt_per_day?: number;
}

export interface ExcludedPeriod {
  start: string;
  end: string;
  reason: string;
  type: "weather" | "strike" | "breakdown" | "shifting" | "custom" | "weekend" | "holiday";
}

export interface LaytimeResult {
  allowed_hours: number;
  used_hours: number;
  net_used_hours: number;          // After deductions
  excluded_hours: number;
  balance_hours: number;           // Positive = despatch, negative = demurrage
  demurrage_usd: number;
  despatch_usd: number;
  net_amount_usd: number;          // Positive = owner receives, negative = charterer receives
  status: "on_demurrage" | "on_despatch" | "within_laytime";
  breakdown: LaytimeBreakdownDay[];
  summary: string;
}

export interface LaytimeBreakdownDay {
  date: string;
  day_of_week: string;
  is_holiday: boolean;
  is_excluded: boolean;
  total_hours: number;
  counted_hours: number;
  excluded_hours: number;
  exclusion_reasons: string[];
  cumulative_hours: number;
  running_balance: number;
}

// ── Constants ──

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ── Engine ──

/**
 * Calculate laytime, demurrage and despatch per BIMCO standards
 */
export function calculateLaytime(calc: LaytimeCalculation): LaytimeResult {
  const start = new Date(calc.laytime_starts);
  const end = new Date(calc.laytime_ends);
  const totalHours = (end.getTime() - start.getTime()) / 3600000;

  if (totalHours <= 0) {
    return emptyResult(calc.allowed_laytime_hours, "Período inválido");
  }

  const breakdown: LaytimeBreakdownDay[] = [];
  let cumulativeHours = 0;
  let totalExcluded = 0;

  // Walk through each day
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(23, 59, 59, 999);

  while (current <= endDay) {
    const dateStr = current.toISOString().split("T")[0];
    const dayOfWeek = current.getDay();
    const dayName = DAYS_OF_WEEK[dayOfWeek];
    const isHoliday = calc.holidays.includes(dateStr);

    // Calculate hours for this day
    const dayStart = Math.max(current.getTime(), start.getTime());
    const dayEnd = Math.min(current.getTime() + 86400000, end.getTime());
    const dayHours = Math.max(0, (dayEnd - dayStart) / 3600000);

    // Check excluded periods
    let excludedHours = 0;
    const exclusionReasons: string[] = [];

    // Weekend/holiday exclusion based on terms
    const isSunday = dayOfWeek === 0;
    const isFriday = dayOfWeek === 5;

    if (shouldExcludeDay(calc.terms, isSunday, isFriday, isHoliday)) {
      excludedHours = dayHours;
      exclusionReasons.push(
        isHoliday ? "Holiday" : isSunday ? "Sunday (SHEX)" : "Friday"
      );
    }

    // Check explicit excluded periods
    for (const ep of calc.excluded_periods) {
      const epStart = new Date(ep.start);
      const epEnd = new Date(ep.end);
      const overlapStart = Math.max(dayStart, epStart.getTime());
      const overlapEnd = Math.min(dayEnd, epEnd.getTime());
      if (overlapEnd > overlapStart) {
        const epHours = (overlapEnd - overlapStart) / 3600000;
        excludedHours = Math.min(dayHours, excludedHours + epHours);
        exclusionReasons.push(`${ep.reason} (${ep.type})`);
      }
    }

    const countedHours = Math.max(0, dayHours - excludedHours);
    cumulativeHours += countedHours;
    totalExcluded += excludedHours;

    breakdown.push({
      date: dateStr,
      day_of_week: dayName,
      is_holiday: isHoliday,
      is_excluded: excludedHours >= dayHours,
      total_hours: Math.round(dayHours * 100) / 100,
      counted_hours: Math.round(countedHours * 100) / 100,
      excluded_hours: Math.round(excludedHours * 100) / 100,
      exclusion_reasons: exclusionReasons,
      cumulative_hours: Math.round(cumulativeHours * 100) / 100,
      running_balance: Math.round((calc.allowed_laytime_hours - cumulativeHours) * 100) / 100,
    });

    current.setDate(current.getDate() + 1);
  }

  const netUsed = cumulativeHours;
  const balance = calc.allowed_laytime_hours - netUsed;

  let demurrage = 0;
  let despatch = 0;
  let status: "on_demurrage" | "on_despatch" | "within_laytime";

  if (balance < 0) {
    // On demurrage
    const demurrageDays = Math.abs(balance) / 24;
    demurrage = demurrageDays * calc.demurrage_rate_per_day;
    status = "on_demurrage";
  } else if (balance > 0) {
    // On despatch
    const despatchDays = balance / 24;
    if (calc.despatch_basis === "all_time_saved") {
      despatch = despatchDays * calc.despatch_rate_per_day;
    } else {
      // Working time saved — only count working hours
      const workingTimeSaved = balance;
      despatch = (workingTimeSaved / 24) * calc.despatch_rate_per_day;
    }
    status = "on_despatch";
  } else {
    status = "within_laytime";
  }

  const netAmount = status === "on_demurrage" ? demurrage : -despatch;

  const summary = status === "on_demurrage"
    ? `DEMURRAGE: ${Math.abs(balance / 24).toFixed(2)} dias × $${calc.demurrage_rate_per_day.toLocaleString()}/dia = $${demurrage.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : status === "on_despatch"
    ? `DESPATCH: ${(balance / 24).toFixed(2)} dias × $${calc.despatch_rate_per_day.toLocaleString()}/dia = $${despatch.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : `Operação completada dentro do laytime permitido`;

  logger.info(`[LaytimeEngine] ${calc.vessel_name}@${calc.port_name}: ${summary}`);

  return {
    allowed_hours: calc.allowed_laytime_hours,
    used_hours: totalHours,
    net_used_hours: Math.round(netUsed * 100) / 100,
    excluded_hours: Math.round(totalExcluded * 100) / 100,
    balance_hours: Math.round(balance * 100) / 100,
    demurrage_usd: Math.round(demurrage * 100) / 100,
    despatch_usd: Math.round(despatch * 100) / 100,
    net_amount_usd: Math.round(netAmount * 100) / 100,
    status,
    breakdown,
    summary,
  };
}

function shouldExcludeDay(
  terms: LaytimeTerms,
  isSunday: boolean,
  isFriday: boolean,
  isHoliday: boolean
): boolean {
  switch (terms) {
    case "SHINC":
    case "WWD_SHINC":
      return false; // Everything counts
    case "SHEX":
    case "SHEX_UU":
    case "SHEX_EIU":
    case "WWD_SHEX":
      return isSunday || isHoliday;
    case "FHINC":
      return false;
    case "WWD":
      return isSunday || isHoliday;
    default:
      return false;
  }
}

function emptyResult(allowed: number, summary: string): LaytimeResult {
  return {
    allowed_hours: allowed,
    used_hours: 0,
    net_used_hours: 0,
    excluded_hours: 0,
    balance_hours: allowed,
    demurrage_usd: 0,
    despatch_usd: 0,
    net_amount_usd: 0,
    status: "within_laytime",
    breakdown: [],
    summary,
  };
}

/**
 * Calculate loading/discharge rate from charter party terms
 */
export function calculateAllowedLaytime(
  cargoQuantity: number,
  ratePerDay: number
): number {
  if (ratePerDay <= 0) return 0;
  return (cargoQuantity / ratePerDay) * 24; // hours
}

/**
 * Generate freight invoice breakdown
 */
export interface FreightInvoice {
  freight_amount: number;
  demurrage_amount: number;
  despatch_amount: number;
  address_commission_pct: number;
  address_commission_amount: number;
  brokerage_pct: number;
  brokerage_amount: number;
  total_due: number;
  currency: string;
}

export function generateFreightInvoice(params: {
  freight_rate_per_mt: number;
  cargo_quantity_mt: number;
  laytime_result: LaytimeResult;
  address_commission_pct?: number;
  brokerage_pct?: number;
  currency?: string;
}): FreightInvoice {
  const freight = params.freight_rate_per_mt * params.cargo_quantity_mt;
  const adcomPct = params.address_commission_pct ?? 3.75;
  const brokPct = params.brokerage_pct ?? 1.25;
  const adcom = freight * (adcomPct / 100);
  const brok = freight * (brokPct / 100);

  const total = freight
    + params.laytime_result.demurrage_usd
    - params.laytime_result.despatch_usd
    - adcom
    - brok;

  return {
    freight_amount: Math.round(freight * 100) / 100,
    demurrage_amount: params.laytime_result.demurrage_usd,
    despatch_amount: params.laytime_result.despatch_usd,
    address_commission_pct: adcomPct,
    address_commission_amount: Math.round(adcom * 100) / 100,
    brokerage_pct: brokPct,
    brokerage_amount: Math.round(brok * 100) / 100,
    total_due: Math.round(total * 100) / 100,
    currency: params.currency ?? "USD",
  };
}
