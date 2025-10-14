/**
 * MMI Service - Data access layer for Intelligent Maintenance Module
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  MMIAsset,
  MMIComponent,
  MMIJob,
  MMIServiceOrder,
  MMIHistory,
  MMIHourMeter,
  MMIJobExtended,
  MMIDashboardStats,
  MMIJobFilters,
} from '@/types/mmi';

/**
 * Assets Service
 */
export const assetsService = {
  /**
   * Get all assets
   */
  async getAll() {
    const { data, error } = await supabase
      .from('mmi_assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as MMIAsset[];
  },

  /**
   * Get asset by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('mmi_assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as MMIAsset;
  },

  /**
   * Get assets by vessel
   */
  async getByVessel(vessel: string) {
    const { data, error } = await supabase
      .from('mmi_assets')
      .select('*')
      .eq('vessel', vessel)
      .order('name');

    if (error) throw error;
    return data as MMIAsset[];
  },

  /**
   * Get critical assets
   */
  async getCritical() {
    const { data, error } = await supabase
      .from('mmi_assets')
      .select('*')
      .eq('critical', true)
      .order('vessel');

    if (error) throw error;
    return data as MMIAsset[];
  },

  /**
   * Create asset
   */
  async create(asset: Omit<MMIAsset, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('mmi_assets')
      .insert(asset)
      .select()
      .single();

    if (error) throw error;
    return data as MMIAsset;
  },

  /**
   * Update asset
   */
  async update(id: string, updates: Partial<MMIAsset>) {
    const { data, error } = await supabase
      .from('mmi_assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MMIAsset;
  },
};

/**
 * Components Service
 */
export const componentsService = {
  /**
   * Get all components
   */
  async getAll() {
    const { data, error } = await supabase
      .from('mmi_components')
      .select('*, asset:mmi_assets(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as MMIComponent[];
  },

  /**
   * Get component by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('mmi_components')
      .select('*, asset:mmi_assets(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as MMIComponent;
  },

  /**
   * Get components by asset
   */
  async getByAsset(assetId: string) {
    const { data, error } = await supabase
      .from('mmi_components')
      .select('*')
      .eq('asset_id', assetId)
      .order('name');

    if (error) throw error;
    return data as MMIComponent[];
  },

  /**
   * Create component
   */
  async create(component: Omit<MMIComponent, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('mmi_components')
      .insert(component)
      .select()
      .single();

    if (error) throw error;
    return data as MMIComponent;
  },

  /**
   * Update component
   */
  async update(id: string, updates: Partial<MMIComponent>) {
    const { data, error } = await supabase
      .from('mmi_components')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MMIComponent;
  },
};

/**
 * Jobs Service
 */
export const jobsService = {
  /**
   * Get all jobs with filters
   */
  async getAll(filters?: MMIJobFilters) {
    let query = supabase
      .from('mmi_jobs')
      .select(`
        *,
        component:mmi_components(
          *,
          asset:mmi_assets(*)
        ),
        service_orders:mmi_os(*)
      `);

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters?.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as MMIJobExtended[];
  },

  /**
   * Get job by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('mmi_jobs')
      .select(`
        *,
        component:mmi_components(
          *,
          asset:mmi_assets(*)
        ),
        service_orders:mmi_os(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as MMIJobExtended;
  },

  /**
   * Get pending jobs
   */
  async getPending() {
    const { data, error } = await supabase
      .from('mmi_jobs')
      .select(`
        *,
        component:mmi_components(
          *,
          asset:mmi_assets(*)
        )
      `)
      .eq('status', 'pendente')
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data as MMIJobExtended[];
  },

  /**
   * Get overdue jobs
   */
  async getOverdue() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('mmi_jobs')
      .select(`
        *,
        component:mmi_components(
          *,
          asset:mmi_assets(*)
        )
      `)
      .in('status', ['pendente', 'em_andamento'])
      .lt('due_date', today)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data as MMIJobExtended[];
  },

  /**
   * Create job
   */
  async create(job: Omit<MMIJob, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('mmi_jobs')
      .insert(job)
      .select()
      .single();

    if (error) throw error;
    return data as MMIJob;
  },

  /**
   * Update job
   */
  async update(id: string, updates: Partial<MMIJob>) {
    const { data, error } = await supabase
      .from('mmi_jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MMIJob;
  },

  /**
   * Update job status
   */
  async updateStatus(id: string, status: MMIJob['status']) {
    return this.update(id, { status });
  },
};

/**
 * Service Orders Service
 */
export const serviceOrdersService = {
  /**
   * Get all service orders
   */
  async getAll() {
    const { data, error } = await supabase
      .from('mmi_os')
      .select('*, job:mmi_jobs(*)')
      .order('opened_at', { ascending: false });

    if (error) throw error;
    return data as MMIServiceOrder[];
  },

  /**
   * Get open service orders
   */
  async getOpen() {
    const { data, error } = await supabase
      .from('mmi_os')
      .select('*, job:mmi_jobs(*)')
      .in('status', ['aberta', 'aprovada', 'em_execucao'])
      .order('opened_at', { ascending: false });

    if (error) throw error;
    return data as MMIServiceOrder[];
  },

  /**
   * Create service order
   */
  async create(order: Omit<MMIServiceOrder, 'id' | 'opened_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('mmi_os')
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data as MMIServiceOrder;
  },

  /**
   * Update service order
   */
  async update(id: string, updates: Partial<MMIServiceOrder>) {
    const { data, error } = await supabase
      .from('mmi_os')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MMIServiceOrder;
  },

  /**
   * Close service order
   */
  async close(id: string) {
    return this.update(id, {
      status: 'finalizada',
      closed_at: new Date().toISOString(),
    });
  },
};

/**
 * History Service
 */
export const historyService = {
  /**
   * Get history by component
   */
  async getByComponent(componentId: string) {
    const { data, error } = await supabase
      .from('mmi_history')
      .select('*')
      .eq('component_id', componentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as MMIHistory[];
  },

  /**
   * Create history entry
   */
  async create(entry: Omit<MMIHistory, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('mmi_history')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data as MMIHistory;
  },
};

/**
 * Hour Meters Service
 */
export const hourMetersService = {
  /**
   * Get latest reading for component
   */
  async getLatest(componentId: string) {
    const { data, error } = await supabase
      .from('mmi_hours')
      .select('*')
      .eq('component_id', componentId)
      .order('read_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found
    return data as MMIHourMeter | null;
  },

  /**
   * Get readings by component
   */
  async getByComponent(componentId: string, limit = 10) {
    const { data, error } = await supabase
      .from('mmi_hours')
      .select('*')
      .eq('component_id', componentId)
      .order('read_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as MMIHourMeter[];
  },

  /**
   * Create hour meter reading
   */
  async create(reading: Omit<MMIHourMeter, 'id' | 'read_at'>) {
    const { data, error } = await supabase
      .from('mmi_hours')
      .insert(reading)
      .select()
      .single();

    if (error) throw error;
    return data as MMIHourMeter;
  },
};

/**
 * Dashboard Service
 */
export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<MMIDashboardStats> {
    // Get total assets
    const { count: total_assets } = await supabase
      .from('mmi_assets')
      .select('*', { count: 'exact', head: true });

    // Get critical assets
    const { count: critical_assets } = await supabase
      .from('mmi_assets')
      .select('*', { count: 'exact', head: true })
      .eq('critical', true);

    // Get total jobs
    const { count: total_jobs } = await supabase
      .from('mmi_jobs')
      .select('*', { count: 'exact', head: true });

    // Get jobs by status
    const { count: pending_jobs } = await supabase
      .from('mmi_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendente');

    const { count: in_progress_jobs } = await supabase
      .from('mmi_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'em_andamento');

    const { count: completed_jobs } = await supabase
      .from('mmi_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'concluido');

    // Get critical jobs
    const { count: critical_jobs } = await supabase
      .from('mmi_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('priority', 'crítica')
      .in('status', ['pendente', 'em_andamento']);

    // Get overdue jobs
    const today = new Date().toISOString().split('T')[0];
    const { count: overdue_jobs } = await supabase
      .from('mmi_jobs')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pendente', 'em_andamento'])
      .lt('due_date', today);

    // Get open service orders
    const { count: open_service_orders } = await supabase
      .from('mmi_os')
      .select('*', { count: 'exact', head: true })
      .in('status', ['aberta', 'aprovada', 'em_execucao']);

    return {
      total_assets: total_assets || 0,
      critical_assets: critical_assets || 0,
      total_jobs: total_jobs || 0,
      pending_jobs: pending_jobs || 0,
      in_progress_jobs: in_progress_jobs || 0,
      completed_jobs: completed_jobs || 0,
      overdue_jobs: overdue_jobs || 0,
      open_service_orders: open_service_orders || 0,
      critical_jobs: critical_jobs || 0,
    };
  },
};
