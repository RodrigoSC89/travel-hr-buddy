import { describe, it, expect } from "vitest";
import type { MMIHistory, MMITask, AIForecast } from "@/types/mmi";

describe("MMI Types", () => {
  describe("MMIHistory", () => {
    it("should accept valid history object", () => {
      const history: MMIHistory = {
        id: "test-id",
        system_name: "Sistema Hidráulico",
        task_description: "Manutenção preventiva realizada",
        status: "executado",
        executed_at: "2025-10-19T10:00:00Z",
        created_at: "2025-10-19T09:00:00Z",
      };

      expect(history.id).toBe("test-id");
      expect(history.status).toBe("executado");
    });

    it("should accept all valid status values", () => {
      const validStatuses: Array<"executado" | "pendente" | "atrasado"> = [
        "executado",
        "pendente",
        "atrasado",
      ];

      validStatuses.forEach((status) => {
        const history: MMIHistory = {
          id: "test-id",
          system_name: "Test System",
          task_description: "Test task",
          status,
        };
        expect(history.status).toBe(status);
      });
    });
  });

  describe("MMITask", () => {
    it("should accept valid task object", () => {
      const task: MMITask = {
        id: "task-id",
        title: "Manutenção do Motor",
        description: "Substituir filtros e verificar óleo",
        status: "pendente",
        priority: "high",
        forecast_date: "2025-10-25",
        system_name: "Motor Principal",
      };

      expect(task.id).toBe("task-id");
      expect(task.priority).toBe("high");
    });

    it("should accept all valid status values", () => {
      const validStatuses: Array<"pendente" | "em_andamento" | "concluido" | "cancelado"> = [
        "pendente",
        "em_andamento",
        "concluido",
        "cancelado",
      ];

      validStatuses.forEach((status) => {
        const task: MMITask = {
          id: "test-id",
          title: "Test Task",
          description: "Test description",
          status,
          priority: "medium",
        };
        expect(task.status).toBe(status);
      });
    });

    it("should accept all valid priority values", () => {
      const validPriorities: Array<"low" | "medium" | "high" | "critical"> = [
        "low",
        "medium",
        "high",
        "critical",
      ];

      validPriorities.forEach((priority) => {
        const task: MMITask = {
          id: "test-id",
          title: "Test Task",
          description: "Test description",
          status: "pendente",
          priority,
        };
        expect(task.priority).toBe(priority);
      });
    });
  });

  describe("AIForecast", () => {
    it("should accept valid forecast object", () => {
      const forecast: AIForecast = {
        next_intervention: "Substituir rolamentos",
        reasoning: "Componente atingiu 95% do intervalo",
        impact: "Risco de falha operacional",
        priority: "high",
        suggested_date: "2025-10-25",
        hourometer_current: 850,
        maintenance_history: [
          {
            date: "2025-08-15",
            action: "Troca de óleo",
          },
        ],
      };

      expect(forecast.priority).toBe("high");
      expect(forecast.hourometer_current).toBe(850);
      expect(forecast.maintenance_history).toHaveLength(1);
    });

    it("should accept all valid priority values", () => {
      const validPriorities: Array<"low" | "medium" | "high" | "critical"> = [
        "low",
        "medium",
        "high",
        "critical",
      ];

      validPriorities.forEach((priority) => {
        const forecast: AIForecast = {
          next_intervention: "Test intervention",
          reasoning: "Test reasoning",
          impact: "Test impact",
          priority,
          suggested_date: "2025-10-25",
          hourometer_current: 100,
          maintenance_history: [],
        };
        expect(forecast.priority).toBe(priority);
      });
    });

    it("should accept empty maintenance history", () => {
      const forecast: AIForecast = {
        next_intervention: "Test intervention",
        reasoning: "Test reasoning",
        impact: "Test impact",
        priority: "medium",
        suggested_date: "2025-10-25",
        hourometer_current: 100,
        maintenance_history: [],
      };

      expect(forecast.maintenance_history).toHaveLength(0);
    });
  });
});
