/**
 * B8: API Service Layer for Nauti One
 * Type-safe database operations with built-in error handling
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

/**
 * Vessel Service with maritime-specific operations
 */
export const vesselService = {
  async getAll(options?: { limit?: number; status?: string }) {
    let query = supabase.from("vessels").select("*");
    
    if (options?.status) {
      query = query.eq("status", options.status);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query.order("name");
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("vessels")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async getWithCrew(vesselId: string) {
    const { data, error } = await supabase
      .from("vessels")
      .select(`*, crew_members(*)`)
      .eq("id", vesselId)
      .single();
    if (error) throw error;
    return data;
  },

  async getActiveVessels() {
    const { data, error } = await supabase
      .from("vessels")
      .select("*")
      .eq("status", "active")
      .order("name");
    if (error) throw error;
    return data;
  },

  async create(data: Tables["vessels"]["Insert"]) {
    const { data: created, error } = await supabase
      .from("vessels")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return created;
  },

  async update(id: string, data: Tables["vessels"]["Update"]) {
    const { data: updated, error } = await supabase
      .from("vessels")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },

  async delete(id: string) {
    const { error } = await supabase.from("vessels").delete().eq("id", id);
    if (error) throw error;
  },

  async getDashboardStats(vesselId: string) {
    const { data, error } = await supabase.rpc("get_vessel_dashboard_stats", {
      p_vessel_id: vesselId,
    });
    if (error) throw error;
    return data;
  },

  async getComplianceScore(vesselId: string) {
    const { data, error } = await supabase.rpc("calculate_compliance_score", {
      p_vessel_id: vesselId,
    });
    if (error) throw error;
    return data;
  },
};

/**
 * Crew Service with certificate management
 */
export const crewService = {
  async getAll(options?: { vesselId?: string; limit?: number }) {
    let query = supabase.from("crew_members").select("*");
    
    if (options?.vesselId) {
      query = query.eq("vessel_id", options.vesselId);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query.order("name");
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("crew_members")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async getWithCertificates(crewId: string) {
    const { data, error } = await supabase
      .from("crew_members")
      .select(`*, maritime_certificates(*)`)
      .eq("id", crewId)
      .single();
    if (error) throw error;
    return data;
  },

  async getByVessel(vesselId: string) {
    const { data, error } = await supabase
      .from("crew_members")
      .select("*")
      .eq("vessel_id", vesselId)
      .order("name");
    if (error) throw error;
    return data;
  },

  async create(data: Tables["crew_members"]["Insert"]) {
    const { data: created, error } = await supabase
      .from("crew_members")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return created;
  },

  async update(id: string, data: Tables["crew_members"]["Update"]) {
    const { data: updated, error } = await supabase
      .from("crew_members")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },

  async getExpiringCertificates(days: number = 30) {
    const { data, error } = await supabase.rpc("get_expiring_certificates_v2", {
      p_days: days,
    });
    if (error) throw error;
    return data;
  },
};

/**
 * Maintenance Service
 */
export const maintenanceService = {
  async getAll(options?: { vesselId?: string; status?: string; limit?: number }) {
    let query = supabase.from("maintenance_records").select("*");
    
    if (options?.vesselId) {
      query = query.eq("vessel_id", options.vesselId);
    }
    if (options?.status) {
      query = query.eq("status", options.status);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query.order("scheduled_date", { ascending: true });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("maintenance_records")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async getPending() {
    const { data, error } = await supabase
      .from("maintenance_records")
      .select(`*, vessels(name, imo_number)`)
      .eq("status", "pending")
      .order("scheduled_date");
    if (error) throw error;
    return data;
  },

  async getOverdue() {
    const { data, error } = await supabase
      .from("maintenance_records")
      .select(`*, vessels(name)`)
      .eq("status", "pending")
      .lt("scheduled_date", new Date().toISOString())
      .order("scheduled_date");
    if (error) throw error;
    return data;
  },

  async create(data: Tables["maintenance_records"]["Insert"]) {
    const { data: created, error } = await supabase
      .from("maintenance_records")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return created;
  },

  async update(id: string, data: Tables["maintenance_records"]["Update"]) {
    const { data: updated, error } = await supabase
      .from("maintenance_records")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },

  async suggestDate(vesselId: string, component: string) {
    const { data, error } = await supabase.rpc("suggest_maintenance_date", {
      p_vessel_id: vesselId,
      p_component: component,
    });
    if (error) throw error;
    return data;
  },
};

/**
 * Voyage Service
 */
export const voyageService = {
  async getAll(options?: { vesselId?: string; status?: string }) {
    let query = supabase.from("voyages").select("*");
    
    if (options?.vesselId) {
      query = query.eq("vessel_id", options.vesselId);
    }
    if (options?.status) {
      query = query.eq("status", options.status);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("voyages")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async getActive(vesselId?: string) {
    let query = supabase.from("voyages").select("*").eq("status", "active");
    if (vesselId) {
      query = query.eq("vessel_id", vesselId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(data: Tables["voyages"]["Insert"]) {
    const { data: created, error } = await supabase
      .from("voyages")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return created;
  },

  async update(id: string, data: Tables["voyages"]["Update"]) {
    const { data: updated, error } = await supabase
      .from("voyages")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },
};

/**
 * Document Service
 */
export const documentService = {
  async getAll(options?: { entityType?: string; entityId?: string }) {
    let query = supabase.from("documents").select("*");
    
    if (options?.entityType) {
      query = query.eq("document_type", options.entityType);
    }
    if (options?.entityId) {
      query = query.eq("vessel_id", options.entityId);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(data: Tables["documents"]["Insert"]) {
    const { data: created, error } = await supabase
      .from("documents")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return created;
  },

  async uploadDocument(
    file: File,
    vesselId: string,
    documentType: string,
    metadata?: Partial<Tables["documents"]["Insert"]>
  ) {
    const fileName = `${vesselId}/${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("documents")
      .getPublicUrl(fileName);

    return this.create({
      vessel_id: vesselId,
      document_type: documentType,
      title: file.name,
      file_url: publicUrl,
      file_size: file.size,
      mime_type: file.type,
      ...metadata,
    });
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

/**
 * Expense Service with financial calculations
 */
export const expenseService = {
  async getAll(options?: { vesselId?: string; startDate?: string; endDate?: string }) {
    let query = supabase.from("expenses").select("*");
    
    if (options?.vesselId) {
      query = query.eq("vessel_id", options.vesselId);
    }
    if (options?.startDate) {
      query = query.gte("expense_date", options.startDate);
    }
    if (options?.endDate) {
      query = query.lte("expense_date", options.endDate);
    }
    
    const { data, error } = await query.order("expense_date", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(data: Tables["expenses"]["Insert"]) {
    const { data: created, error } = await supabase
      .from("expenses")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return created;
  },

  async update(id: string, data: Tables["expenses"]["Update"]) {
    const { data: updated, error } = await supabase
      .from("expenses")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },

  async calculateOpex(vesselId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase.rpc("calculate_vessel_opex", {
      p_vessel_id: vesselId,
      p_start_date: startDate,
      p_end_date: endDate,
    });
    if (error) throw error;
    return data;
  },
};

/**
 * Notification Service
 */
export const notificationService = {
  async getAll(userId: string, options?: { unreadOnly?: boolean; limit?: number }) {
    let query = supabase.from("notifications").select("*").eq("user_id", userId);
    
    if (options?.unreadOnly) {
      query = query.eq("read", false);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
    if (error) throw error;
  },
};

/**
 * Incident Service
 */
export const incidentService = {
  async getAll(options?: { vesselId?: string; severity?: string }) {
    let query = supabase.from("incidents").select("*");
    
    if (options?.vesselId) {
      query = query.eq("vessel_id", options.vesselId);
    }
    if (options?.severity) {
      query = query.eq("severity", options.severity);
    }
    
    const { data, error } = await query.order("date_occurred", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("incidents")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(data: Tables["incidents"]["Insert"]) {
    const { data: created, error } = await supabase
      .from("incidents")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return created;
  },

  async update(id: string, data: Tables["incidents"]["Update"]) {
    const { data: updated, error } = await supabase
      .from("incidents")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },
};

/**
 * Mission Service  
 */
export const missionService = {
  async getAll(options?: { status?: string; limit?: number }) {
    let query = supabase.from("missions").select("*");
    
    if (options?.status) {
      query = query.eq("status", options.status);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("missions")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(data: Tables["missions"]["Insert"]) {
    const { data: created, error } = await supabase
      .from("missions")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return created;
  },

  async update(id: string, data: Tables["missions"]["Update"]) {
    const { data: updated, error } = await supabase
      .from("missions")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },
};
