/**
 * Security & Monitoring Routes
 * All security, NOC, and monitoring pages
 */
import { Route } from "react-router-dom";
import {
  SecurityCenter,
  SecurityAudit,
  SecurityScanner,
  NOCMode,
  NOCMonitoring,
  TelemetriaCommand,
  PredictiveTelemetry,
  ObservabilityCenter,
  AuditoriaTecnica,
} from "./lazy-imports";

export const securityRoutes = (
  <>
    <Route path="security-center" element={<SecurityCenter />} />
    <Route path="auditoria-seguranca" element={<SecurityAudit />} />
    <Route path="security-scanner" element={<SecurityScanner />} />
    <Route path="noc-mode" element={<NOCMode />} />
    <Route path="noc" element={<NOCMode />} />
    <Route path="noc-monitoring" element={<NOCMonitoring />} />
    <Route path="telemetria" element={<TelemetriaCommand />} />
    <Route path="predictive-telemetry" element={<PredictiveTelemetry />} />
    <Route path="observability" element={<ObservabilityCenter />} />
    <Route path="auditoria-tecnica" element={<AuditoriaTecnica />} />
  </>
);
