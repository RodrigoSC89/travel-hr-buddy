/**
 * Logistics Analytics Data Hook
 * Fetches real delivery, supplier and inventory data from Supabase
 * ✅ R01 COMPLIANCE: Zero mock data fallbacks in production
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface DeliveryMetric {
  month: string;
  onTime: number;
  delayed: number;
  total: number;
  avgDays: number;
  cost: number;
}

export interface SupplierPerformance {
  name: string;
  deliveries: number;
  onTimeRate: number;
  qualityScore: number;
}

export interface InventoryTrend {
  category: string;
  current: number;
  optimal: number;
  reorderPoint: number;
}

export interface LogisticsData {
  deliveryData: DeliveryMetric[];
  supplierData: SupplierPerformance[];
  inventoryData: InventoryTrend[];
  hasRealData: boolean;
  status: 'loading' | 'ok' | 'empty' | 'error' | 'not_configured';
}

export function useLogisticsAnalytics(period: string = '6m') {
  return useQuery({
    queryKey: ['logistics-analytics', period],
    queryFn: async (): Promise<LogisticsData> => {
      try {
        const deliveryData = await fetchDeliveryMetrics(period);
        const supplierData = await fetchSupplierPerformance();
        const inventoryData = await fetchInventoryTrends();

        const hasRealData = deliveryData.length > 0 || supplierData.length > 0 || inventoryData.length > 0;

        // ✅ R01 COMPLIANCE: Retorna dados vazios em vez de mocks
        // UI deve exibir EmptyState quando não há dados
        return {
          deliveryData,
          supplierData,
          inventoryData,
          hasRealData,
          status: hasRealData ? 'ok' : 'empty',
        };
      } catch (error) {
        logger.error('Error fetching logistics analytics:', error);
        return {
          deliveryData: [],
          supplierData: [],
          inventoryData: [],
          hasRealData: false,
          status: 'error',
        };
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

async function fetchDeliveryMetrics(period: string): Promise<DeliveryMetric[]> {
  try {
    const months = period === '1m' ? 1 : period === '3m' ? 3 : period === '6m' ? 6 : 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data: shipments, error } = await supabase
      .from('shipments')
      .select('id, status, departure_date, estimated_arrival, actual_arrival, shipping_cost')
      .gte('departure_date', startDate.toISOString())
      .order('departure_date');

    if (error || !shipments || shipments.length === 0) return [];

    const monthlyData: Record<string, { onTime: number; delayed: number; total: number; totalDays: number; totalCost: number }> = {};

    shipments.forEach(shipment => {
      const date = new Date(shipment.departure_date || new Date());
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { onTime: 0, delayed: 0, total: 0, totalDays: 0, totalCost: 0 };
      }

      monthlyData[monthKey].total++;
      monthlyData[monthKey].totalCost += Number(shipment.shipping_cost) || 0;

      if (shipment.actual_arrival && shipment.estimated_arrival) {
        const actual = new Date(shipment.actual_arrival);
        const estimated = new Date(shipment.estimated_arrival);
        if (actual <= estimated) {
          monthlyData[monthKey].onTime++;
        } else {
          monthlyData[monthKey].delayed++;
        }
      } else if (shipment.status === 'delivered') {
        monthlyData[monthKey].onTime++;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      onTime: data.total > 0 ? Math.round((data.onTime / data.total) * 100) : 0,
      delayed: data.total > 0 ? Math.round((data.delayed / data.total) * 100) : 0,
      total: data.total,
      avgDays: data.total > 0 ? Math.round((data.totalDays / data.total) * 10) / 10 : 0,
      cost: data.totalCost,
    }));
  } catch (err) {
    logger.error('Error fetching delivery metrics:', err);
    return [];
  }
}

async function fetchSupplierPerformance(): Promise<SupplierPerformance[]> {
  try {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('id, name, rating, on_time_delivery, quality_score, total_orders')
      .limit(10);

    if (error || !vendors || vendors.length === 0) return [];

    return vendors.map(vendor => ({
      name: vendor.name || 'Unknown',
      deliveries: vendor.total_orders || 0,
      onTimeRate: Number(vendor.on_time_delivery) || (vendor.rating ? vendor.rating * 20 : 0),
      qualityScore: Number(vendor.quality_score) || vendor.rating || 0,
    }));
  } catch (err) {
    logger.error('Error fetching supplier performance:', err);
    return [];
  }
}

async function fetchInventoryTrends(): Promise<InventoryTrend[]> {
  try {
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('id, name, category, quantity, min_quantity, max_quantity')
      .limit(100);

    if (error || !items || items.length === 0) return [];

    const categoryData: Record<string, { current: number; optimal: number; reorder: number }> = {};

    items.forEach(item => {
      const category = item.category || 'Outros';
      if (!categoryData[category]) {
        categoryData[category] = { current: 0, optimal: 0, reorder: 0 };
      }
      const qty = Number(item.quantity) || 0;
      categoryData[category].current += qty;
      categoryData[category].optimal += Number(item.max_quantity) || qty * 1.2;
      categoryData[category].reorder += Number(item.min_quantity) || qty * 0.3;
    });

    return Object.entries(categoryData).slice(0, 5).map(([category, data]) => ({
      category,
      current: Math.round(data.current),
      optimal: Math.round(data.optimal),
      reorderPoint: Math.round(data.reorder),
    }));
  } catch (err) {
    logger.error('Error fetching inventory trends:', err);
    return [];
  }
}
