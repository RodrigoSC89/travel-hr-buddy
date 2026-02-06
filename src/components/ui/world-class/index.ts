/**
 * World-Class UI Components
 * 
 * Componentes premium para transformar o NAUTI ONE
 * no melhor sistema marítimo do mundo.
 * 
 * Benchmark: AMOS, DNV Veracity, Veson IMOS, Linear, Notion
 */

// Action Bar Premium
export { EnhancedActionBar, commonActions } from './EnhancedActionBar';
export type { } from './EnhancedActionBar';

// Empty States Inteligentes
export { SmartEmptyState, emptyStates } from './SmartEmptyState';

// Timeline Premium
export { PremiumTimeline } from './PremiumTimeline';

// Workflow Status
export { WorkflowStatusBar, workflowTemplates } from './WorkflowStatusBar';

// Re-export all as default for convenience
import { EnhancedActionBar, commonActions } from './EnhancedActionBar';
import { SmartEmptyState, emptyStates } from './SmartEmptyState';
import { PremiumTimeline } from './PremiumTimeline';
import { WorkflowStatusBar, workflowTemplates } from './WorkflowStatusBar';

export const WorldClassUI = {
  EnhancedActionBar,
  commonActions,
  SmartEmptyState,
  emptyStates,
  PremiumTimeline,
  WorkflowStatusBar,
  workflowTemplates,
};

export default WorldClassUI;
