/**
 * PMS Job Scheduling & Spare Parts Auto-Reorder Service
 * Calendar-based scheduling with conflict detection and ROL/ROQ calculation
 */

import { logger } from "@/lib/logger";

// ── Types ──

export interface MaintenanceJob {
  id: string;
  title: string;
  component_name: string;
  vessel_id: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "overdue" | "deferred";
  scheduled_date: string;
  due_date: string;
  estimated_hours: number;
  assigned_to?: string;
  requires_port?: boolean;
  requires_drydock?: boolean;
  interval_days?: number;
  last_completed?: string;
  class_survey_linked?: boolean;
}

export interface ScheduleConflict {
  job_a: string;
  job_b: string;
  conflict_type: "resource" | "time_overlap" | "port_required" | "drydock";
  description: string;
  suggested_resolution: string;
}

export interface CalendarSlot {
  date: string;
  available_hours: number;
  jobs: MaintenanceJob[];
  is_port_day: boolean;
  is_drydock: boolean;
  utilization_pct: number;
}

export interface SparePartROL {
  part_id: string;
  part_name: string;
  current_stock: number;
  reorder_level: number;        // ROL: When to reorder
  reorder_quantity: number;     // ROQ: How much to order
  avg_monthly_consumption: number;
  lead_time_days: number;
  safety_stock: number;
  status: "adequate" | "low" | "critical" | "out_of_stock";
  estimated_cost_usd: number;
  auto_reorder_triggered: boolean;
}

// ── Scheduling Engine ──

/**
 * Detect scheduling conflicts between maintenance jobs
 */
