/**
 * 📦 INVENTORY & SPARES - Types & Logic
 * Smart inventory with AI demand forecasting
 */

// ============================================================================
// TYPES
// ============================================================================

export interface InventoryItem {
  id: string;
  partNumber: string;
  description: string;
  category: ItemCategory;
  subcategory: string;
  manufacturer: string;
  vesselId: string;
  location: StorageLocation;
  quantity: number;
  unit: string;
  minimumStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  currency: string;
  leadTimeDays: number;
  criticality: 'critical' | 'essential' | 'standard' | 'consumable';
  suppliers: SupplierInfo[];
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'ordered' | 'expired';
  lastUsed?: Date;
  expiryDate?: Date;
}

export type ItemCategory =
  | 'machinery' | 'electrical' | 'deck' | 'navigation' | 'safety'
  | 'consumables' | 'chemicals' | 'lubricants' | 'medical' | 'provisions';

export interface StorageLocation {
  store: string;
  shelf: string;
  bin: string;
  vesselArea: string;
  barcode?: string;
}

export interface SupplierInfo {
  supplierId: string;
  supplierName: string;
  partNumberSupplier: string;
  unitPrice: number;
  currency: string;
  leadTimeDays: number;
  minimumOrder: number;
  isPreferred: boolean;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'return' | 'disposal';
  quantity: number;
  reference: string;
  workOrderId?: string;
  purchaseOrderId?: string;
  reason?: string;
  performedBy: string;
  performedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vesselId: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  status: 'draft' | 'submitted' | 'approved' | 'ordered' | 'shipped' | 'received' | 'cancelled';
  deliveryPort: string;
  deliveryDate: Date;
  totalAmount: number;
  currency: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface PurchaseOrderItem {
  itemId: string;
  partNumber: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
  status: 'pending' | 'partial' | 'received' | 'cancelled';
}

export interface StockReport {
  vesselId: string;
  generatedAt: Date;
  summary: {
    totalItems: number;
    totalValue: number;
    criticalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    expiringItems: number;
  };
  categories: CategorySummary[];
  lowStockItems: InventoryItem[];
  reorderRecommendations: ReorderRecommendation[];
}

export interface CategorySummary {
  category: ItemCategory;
  itemCount: number;
  totalValue: number;
  lowStockCount: number;
}

export interface ReorderRecommendation {
  item: InventoryItem;
  recommendedQuantity: number;
  reason: string;
  urgency: 'immediate' | 'soon' | 'planned';
  estimatedCost: number;
  suggestedSupplier: SupplierInfo;
}

export interface DemandForecast {
  itemId: string;
  partNumber: string;
  currentStock: number;
  projectedUsage: number[];
  stockoutDate?: Date;
  recommendedOrderDate?: Date;
  confidence: number;
  factors: ForecastFactor[];
}

export interface ForecastFactor {
  type: 'historical' | 'maintenance' | 'seasonal' | 'voyage';
  impact: number;
  description: string;
}

// ============================================================================
// INVENTORY ENGINE
// ============================================================================

export class InventorySparesEngine {
  private static instance: InventorySparesEngine;

  static getInstance(): InventorySparesEngine {
    if (!InventorySparesEngine.instance) {
      InventorySparesEngine.instance = new InventorySparesEngine();
    }
    return InventorySparesEngine.instance;
  }

  /**
   * Add new inventory item
   */
  addItem(item: Omit<InventoryItem, 'id' | 'status'>): InventoryItem {
    const status = this.determineStatus(item.quantity, item.minimumStock, item.reorderPoint);
    return {
      ...item,
      id: crypto.randomUUID(),
      status,
      location: { ...item.location, barcode: `NAUTI-${Date.now().toString(36).toUpperCase()}` },
    };
  }

