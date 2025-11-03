/**
 * Non-Conformity Tag Component
 * PATCH-609: Visual indicator for non-conformities
 */

import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, AlertOctagon } from "lucide-react";

interface NonConformityTagProps {
  riskLevel: "low" | "medium" | "high" | "critical";
  count?: number;
  className?: string;
}

const riskConfig = {
  low: {
    icon: AlertCircle,
    color: "bg-blue-100 text-blue-800 border-blue-300",
    label: "Baixo Risco",
  },
  medium: {
    icon: AlertTriangle,
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    label: "Médio Risco",
  },
  high: {
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-800 border-orange-300",
    label: "Alto Risco",
  },
  critical: {
    icon: AlertOctagon,
    color: "bg-red-100 text-red-800 border-red-300",
    label: "Crítico",
  },
};

export function NonConformityTag({ 
  riskLevel, 
  count, 
  className = "" 
}: NonConformityTagProps) {
  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${className} flex items-center gap-1`}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
      {count !== undefined && count > 0 && (
        <span className="ml-1 font-bold">({count})</span>
      )}
    </Badge>
  );
}
