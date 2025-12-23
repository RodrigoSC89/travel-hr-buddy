/**
 * Legacy Route Redirects
 * PATCH 850.4 - Extracted from App.tsx for cleaner routing
 */
import { Navigate, Route } from "react-router-dom";

export const LegacyRedirects = () => (
  <>
    {/* Document Routes */}
    <Route path="intelligent-documents" element={<Navigate to="/documents" replace />} />
    <Route path="document-ai" element={<Navigate to="/documents" replace />} />
    <Route path="documentos" element={<Navigate to="/documents" replace />} />
    
    {/* Assistant Routes */}
    <Route path="ai-assistant" element={<Navigate to="/assistant/voice" replace />} />
    <Route path="voice" element={<Navigate to="/assistant/voice" replace />} />
    <Route path="voice-assistant" element={<Navigate to="/assistant/voice" replace />} />
    
    {/* Automation Routes */}
    <Route path="task-automation" element={<Navigate to="/automation" replace />} />
    
    {/* Communication Routes */}
    <Route path="comunicacao" element={<Navigate to="/communication" replace />} />
    <Route path="communication-center" element={<Navigate to="/communication" replace />} />
    <Route path="channel-manager" element={<Navigate to="/communication-command" replace />} />
    
    {/* Notification Routes */}
    <Route path="notification-center" element={<Navigate to="/notifications-center" replace />} />
    <Route path="help" element={<Navigate to="/notifications-center" replace />} />
    
    {/* Checklist Routes */}
    <Route path="checklists" element={<Navigate to="/admin/checklists" replace />} />
    <Route path="checklists-inteligentes" element={<Navigate to="/admin/checklists" replace />} />
    
    {/* Finance Routes */}
    <Route path="finance-hub" element={<Navigate to="/finance" replace />} />
    <Route path="finance" element={<Navigate to="/finance-command" replace />} />
    
    {/* Reports Routes */}
    <Route path="reports-module" element={<Navigate to="/reports-command" replace />} />
    <Route path="reports" element={<Navigate to="/reports-command" replace />} />
    <Route path="incident-reports" element={<Navigate to="/reports-command" replace />} />
    
    {/* Workflow Routes */}
    <Route path="smart-workflow" element={<Navigate to="/workflow" replace />} />
    <Route path="workflow" element={<Navigate to="/workflow-command" replace />} />
    
    {/* User Routes */}
    <Route path="user-management" element={<Navigate to="/users" replace />} />
    
    {/* Project Routes */}
    <Route path="project-timeline" element={<Navigate to="/projects/timeline" replace />} />
    
    {/* Analytics Routes */}
    <Route path="analytics-core" element={<Navigate to="/analytics-command" replace />} />
    <Route path="analytics" element={<Navigate to="/analytics-command" replace />} />
    <Route path="advanced-analytics" element={<Navigate to="/analytics-command" replace />} />
    <Route path="predictive-analytics" element={<Navigate to="/analytics-command" replace />} />
    
    {/* Academy Routes */}
    <Route path="portal" element={<Navigate to="/nautilus-academy" replace />} />
    <Route path="portal-funcionario" element={<Navigate to="/nautilus-academy" replace />} />
    <Route path="training-academy" element={<Navigate to="/nautilus-academy" replace />} />
    
    {/* Optimization Routes */}
    <Route path="mobile-optimization" element={<Navigate to="/optimization" replace />} />
    
    {/* Alert Routes */}
    <Route path="alertas-precos" element={<Navigate to="/alerts-command" replace />} />
    <Route path="price-alerts" element={<Navigate to="/alerts-command" replace />} />
    <Route path="intelligent-alerts" element={<Navigate to="/alerts-command" replace />} />
    
    {/* Audit Routes */}
    <Route path="audit-center" element={<Navigate to="/compliance-hub" replace />} />
    
    {/* Crew Routes */}
    <Route path="crew-management" element={<Navigate to="/crew" replace />} />
    <Route path="crew" element={<Navigate to="/maritime-command" replace />} />
    <Route path="crew-members" element={<Navigate to="/maritime-command" replace />} />
    <Route path="crew-schedule" element={<Navigate to="/maritime-command" replace />} />
    
    {/* Fleet Routes */}
    <Route path="vessels" element={<Navigate to="/fleet" replace />} />
    <Route path="fleet" element={<Navigate to="/fleet-command" replace />} />
    <Route path="fleet-dashboard" element={<Navigate to="/fleet-command" replace />} />
    <Route path="fleet-tracking" element={<Navigate to="/fleet-command" replace />} />
    <Route path="fleet-operations" element={<Navigate to="/fleet-command" replace />} />
    <Route path="fleet-management" element={<Navigate to="/fleet-command" replace />} />
    <Route path="fleet-status" element={<Navigate to="/fleet-command" replace />} />
    
    {/* Schedule Routes */}
    <Route path="schedule" element={<Navigate to="/calendar" replace />} />
    <Route path="schedules" element={<Navigate to="/calendar" replace />} />
    
    {/* Mission Routes */}
    <Route path="missions/new" element={<Navigate to="/mission-logs" replace />} />
    <Route path="missions" element={<Navigate to="/mission-logs" replace />} />
    <Route path="mission-control" element={<Navigate to="/mission-command" replace />} />
    
    {/* Maintenance Routes */}
    <Route path="maintenance/planner" element={<Navigate to="/maintenance-planner" replace />} />
    <Route path="maintenance-planner" element={<Navigate to="/maintenance-command" replace />} />
    <Route path="intelligent-maintenance" element={<Navigate to="/maintenance-command" replace />} />
    <Route path="mmi" element={<Navigate to="/maintenance-command" replace />} />
    <Route path="mmi-tasks" element={<Navigate to="/maintenance-command" replace />} />
    <Route path="mmi-forecast" element={<Navigate to="/maintenance-command" replace />} />
    <Route path="mmi-history" element={<Navigate to="/maintenance-command" replace />} />
    <Route path="mmi-jobs-panel" element={<Navigate to="/maintenance-command" replace />} />
    <Route path="mmi-dashboard" element={<Navigate to="/maintenance-command" replace />} />
    
    {/* Executive Routes */}
    <Route path="executive-dashboard" element={<Navigate to="/command-center" replace />} />
    
    {/* Maritime Routes */}
    <Route path="maritime" element={<Navigate to="/maritime-command" replace />} />
    <Route path="maritime-checklists" element={<Navigate to="/maritime-command" replace />} />
    <Route path="maritime-certifications" element={<Navigate to="/maritime-command" replace />} />
    
    {/* Operations Routes */}
    <Route path="operations-dashboard" element={<Navigate to="/operations-command" replace />} />
    <Route path="operations" element={<Navigate to="/operations-command" replace />} />
    
    {/* AI Routes */}
    <Route path="ai-insights" element={<Navigate to="/ai-command" replace />} />
    
    {/* Travel & Voyage Routes */}
    <Route path="smart-mobility" element={<Navigate to="/travel-command" replace />} />
    <Route path="voyage-planner" element={<Navigate to="/voyage-command" replace />} />
    
    {/* Weather Routes */}
    <Route path="weather-dashboard" element={<Navigate to="/weather-command" replace />} />
    
    {/* Logistics Routes */}
    <Route path="logistics" element={<Navigate to="/logistics-command" replace />} />
    
    {/* Procurement Routes */}
    <Route path="procurement-inventory" element={<Navigate to="/procurement-command" replace />} />
    <Route path="procurement" element={<Navigate to="/procurement-command" replace />} />
    <Route path="inventory" element={<Navigate to="/procurement-command" replace />} />
    
    {/* Monitoring Routes */}
    <Route path="monitoring" element={<Navigate to="/nautilus-command" replace />} />
  </>
);
