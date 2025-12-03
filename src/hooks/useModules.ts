import { useEffect, useState } from "react";

export interface Module {
  id: string;
  name: string;
  path: string;
  status: "functional" | "pending" | "disabled";
  description: string;
  created_at: string;
  updated_at: string;
}

// Inline module registry - replaces external JSON
const MODULES_REGISTRY = {
  modules: [
    { id: "dashboard", name: "Dashboard", path: "/dashboard", status: "active", description: "Main dashboard" },
    { id: "dp-intelligence", name: "DP Intelligence", path: "/dp-intelligence", status: "active", description: "Dynamic positioning AI" },
    { id: "forecast-global", name: "Forecast Global", path: "/forecast-global", status: "active", description: "Global forecasting" },
    { id: "control-hub", name: "Control Hub", path: "/control-hub", status: "active", description: "Central control" },
    { id: "fmea-expert", name: "FMEA Expert", path: "/fmea-expert", status: "active", description: "Failure mode analysis" },
    { id: "compliance-hub", name: "Compliance Hub", path: "/compliance-hub", status: "active", description: "Compliance management" },
    { id: "crew-management", name: "Crew Management", path: "/crew-management", status: "active", description: "Crew operations" },
    { id: "fleet-management", name: "Fleet Management", path: "/fleet-management", status: "active", description: "Fleet operations" },
    { id: "maintenance", name: "Maintenance", path: "/maintenance", status: "active", description: "Maintenance system" },
    { id: "reports", name: "Reports", path: "/reports", status: "active", description: "Reporting system" },
  ]
};

const STATUS_MAP: Record<string, Module["status"]> = {
  active: "functional",
  implemented: "functional",
  functional: "functional",
  available: "functional",
  planned: "pending",
  partial: "pending",
  experimental: "pending",
  beta: "pending",
  preview: "pending",
  deprecated: "disabled",
  disabled: "disabled",
  removed: "disabled",
  archived: "disabled",
};

const normalizeStatus = (status?: string): Module["status"] => {
  if (!status) return "pending";
  const normalized = status.toLowerCase();
  return STATUS_MAP[normalized] ?? "disabled";
};

export default function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const formattedModules = MODULES_REGISTRY.modules.map((module) => ({
      id: module.id,
      name: module.name,
      path: module.path,
      status: normalizeStatus(module.status),
      description: module.description || "Descrição indisponível",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    setModules(formattedModules);
    setLoading(false);
  }, []);

  return { modules, loading };
}
