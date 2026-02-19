/**
 * useLVSPersistence - Hook for persisting LVS checklist data to Supabase
 */
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ALL_LVS_SECTIONS, type Section, type ItemStatus } from "./lvs-data";

export interface LVSSession {
  id: string;
  vessel_id: string | null;
  title: string;
  status: string;
  overall_score: number;
  total_items: number;
  approved_items: number;
  pending_items: number;
  rejected_items: number;
  target_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useLVSPersistence() {
  const [sessions, setSessions] = useState<LVSSession[]>([]);
  const [activeSession, setActiveSession] = useState<LVSSession | null>(null);
  const [sections, setSections] = useState<Section[]>(ALL_LVS_SECTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load sessions
  const loadSessions = useCallback(async () => {
    const { data } = await supabase
      .from("lvs_acceptance_sessions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setSessions(data as unknown as LVSSession[]);
  }, []);

  // Create new session
  const createSession = useCallback(async (title: string, vesselId?: string, targetDate?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Não autenticado"); return null; }

    const allItems = ALL_LVS_SECTIONS.flatMap(s => s.subsections.flatMap(ss => ss.items));

    const { data, error } = await supabase
      .from("lvs_acceptance_sessions")
      .insert({
        title,
        vessel_id: vesselId || null,
        created_by: user.id,
        total_items: allItems.length,
        target_date: targetDate || null,
      })
      .select()
      .single();

    if (error) { toast.error("Erro ao criar sessão"); return null; }

    const session = data as unknown as LVSSession;

    // Bulk insert all items with default status
    const itemRows = allItems.map(item => {
      const section = ALL_LVS_SECTIONS.find(s => s.subsections.some(ss => ss.items.some(i => i.id === item.id)));
      return {
        session_id: session.id,
        item_ref: item.ref,
        item_question: item.question,
        section_code: section?.code || "",
        et_ref: section?.etRef || "",
        status: item.status,
        observations: item.observations || "",
        pendency: item.pendency || "",
        has_photo: item.hasPhoto || false,
      };
    });

    // Insert in batches of 100
    for (let i = 0; i < itemRows.length; i += 100) {
      await supabase.from("lvs_item_status").insert(itemRows.slice(i, i + 100));
    }

    setActiveSession(session);
    await loadSessions();
    toast.success(`Sessão "${title}" criada com ${allItems.length} itens`);
    return session;
  }, [loadSessions]);

  // Load session items into sections state
  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      const [sessionResult, itemsResult] = await Promise.all([
        supabase.from("lvs_acceptance_sessions").select("*").eq("id", sessionId).single(),
        supabase.from("lvs_item_status").select("*").eq("session_id", sessionId),
      ]);

      if (sessionResult.data) {
        setActiveSession(sessionResult.data as unknown as LVSSession);
      }

      if (itemsResult.data) {
        const itemMap = new Map<string, any>();
        (itemsResult.data as any[]).forEach(item => itemMap.set(item.item_ref, item));

        const updatedSections = ALL_LVS_SECTIONS.map(sec => ({
          ...sec,
          subsections: sec.subsections.map(sub => ({
            ...sub,
            items: sub.items.map(item => {
              const dbItem = itemMap.get(item.ref);
              if (dbItem) {
                return {
                  ...item,
                  status: dbItem.status as ItemStatus,
                  observations: dbItem.observations || "",
                  pendency: dbItem.pendency || "",
                  deadline: dbItem.deadline || "",
                  hasPhoto: dbItem.has_photo || false,
                };
              }
              return item;
            }),
          })),
        }));

        setSections(updatedSections);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save item status change
  const saveItemStatus = useCallback(async (itemRef: string, status: ItemStatus, fields?: { observations?: string; pendency?: string; deadline?: string }) => {
    if (!activeSession) return;

    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (fields?.observations !== undefined) updateData.observations = fields.observations;
    if (fields?.pendency !== undefined) updateData.pendency = fields.pendency;
    if (fields?.deadline !== undefined) updateData.deadline = fields.deadline || null;

    await supabase
      .from("lvs_item_status")
      .update(updateData)
      .eq("session_id", activeSession.id)
      .eq("item_ref", itemRef);

    // Update local state
    setSections(prev => prev.map(sec => ({
      ...sec,
      subsections: sec.subsections.map(sub => ({
        ...sub,
        items: sub.items.map(item =>
          item.ref === itemRef ? { ...item, status, ...fields } : item
        ),
      })),
    })));

    // Recalculate session scores
    await recalculateSessionScore();
  }, [activeSession]);

  // Recalculate session score
  const recalculateSessionScore = useCallback(async () => {
    if (!activeSession) return;

    const { data } = await supabase
      .from("lvs_item_status")
      .select("status")
      .eq("session_id", activeSession.id);

    if (data) {
      const items = data as any[];
      const total = items.length;
      const approved = items.filter(i => i.status === "approved").length;
      const pending = items.filter(i => i.status === "pending").length;
      const rejected = items.filter(i => i.status === "rejected").length;
      const na = items.filter(i => i.status === "not_applicable").length;
      const applicable = total - na;
      const score = applicable > 0 ? Math.round((approved / applicable) * 100) : 0;

      await supabase
        .from("lvs_acceptance_sessions")
        .update({ overall_score: score, approved_items: approved, pending_items: pending, rejected_items: rejected })
        .eq("id", activeSession.id);

      setActiveSession(prev => prev ? { ...prev, overall_score: score, approved_items: approved, pending_items: pending, rejected_items: rejected } : null);
    }
  }, [activeSession]);

  // Save action plan
  const saveActionPlan = useCallback(async (title: string, content: string, scope: string, priority: string, gapCount: number, estimatedDays: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("lvs_action_plans")
      .insert({
        session_id: activeSession?.id || null,
        created_by: user.id,
        title,
        content,
        scope,
        priority,
        gap_count: gapCount,
        estimated_days: estimatedDays,
      })
      .select()
      .single();

    if (error) { toast.error("Erro ao salvar plano"); return null; }
    return data;
  }, [activeSession]);

  // Save document analysis
  const saveDocumentAnalysis = useCallback(async (documentName: string, aiResponse: string, mappedItems: number, gaps: number, confidence: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("lvs_document_analyses")
      .insert({
        session_id: activeSession?.id || null,
        created_by: user.id,
        document_name: documentName,
        ai_response: aiResponse,
        mapped_items: mappedItems,
        gaps_found: gaps,
        confidence,
      })
      .select()
      .single();

    if (error) { toast.error("Erro ao salvar análise"); return null; }
    return data;
  }, [activeSession]);

  // Initial load
  useEffect(() => { loadSessions(); }, [loadSessions]);

  return {
    sessions,
    activeSession,
    sections,
    isLoading,
    isSaving,
    setSections,
    loadSessions,
    createSession,
    loadSession,
    saveItemStatus,
    saveActionPlan,
    saveDocumentAnalysis,
    recalculateSessionScore,
  };
}
