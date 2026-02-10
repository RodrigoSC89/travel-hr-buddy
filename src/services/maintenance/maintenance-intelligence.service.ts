/**
 * Maintenance Intelligence Service - M046-M051
 * Core service for Equipment Digital Twin, CBM, and Dry Dock Planning
 */

import { supabase } from "@/integrations/supabase/client";

// ===== Types =====

export interface EquipmentTwin {
  id: string;
  name: string;
  type: "engine" | "pump" | "generator" | "compressor" | "separator" | "boiler" | "steering" | "propeller";
  vessel: string;
  healthScore: number;
  status: "operational" | "degraded" | "warning" | "critical" | "offline";
  runningHours: number;
  maxHours: number;
  lastInspection: Date;
  nextMaintenance: Date;
  sensors: SensorReading[];
  components: TwinComponent[];
  maintenanceHistory: MaintenanceEvent[];
}

export interface SensorReading {
  id: string;
  name: string;
  parameter: string;
  value: number;
  unit: string;
  threshold: { min: number; max: number; critical: number };
  trend: "rising" | "falling" | "stable" | "oscillating";
  lastUpdate: Date;
  status: "normal" | "warning" | "alarm" | "critical";
}

export interface TwinComponent {
  id: string;
  name: string;
  healthPercent: number;
  wearLevel: number;
  estimatedLifeRemaining: number; // days
  replacementCost: number;
  lastReplaced: Date | null;
}

export interface MaintenanceEvent {
  id: string;
  date: Date;
  type: "preventive" | "corrective" | "predictive" | "inspection";
  description: string;
  cost: number;
  duration: number; // hours
  technician: string;
}

export interface CBMAlert {
  id: string;
  equipmentId: string;
  equipmentName: string;
  parameter: string;
  currentValue: number;
  normalRange: { min: number; max: number };
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: Date;
  recommendedAction: string;
  estimatedDaysToFailure: number;
}

export interface DryDockProject {
  id: string;
  vesselName: string;
  scheduledDate: Date;
  estimatedDuration: number; // days
  estimatedCost: number;
  status: "planning" | "approved" | "in_progress" | "completed" | "postponed";
  yardName: string;
  scopeItems: DryDockWorkItem[];
  totalHours: number;
  progress: number;
}

export interface DryDockWorkItem {
  id: string;
  category: "hull" | "machinery" | "piping" | "electrical" | "painting" | "survey" | "safety";
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  estimatedHours: number;
  estimatedCost: number;
  status: "pending" | "in_progress" | "completed" | "deferred";
  assignedTo: string;
}

// ===== Service =====

