/**
 * Procurement Command Center - Shared Types & Constants
 */

export interface Supplier {
  id: string;
  company_name: string;
  trading_name: string;
  category: string[];
  services: string[];
  ports_served: string[];
  countries: string[];
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  city: string;
  country: string;
  rating: number;
  total_orders: number;
  total_value: number;
  payment_terms: string;
  lead_time_days: number;
  certifications: string[];
  is_approved: boolean;
  is_active: boolean;
}

export interface RFQRequest {
  id: string;
  rfq_number: string;
  title: string;
  category: string;
  delivery_port: string;
  status: string;
  deadline: string;
  budget_estimate: number;
  currency: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  avgConsumption: number;
  daysUntilEmpty: number;
  status: 'critical' | 'low' | 'normal' | 'excess';
  autoOrderEnabled: boolean;
}

export interface PurchaseRecommendation {
  id: string;
  item: StockItem;
  suggestedQuantity: number;
  suggestedSupplier: {
    id: string;
    name: string;
    rating: number;
    leadTime: number;
  };
  estimatedCost: number;
  urgency: 'immediate' | 'soon' | 'planned';
  aiReasoning: string;
  savingsOpportunity: number;
}

export interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  description: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_cost: number;
  total_value: number;
  status: string;
  location: string;
}

export const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-muted",
  sent: "bg-primary/20 text-primary border-primary/30",
  quoted: "bg-warning/20 text-warning border-warning/30",
  awarded: "bg-success/20 text-success border-success/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  expired: "bg-muted text-muted-foreground border-muted",
};

export const categoryLabels: Record<string, string> = {
  spare_parts: "Peças Sobressalentes",
  provisions: "Provisões",
  deck_supplies: "Suprimentos de Convés",
  engine_supplies: "Suprimentos de Máquinas",
  safety_equipment: "Equipamentos de Segurança",
  navigation: "Navegação",
  lubricants: "Lubrificantes",
  chemicals: "Químicos",
  services: "Serviços",
};

export function getStatusColor(status: string) {
  switch (status) {
    case 'critical': return 'bg-destructive text-destructive-foreground';
    case 'low': return 'bg-warning text-warning-foreground';
    case 'normal': return 'bg-success text-success-foreground';
    case 'excess': return 'bg-info text-info-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function getUrgencyColor(urgency: string) {
  switch (urgency) {
    case 'immediate': return 'text-destructive bg-destructive/10 border-destructive/30';
    case 'soon': return 'text-warning bg-warning/10 border-warning/30';
    case 'planned': return 'text-info bg-info/10 border-info/30';
    default: return 'text-muted-foreground bg-muted/10';
  }
}