  /**
   * Record inventory transaction
   */
  recordTransaction(item: InventoryItem, params: Omit<InventoryTransaction, 'id' | 'performedAt'>): { item: InventoryItem; transaction: InventoryTransaction } {
    let newQuantity = item.quantity;
    switch (params.type) {
      case 'receipt':
      case 'return':
        newQuantity += params.quantity;
        break;
      case 'issue':
      case 'disposal':
        newQuantity = Math.max(0, newQuantity - params.quantity);
        break;
      case 'adjustment':
        newQuantity = params.quantity;
        break;
    }

    const updatedItem: InventoryItem = {
      ...item,
      quantity: newQuantity,
      status: this.determineStatus(newQuantity, item.minimumStock, item.reorderPoint),
      lastUsed: params.type === 'issue' ? new Date() : item.lastUsed,
    };

    const transaction: InventoryTransaction = {
      ...params,
      id: crypto.randomUUID(),
      performedAt: new Date(),
    };

    return { item: updatedItem, transaction };
  }

  /**
   * Create purchase order
   */
  createPurchaseOrder(params: {
    vesselId: string;
    items: { item: InventoryItem; quantity: number }[];
    deliveryPort: string;
    deliveryDate: Date;
    createdBy: string;
    notes?: string;
  }): PurchaseOrder {
    const poItems: PurchaseOrderItem[] = [];
    let totalAmount = 0;
    let currency = 'USD';
    let supplierId = '';
    let supplierName = '';

    for (const { item, quantity } of params.items) {
      const supplier = item.suppliers.find(s => s.isPreferred) || item.suppliers[0];
      if (supplier) {
        supplierId = supplier.supplierId;
        supplierName = supplier.supplierName;
        currency = supplier.currency;
      }

      const unitPrice = supplier?.unitPrice || item.unitCost;
      const itemTotal = unitPrice * quantity;

      poItems.push({
        itemId: item.id,
        partNumber: item.partNumber,
        description: item.description,
        quantity,
        unit: item.unit,
        unitPrice,
        totalPrice: itemTotal,
        status: 'pending',
      });

      totalAmount += itemTotal;
    }

    return {
      id: crypto.randomUUID(),
      poNumber: `PO-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Date.now().toString(36).toUpperCase()}`,
      vesselId: params.vesselId,
      supplierId,
      supplierName,
      items: poItems,
      status: 'draft',
      deliveryPort: params.deliveryPort,
      deliveryDate: params.deliveryDate,
      totalAmount,
      currency,
      notes: params.notes,
      createdBy: params.createdBy,
      createdAt: new Date(),
    };
  }

  /**
   * Generate stock report
   */
  generateStockReport(vesselId: string, items: InventoryItem[]): StockReport {
    const vesselItems = items.filter(i => i.vesselId === vesselId);
    const totalValue = vesselItems.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
    const criticalItems = vesselItems.filter(i => i.criticality === 'critical' && i.status !== 'in_stock');
    const lowStockItems = vesselItems.filter(i => i.status === 'low_stock');
    const outOfStockItems = vesselItems.filter(i => i.status === 'out_of_stock');
    const expiringItems = vesselItems.filter(i => i.expiryDate && i.expiryDate < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));

    return {
      vesselId,
      generatedAt: new Date(),
      summary: {
        totalItems: vesselItems.length,
        totalValue,
        criticalItems: criticalItems.length,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length,
        expiringItems: expiringItems.length,
      },
      categories: this.calculateCategorySummaries(vesselItems),
      lowStockItems,
      reorderRecommendations: this.generateReorderRecommendations(vesselItems),
    };
  }

  /**
   * AI-powered demand forecasting
   */
  forecastDemand(items: InventoryItem[], historicalUsage: Map<string, number[]>, forecastDays: number): DemandForecast[] {
    return items.map(item => {
      const usage = historicalUsage.get(item.id) || [];
      const avgDaily = usage.length > 0 ? usage.reduce((a, b) => a + b, 0) / usage.length : 0;

      const projectedUsage: number[] = [];
      let remaining = item.quantity;
      let stockoutDate: Date | undefined;

      for (let day = 0; day < forecastDays; day++) {
        projectedUsage.push(avgDaily);
        remaining -= avgDaily;
        if (remaining <= 0 && !stockoutDate) {
          stockoutDate = new Date(Date.now() + day * 24 * 60 * 60 * 1000);
        }
      }

      let recommendedOrderDate: Date | undefined;
      if (stockoutDate) {
        recommendedOrderDate = new Date(stockoutDate.getTime() - item.leadTimeDays * 24 * 60 * 60 * 1000);
        if (recommendedOrderDate < new Date()) recommendedOrderDate = new Date();
      }

      return {
        itemId: item.id,
        partNumber: item.partNumber,
        currentStock: item.quantity,
        projectedUsage,
        stockoutDate,
        recommendedOrderDate,
        confidence: usage.length >= 30 ? 0.85 : usage.length >= 7 ? 0.65 : 0.4,
        factors: usage.length > 0 ? [{ type: 'historical' as const, impact: 0.7, description: `Based on ${usage.length} days of data` }] : [],
      };
    });
  }

