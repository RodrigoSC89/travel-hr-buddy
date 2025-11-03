import { supabase } from "@/integrations/supabase/client";
import type {
  LSAFFAInspection,
  InspectionStats,
  InspectionType,
  ChecklistItem,
  InspectionIssue,
} from "@/types/lsa-ffa";

class LSAFFAInspectionService {
  // Get all inspections
  async getInspections(vesselId?: string): Promise<LSAFFAInspection[]> {
    let query = supabase
      .from("lsa_ffa_inspections")
      .select("*")
      .order("date", { ascending: false });

    if (vesselId) {
      query = query.eq("vessel_id", vesselId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as LSAFFAInspection[];
  }

  // Get inspection by ID
  async getInspectionById(id: string): Promise<LSAFFAInspection | null> {
    const { data, error } = await supabase
      .from("lsa_ffa_inspections")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        console.warn(`Inspection not found: ${id}`);
        return null; // Not found
      }
      console.error(`Failed to fetch inspection ${id}:`, error);
      throw error;
    }

    return data as LSAFFAInspection;
  }

  // Create new inspection
  async createInspection(
    inspection: Omit<LSAFFAInspection, "id" | "created_at" | "updated_at">
  ): Promise<LSAFFAInspection> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("lsa_ffa_inspections")
      .insert({
        ...inspection,
        created_by: userData?.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as LSAFFAInspection;
  }

  // Update inspection
  async updateInspection(
    id: string,
    updates: Partial<LSAFFAInspection>
  ): Promise<LSAFFAInspection> {
    const { data, error } = await supabase
      .from("lsa_ffa_inspections")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as LSAFFAInspection;
  }

  // Delete inspection
  async deleteInspection(id: string): Promise<void> {
    const { error } = await supabase
      .from("lsa_ffa_inspections")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // Calculate score based on checklist
  calculateScore(checklist: Record<string, ChecklistItem>): number {
    const items = Object.values(checklist);
    if (items.length === 0) return 0;

    const passedItems = items.filter(
      (item) => item.status === "pass" || item.status === "na"
    ).length;

    return Math.round((passedItems / items.length) * 100);
  }

  // Get inspection statistics
  async getInspectionStats(vesselId?: string): Promise<InspectionStats> {
    const inspections = await this.getInspections(vesselId);

    const lsaInspections = inspections.filter((i) => i.type === "LSA");
    const ffaInspections = inspections.filter((i) => i.type === "FFA");

    const averageScore =
      inspections.length > 0
        ? Math.round(
          inspections.reduce((sum, i) => sum + (i.score || 0), 0) /
              inspections.length
        )
        : 0;

    const criticalIssues = inspections.reduce(
      (sum, i) =>
        sum +
        i.issues_found.filter((issue) => issue.severity === "critical").length,
      0
    );

    return {
      totalInspections: inspections.length,
      lsaInspections: lsaInspections.length,
      ffaInspections: ffaInspections.length,
      averageScore,
      criticalIssues,
      recentInspections: inspections.slice(0, 5),
    };
  }

  // Get inspections by type
  async getInspectionsByType(type: InspectionType): Promise<LSAFFAInspection[]> {
    const { data, error } = await supabase
      .from("lsa_ffa_inspections")
      .select("*")
      .eq("type", type)
      .order("date", { ascending: false });

    if (error) throw error;
    return (data || []) as LSAFFAInspection[];
  }

  // Get inspections with critical issues
  async getCriticalInspections(): Promise<LSAFFAInspection[]> {
    const inspections = await this.getInspections();
    return inspections.filter(
      (i) =>
        i.score < 70 ||
        i.issues_found.some((issue) => issue.severity === "critical")
    );
  }

  // Get inspection history for a vessel
  async getInspectionHistory(
    vesselId: string,
    type?: InspectionType
  ): Promise<LSAFFAInspection[]> {
    let query = supabase
      .from("lsa_ffa_inspections")
      .select("*")
      .eq("vessel_id", vesselId)
      .order("date", { ascending: false });

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as LSAFFAInspection[];
  }

  // Validate signature
  async validateSignature(
    inspectionId: string,
    signatureData: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("lsa_ffa_inspections")
      .update({
        signature_data: signatureData,
        signature_validated: true,
        signature_validated_at: new Date().toISOString(),
      })
      .eq("id", inspectionId)
      .select()
      .single();

    if (error) throw error;
    return !!data;
  }

  // Get unresolved issues across all inspections
  async getUnresolvedIssues(vesselId?: string): Promise<
    Array<{
      inspection: LSAFFAInspection;
      issues: InspectionIssue[];
    }>
  > {
    const inspections = await this.getInspections(vesselId);
    
    return inspections
      .map((inspection) => ({
        inspection,
        issues: inspection.issues_found.filter((issue) => !issue.resolved),
      }))
      .filter((item) => item.issues.length > 0);
  }

  // Mark issue as resolved
  async resolveIssue(
    inspectionId: string,
    issueId: string
  ): Promise<LSAFFAInspection> {
    const inspection = await this.getInspectionById(inspectionId);
    if (!inspection) {
      throw new Error(`Inspection not found: ${inspectionId}`);
    }

    const updatedIssues = inspection.issues_found.map((issue) =>
      issue.id === issueId
        ? { ...issue, resolved: true, resolvedAt: new Date().toISOString() }
        : issue
    );

    return this.updateInspection(inspectionId, {
      issues_found: updatedIssues,
    });
  }
}

export const lsaFfaInspectionService = new LSAFFAInspectionService();
