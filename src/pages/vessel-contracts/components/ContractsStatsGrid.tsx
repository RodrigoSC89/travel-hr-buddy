/**
 * ContractsStatsGrid - Extracted from VesselContractsV2
 * Displays contracts statistics cards
 */

import { StatsGridV2 } from "@/components/v2";
import { FileText, Clock, AlertTriangle, Shield } from "lucide-react";

interface ContractsStatsGridProps {
  activeContracts: number;
  totalDowntimeHours: number;
  criticalDowntimes: number;
  avgSLA: string;
}

export function ContractsStatsGrid({
  activeContracts,
  totalDowntimeHours,
  criticalDowntimes,
  avgSLA
}: ContractsStatsGridProps) {
  const stats = [
    { 
      label: "Contratos Ativos", 
      value: activeContracts, 
      icon: FileText, 
      color: "blue" as const, 
      trend: { value: 5, direction: "up" as const } 
    },
    { 
      label: "Total Downtime (h)", 
      value: totalDowntimeHours.toFixed(1), 
      icon: Clock, 
      color: "orange" as const 
    },
    { 
      label: "Downtimes Críticos", 
      value: criticalDowntimes, 
      icon: AlertTriangle, 
      color: "red" as const 
    },
    { 
      label: "SLA Médio (%)", 
      value: `${avgSLA}%`, 
      icon: Shield, 
      color: "green" as const 
    },
  ];

  return <StatsGridV2 stats={stats} columns={4} />;
}
