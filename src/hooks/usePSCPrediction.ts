/**
 * PSC Prediction Engine Hook - Port State Control inspection preparation
 * Connects to psc_inspections table with resilient error handling
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export interface PSCInspection {
  id: string;
  vessel_id?: string;
  vessel_name?: string;
  port_name: string;
  country: string;
  inspection_date?: string;
  detention_risk_score: number;
  predicted_deficiencies: any[];
  actual_deficiencies: any[];
  was_detained: boolean;
  status: string;
  ai_briefing?: string;
  preparation_checklist: any[];
  notes?: string;
  created_at: string;
}

export function usePSCPrediction() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const inspections = useQuery({
    queryKey: ["psc-inspections"],
    queryFn: async () => {
      try {
        const db = supabase.from as Function;
        const { data, error } = await db("psc_inspections")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Fetch vessel names for mapping
        let vesselMap: Record<string, string> = {};
        const vesselIds = [...new Set((data || []).map((i: any) => i.vessel_id).filter(Boolean))] as string[];
        if (vesselIds.length > 0) {
          const { data: vessels } = await supabase.from("vessels").select("id, name").in("id", vesselIds);
          vesselMap = (vessels || []).reduce((acc: Record<string, string>, v: any) => {
            acc[v.id] = v.name;
            return acc;
          }, {});
        }

        return (data || []).map((i: any) => ({
          id: i.id,
          vessel_id: i.vessel_id,
          vessel_name: vesselMap[i.vessel_id] || null,
          port_name: i.port_name || "",
          country: i.country || "",
          inspection_date: i.inspection_date,
          detention_risk_score: i.detention_risk_score || 0,
          predicted_deficiencies: i.predicted_deficiencies || [],
          actual_deficiencies: i.actual_deficiencies || [],
          was_detained: i.was_detained || false,
          status: i.status || "scheduled",
          ai_briefing: i.ai_briefing,
          preparation_checklist: i.preparation_checklist || [],
          notes: i.notes,
          created_at: i.created_at,
        })) as PSCInspection[];
      } catch (err) {
        logger.error("[PSC] Error loading inspections:", err);
        throw err;
      }
    },
    retry: 1,
  });

  const createInspection = useMutation({
    mutationFn: async (input: { vessel_id: string; port_name: string; country: string; inspection_date?: string }) => {
      const db = supabase.from as Function;
      const { data, error } = await db("psc_inspections")
        .insert([{
          vessel_id: input.vessel_id,
          port_name: input.port_name,
          country: input.country,
          inspection_date: input.inspection_date || null,
          status: "scheduled",
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psc-inspections"] });
      toast({ title: "✅ Inspeção PSC agendada", description: "Gere um briefing AI para preparação completa" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao agendar inspeção", description: err?.message || "Tente novamente", variant: "destructive" });
    },
  });

  const generateBriefing = useMutation({
    mutationFn: async (inspectionId: string) => {
      const inspection = inspections.data?.find(i => i.id === inspectionId);
      if (!inspection) throw new Error("Inspeção não encontrada");

      const { data, error } = await supabase.functions.invoke("psc-ai-briefing", {
        body: {
          inspection_id: inspectionId,
          vessel_id: inspection.vessel_id,
          port_name: inspection.port_name,
          country: inspection.country,
        },
      });

      if (error) throw error;

      // Update inspection with AI briefing
      if (data?.briefing) {
        const db = supabase.from as Function;
        await db("psc_inspections").update({
          ai_briefing: data.briefing,
          detention_risk_score: data.risk_score || 0,
          predicted_deficiencies: data.predicted_deficiencies || [],
          preparation_checklist: data.preparation_checklist || [],
        }).eq("id", inspectionId);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psc-inspections"] });
      toast({ title: "🧠 Briefing AI gerado", description: "Análise de risco e preparação prontas" });
    },
    onError: (err: any) => {
      const msg = err?.message || "";
      if (msg.includes("429") || msg.includes("rate")) {
        toast({ title: "Rate limit", description: "Aguarde alguns segundos e tente novamente", variant: "destructive" });
      } else {
        toast({ title: "Erro ao gerar briefing", description: msg || "Tente novamente", variant: "destructive" });
      }
    },
  });

  return {
    inspections: inspections.data || [],
    isLoading: inspections.isLoading,
    isError: inspections.isError,
    errorMsg: inspections.error?.message,
    createInspection,
    generateBriefing,
    refetch: inspections.refetch,
  };
}