class MaintenanceIntelligenceService {
  /**
   * Build equipment digital twin from maintenance data
   */
  async getEquipmentTwins(vesselId?: string): Promise<EquipmentTwin[]> {
    const { data: tasks, error } = await supabase
      .from("maintenance_tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    const equipmentMap = new Map<string, EquipmentTwin>();
    const now = new Date();

    (tasks || []).forEach((task) => {
      const name = task.component_name || task.title || "Equipment";
      if (!equipmentMap.has(name)) {
        const baseHealth = this.calculateHealthFromPriority(task.priority);
        const runHours = 5000 + ((name.length * 137) % 15000);
        const maxHours = 25000;

        equipmentMap.set(name, {
          id: task.id,
          name,
          type: this.inferEquipmentType(name),
          vessel: "MV Atlantic Star",
          healthScore: baseHealth,
          status: this.healthToStatus(baseHealth),
          runningHours: runHours,
          maxHours,
          lastInspection: new Date(task.completed_date || now.getTime() - 30 * 86400000),
          nextMaintenance: new Date(task.due_date || now.getTime() + 30 * 86400000),
          sensors: this.generateSensorsForEquipment(name, baseHealth),
          components: this.generateComponentsForEquipment(name, baseHealth),
          maintenanceHistory: [],
        });
      }

      const twin = equipmentMap.get(name)!;
      twin.maintenanceHistory.push({
        id: task.id,
        date: new Date(task.created_at || now),
        type: (task.task_type as MaintenanceEvent["type"]) || "preventive",
        description: task.description || task.title || "",
        cost: Number(task.estimated_hours || 4) * 150,
        duration: Number(task.estimated_hours || 4),
        technician: "Equipe Técnica",
      });
    });

    return Array.from(equipmentMap.values()).slice(0, 12);
  }

  /**
   * Get CBM alerts from sensor thresholds
   */
  async getCBMAlerts(): Promise<CBMAlert[]> {
    const { data: predictions, error } = await supabase
      .from("ai_maintenance_predictions")
      .select("*")
      .order("failure_probability", { ascending: false })
      .limit(20);

    if (error) throw error;

    return (predictions || []).map((pred) => {
      const failProb = pred.failure_probability || 0;
      const severity: CBMAlert["severity"] = failProb > 70 ? "critical" : failProb > 40 ? "warning" : "info";

      return {
        id: pred.id,
        equipmentId: pred.equipment_id,
        equipmentName: pred.equipment_name,
        parameter: "Failure Probability",
        currentValue: failProb,
        normalRange: { min: 0, max: 30 },
        severity,
        message: `${pred.equipment_name}: ${failProb}% probabilidade de falha`,
        timestamp: new Date(pred.created_at),
        recommendedAction: pred.recommended_action || "Monitorar",
        estimatedDaysToFailure: pred.predicted_failure_date
          ? Math.max(0, Math.round((new Date(pred.predicted_failure_date).getTime() - Date.now()) / 86400000))
          : 90,
      };
    });
  }

  /**
   * Build dry dock project plan from maintenance backlog
   */
  async getDryDockProjects(): Promise<DryDockProject[]> {
    const { data: tasks, error } = await supabase
      .from("maintenance_tasks")
      .select("*")
      .in("status", ["scheduled", "overdue"])
      .order("priority", { ascending: true })
      .limit(50);

    if (error) throw error;

    const scopeItems: DryDockWorkItem[] = (tasks || []).map((task) => ({
      id: task.id,
      category: this.inferWorkCategory(task.component_name || task.title || ""),
      description: task.description || task.title || "Manutenção programada",
      priority: (task.priority as DryDockWorkItem["priority"]) || "medium",
      estimatedHours: Number(task.estimated_hours || 8),
      estimatedCost: Number(task.estimated_hours || 8) * 200,
      status: "pending" as const,
      assignedTo: "TBD",
    }));

    const totalHours = scopeItems.reduce((sum, item) => sum + item.estimatedHours, 0);
    const totalCost = scopeItems.reduce((sum, item) => sum + item.estimatedCost, 0);

    if (scopeItems.length === 0) return [];

    return [{
      id: "DD-2026-001",
      vesselName: "MV Atlantic Star",
      scheduledDate: new Date(Date.now() + 90 * 86400000),
      estimatedDuration: Math.ceil(totalHours / 24),
      estimatedCost: totalCost + 50000, // yard fees
      status: "planning",
      yardName: "Jurong Shipyard, Singapore",
      scopeItems,
      totalHours,
      progress: 0,
    }];
  }

  /**
   * Run AI optimization analysis via Edge Function
   */
  async runOptimization(analysisType: string, vesselId?: string, equipmentId?: string) {
    const { data, error } = await supabase.functions.invoke("maintenance-optimizer-ai", {
      body: { analysisType, vesselId, equipmentId },
    });

    if (error) throw error;
    return data;
  }

  // ===== Private helpers =====

  private calculateHealthFromPriority(priority: string | null): number {
    switch (priority) {
      case "critical": return 42;
      case "high": return 62;
      case "medium": return 77;
      case "low": return 90;
      default: return 87;
    }
  }

  private healthToStatus(health: number): EquipmentTwin["status"] {
    if (health >= 85) return "operational";
    if (health >= 70) return "degraded";
    if (health >= 50) return "warning";
    return "critical";
  }

  private inferEquipmentType(name: string): EquipmentTwin["type"] {
    const lower = name.toLowerCase();
    if (lower.includes("engine") || lower.includes("motor")) return "engine";
    if (lower.includes("pump") || lower.includes("bomba")) return "pump";
    if (lower.includes("generator") || lower.includes("gerador")) return "generator";
    if (lower.includes("compressor")) return "compressor";
    if (lower.includes("separator") || lower.includes("separador")) return "separator";
    if (lower.includes("boiler") || lower.includes("caldeira")) return "boiler";
    if (lower.includes("steering") || lower.includes("leme")) return "steering";
    if (lower.includes("propeller") || lower.includes("hélice")) return "propeller";
    return "engine";
  }

  private inferWorkCategory(name: string): DryDockWorkItem["category"] {
    const lower = name.toLowerCase();
    if (lower.includes("hull") || lower.includes("casco")) return "hull";
    if (lower.includes("engine") || lower.includes("motor") || lower.includes("pump")) return "machinery";
    if (lower.includes("pipe") || lower.includes("tubo") || lower.includes("valve")) return "piping";
    if (lower.includes("electric") || lower.includes("elétric")) return "electrical";
    if (lower.includes("paint") || lower.includes("pintura") || lower.includes("coat")) return "painting";
    if (lower.includes("survey") || lower.includes("vistoria") || lower.includes("class")) return "survey";
    return "safety";
  }

  private generateSensorsForEquipment(name: string, health: number): SensorReading[] {
    const degradation = (100 - health) / 100;
    const now = new Date();

    return [
      {
        id: `${name}-temp`,
        name: "Temperature",
        parameter: "temperature_c",
        value: Math.round(75 + degradation * 35),
        unit: "°C",
        threshold: { min: 60, max: 95, critical: 110 },
        trend: degradation > 0.3 ? "rising" : "stable",
        lastUpdate: now,
        status: degradation > 0.5 ? "warning" : "normal",
      },
      {
        id: `${name}-vib`,
        name: "Vibration",
        parameter: "vibration_mm_s",
        value: parseFloat((2.5 + degradation * 8).toFixed(1)),
        unit: "mm/s",
        threshold: { min: 0, max: 7.1, critical: 11.2 },
        trend: degradation > 0.4 ? "rising" : "stable",
        lastUpdate: now,
        status: degradation > 0.6 ? "alarm" : degradation > 0.3 ? "warning" : "normal",
      },
      {
        id: `${name}-press`,
        name: "Pressure",
        parameter: "pressure_bar",
        value: parseFloat((6.5 - degradation * 2).toFixed(1)),
        unit: "bar",
        threshold: { min: 4, max: 8, critical: 10 },
        trend: degradation > 0.3 ? "falling" : "stable",
        lastUpdate: now,
        status: degradation > 0.5 ? "warning" : "normal",
      },
      {
        id: `${name}-rpm`,
        name: "RPM",
        parameter: "rpm",
        value: Math.round(1800 - degradation * 300),
        unit: "RPM",
        threshold: { min: 1400, max: 2000, critical: 2200 },
        trend: degradation > 0.4 ? "falling" : "stable",
        lastUpdate: now,
        status: degradation > 0.6 ? "warning" : "normal",
      },
    ];
  }

  private generateComponentsForEquipment(name: string, health: number): TwinComponent[] {
    const degradation = (100 - health) / 100;

    return [
      {
        id: `${name}-bearings`,
        name: "Bearings",
        healthPercent: Math.round(Math.max(20, 95 - degradation * 60)),
        wearLevel: parseFloat((degradation * 80).toFixed(1)),
        estimatedLifeRemaining: Math.round(365 * (1 - degradation)),
        replacementCost: 15000,
        lastReplaced: new Date(Date.now() - 180 * 86400000),
      },
      {
        id: `${name}-seals`,
        name: "Seals & Gaskets",
        healthPercent: Math.round(Math.max(15, 90 - degradation * 70)),
        wearLevel: parseFloat((degradation * 90).toFixed(1)),
        estimatedLifeRemaining: Math.round(200 * (1 - degradation)),
        replacementCost: 5000,
        lastReplaced: new Date(Date.now() - 120 * 86400000),
      },
      {
        id: `${name}-filters`,
        name: "Filters",
        healthPercent: Math.round(Math.max(30, 85 - degradation * 50)),
        wearLevel: parseFloat((degradation * 65).toFixed(1)),
        estimatedLifeRemaining: Math.round(90 * (1 - degradation * 0.8)),
        replacementCost: 2000,
        lastReplaced: new Date(Date.now() - 60 * 86400000),
      },
    ];
  }
}

export const maintenanceIntelligence = new MaintenanceIntelligenceService();
export { MaintenanceIntelligenceService };
