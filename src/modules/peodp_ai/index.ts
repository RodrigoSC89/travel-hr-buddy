/**
 * PEO-DP AI Module - Phase 2
 * Intelligent Dynamic Positioning Compliance System with Real-time Monitoring
 * 
 * This module provides:
 * - Real-time compliance monitoring for DP systems
 * - Automatic evaluation against NORMAM-101 and IMCA M117 standards
 * - Smart workflow integration for corrective actions
 * - Comprehensive audit and reporting capabilities
 */

export { PEOdpCore } from "./peodp_core";
export { PEODPEngine } from "./peodp_engine";
export { PEODPRules } from "./peodp_rules";
export { PEORealTime } from "./peodp_realtime";
export { PEOWorkflow } from "./peodp_workflow";
export { PEODPReport } from "./peodp_report";

export type {
  ComplianceRule,
  ComplianceProfile,
  ComplianceLevel,
  ComplianceSeverity,
  ComplianceStatus,
  DPEvent,
  EventType,
  AuditResult,
  RuleViolation,
  WorkflowAction,
  VesselConfiguration,
  MonitoringSession,
  ReportData,
  DPClass
} from "./types";
