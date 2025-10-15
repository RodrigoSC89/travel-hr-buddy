/**
 * MMI (Manutenção e Manutenibilidade Industrial) Type Definitions
 * 
 * Types for the MMI Business Intelligence Dashboard and v1.1.0 AI features
 */

/**
 * Failure by system data point
 */
export interface FailureBySystem {
  system: string;
  count: number;
}

/**
 * Jobs by vessel data point
 */
export interface JobsByVessel {
  vessel: string;
  jobs: number;
}

/**
 * Postponement status data point
 */
export interface Postponement {
  status: string;
  count: number;
}

/**
 * Complete MMI BI Summary response
 */
export interface MMIBISummary {
  failuresBySystem: FailureBySystem[];
  jobsByVessel: JobsByVessel[];
  postponements: Postponement[];
}

/**
 * MMI v1.1.0 - AI Recommendation with Historical Learning
 */
export interface AIRecommendation {
  technical_action: string;
  component: string;
  deadline: string;
  requires_work_order: boolean;
  reasoning: string;
  similar_cases: SimilarCase[];
}

/**
 * Similar historical case for AI learning
 */
export interface SimilarCase {
  job_id: string;
  similarity: number;
  action: string;
  outcome: string;
  date?: string;
}

/**
 * Enhanced Job with vector embeddings support
 */
export interface MMIJob {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  component_name: string;
  component: {
    name: string;
    asset: {
      name: string;
      vessel: string;
    };
  };
  suggestion_ia?: string;
  can_postpone?: boolean;
  ai_recommendation?: AIRecommendation;
  created_at?: string;
  updated_at?: string;
  embedding?: number[];
}

/**
 * Job history entry for learning
 */
export interface JobHistory {
  id: number;
  job_id: string;
  action: string;
  ai_recommendation?: string;
  outcome: string;
  created_at: string;
  embedding?: number[];
}