  /**
   * Get auto-reorder suggestions
   */
  getAutoReorderSuggestions(items: InventoryItem[]): { urgent: InventoryItem[]; planned: InventoryItem[]; economicBatching: { supplier: string; items: InventoryItem[]; totalValue: number }[] } {
    const recommendations = this.generateReorderRecommendations(items);
    const urgent = recommendations.filter(r => r.urgency === 'immediate').map(r => r.item);
    const planned = recommendations.filter(r => r.urgency === 'planned').map(r => r.item);

    const bySupplier = new Map<string, InventoryItem[]>();
    for (const item of [...urgent, ...planned]) {
      const supplier = item.suppliers.find(s => s.isPreferred) || item.suppliers[0];
      if (supplier) {
        const existing = bySupplier.get(supplier.supplierName) || [];
        existing.push(item);
        bySupplier.set(supplier.supplierName, existing);
      }
    }

    const economicBatching = Array.from(bySupplier.entries()).map(([supplier, items]) => ({
      supplier,
      items,
      totalValue: items.reduce((sum, i) => {
        const s = i.suppliers.find(s => s.supplierName === supplier) || i.suppliers[0];
        return sum + (s?.unitPrice || i.unitCost) * i.reorderQuantity;
      }, 0),
    }));

    return { urgent, planned, economicBatching };
  }

  private determineStatus(quantity: number, minimumStock: number, reorderPoint: number): InventoryItem['status'] {
    if (quantity <= 0) return 'out_of_stock';
    if (quantity <= reorderPoint) return 'low_stock';
    return 'in_stock';
  }

  private calculateCategorySummaries(items: InventoryItem[]): CategorySummary[] {
    const categories = new Map<ItemCategory, CategorySummary>();
    for (const item of items) {
      const existing = categories.get(item.category) || { category: item.category, itemCount: 0, totalValue: 0, lowStockCount: 0 };
      existing.itemCount++;
      existing.totalValue += item.quantity * item.unitCost;
      if (item.status === 'low_stock') existing.lowStockCount++;
      categories.set(item.category, existing);
    }
    return Array.from(categories.values());
  }

  private generateReorderRecommendations(items: InventoryItem[]): ReorderRecommendation[] {
    return items
      .filter(i => i.status === 'low_stock' || i.status === 'out_of_stock')
      .map(item => {
        const supplier = item.suppliers.find(s => s.isPreferred) || item.suppliers[0] || {
          supplierId: '', supplierName: 'Unknown', partNumberSupplier: item.partNumber,
          unitPrice: item.unitCost, currency: item.currency, leadTimeDays: item.leadTimeDays,
          minimumOrder: 1, isPreferred: false
        };

        return {
          item,
          recommendedQuantity: item.reorderQuantity,
          reason: item.status === 'out_of_stock' ? 'Out of stock' : 'Below reorder point',
          urgency: item.criticality === 'critical' ? 'immediate' as const : item.status === 'out_of_stock' ? 'soon' as const : 'planned' as const,
          estimatedCost: item.reorderQuantity * supplier.unitPrice,
          suggestedSupplier: supplier,
        };
      })
      .sort((a, b) => {
        const order = { immediate: 0, soon: 1, planned: 2 };
        return order[a.urgency] - order[b.urgency];
      });
  }
}

export const inventorySpares = InventorySparesEngine.getInstance();
