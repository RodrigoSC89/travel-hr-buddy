/**
 * PATCH 268 - Analytics Dashboard Service
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';
import type { Database, Json } from "@/integrations/supabase/types";

type DashboardRow = Database['public']['Tables']['analytics_dashboards']['Row'];
type EventRow = Database['public']['Tables']['analytics_events']['Row'];

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
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
}

export interface AnalyticsEvent {
  id?: string;
  userId?: string;
  organizationId?: string;
  sessionId: string;
  eventName: string;
  eventCategory: string;
  properties: Record<string, unknown>;
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
          name: dashboard.dashboardName,
          description: dashboard.description,
          layout: dashboard.layout,
          is_public: dashboard.isPublic || false
        } as never)
        .select()
        .single();

      if (error) throw error;
      return this.mapToDashboard(data);
    } catch (error) {
      logger.error("Error creating dashboard:", error);
      throw error;
    }
  }

  async updateDashboard(id: string, dashboard: Partial<AnalyticsDashboard>): Promise<AnalyticsDashboard> {
    try {
      const updateData: Record<string, unknown> = {};
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
      logger.error("Error updating dashboard:", error);
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
      logger.error("Error deleting dashboard:", error);
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
      logger.error("Error fetching dashboards:", error);
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
      logger.error("Error fetching dashboard:", error);
      return null;
    }
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase
        .from("analytics_events")
        .insert([{
          user_id: user?.id,
          session_id: event.sessionId,
          event_name: event.eventName,
          event_category: event.eventCategory,
          properties: event.properties as unknown as Json,
          page_url: event.pageUrl,
          device_type: event.deviceType,
          browser: event.browser,
          os: event.os
        }]);
    } catch (error) {
      logger.error("Error tracking event:", error);
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
      logger.error("Error fetching events:", error);
      return [];
    }
  }

  private mapToDashboard(data: DashboardRow): AnalyticsDashboard {
    return {
      id: data.id,
      userId: data.user_id ?? undefined,
      organizationId: data.organization_id ?? undefined,
      dashboardName: data.name,
      description: data.description ?? undefined,
      layout: (data.layout as unknown as DashboardWidget[]) || [],
      isPublic: data.is_public ?? undefined,
      createdAt: data.created_at ?? undefined,
      updatedAt: data.updated_at ?? undefined
    };
  }

  private mapToEvent(data: EventRow): AnalyticsEvent {
    return {
      id: data.id,
      userId: data.user_id ?? undefined,
      sessionId: data.session_id ?? '',
      eventName: data.event_name,
      eventCategory: data.event_category ?? '',
      properties: (data.properties as Record<string, unknown>) || {},
      pageUrl: data.page_url ?? '',
      timestamp: data.timestamp ?? undefined,
      deviceType: data.device_type ?? undefined,
      browser: data.browser ?? undefined,
      os: data.os ?? undefined
    };
  }
}

export const analyticsDashboardService = new AnalyticsDashboardService();
