/**
 * Camada de dados do Control Tower (Supabase + React Query).
 * As regras de double check vivem no banco (triggers); aqui só repassamos
 * as mensagens de erro do Postgres para o usuário.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { EVIDENCE_BUCKET } from "./constants";
import type {
  Contract,
  CtEvent,
  Deliverable,
  DeliverableLot,
  DeliverableProgress,
  Evidence,
  Member,
  Opportunity,
  Task,
  TaskHistory,
} from "./types";

type TableName =
  | "ct_members"
  | "ct_contracts"
  | "ct_deliverables"
  | "ct_deliverable_lots"
  | "ct_deliverable_progress"
  | "ct_tasks"
  | "ct_task_history"
  | "ct_evidences"
  | "ct_events"
  | "ct_opportunities";

const QUERY_OPTS = { staleTime: 15_000, refetchOnMount: true as const, networkMode: "online" as const };

export const ctKeys = {
  me: ["ct", "me"] as const,
  unclaimed: ["ct", "unclaimed"] as const,
  table: (t: TableName) => ["ct", t] as const,
  history: (taskId: string) => ["ct", "ct_task_history", taskId] as const,
  evidences: (parent: string) => ["ct", "ct_evidences", parent] as const,
};

export function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return String(err);
}

async function selectAll<T>(table: TableName, order = "code"): Promise<T[]> {
  let q = fromUntyped(table).select("*");
  if (order) q = q.order(order, { ascending: true });
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as T[];
}

// ---------------------------------------------------------------------
// Membros / sessão
// ---------------------------------------------------------------------
export function useCurrentMember(userId: string | undefined) {
  return useQuery({
    queryKey: [...ctKeys.me, userId],
    enabled: !!userId,
    ...QUERY_OPTS,
    queryFn: async (): Promise<Member | null> => {
      const { data, error } = await fromUntyped("ct_members").select("*").eq("user_id", userId).maybeSingle();
      if (error) throw error;
      return (data as Member) ?? null;
    },
  });
}

export function useUnclaimedMembers(enabled: boolean) {
  return useQuery({
    queryKey: ctKeys.unclaimed,
    enabled,
    ...QUERY_OPTS,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("ct_unclaimed_members");
      if (error) throw error;
      return (data ?? []) as { id: string; name: string; short_name: string; requires_email: boolean }[];
    },
  });
}

export function useClaimMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc("ct_claim_member", { p_member_id: memberId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ct"] });
      toast.success("Perfil vinculado. Bem-vindo ao Control Tower!");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export const useMembers = () =>
  useQuery({ queryKey: ctKeys.table("ct_members"), ...QUERY_OPTS, queryFn: () => selectAll<Member>("ct_members", "short_name") });

// ---------------------------------------------------------------------
// Leitura das entidades
// ---------------------------------------------------------------------
export const useContracts = () =>
  useQuery({ queryKey: ctKeys.table("ct_contracts"), ...QUERY_OPTS, queryFn: () => selectAll<Contract>("ct_contracts") });

export const useDeliverables = () =>
  useQuery({ queryKey: ctKeys.table("ct_deliverables"), ...QUERY_OPTS, queryFn: () => selectAll<Deliverable>("ct_deliverables") });

export const useDeliverableProgress = () =>
  useQuery({
    queryKey: ctKeys.table("ct_deliverable_progress"),
    ...QUERY_OPTS,
    queryFn: () => selectAll<DeliverableProgress>("ct_deliverable_progress", ""),
  });

export const useLots = () =>
  useQuery({ queryKey: ctKeys.table("ct_deliverable_lots"), ...QUERY_OPTS, queryFn: () => selectAll<DeliverableLot>("ct_deliverable_lots", "created_at") });

export const useTasks = () =>
  useQuery({ queryKey: ctKeys.table("ct_tasks"), ...QUERY_OPTS, queryFn: () => selectAll<Task>("ct_tasks") });

export const useEvents = () =>
  useQuery({ queryKey: ctKeys.table("ct_events"), ...QUERY_OPTS, queryFn: () => selectAll<CtEvent>("ct_events") });

export const useOpportunities = () =>
  useQuery({ queryKey: ctKeys.table("ct_opportunities"), ...QUERY_OPTS, queryFn: () => selectAll<Opportunity>("ct_opportunities") });

export function useTaskHistory(taskId: string | undefined) {
  return useQuery({
    queryKey: ctKeys.history(taskId ?? ""),
    enabled: !!taskId,
    ...QUERY_OPTS,
    queryFn: async () => {
      const { data, error } = await fromUntyped("ct_task_history")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TaskHistory[];
    },
  });
}

export type EvidenceParent = { task_id: string } | { lot_id: string } | { contract_id: string };
const parentKey = (p: EvidenceParent) => Object.values(p)[0] as string;
const parentCol = (p: EvidenceParent) => Object.keys(p)[0] as string;

export function useEvidences(parent: EvidenceParent | null) {
  return useQuery({
    queryKey: ctKeys.evidences(parent ? parentKey(parent) : ""),
    enabled: !!parent,
    ...QUERY_OPTS,
    queryFn: async () => {
      if (!parent) return [];
      const { data, error } = await fromUntyped("ct_evidences")
        .select("*")
        .eq(parentCol(parent), parentKey(parent))
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Evidence[];
    },
  });
}

// ---------------------------------------------------------------------
// Escrita genérica
// ---------------------------------------------------------------------
type Writable = "ct_contracts" | "ct_deliverables" | "ct_deliverable_lots" | "ct_tasks" | "ct_events" | "ct_opportunities" | "ct_members";

/** Tabelas que dependem umas das outras e precisam ser recarregadas juntas. */
const RELATED: Partial<Record<Writable, TableName[]>> = {
  ct_deliverable_lots: ["ct_deliverable_progress"],
  ct_tasks: ["ct_task_history"],
};

