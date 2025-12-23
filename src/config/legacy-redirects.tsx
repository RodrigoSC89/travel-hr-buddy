/**
 * Legacy Route Redirects
 * PATCH 850.4 - Extracted from App.tsx for cleaner routing
 */
import { Navigate, Route } from "react-router-dom";
import type { FC } from "react";

// Redirect configuration for cleaner maintenance
const redirects: Array<[string, string]> = [
  // Document Routes
  ["intelligent-documents", "/documents"],
  ["document-ai", "/documents"],
  ["documentos", "/documents"],
  
  // Assistant Routes
  ["ai-assistant", "/assistant/voice"],
  ["voice", "/assistant/voice"],
  ["voice-assistant", "/assistant/voice"],
  
  // Automation Routes
  ["task-automation", "/automation"],
  
  // Communication Routes
  ["comunicacao", "/communication"],
  ["communication-center", "/communication"],
  ["channel-manager", "/communication-command"],
  
  // Notification Routes
  ["notification-center", "/notifications-center"],
  ["help", "/notifications-center"],
  
  // Checklist Routes
  ["checklists", "/admin/checklists"],
  ["checklists-inteligentes", "/admin/checklists"],
  
  // Finance Routes
  ["finance-hub", "/finance"],
  ["finance", "/finance-command"],
  
  // Reports Routes
  ["reports-module", "/reports-command"],
  ["reports", "/reports-command"],
  ["incident-reports", "/reports-command"],
  
  // Workflow Routes
  ["smart-workflow", "/workflow"],
  ["workflow", "/workflow-command"],
  
  // User Routes
  ["user-management", "/users"],
  
  // Project Routes
  ["project-timeline", "/projects/timeline"],
  
  // Analytics Routes
  ["analytics-core", "/analytics-command"],
  ["analytics", "/analytics-command"],
  ["advanced-analytics", "/analytics-command"],
  ["predictive-analytics", "/analytics-command"],
  
  // Academy Routes
  ["portal", "/nautilus-academy"],
  ["portal-funcionario", "/nautilus-academy"],
  ["training-academy", "/nautilus-academy"],
  
  // Optimization Routes
  ["mobile-optimization", "/optimization"],
  
  // Alert Routes
  ["alertas-precos", "/alerts-command"],
  ["price-alerts", "/alerts-command"],
  ["intelligent-alerts", "/alerts-command"],
  
  // Audit Routes
  ["audit-center", "/compliance-hub"],
  
  // Crew Routes
  ["crew-management", "/crew"],
  ["crew", "/maritime-command"],
  ["crew-members", "/maritime-command"],
  ["crew-schedule", "/maritime-command"],
  
  // Fleet Routes
  ["vessels", "/fleet"],
  ["fleet", "/fleet-command"],
  ["fleet-dashboard", "/fleet-command"],
  ["fleet-tracking", "/fleet-command"],
  ["fleet-operations", "/fleet-command"],
  ["fleet-management", "/fleet-command"],
  ["fleet-status", "/fleet-command"],
  
  // Schedule Routes
  ["schedule", "/calendar"],
  ["schedules", "/calendar"],
  
  // Mission Routes
  ["missions/new", "/mission-logs"],
  ["missions", "/mission-logs"],
  ["mission-control", "/mission-command"],
  
  // Maintenance Routes
  ["maintenance/planner", "/maintenance-planner"],
  ["maintenance-planner", "/maintenance-command"],
  ["intelligent-maintenance", "/maintenance-command"],
  ["mmi", "/maintenance-command"],
  ["mmi-tasks", "/maintenance-command"],
  ["mmi-forecast", "/maintenance-command"],
  ["mmi-history", "/maintenance-command"],
  ["mmi-jobs-panel", "/maintenance-command"],
  ["mmi-dashboard", "/maintenance-command"],
  
  // Executive Routes
  ["executive-dashboard", "/command-center"],
  
  // Maritime Routes
  ["maritime", "/maritime-command"],
  ["maritime-checklists", "/maritime-command"],
  ["maritime-certifications", "/maritime-command"],
  
  // Operations Routes
  ["operations-dashboard", "/operations-command"],
  ["operations", "/operations-command"],
  
  // AI Routes
  ["ai-insights", "/ai-command"],
  
  // Travel & Voyage Routes
  ["smart-mobility", "/travel-command"],
  ["voyage-planner", "/voyage-command"],
  
  // Weather Routes
  ["weather-dashboard", "/weather-command"],
  
  // Logistics Routes
  ["logistics", "/logistics-command"],
  
  // Procurement Routes
  ["procurement-inventory", "/procurement-command"],
  ["procurement", "/procurement-command"],
  ["inventory", "/procurement-command"],
  
  // Monitoring Routes
  ["monitoring", "/nautilus-command"],
];

// Generate Route elements from configuration
export const legacyRedirectRoutes = redirects.map(([from, to]) => (
  <Route key={from} path={from} element={<Navigate to={to} replace />} />
));
