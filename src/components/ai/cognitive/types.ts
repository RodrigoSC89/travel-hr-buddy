/**
 * CognitiveDashboard - Shared types and helpers
 */

import { ModuleRiskScore } from "@/ai/predictiveEngine";
import { TacticalDecision } from "@/ai/tacticalAI";
import { EvolutionReport } from "@/ai/evoAIConnector";

export type TimeRange = "1h" | "24h" | "7d" | "30d";

export const TIME_RANGES: Record<TimeRange, number> = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export const getRiskColor = (level: string) => {
  switch (level) {
    case "critical": return "bg-destructive";
    case "high": return "bg-warning";
    case "medium": return "bg-warning/70";
    case "low": return "bg-success";
    default: return "bg-muted";
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical": return "destructive";
    case "high": return "default";
    case "medium": return "secondary";
    case "low": return "outline";
    default: return "outline";
  }
};

export const formatTimestamp = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString();
};

export const filterByTimeRange = (timestamp: string | Date, timeRange: TimeRange): boolean => {
  const time = new Date(timestamp).getTime();
  return Date.now() - time <= TIME_RANGES[timeRange];
};
