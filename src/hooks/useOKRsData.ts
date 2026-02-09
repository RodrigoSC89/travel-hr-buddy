/**
 * Hook para dados de OKRs (Objectives & Key Results)
 * PATCH v3.0 - Integrado com tabelas hr_okrs e hr_key_results
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface KeyResult {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  status: "on_track" | "at_risk" | "behind" | "achieved";
}

export interface OKR {
  id: string;
  objective: string;
  owner: string;
  level: "company" | "team" | "individual";
  quarter: string;
  progress: number;
  status: "on_track" | "at_risk" | "behind" | "achieved";
  key_results: KeyResult[];
  children?: OKR[];
}

export function useOKRsData() {
  const queryClient = useQueryClient();

  // Get user's organization
  const { data: orgId } = useQuery({
    queryKey: ["okrs-org-id"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      return data?.organization_id || null;
    },
    staleTime: 300000,
  });

  const okrsQuery = useQuery({
    queryKey: ["hr-okrs", orgId],
    queryFn: async (): Promise<OKR[]> => {
      // Fetch OKRs
      const { data: okrs, error: okrError } = await supabase
        .from("hr_okrs")
        .select("*")
        .order("created_at", { ascending: false });

      if (okrError) throw okrError;
      if (!okrs?.length) return [];

      // Fetch key results for all OKRs
      const okrIds = okrs.map((o) => o.id);
      const { data: keyResults, error: krError } = await supabase
        .from("hr_key_results")
        .select("*")
        .in("okr_id", okrIds);

      if (krError) throw krError;

      // Build OKR tree
      const krMap = new Map<string, KeyResult[]>();
      (keyResults || []).forEach((kr) => {
        const list = krMap.get(kr.okr_id) || [];
        list.push({
          id: kr.id,
          title: kr.title,
          current: Number(kr.current_value) || 0,
          target: Number(kr.target_value) || 100,
          unit: kr.unit || "%",
          status: kr.status as KeyResult["status"],
        });
        krMap.set(kr.okr_id, list);
      });

      // Map to OKR interface
      const allOkrs: OKR[] = okrs.map((o) => {
        const krs = krMap.get(o.id) || [];
        const progress = krs.length > 0
          ? Math.round(krs.reduce((sum, kr) => sum + (kr.target > 0 ? (kr.current / kr.target) * 100 : 0), 0) / krs.length)
          : Number(o.progress) || 0;

        return {
          id: o.id,
          objective: o.objective,
          owner: o.owner,
          level: o.level as OKR["level"],
          quarter: o.quarter,
          progress,
          status: o.status as OKR["status"],
          key_results: krs,
          parent_okr_id: o.parent_okr_id,
        };
      });

      // Build tree structure
      type OKRWithParent = OKR & { parent_okr_id?: string };
      const rootOkrs = allOkrs.filter((o) => !(o as OKRWithParent).parent_okr_id);
      const childMap = new Map<string, OKR[]>();
      allOkrs.filter((o) => (o as OKRWithParent).parent_okr_id).forEach((o) => {
        const parentId = (o as OKRWithParent).parent_okr_id!;
        const list = childMap.get(parentId) || [];
        list.push(o);
        childMap.set(parentId, list);
      });

      return rootOkrs.map(o => ({
        ...o,
        children: childMap.get(o.id) || [],
      }));
    },
    enabled: !!orgId,
    staleTime: 15000,
  });

  // Create OKR
  const createOKR = useMutation({
    mutationFn: async (data: { objective: string; owner: string; level: string; quarter: string; keyResults?: { title: string; target: number; unit: string }[] }) => {
      const { data: okr, error } = await supabase
        .from("hr_okrs")
        .insert({
          objective: data.objective,
          owner: data.owner,
          level: data.level,
          quarter: data.quarter,
          organization_id: orgId,
        })
        .select()
        .single();

      if (error) throw error;

      // Insert key results if provided
      if (data.keyResults?.length && okr) {
        const krInserts = data.keyResults.map(kr => ({
          okr_id: okr.id,
          title: kr.title,
          target_value: kr.target,
          unit: kr.unit,
        }));

        const { error: krError } = await supabase
          .from("hr_key_results")
          .insert(krInserts);

        if (krError) throw krError;
      }

      return okr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-okrs"] });
      toast.success("OKR criado com sucesso");
    },
    onError: (error) => {
      toast.error(`Erro ao criar OKR: ${error.message}`);
    },
  });

  // Update OKR status
  const updateOKR = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; progress?: number }) => {
      const { error } = await supabase
        .from("hr_okrs")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-okrs"] });
      toast.success("OKR atualizado");
    },
  });

  // Update Key Result
  const updateKeyResult = useMutation({
    mutationFn: async ({ id, current_value, status }: { id: string; current_value?: number; status?: string }) => {
      const updates: Record<string, unknown> = {};
      if (current_value !== undefined) updates.current_value = current_value;
      if (status) updates.status = status;

      const { error } = await supabase
        .from("hr_key_results")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-okrs"] });
      toast.success("Key Result atualizado");
    },
  });

  // Delete OKR
  const deleteOKR = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hr_okrs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-okrs"] });
      toast.success("OKR removido");
    },
  });

  return {
    ...okrsQuery,
    createOKR,
    updateOKR,
    updateKeyResult,
    deleteOKR,
    orgId,
  };
}
