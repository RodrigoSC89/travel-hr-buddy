/**
 * Fleet Command Center - Shared types
 */

export interface EnrichedVessel {
  id: string;
  name: string;
  vessel_type?: string | null;
  status: string;
  imo_number?: string | null;
  flag_state?: string | null;
  speed?: number;
  fuel?: number;
  efficiency?: number;
  crew_count?: number;
  course?: number;
  current_speed?: number | null;
  current_fuel_level?: number | null;
  crew?: number | null;
  current_location?: string | null;
  location?: string | null;
  [key: string]: unknown;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
}

export const INITIAL_PERFORMANCE_METRICS: PerformanceMetric[] = [
  { metric: "Eficiência", value: 0 },
  { metric: "Segurança", value: 0 },
  { metric: "Pontualidade", value: 0 },
  { metric: "Manutenção", value: 0 },
  { metric: "Tripulação", value: 0 },
  { metric: "Compliance", value: 0 },
];

export const STATUS_CONFIG: Record<string, { color: string; label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  operational: { color: "bg-success", label: "Operacional", variant: "default" },
  active: { color: "bg-success", label: "Ativa", variant: "default" },
  "in-port": { color: "bg-primary", label: "Em Porto", variant: "secondary" },
  anchored: { color: "bg-warning", label: "Ancorada", variant: "secondary" },
  maintenance: { color: "bg-accent-foreground", label: "Manutenção", variant: "outline" },
  emergency: { color: "bg-destructive", label: "Emergência", variant: "destructive" },
};