export function useSave<T extends { id?: string }>(table: Writable, successMsg = "Salvo") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<T> & { id?: string }) => {
      const { id, ...rest } = row;
      const payload = Object.fromEntries(
        Object.entries(rest).map(([k, v]) => [k, v === "" ? null : v]),
      );
      const q = id
        ? fromUntyped(table).update(payload).eq("id", id).select().single()
        : fromUntyped(table).insert(payload).select().single();
      const { data, error } = await q;
      if (error) throw error;
      return data as T;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ctKeys.table(table) });
      RELATED[table]?.forEach((t) => qc.invalidateQueries({ queryKey: ["ct", t] }));
      if (successMsg) toast.success(successMsg);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useRemove(table: Writable) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromUntyped(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ctKeys.table(table) });
      RELATED[table]?.forEach((t) => qc.invalidateQueries({ queryKey: ["ct", t] }));
      toast.success("Removido");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

// ---------------------------------------------------------------------
// Evidências (Storage)
// ---------------------------------------------------------------------
export function useUploadEvidence(parent: EvidenceParent) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const safeName = file.name.normalize("NFD").replace(/[^\w.-]+/g, "_");
      const path = `${parentCol(parent).replace("_id", "")}/${parentKey(parent)}/${Date.now()}_${safeName}`;
      const up = await supabase.storage.from(EVIDENCE_BUCKET).upload(path, file, { upsert: false });
      if (up.error) throw up.error;
      const { error } = await fromUntyped("ct_evidences").insert({
        ...parent,
        file_path: path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || null,
      });
      if (error) {
        await supabase.storage.from(EVIDENCE_BUCKET).remove([path]);
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ctKeys.evidences(parentKey(parent)) });
      toast.success("Evidência anexada");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useDeleteEvidence(parent: EvidenceParent) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ev: Evidence) => {
      const { error } = await fromUntyped("ct_evidences").delete().eq("id", ev.id);
      if (error) throw error;
      await supabase.storage.from(EVIDENCE_BUCKET).remove([ev.file_path]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ctKeys.evidences(parentKey(parent)) }),
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export async function openEvidence(ev: Evidence) {
  const { data, error } = await supabase.storage.from(EVIDENCE_BUCKET).createSignedUrl(ev.file_path, 300);
  if (error || !data) {
    toast.error(errorMessage(error ?? "Não foi possível abrir o arquivo"));
    return;
  }
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}
