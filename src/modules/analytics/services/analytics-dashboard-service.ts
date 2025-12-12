/**
 * PATCH 268 - Analytics Dashboard Service
 */

import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsDashboard {
  id?: string;
  userId?: string;
  organizationId?: string;
  dashboardName: string;
  description?: string;
  layout: DashboardWidget[];
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardWidget {
  id: string;
  type: "chart" | "metric" | "table" | "map";
  title: string;
  dataSource?: string;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
}

export interface AnalyticsEvent {
  id?: string;
  userId?: string;
  organizationId?: string;
  sessionId: string;
  eventName: string;
  eventCategory: string;
  properties: Record<string, any>;
  pageUrl: string;
  timestamp?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
}

export class AnalyticsDashboardService {
  
  async createDashboard(dashboard: AnalyticsDashboard): Promise<AnalyticsDashboard> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("analytics_dashboards")
        .insert({
          organization_id: dashboard.organizationId,
          dashboard_name: dashboard.dashboardName,
          description: dashboard.description,
          layout: dashboard.layout,
          is_public: dashboard.isPublic || false
        } as any)
        .select()
        .single();

      if (error) throw error;
      return this.mapToDashboard(data);
    } catch (error) {
      console.error("Error creating dashboard:", error);
      throw error;
    }
  }

  async updateDashboard(id: string, dashboard: Partial<AnalyticsDashboard>): Promise<AnalyticsDashboard> {
    try {
      const updateData: any = {};
      if (dashboard.dashboardName) updateData.dashboard_name = dashboard.dashboardName;
      if (dashboard.description !== undefined) updateData.description = dashboard.description;
      if (dashboard.layout) updateData.layout = dashboard.layout;
      if (dashboard.isPublic !== undefined) updateData.is_public = dashboard.isPublic;

      const { data, error } = await supabase
        .from("analytics_dashboards")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return this.mapToDashboard(data);
    } catch (error) {
      console.error("Error updating dashboard:", error);
      throw error;
    }
  }

  async deleteDashboard(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("analytics_dashboards")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      throw error;
    }
  }

  async getDashboards(): Promise<AnalyticsDashboard[]> {
    try {
      const { data, error } = await supabase
        .from("analytics_dashboards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(this.mapToDashboard);
    } catch (error) {
      console.error("Error fetching dashboards:", error);
      return [];
    }
  }

  async getDashboard(id: string): Promise<AnalyticsDashboard | null> {
    try {
      const { data, error } = await supabase
        .from("analytics_dashboards")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data ? this.mapToDashboard(data) : null;
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      return null;
    }
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase
        .from("analytics_events")
        .insert({
          user_id: user?.id,
          organization_id: event.organizationId,
          session_id: event.sessionId,
          event_name: event.eventName,
          event_category: event.eventCategory,
          properties: event.properties,
          page_url: event.pageUrl,
          device_type: event.deviceType,
          browser: event.browser,
          os: event.os
        });
    } catch (error) {
      console.error("Error tracking event:", error);
    }
  }

  async getEvents(filters?: { category?: string; dateFrom?: string; dateTo?: string }): Promise<AnalyticsEvent[]> {
    try {
      let query = supabase
        .from("analytics_events")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1000);

      if (filters?.category) {
        query = query.eq("event_category", filters.category);
      }
      if (filters?.dateFrom) {
        query = query.gte("timestamp", filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte("timestamp", filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this.mapToEvent);
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  }

  private mapToDashboard(data: any): AnalyticsDashboard {
    return {
      id: data.id,
      userId: data.user_id,
      organizationId: data.organization_id,
      dashboardName: data.dashboard_name,
      description: data.description,
      layout: data.layout || [],
      isPublic: data.is_public,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  }

  private mapToEvent(data: any): AnalyticsEvent {
    return {
      id: data.id,
      userId: data.user_id,
      organizationId: data.organization_id,
      sessionId: data.session_id,
      eventName: data.event_name,
      eventCategory: data.event_category,
      properties: data.properties || {},
      pageUrl: data.page_url,
      timestamp: data.timestamp,
      deviceType: data.device_type,
      browser: data.browser,
      os: data.os
    };
  }
}

export const analyticsDashboardService = new AnalyticsDashboardService();
