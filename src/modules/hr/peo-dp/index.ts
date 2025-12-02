/**
 * PEO-DP AI Module
 * Sistema Inteligente de Auditoria DP baseado em NORMAM-101 e IMCA M 117
 * Phase 2: Real-time Monitoring and Workflow Integration
 */

import PEODPPanel from "./PEODPPanel";

export { PEOdpCore, peodpCore } from "./peodp_core";
export { PEOEngine } from "./peodp_engine";
export { PEOReport } from "./peodp_report";
export { PEORealTime } from "./peodp_realtime";
export { PEOWorkflow } from "./peodp_workflow";
export * from "./peodp_rules";
export * from "./types";
export { PEODPPanel };

export type { PEODPCoreOptions } from "./peodp_core";
export default PEODPPanel;
