/**
 * usePeotramAudit - Full CRUD hook for PEOTRAM audit persistence
 * Handles audit lifecycle: create, save progress, load, complete, delete, compare cycles
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { PEOTRAM_ELEMENTS, SCORE_CRITERIA } from "@/data/peotram-elements-data";
import type { ScoreValue } from "@/data/peotram-elements-data";

export interface ItemAuditState {
  score: ScoreValue;
  observations: string;
  evidence: string | null;
  aiEvidence: string | null;
  isGeneratingEvidence: boolean;
  ncClassification: string | null;
  photos: string[];
}

export interface PeotramAuditData {
  id: string;
  vessel_name: string;
  auditor_name: string;
  audit_date: string;
  cycle: string;
  status: string;
  element_scores: Record<string, number>;
  total_items: number;
  scored_items: number;
  nc_count: number;
  final_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const defaultItemState: ItemAuditState = {
  score: "NA",
  observations: "",
  evidence: null,
  aiEvidence: null,
  isGeneratingEvidence: false,
  ncClassification: null,
  photos: [],
};

export function usePeotramAudit() {
  const queryClient = useQueryClient();
  const [currentAuditId, setCurrentAuditId] = useState<string | null>(null);
  const [itemStates, setItemStates] = useState<Record<string, ItemAuditState>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all audits (history)
  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ["peotram-audits-list"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("peotram_audits")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as PeotramAuditData[];
    },
    staleTime: 10000,
  });

  // Fetch responses for current audit
  const { data: responses = [], isLoading: responsesLoading } = useQuery({
    queryKey: ["peotram-responses", currentAuditId],
    queryFn: async () => {
      if (!currentAuditId) return [];
      const { data, error } = await (supabase.from as Function)("peotram_audit_responses")
        .select("*")
        .eq("audit_id", currentAuditId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentAuditId,
  });

  // Load responses into itemStates when they arrive
  useEffect(() => {
    if (responses.length > 0) {
      const states: Record<string, ItemAuditState> = {};
      for (const r of responses) {
        states[r.item_id] = {
          score: r.score === "NA" ? "NA" : (isNaN(Number(r.score)) ? "NA" : Number(r.score) as ScoreValue),
          observations: r.observations || "",
          evidence: null,
          aiEvidence: r.ai_evidence || null,
          isGeneratingEvidence: false,
          ncClassification: r.nc_classification || null,
          photos: r.photos || [],
        };
      }
      setItemStates(states);
    }
  }, [responses]);

  // Create new audit
  const createAudit = useMutation({
    mutationFn: async (params: { vesselName: string; auditorName: string; auditDate: string; cycle: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Autenticação necessária");

      const totalItems = PEOTRAM_ELEMENTS.reduce((acc, el) => acc + el.subelements.reduce((a, s) => a + s.items.length, 0), 0);

      const { data, error } = await (supabase.from as Function)("peotram_audits")
        .insert({
          vessel_name: params.vesselName,
          auditor_name: params.auditorName,
          audit_date: params.auditDate,
          cycle: params.cycle,
          audit_period: params.cycle,
          audit_type: "peotram",
          status: "in_progress",
          total_items: totalItems,
          scored_items: 0,
          nc_count: 0,
          element_scores: {},
          created_by: user.id,
        })
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setCurrentAuditId(data.id);
      setItemStates({});
      queryClient.invalidateQueries({ queryKey: ["peotram-audits-list"] });
      toast.success("Nova auditoria PEOTRAM criada!");
    },
    onError: (err) => {
      logger.error("[PeotramAudit] Create error", err);
      toast.error("Erro ao criar auditoria");
    },
  });

  // Calculate element scores from itemStates
  const calculateScores = useCallback(() => {
    const elementScores: Record<string, number> = {};
    let totalScored = 0;
    let totalNCs = 0;
    let overallSum = 0;
    let overallCount = 0;

    for (const el of PEOTRAM_ELEMENTS) {
      const items = el.subelements.flatMap(s => s.items);
      let elSum = 0;
      let elCount = 0;

      for (const item of items) {
        const state = itemStates[item.id];
        if (state && state.score !== "NA" && state.score !== undefined) {
          const criteria = SCORE_CRITERIA[String(state.score)];
          if (criteria) {
            elSum += criteria.percentage;
            elCount++;
            totalScored++;
            overallSum += criteria.percentage;
            overallCount++;
          }
          if (typeof state.score === "number" && state.score <= 2 && state.ncClassification) {
            totalNCs++;
          }
        }
      }

      elementScores[String(el.id)] = elCount > 0 ? Math.round(elSum / elCount) : 0;
    }

    return {
      elementScores,
      scoredItems: totalScored,
      ncCount: totalNCs,
      overallScore: overallCount > 0 ? Math.round(overallSum / overallCount) : 0,
    };
  }, [itemStates]);

  // Save progress (bulk upsert responses + update audit)
  const saveProgress = useCallback(async () => {
    if (!currentAuditId) {
      toast.error("Nenhuma auditoria ativa");
      return;
    }

    setIsSaving(true);
    try {
      // Build responses array
      const responsesToUpsert = Object.entries(itemStates)
        .filter(([_, state]) => state.score !== "NA" || state.observations || state.aiEvidence)
        .map(([itemId, state]) => {
          // Find element and subelement for this item
          let elementId = 0;
          let subelementId = "";
          for (const el of PEOTRAM_ELEMENTS) {
            for (const sub of el.subelements) {
              if (sub.items.some(i => i.id === itemId)) {
                elementId = el.id;
                subelementId = sub.id;
                break;
              }
            }
          }

          return {
            audit_id: currentAuditId,
            element_id: elementId,
            subelement_id: subelementId,
            item_id: itemId,
            score: String(state.score),
            observations: state.observations || "",
            nc_classification: state.ncClassification || null,
            ai_evidence: state.aiEvidence || null,
            photos: state.photos || [],
          };
        });

      if (responsesToUpsert.length > 0) {
        const { error: respError } = await (supabase.from as Function)("peotram_audit_responses")
          .upsert(responsesToUpsert, { onConflict: "audit_id,item_id" });
        if (respError) throw respError;
      }

      // Update audit summary
      const scores = calculateScores();
      const { error: auditError } = await (supabase.from as Function)("peotram_audits")
        .update({
          element_scores: scores.elementScores,
          scored_items: scores.scoredItems,
          nc_count: scores.ncCount,
          final_score: scores.overallScore,
          compliance_score: scores.overallScore,
        })
        .eq("id", currentAuditId);
      if (auditError) throw auditError;

      queryClient.invalidateQueries({ queryKey: ["peotram-audits-list"] });
      queryClient.invalidateQueries({ queryKey: ["peotram-responses", currentAuditId] });
      toast.success(`Progresso salvo! ${scores.scoredItems} itens avaliados.`);
    } catch (err) {
      logger.error("[PeotramAudit] Save error", err);
      toast.error("Erro ao salvar progresso");
    } finally {
      setIsSaving(false);
    }
  }, [currentAuditId, itemStates, calculateScores, queryClient]);

  // Complete audit
  const completeAudit = useCallback(async () => {
    if (!currentAuditId) return;
    const scores = calculateScores();
    
    const { error } = await (supabase.from as Function)("peotram_audits")
      .update({
        status: "completed",
        element_scores: scores.elementScores,
        scored_items: scores.scoredItems,
        nc_count: scores.ncCount,
        final_score: scores.overallScore,
        compliance_score: scores.overallScore,
      })
      .eq("id", currentAuditId);

    if (error) {
      toast.error("Erro ao finalizar auditoria");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["peotram-audits-list"] });
    toast.success("Auditoria PEOTRAM finalizada com sucesso!");
  }, [currentAuditId, calculateScores, queryClient]);

  // Load existing audit
  const loadAudit = useCallback((auditId: string) => {
    setCurrentAuditId(auditId);
  }, []);

  // Upload photo evidence
  const uploadPhoto = useCallback(async (itemId: string, file: File) => {
    if (!currentAuditId) return null;

    const fileExt = file.name.split(".").pop();
    const filePath = `${currentAuditId}/${itemId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("peotram-evidence")
      .upload(filePath, file);

    if (error) {
      toast.error("Erro ao fazer upload da foto");
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("peotram-evidence")
      .getPublicUrl(filePath);

    // Update local state
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { ...defaultItemState }),
        photos: [...(prev[itemId]?.photos || []), publicUrl],
      },
    }));

    toast.success("Foto adicionada!");
    return publicUrl;
  }, [currentAuditId]);

  // Get state for item
  const getState = useCallback((itemId: string): ItemAuditState => {
    return itemStates[itemId] || { ...defaultItemState };
  }, [itemStates]);

  // Update state for item
  const updateState = useCallback((itemId: string, patch: Partial<ItemAuditState>) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || { ...defaultItemState }), ...patch },
    }));
  }, []);

  // Auto-save debounce (30s after last change)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!currentAuditId || Object.keys(itemStates).length === 0) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveProgress();
    }, 30000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [itemStates, currentAuditId]);

  // Delete audit
  const deleteAudit = useMutation({
    mutationFn: async (auditId: string) => {
      // Delete responses first
      await (supabase.from as Function)("peotram_audit_responses").delete().eq("audit_id", auditId);
      const { error } = await (supabase.from as Function)("peotram_audits").delete().eq("id", auditId);
      if (error) throw error;
    },
    onSuccess: (_, auditId) => {
      if (currentAuditId === auditId) {
        setCurrentAuditId(null);
        setItemStates({});
      }
      queryClient.invalidateQueries({ queryKey: ["peotram-audits-list"] });
      toast.success("Auditoria excluída");
    },
    onError: (err) => {
      logger.error("[PeotramAudit] Delete error", err);
      toast.error("Erro ao excluir auditoria");
    },
  });

  const currentAudit = audits.find(a => a.id === currentAuditId);

  return {
    // State
    currentAuditId,
    currentAudit,
    audits,
    auditsLoading,
    responsesLoading,
    itemStates,
    isSaving,
    // Actions
    createAudit,
    deleteAudit,
    saveProgress,
    completeAudit,
    loadAudit,
    uploadPhoto,
    getState,
    updateState,
    calculateScores,
    setCurrentAuditId,
  };
}
