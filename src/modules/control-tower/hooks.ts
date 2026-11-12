import { useContracts, useDeliverableProgress, useDeliverables, useEvents, useLots, useOpportunities, useTasks } from "./api";
import { useCtContext } from "./context";
import type { ExportData } from "./lib/export";

/** Junta todos os dados para exportação; retorna null enquanto carrega. */
export function useExportData(): ExportData | null {
  const { members } = useCtContext();
  const contracts = useContracts().data;
  const deliverables = useDeliverables().data;
  const progress = useDeliverableProgress().data;
  const lots = useLots().data;
  const tasks = useTasks().data;
  const events = useEvents().data;
  const opportunities = useOpportunities().data;
  if (!contracts || !deliverables || !progress || !lots || !tasks || !events || !opportunities) return null;
  return { members, contracts, deliverables, progress, lots, tasks, events, opportunities };
}

export function readPref<T extends string>(key: string, fallback: T): T {
  try {
    return (localStorage.getItem(key) as T) || fallback;
  } catch {
    return fallback;
  }
}

export function writePref(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage indisponível */
  }
}
