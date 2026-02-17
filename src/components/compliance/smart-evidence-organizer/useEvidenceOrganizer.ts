import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { EvidencePack, EvidenceElement, EvidenceItem, EvidenceMatch } from "./types";

export function useEvidenceOrganizer(framework: string) {
  const [packs, setPacks] = useState<EvidencePack[]>([]);
  const [activePack, setActivePack] = useState<EvidencePack | null>(null);
  const [elements, setElements] = useState<EvidenceElement[]>([]);
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [matches, setMatches] = useState<EvidenceMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRematching, setIsRematching] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);

  const loadPacks = useCallback(async () => {
    const { data } = await (supabase.from as Function)("audit_evidence_packs")
      .select("*")
      .eq("framework", framework)
      .order("created_at", { ascending: false });
    setPacks((data as EvidencePack[]) || []);
  }, [framework]);

  const loadPackDetails = useCallback(async (packId: string) => {
    const [elemResult, itemResult, matchResult, packResult] = await Promise.all([
      (supabase.from as Function)("audit_evidence_elements")
        .select("*").eq("pack_id", packId).order("sort_order"),
      (supabase.from as Function)("audit_evidence_items")
        .select("*").eq("pack_id", packId).order("sort_order"),
      (supabase.from as Function)("audit_evidence_matches")
        .select("*").eq("pack_id", packId).order("created_at"),
      (supabase.from as Function)("audit_evidence_packs")
        .select("*").eq("id", packId).single(),
    ]);

    setElements((elemResult.data as EvidenceElement[]) || []);
    setItems((itemResult.data as EvidenceItem[]) || []);
    setMatches((matchResult.data as EvidenceMatch[]) || []);
    if (packResult.data) setActivePack(packResult.data as EvidencePack);
  }, []);

  const loadPackElements = useCallback(async (packId: string): Promise<EvidenceElement[]> => {
    const { data } = await (supabase.from as Function)("audit_evidence_elements")
      .select("*").eq("pack_id", packId).order("sort_order");
    return (data as EvidenceElement[]) || [];
  }, []);

  const uploadAndProcess = useCallback(async (
    text: string,
    fileName: string,
    fileType: string,
    vesselId?: string
  ) => {
    setIsLoading(true);
    setProcessingStep("Analisando checklist com IA...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Step 1: Parse checklist
      const parseResult = await supabase.functions.invoke("smart-evidence-organizer", {
        body: {
          action: "parse_checklist",
          framework,
          checklist_text: text,
          user_id: user.id,
          vessel_id: vesselId,
        },
      });

      if (parseResult.error) throw parseResult.error;
      const { pack_id } = parseResult.data;

      toast.success("Checklist analisado!", {
        description: `${parseResult.data.elements_count} elementos, ${parseResult.data.items_count} itens extraídos`,
      });

      // Step 2: Match evidence
      setProcessingStep("Buscando evidências na biblioteca de documentos...");

      const matchResult = await supabase.functions.invoke("smart-evidence-organizer", {
        body: { action: "match_evidence", pack_id, framework },
      });

      if (matchResult.error) throw matchResult.error;

      toast.success("Matching concluído!", {
        description: `${matchResult.data.matched} encontradas, ${matchResult.data.partial} parciais, ${matchResult.data.unmatched} não encontradas`,
      });

      // Step 3: Generate responses
      setProcessingStep("Gerando respostas de auditoria...");

      await supabase.functions.invoke("smart-evidence-organizer", {
        body: { action: "generate_responses", pack_id, framework },
      });

      toast.success("Respostas geradas com sucesso!");

      // Load the complete pack
      await loadPackDetails(pack_id);
      await loadPacks();
      setProcessingStep(null);
    } catch (error) {
      console.error("Process error:", error);
      toast.error("Erro no processamento", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
      setProcessingStep(null);
    } finally {
      setIsLoading(false);
    }
  }, [framework, loadPackDetails, loadPacks]);

  const rematchGaps = useCallback(async () => {
    if (!activePack) return;
    setIsRematching(true);

    try {
      const result = await supabase.functions.invoke("smart-evidence-organizer", {
        body: { action: "rematch_gaps", pack_id: activePack.id, framework },
      });

      if (result.error) throw result.error;

      const { gaps_processed, improved, new_score } = result.data;
      toast.success("Re-matching concluído!", {
        description: `${gaps_processed} gaps processados, ${improved} melhorados. Novo score: ${new_score}%`,
      });

      await loadPackDetails(activePack.id);
      await loadPacks();
    } catch (error) {
      console.error("Rematch error:", error);
      toast.error("Erro no re-matching", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsRematching(false);
    }
  }, [activePack, framework, loadPackDetails, loadPacks]);

  const addManualEvidence = useCallback(async (itemId: string, documentTitle: string, documentPath?: string) => {
    if (!activePack) return;

    await (supabase.from as Function)("audit_evidence_matches").insert({
      item_id: itemId,
      pack_id: activePack.id,
      document_title: documentTitle,
      document_path: documentPath,
      match_source: "manual",
      match_confidence: 100,
      match_reason: "Adicionado manualmente pelo usuário",
    });

    await (supabase.from as Function)("audit_evidence_items")
      .update({ evidence_status: "found" })
      .eq("id", itemId);

    await loadPackDetails(activePack.id);
    toast.success("Evidência adicionada!");
  }, [activePack, loadPackDetails]);

  return {
    packs,
    activePack,
    elements,
    items,
    matches,
    isLoading,
    isRematching,
    processingStep,
    loadPacks,
    loadPackDetails,
    loadPackElements,
    setActivePack,
    uploadAndProcess,
    addManualEvidence,
    rematchGaps,
  };
}
