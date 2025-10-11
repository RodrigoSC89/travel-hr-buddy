/**
 * Configuração de dados demo do sistema
 * Centraliza todos os dados fictícios usados durante desenvolvimento e demonstração
 */

export const DEMO_TENANT = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  slug: "nautilus-demo",
  name: "Nautilus Demo Corporation",
  description: "Empresa demonstrativa do sistema Nautilus One",
  status: "active",
  plan_type: "enterprise",
  max_users: 100,
  max_vessels: 50,
  max_storage_gb: 100,
  max_api_calls_per_month: 50000,
  billing_cycle: "monthly",
  subdomain: "demo",
  metadata: {},
  features: {
    peotram: true,
    fleet_management: true,
    advanced_analytics: true,
    ai_analysis: true,
    white_label: true
  }
} as const;

export const DEMO_BRANDING = {
  id: "demo-branding",
  tenant_id: DEMO_TENANT.id,
  company_name: "Nautilus One Demo",
  logo_url: "",
  favicon_url: "",
  primary_color: "#2563eb",
  secondary_color: "#64748b",
  accent_color: "#7c3aed",
  background_color: "#ffffff",
  text_color: "#000000",
  theme_mode: "light",
  default_language: "pt-BR",
  default_currency: "BRL",
  timezone: "America/Sao_Paulo",
  date_format: "DD/MM/YYYY",
  header_style: {},
  sidebar_style: {},
  button_style: {},
  enabled_modules: {
    peotram: true,
    fleet_management: true,
    analytics: true,
    hr: true,
    ai_analysis: true
  },
  module_settings: {
    peotram: {
      templates_enabled: true,
      ai_analysis: true,
      permissions_matrix: true
    },
    fleet: {
      real_time_tracking: true
    },
    analytics: {
      advanced_reports: true
    }
  },
  custom_fields: {},
  business_rules: {
    max_reservations_per_user: 10,
    alert_frequency: "daily",
    auto_backup: true
  }
} as const;

export function getDemoUsage(tenantId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return {
    id: "demo-usage",
    tenant_id: tenantId,
    period_start: startOfMonth.toISOString(),
    period_end: new Date().toISOString(),
    active_users: 12,
    total_logins: 345,
    storage_used_gb: 2.3,
    api_calls_made: 1250,
    peotram_audits_created: 15,
    vessels_managed: 8,
    documents_processed: 42,
    reports_generated: 23,
    metadata: {}
  };
}

export function getDemoUser(userId: string, tenantId: string, userEmail?: string, userName?: string) {
  return {
    id: "demo-user",
    tenant_id: tenantId,
    user_id: userId,
    role: "admin",
    status: "active",
    display_name: userName || userEmail || "Usuário Demo",
    job_title: "Administrador",
    department: "TI",
    permissions: {},
    joined_at: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
    metadata: {}
  };
}
