/**
 * Workflow and Automation Type Definitions
 * 
 * Types for workflow management, automation, and onboarding processes
 */

/**
 * Workflow action types
 */
export type WorkflowActionType = "email" | "webhook" | "notification" | "api_call" | "script";

/**
 * Workflow action configuration
 */
export interface WorkflowAction {
  type: WorkflowActionType;
  config: Record<string, unknown>;
  enabled: boolean;
  order?: number;
}

/**
 * Workflow condition operators
 */
export type WorkflowConditionOperator = "==" | "!=" | ">" | "<" | ">=" | "<=" | "contains" | "in";

/**
 * Workflow condition
 */
export interface WorkflowCondition {
  field: string;
  operator: WorkflowConditionOperator;
  value: string | number | boolean;
}

/**
 * Workflow step
 */
export interface WorkflowStep {
  id: string;
  name: string;
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  metadata: Record<string, unknown>;
  nextStep?: string;
}

/**
 * Workflow definition
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  status: "active" | "inactive" | "draft";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Onboarding data structure
 */
export interface OnboardingData {
  userId: string;
  companyProfile: CompanyProfile;
  preferences: UserPreferences;
  progress: OnboardingProgress;
  metadata?: Record<string, unknown>;
}

/**
 * Company profile
 */
export interface CompanyProfile {
  name: string;
  size: "small" | "medium" | "large" | "enterprise";
  industry: string;
  location?: string;
  website?: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: boolean;
  language: string;
  timezone?: string;
}

/**
 * Onboarding progress
 */
export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  skippedSteps?: string[];
}

/**
 * Automation rule
 */
export interface AutomationRule {
  id: string;
  name: string;
  trigger: WorkflowCondition[];
  actions: WorkflowAction[];
  enabled: boolean;
  priority?: number;
}

/**
 * Automation execution log
 */
export interface AutomationLog {
  id: string;
  ruleId: string;
  executedAt: string;
  status: "success" | "failed" | "partial";
  duration: number;
  error?: string;
  metadata?: Record<string, unknown>;
}
