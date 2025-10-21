/**
 * Centralized exports for all application types
 * 
 * This file provides a single import point for all type definitions,
 * making it easier to import and use them throughout the application.
 * 
 * @example
 * import type { AIModel, DashboardMetric, WorkflowStep } from '@/types';
 */

// AI Types
export type * from "./ai";

// Common/Shared Types
export type * from "./common";

// Control Hub Types
export type * from "./controlhub";

// Cron/Scheduling Types
export type * from "./cron";

// Dashboard Types
export type * from "./dashboard";

// External Audit Types
export type * from "./external-audit";

// Forecast Types
export type * from "./forecast";

// IMCA Audit Types
export type * from "./imca-audit";

// Incident Types
export type * from "./incident";

// MMI (Maritime Management Intelligence) Types
export type * from "./mmi";

// PEODP Audit Types
export type * from "./peodp-audit";

// Simulation Types
export type * from "./simulation";

// Training Types
export type * from "./training";

// Workflow Types
export type * from "./workflow";
