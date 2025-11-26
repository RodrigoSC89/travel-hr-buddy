import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Checklist, ChecklistTemplate } from "@/components/maritime-checklists/checklist-types";
import type { Database } from "@/integrations/supabase/types";

const DEFAULT_TEMPLATE_FALLBACKS: ChecklistTemplate[] = [
  {
    id: "template-1",
    name: "DP Inspection Template",
    type: "dp",
    version: "2.0",
    description: "Template padrão para inspeção de Dynamic Positioning",
    items: [],
    estimatedDuration: 240,
    frequency: "monthly",
    applicableVesselTypes: ["PSV", "AHTS", "OSV"],
    requiredCertifications: ["DPO"],
    dependencies: [],
    active: true,
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "template-2",
    name: "Machine Routine Template",
    type: "machine_routine",
    version: "1.5",
    description: "Template para rotina de inspeção de máquinas",
    items: [],
    estimatedDuration: 180,
    frequency: "weekly",
    applicableVesselTypes: ["PSV", "AHTS", "OSV", "Drill Ship"],
    requiredCertifications: ["Chief Engineer"],
    dependencies: [],
    active: true,
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "template-3",
    name: "Nautical Routine Template",
    type: "nautical_routine",
    version: "1.0",
    description: "Template para rotina náutica",
    items: [],
    estimatedDuration: 120,
    frequency: "daily",
    applicableVesselTypes: ["PSV", "AHTS", "OSV", "Drill Ship"],
    requiredCertifications: ["Captain", "Officer"],
    dependencies: [],
    active: true,
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "template-4",
    name: "Safety Inspection Template",
    type: "safety",
    version: "2.1",
    description: "Template para inspeção de segurança",
    items: [],
    estimatedDuration: 200,
    frequency: "weekly",
    applicableVesselTypes: ["PSV", "AHTS", "OSV", "Drill Ship"],
    requiredCertifications: ["Safety Officer"],
    dependencies: [],
    active: true,
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const CHECKLIST_TYPES: ChecklistTemplate["type"][] = [
  "dp",
  "machine_routine",
  "nautical_routine",
  "safety",
  "environmental",
  "custom"
];

const CHECKLIST_FREQUENCIES: ChecklistTemplate["frequency"][] = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "annually",
  "custom"
];

const CHECKLIST_ITEM_TYPES: ChecklistTemplate["items"][number]["type"][] = [
  "boolean",
  "text",
  "number",
  "select",
  "multiselect",
  "file",
  "photo",
  "signature",
  "measurement"
];

const normalizeChecklistType = (value?: string | null): ChecklistTemplate["type"] => {
  if (value && CHECKLIST_TYPES.includes(value as ChecklistTemplate["type"])) {
    return value as ChecklistTemplate["type"];
  }
  return "custom";
};

const normalizeFrequency = (value?: string | null): ChecklistTemplate["frequency"] => {
  if (value && CHECKLIST_FREQUENCIES.includes(value as ChecklistTemplate["frequency"])) {
    return value as ChecklistTemplate["frequency"];
  }
  return "monthly";
};

const normalizeItemType = (value?: string | null): ChecklistTemplate["items"][number]["type"] => {
  if (value && CHECKLIST_ITEM_TYPES.includes(value as ChecklistTemplate["items"][number]["type"])) {
    return value as ChecklistTemplate["items"][number]["type"];
  }
  return "boolean";
};

const ensureStringArray = (value: unknown, fallback: string[] = []): string[] => {
  if (Array.isArray(value)) {
    return value.map(item => String(item));
  }
  return fallback;
};

const parseJsonContent = (value: unknown): Record<string, unknown> => {
  if (!value) return {};
  if (typeof value === "object") {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch (err) {
      console.warn("Unable to parse template content as JSON", err);
      return {};
    }
  }
  return {};
};

const normalizeNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const isPrimitive = (value: unknown): value is string | number | boolean =>
  ["string", "number", "boolean"].includes(typeof value);

const mapTemplateItems = (rawItems: unknown): ChecklistTemplate["items"] => {
  if (!Array.isArray(rawItems)) return [];

  return rawItems.map((item, index) => {
    const data = (item ?? {}) as Record<string, unknown>;
    const title =
      typeof data.title === "string" && data.title.trim().length > 0
        ? data.title
        : typeof data.name === "string" && data.name.trim().length > 0
          ? data.name
          : `Item ${index + 1}`;

    return {
      id: String(data.id ?? data.key ?? `item-${index}`),
      title,
      description: typeof data.description === "string" ? data.description : "",
      type: normalizeItemType(typeof data.type === "string" ? data.type : undefined),
      required: typeof data.required === "boolean" ? data.required : true,
      category: typeof data.category === "string" ? data.category : "General",
      order: normalizeNumber(
        typeof data.order !== "undefined" ? data.order : data.order_index,
        index
      ),
      options: Array.isArray(data.options) ? data.options.map(String) : undefined,
      unit: typeof data.unit === "string" ? data.unit : undefined,
      minValue:
        typeof data.minValue === "number"
          ? data.minValue
          : typeof data.min_value === "number"
            ? data.min_value
            : undefined,
      maxValue:
        typeof data.maxValue === "number"
          ? data.maxValue
          : typeof data.max_value === "number"
            ? data.max_value
            : undefined,
      validationRules: Array.isArray(data.validationRules)
        ? (data.validationRules as ChecklistTemplate["items"][number]["validationRules"])
        : Array.isArray(data.validation_rules)
          ? (data.validation_rules as ChecklistTemplate["items"][number]["validationRules"])
          : undefined,
      dependencies: ensureStringArray(data.dependencies),
      aiSuggestion: typeof data.aiSuggestion === "string" ? data.aiSuggestion : undefined,
      historicalData: Array.isArray(data.historicalData) ? data.historicalData : undefined,
      qrCode: typeof data.qrCode === "string" ? data.qrCode : undefined,
      iotSensorId: typeof data.iotSensorId === "string" ? data.iotSensorId : undefined,
      autoValue: isPrimitive(data.autoValue) ? data.autoValue : undefined,
    };
  });
};

type SupabaseTemplateRecord = {
  id: string;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  metadata?: Record<string, unknown> | null;
  content?: unknown;
};

const transformTemplateRecord = (record: SupabaseTemplateRecord): ChecklistTemplate | null => {
  if (!record?.id) return null;

  const metadata = (record.metadata ?? {}) as Record<string, unknown>;
  const content = parseJsonContent(record.content);
  const templateSource = typeof content.template === "object" ? (content.template as Record<string, unknown>) : content;
  const merged = { ...templateSource, ...metadata } as Record<string, unknown>;
  const items = mapTemplateItems(merged.items ?? metadata.items);

  return {
    id: record.id,
    name: typeof merged.name === "string" ? merged.name : record.title ?? "Checklist Template",
    type: normalizeChecklistType(typeof merged.type === "string" ? merged.type : record.category),
    version: typeof merged.version === "string" ? merged.version : "1.0",
    description:
      typeof merged.description === "string"
        ? merged.description
        : record.description ?? record.title ?? "",
    items,
    estimatedDuration: normalizeNumber(
      merged.estimatedDuration ?? merged.estimated_duration,
      180
    ),
    frequency: normalizeFrequency(typeof merged.frequency === "string" ? merged.frequency : undefined),
    applicableVesselTypes: ensureStringArray(
      merged.applicableVesselTypes ?? merged.applicable_vessel_types,
      []
    ),
    requiredCertifications: ensureStringArray(
      merged.requiredCertifications ?? merged.required_certifications,
      []
    ),
    dependencies: ensureStringArray(merged.dependencies, []),
    active: typeof merged.active === "boolean" ? merged.active : true,
    createdBy: record.created_by ?? (typeof merged.createdBy === "string" ? merged.createdBy : "system"),
    createdAt: record.created_at ?? new Date().toISOString(),
    updatedAt: record.updated_at ?? record.created_at ?? new Date().toISOString(),
  };
};

type OperationalChecklistRow = Database["public"]["Tables"]["operational_checklists"]["Row"];
type ChecklistItemRow = Database["public"]["Tables"]["checklist_items"]["Row"];
type VesselRow = Database["public"]["Tables"]["vessels"]["Row"];

type ChecklistQueryResult = OperationalChecklistRow & {
  checklist_items: ChecklistItemRow[] | null;
  vessels: VesselRow | null;
};

export const useMaritimeChecklists = (userId: string) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch checklists from Supabase
  const fetchChecklists = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("operational_checklists")
        .select(`
          *,
          checklist_items(*),
          vessels(*)
        `)
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match our Checklist interface
      const typedData = (data ?? []) as ChecklistQueryResult[];
      const transformedChecklists: Checklist[] = typedData.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: (item.type as Checklist["type"]) ?? "dp",
        version: "1.0",
        description: item.title || "",
        vessel: {
          id: item.vessels?.id || "",
          name: item.vessels?.name || "Unknown Vessel",
          type: item.vessels?.vessel_type || "Unknown",
          imo: item.vessels?.imo_number || "",
          flag: item.vessels?.flag_state || "",
          classification: "DNV", // Default classification
          operator: "Maritime Operator" // Default operator
        },
        inspector: {
          id: userId,
          name: "Current User",
          license: "LIC001",
          company: "Maritime Company",
          email: "user@maritime.com",
          phone: "+55 11 99999-9999",
          certifications: ["Maritime Inspector"]
        },
        status: (item.status as Checklist["status"]) ?? "draft",
        items: (item.checklist_items ?? []).map((checklistItem: any) => ({
          id: checklistItem.id,
          title: checklistItem.title,
          description: checklistItem.description,
          type: "boolean",
          required: checklistItem.required,
          category: "General",
          order: checklistItem.order_index,
          status: checklistItem.completed ? "completed" : "pending",
          value: checklistItem.completed,
          notes: checklistItem.notes,
          timestamp: checklistItem.completed_at
        })) || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        completedAt: item.status === "completed" ? item.updated_at : undefined, // Set undefined instead of null
        priority: (item.priority as Checklist["priority"]) ?? "medium",
        estimatedDuration: 180, // Default duration
        complianceScore: item.compliance_score ?? undefined,
        workflow: [],
        tags: [],
        template: false,
        syncStatus: "synced"
      })) || [];

      setChecklists(transformedChecklists);
    } catch (err) {
      setError("Erro ao carregar checklists");
      toast.error("Erro ao carregar checklists");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch templates from Supabase
  const fetchTemplates = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("category", "maritime_checklist")
        .order("created_at", { ascending: false });

      if (error) throw error;

      let records = data ?? [];

      if (!records.length) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("templates")
          .select("*")
          .contains("metadata", { module: "maritime-checklists" })
          .order("created_at", { ascending: false });

        if (fallbackError) throw fallbackError;
        records = fallbackData ?? [];
      }

      if (!records.length) {
        setTemplates(DEFAULT_TEMPLATE_FALLBACKS);
        return;
      }

      const transformed = records
        .map((record: any) => transformTemplateRecord(record))
        .filter((template): template is ChecklistTemplate => Boolean(template));

      if (!transformed.length) {
        setTemplates(DEFAULT_TEMPLATE_FALLBACKS);
        return;
      }

      setError(null);
      setTemplates(transformed);
    } catch (err) {
      console.error("Erro ao carregar templates", err);
      setError("Erro ao carregar templates");
      toast.error("Erro ao carregar templates");
      setTemplates(DEFAULT_TEMPLATE_FALLBACKS);
    }
  }, [userId]);

  // Save checklist to Supabase
  const saveChecklist = async (checklist: Checklist) => {
    try {
      // Update checklist
      const { error: checklistError } = await supabase
        .from("operational_checklists")
        .update({
          title: checklist.title,
          description: checklist.description,
          status: checklist.status,
          priority: checklist.priority,
          compliance_score: checklist.complianceScore,
          completed_at: checklist.completedAt,
          updated_at: new Date().toISOString()
        })
        .eq("id", checklist.id);

      if (checklistError) throw checklistError;

      // Update checklist items
      for (const item of checklist.items) {
        const { error: itemError } = await supabase
          .from("checklist_items")
          .update({
            completed: item.status === "completed",
            completed_at: item.timestamp,
            notes: item.notes,
            updated_at: new Date().toISOString()
          })
          .eq("id", item.id);

        if (itemError) throw itemError;
      }

      // Refresh the checklists
      await fetchChecklists();
      
      toast.success("Checklist salvo com sucesso!");
    } catch (err) {
      toast.error("Erro ao salvar checklist");
      throw err;
    }
  };

  // Submit checklist for review
  const submitChecklist = async (checklist: Checklist) => {
    try {
      const { error } = await supabase
        .from("operational_checklists")
        .update({
          status: "pending_review",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", checklist.id);

      if (error) throw error;

      // Refresh the checklists
      await fetchChecklists();
      
      toast.success("Checklist enviado para revisão!");
    } catch (err) {
      toast.error("Erro ao enviar checklist");
      throw err;
    }
  };

  // Create new checklist from template
  const createChecklistFromTemplate = async (template: ChecklistTemplate, vesselId?: string) => {
    try {
      if (!vesselId) {
        toast.error("Vessel ID é obrigatório");
        return;
      }

      const { data: checklist, error: checklistError } = await supabase
        .from("operational_checklists")
        .insert({
          title: `${template.name} - ${new Date().toLocaleDateString()}`,
          description: template.description,
          type: template.type,
          version: template.version,
          status: "draft",
          priority: "medium",
          estimated_duration: template.estimatedDuration,
          vessel_id: vesselId,
          organization_id: null, // Will be set by RLS
          created_by: userId
        })
        .select()
        .single();

      if (checklistError) throw checklistError;

      // TODO: Create checklist items from template
      // For now, we'll let the specific checklist components handle their own items

      // Refresh the checklists
      await fetchChecklists();
      
      toast.success("Checklist criado com sucesso!");
      return checklist;
    } catch (err) {
      toast.error("Erro ao criar checklist");
      throw err;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchChecklists();
      fetchTemplates();
    }
  }, [userId, fetchChecklists, fetchTemplates]);

  return {
    checklists,
    templates,
    loading,
    error,
    saveChecklist,
    submitChecklist,
    createChecklistFromTemplate,
    refetch: fetchChecklists
  };
};