/**
 * Hook para dados reais de Spare Parts Inventory
 * Usa dados do Supabase da tabela inventory_items
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface SparePart {
  id: string;
  partNumber: string;
  description: string;
  category: string;
  location: string;
  robQty: number;
  minQty: number;
  maxQty: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  status: "ok" | "low" | "critical" | "excess";
  critical: boolean;
  lastReceived?: Date;
  leadTime: number;
  supplier: string;
  impaCode?: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  criticalItems: number;
  lowStock: number;
  pendingOrders: number;
  ordersValue: number;
  turnoverRate: number;
  serviceLevel: number;
}

function calculateStatus(robQty: number, minQty: number, maxQty: number): SparePart['status'] {
  if (robQty < minQty * 0.5) return 'critical';
  if (robQty < minQty) return 'low';
  if (robQty > maxQty) return 'excess';
  return 'ok';
}

// Fetch all spare parts from inventory_items table
export function useSpareParts() {
  return useQuery({
    queryKey: ['spare-parts'],
    queryFn: async (): Promise<SparePart[]> => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (error) {
        logger.warn('Spare parts query error: ' + error.message);
        return [];
      }

      return (data || []).map((item): SparePart => {
        const robQty = item.quantity || 0;
        const minQty = item.min_quantity || 1;
        const maxQty = item.max_quantity || 10;
        const unitCost = item.unit_cost || 0;

        return {
          id: item.id,
          partNumber: item.item_code || `PART-${item.id.slice(0, 6).toUpperCase()}`,
          description: item.name || item.description || 'Unknown Part',
          category: item.category || 'General',
          location: item.location || 'Main Store',
          robQty,
          minQty,
          maxQty,
          unit: item.unit || 'PCS',
          unitCost,
          totalValue: robQty * unitCost,
          status: calculateStatus(robQty, minQty, maxQty),
          critical: item.is_critical || false,
          lastReceived: undefined,
          leadTime: 14,
          supplier: item.supplier_name || 'Unknown Supplier',
          impaCode: undefined,
        };
      });
    },
  });
}

// Fetch inventory statistics
export function useInventoryStats() {
  return useQuery({
    queryKey: ['inventory-stats'],
    queryFn: async (): Promise<InventoryStats> => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('quantity, min_quantity, max_quantity, unit_cost, is_critical');

      if (error) {
        logger.warn('Inventory stats query error: ' + error.message);
        return getEmptyStats();
      }

      const parts = data || [];
      
      let totalValue = 0;
      let criticalItems = 0;
      let lowStock = 0;

      parts.forEach(part => {
        const robQty = part.quantity || 0;
        const minQty = part.min_quantity || 1;
        const maxQty = part.max_quantity || 10;
        const unitCost = part.unit_cost || 0;

        totalValue += robQty * unitCost;
        
        if (part.is_critical) criticalItems++;
        
        const status = calculateStatus(robQty, minQty, maxQty);
        if (status === 'low' || status === 'critical') lowStock++;
      });

      return {
        totalItems: parts.length,
        totalValue: Math.round(totalValue),
        criticalItems,
        lowStock,
        pendingOrders: 0,
        ordersValue: 0,
        turnoverRate: 2.4,
        serviceLevel: parts.length > 0 
          ? Math.round((1 - lowStock / parts.length) * 100 * 10) / 10
          : 100,
      };
    },
  });
}

function getEmptyStats(): InventoryStats {
  return {
    totalItems: 0,
    totalValue: 0,
    criticalItems: 0,
    lowStock: 0,
    pendingOrders: 0,
    ordersValue: 0,
    turnoverRate: 0,
    serviceLevel: 100,
  };
}
