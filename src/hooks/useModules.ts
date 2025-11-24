// @ts-nocheck
import { useEffect, useState } from "react";
import modulesRegistry from "@/../modules-registry-complete.json";

export interface Module {
  id: string;
  name: string;
  path: string;
  status: "functional" | "pending" | "disabled";
  description: string;
  created_at: string;
  updated_at: string;
}

type RegistryModule = (typeof modulesRegistry)["modules"][number];

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
  if (!status) {
    return "pending";
  }

  const normalized = status.toLowerCase();
  return STATUS_MAP[normalized] ?? "disabled";
};

const normalizeModule = (module: RegistryModule): Module => {
  const fallbackDate = module.lastModified ?? new Date().toISOString();

  return {
    id: module.id,
    name: module.name,
    path: module.path || module.route || "/",
    status: normalizeStatus(module.status),
    description: module.description || "Descrição indisponível",
    created_at: fallbackDate,
    updated_at: fallbackDate,
  };
};

export default function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    async function fetchModules() {
      try {
        const registryModules = Array.isArray(modulesRegistry.modules)
          ? modulesRegistry.modules
          : [];

        if (cancelled) return;

        const formattedModules = registryModules.map(normalizeModule);
        setModules(formattedModules);
      } catch (error) {
        console.error("Failed to fetch modules:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    
    fetchModules();
    
    return () => {
      cancelled = true;
    };
  }, []);

  return { modules, loading };
}