export function detectConflicts(jobs: MaintenanceJob[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < jobs.length; i++) {
    for (let j = i + 1; j < jobs.length; j++) {
      const a = jobs[i];
      const b = jobs[j];

      // Same date, same vessel, exceeding available hours
      if (
        a.scheduled_date === b.scheduled_date &&
        a.vessel_id === b.vessel_id &&
        a.estimated_hours + b.estimated_hours > 16
      ) {
        conflicts.push({
          job_a: a.id,
          job_b: b.id,
          conflict_type: "time_overlap",
          description: `${a.title} e ${b.title} excedem capacidade diária (${a.estimated_hours + b.estimated_hours}h > 16h)`,
          suggested_resolution: `Mover ${b.priority === "critical" ? a.title : b.title} para ${getNextAvailableDate(a.scheduled_date)}`,
        });
      }

      // Both require port but on different dates
      if (
        a.requires_port &&
        b.requires_port &&
        a.vessel_id === b.vessel_id &&
        a.scheduled_date !== b.scheduled_date
      ) {
        conflicts.push({
          job_a: a.id,
          job_b: b.id,
          conflict_type: "port_required",
          description: `Ambos requerem porto. Consolidar para reduzir downtime.`,
          suggested_resolution: `Agendar ambos para ${a.scheduled_date} (uma escala técnica)`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Auto-schedule jobs considering priority and constraints
 */
export function autoScheduleJobs(
  jobs: MaintenanceJob[],
  availableSlots: CalendarSlot[]
): Map<string, string> {
  const schedule = new Map<string, string>();
  const slotLoad = new Map<string, number>();

  // Initialize slot loads
  for (const slot of availableSlots) {
    slotLoad.set(slot.date, slot.jobs.reduce((sum, j) => sum + j.estimated_hours, 0));
  }

  // Sort by priority (critical first) then due date
  const sorted = [...jobs]
    .filter((j) => j.status === "pending" || j.status === "overdue")
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

  for (const job of sorted) {
    let bestSlot: CalendarSlot | null = null;
    let bestScore = -Infinity;

    for (const slot of availableSlots) {
      const currentLoad = slotLoad.get(slot.date) || 0;
      if (currentLoad + job.estimated_hours > 16) continue;
      if (job.requires_port && !slot.is_port_day) continue;
      if (job.requires_drydock && !slot.is_drydock) continue;

      // Scoring: prefer earlier dates for high priority, later for low
      const dueDate = new Date(job.due_date).getTime();
      const slotDate = new Date(slot.date).getTime();
      const daysBeforeDue = (dueDate - slotDate) / 86400000;

      let score = 0;
      if (daysBeforeDue >= 0) score += 10; // Before due date
      if (daysBeforeDue >= 7) score += 5;  // Comfortable buffer
      score -= currentLoad / 16 * 5;       // Prefer less loaded slots

      if (score > bestScore) {
        bestScore = score;
        bestSlot = slot;
      }
    }

    if (bestSlot) {
      schedule.set(job.id, bestSlot.date);
      slotLoad.set(
        bestSlot.date,
        (slotLoad.get(bestSlot.date) || 0) + job.estimated_hours
      );
    }
  }

  return schedule;
}

// ── Spare Parts ROL/ROQ ──

/**
 * Calculate Reorder Level and Reorder Quantity
 * ROL = (Average Daily Consumption × Lead Time) + Safety Stock
 * ROQ = EOQ (Economic Order Quantity) or fixed multiple
 */
export function calculateROL(params: {
  avg_monthly_consumption: number;
  lead_time_days: number;
  unit_cost_usd: number;
  current_stock: number;
  service_level?: number; // 0.95 = 95% (default)
}): SparePartROL {
  const { avg_monthly_consumption, lead_time_days, unit_cost_usd, current_stock } = params;
  const serviceLevel = params.service_level ?? 0.95;

  const dailyConsumption = avg_monthly_consumption / 30;

  // Safety stock (Z-score for service level × std dev × sqrt(lead time))
  const zScore = serviceLevel >= 0.99 ? 2.33 : serviceLevel >= 0.95 ? 1.65 : 1.28;
  const stdDev = dailyConsumption * 0.3; // Assume 30% variability
  const safetyStock = Math.ceil(zScore * stdDev * Math.sqrt(lead_time_days));

  // ROL
  const reorderLevel = Math.ceil(dailyConsumption * lead_time_days + safetyStock);

  // ROQ using EOQ (Wilson formula)
  const orderingCost = 50; // Fixed cost per order (USD)
  const holdingCostRate = 0.25; // 25% of unit cost per year
  const annualDemand = avg_monthly_consumption * 12;
  const holdingCost = unit_cost_usd * holdingCostRate;

  let eoq = Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / Math.max(holdingCost, 0.01)));
  eoq = Math.max(eoq, Math.ceil(avg_monthly_consumption)); // At least 1 month supply

  // Status
  let status: "adequate" | "low" | "critical" | "out_of_stock";
  if (current_stock === 0) status = "out_of_stock";
  else if (current_stock <= safetyStock) status = "critical";
  else if (current_stock <= reorderLevel) status = "low";
  else status = "adequate";

  const autoReorder = current_stock <= reorderLevel;

  if (autoReorder) {
    logger.warn(`[PMS-ROL] Auto-reorder triggered: stock=${current_stock} ≤ ROL=${reorderLevel}`);
  }

  return {
    part_id: "",
    part_name: "",
    current_stock,
    reorder_level: reorderLevel,
    reorder_quantity: eoq,
    avg_monthly_consumption,
    lead_time_days,
    safety_stock: safetyStock,
    status,
    estimated_cost_usd: Math.round(eoq * unit_cost_usd * 100) / 100,
    auto_reorder_triggered: autoReorder,
  };
}

/**
 * Calculate Class Survey countdown windows
 */
export interface ClassSurveyWindow {
  survey_type: string;
  due_date: string;
  window_opens: string;
  window_closes: string;
  days_remaining: number;
  status: "upcoming" | "in_window" | "overdue" | "completed";
  linked_maintenance_jobs: string[];
}

export function calculateClassSurveyWindows(
  lastSurveyDate: string,
  surveyInterval: number = 5, // years
  windowMonths: number = 3
): ClassSurveyWindow {
  const lastDate = new Date(lastSurveyDate);
  const dueDate = new Date(lastDate);
  dueDate.setFullYear(dueDate.getFullYear() + surveyInterval);

  const windowOpens = new Date(dueDate);
  windowOpens.setMonth(windowOpens.getMonth() - windowMonths);

  const now = new Date();
  const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);

  let status: ClassSurveyWindow["status"];
  if (daysRemaining < 0) status = "overdue";
  else if (now >= windowOpens) status = "in_window";
  else status = "upcoming";

  return {
    survey_type: `${surveyInterval}-Year Survey`,
    due_date: dueDate.toISOString().split("T")[0],
    window_opens: windowOpens.toISOString().split("T")[0],
    window_closes: dueDate.toISOString().split("T")[0],
    days_remaining: Math.max(0, daysRemaining),
    status,
    linked_maintenance_jobs: [],
  };
}

// ── Helpers ──

function getNextAvailableDate(fromDate: string): string {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
