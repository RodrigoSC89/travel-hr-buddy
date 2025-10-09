export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  target?: number;
  unit?: string;
  onClick?: () => void;
}

export interface AlertItem {
  id: string;
  type: "warning" | "error" | "info" | "success";
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  module: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: "audit" | "checklist" | "travel" | "document";
  title: string;
  description: string;
  userName: string;
  userAvatar?: string;
  module: string;
  createdAt: string;
  metadata?: any;
}

export interface DashboardConfig {
  layout: "grid" | "compact" | "executive";
  activeWidgets: string[];
  refreshInterval: number;
  userRole: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}
