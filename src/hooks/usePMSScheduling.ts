/**
 * Hook for PMS Job Scheduling & Spare Parts Management
 */

import { useState, useCallback } from "react";
import {
  detectConflicts,
  calculateROL,
  calculateClassSurveyWindows,
  type MaintenanceJob,
  type ScheduleConflict,
  type SparePartROL,
  type ClassSurveyWindow,
} from "@/services/pms-scheduling";
import { toast } from "sonner";

export function usePMSScheduling() {
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [spareParts, setSpareParts] = useState<SparePartROL[]>([]);
  const [surveyWindows, setSurveyWindows] = useState<ClassSurveyWindow[]>([]);

  const checkConflicts = useCallback((jobs: MaintenanceJob[]) => {
    const found = detectConflicts(jobs);
    setConflicts(found);
    if (found.length > 0) {
      toast.warning(`${found.length} conflito(s) de agendamento detectado(s)`, {
        description: "Revise o calendário de manutenção",
      });
    }
    return found;
  }, []);

  const calculateSparePartROL = useCallback(
    (params: {
      part_id: string;
      part_name: string;
      avg_monthly_consumption: number;
      lead_time_days: number;
      unit_cost_usd: number;
      current_stock: number;
    }) => {
      const result = calculateROL({
        avg_monthly_consumption: params.avg_monthly_consumption,
        lead_time_days: params.lead_time_days,
        unit_cost_usd: params.unit_cost_usd,
        current_stock: params.current_stock,
      });
      result.part_id = params.part_id;
      result.part_name = params.part_name;

      setSpareParts((prev) => {
        const updated = prev.filter((p) => p.part_id !== params.part_id);
        return [...updated, result];
      });

      if (result.auto_reorder_triggered) {
        toast.warning(`📦 Auto-reorder: ${params.part_name}`, {
          description: `Estoque: ${params.current_stock} ≤ ROL: ${result.reorder_level}. Qtd sugerida: ${result.reorder_quantity}`,
        });
      }

      return result;
    },
    []
  );

  const checkClassSurveys = useCallback(
    (surveys: Array<{ lastDate: string; interval: number; type: string }>) => {
      const windows = surveys.map((s) => {
        const w = calculateClassSurveyWindows(s.lastDate, s.interval);
        w.survey_type = s.type;
        return w;
      });
      setSurveyWindows(windows);

      const overdue = windows.filter((w) => w.status === "overdue");
      if (overdue.length > 0) {
        toast.error(`🔴 ${overdue.length} vistoria(s) vencida(s)`, {
          description: overdue.map((o) => o.survey_type).join(", "),
        });
      }

      return windows;
    },
    []
  );

  return {
    conflicts,
    spareParts,
    surveyWindows,
    checkConflicts,
    calculateSparePartROL,
    checkClassSurveys,
  };
}
