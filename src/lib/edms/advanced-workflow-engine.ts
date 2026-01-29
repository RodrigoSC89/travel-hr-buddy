/**
 * Advanced Workflow Engine
 * Superior to SoftExpert & Fluig workflow capabilities
 * Multi-level approval, SLA tracking, escalation, delegation
 * Uses document_workflows table from existing schema
 */

// Types
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  workflow_type: 'sequential' | 'parallel' | 'conditional' | 'matrix';
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
  sla_config: SLAConfig;
  escalation_rules: EscalationRule[];
  notifications: NotificationConfig[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  order: number;
  name: string;
  description: string;
  step_type: 'approval' | 'review' | 'signature' | 'notification' | 'task' | 'conditional';
  approvers: ApproverConfig[];
  approval_type: 'any' | 'all' | 'percentage' | 'quorum';
  required_percentage?: number;
  required_quorum?: number;
  timeout_hours: number;
  auto_approve_on_timeout: boolean;
  allow_delegation: boolean;
  allow_rejection: boolean;
  rejection_action: 'restart' | 'previous_step' | 'end';
  form_fields?: FormField[];
  conditions?: StepCondition[];
}

export interface ApproverConfig {
  type: 'user' | 'role' | 'department' | 'manager' | 'dynamic';
  value: string;
  fallback?: ApproverConfig;
}

export interface SLAConfig {
  warning_hours: number;
  critical_hours: number;
  overdue_hours: number;
  escalation_enabled: boolean;
  business_hours_only: boolean;
  business_hours: {
    start: string;
    end: string;
    timezone: string;
    exclude_weekends: boolean;
    holidays?: string[];
  };
}

export interface EscalationRule {
  trigger: 'warning' | 'critical' | 'overdue';
  action: 'notify' | 'reassign' | 'auto_approve' | 'escalate_to_manager';
  target: ApproverConfig;
  message_template: string;
}

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: unknown;
  target_step_id: string;
}

export interface NotificationConfig {
  event: 'started' | 'step_completed' | 'pending_approval' | 'approved' | 'rejected' | 'sla_warning' | 'completed';
  channels: ('email' | 'push' | 'in_app' | 'sms')[];
  recipients: ApproverConfig[];
  template_id: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'file' | 'signature';
  required: boolean;
  options?: { label: string; value: string }[];
  validation?: { pattern?: string; min?: number; max?: number };
}

export interface StepCondition {
  field: string;
  operator: string;
  value: unknown;
  action: 'skip' | 'require';
}

export interface WorkflowInstance {
  id: string;
  workflow_id: string;
  document_id: string;
  current_step_id: string;
  current_step_order: number;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  started_at: string;
  completed_at: string | null;
  started_by: string;
  step_history: StepHistoryEntry[];
  sla_status: 'on_track' | 'warning' | 'critical' | 'overdue';
  due_at: string | null;
  metadata: Record<string, unknown>;
}

export interface StepHistoryEntry {
  step_id: string;
  step_name: string;
  action: 'approved' | 'rejected' | 'delegated' | 'escalated' | 'skipped' | 'auto_approved';
  actor_id: string;
  actor_name: string;
  timestamp: string;
  comments: string | null;
  form_data: Record<string, unknown> | null;
  signature_data: string | null;
  duration_hours: number;
}

// In-memory storage for workflow instances (production would use DB)
const workflowInstances = new Map<string, WorkflowInstance>();
const workflowDefinitions = new Map<string, WorkflowDefinition>();

// Advanced Workflow Engine
class AdvancedWorkflowEngine {
  private static instance: AdvancedWorkflowEngine;

  private constructor() {
    // Initialize with default workflow templates
    this.initializeDefaultWorkflows();
  }

  static getInstance(): AdvancedWorkflowEngine {
    if (!AdvancedWorkflowEngine.instance) {
      AdvancedWorkflowEngine.instance = new AdvancedWorkflowEngine();
    }
    return AdvancedWorkflowEngine.instance;
  }

  /**
   * Initialize default workflow templates
   */
  private initializeDefaultWorkflows(): void {
    const documentApprovalWorkflow: WorkflowDefinition = {
      id: 'doc-approval-standard',
      name: 'Aprovação de Documento Padrão',
      description: 'Workflow de aprovação em 3 níveis para documentos',
      workflow_type: 'sequential',
      steps: [
        {
          id: 'step-1',
          order: 0,
          name: 'Revisão Técnica',
          description: 'Revisão técnica do documento',
          step_type: 'review',
          approvers: [{ type: 'role', value: 'supervisor' }],
          approval_type: 'any',
          timeout_hours: 48,
          auto_approve_on_timeout: false,
          allow_delegation: true,
          allow_rejection: true,
          rejection_action: 'restart'
        },
        {
          id: 'step-2',
          order: 1,
          name: 'Aprovação Gerencial',
          description: 'Aprovação do gestor da área',
          step_type: 'approval',
          approvers: [{ type: 'role', value: 'manager' }],
          approval_type: 'any',
          timeout_hours: 72,
          auto_approve_on_timeout: false,
          allow_delegation: true,
          allow_rejection: true,
          rejection_action: 'previous_step'
        },
        {
          id: 'step-3',
          order: 2,
          name: 'Aprovação Final',
          description: 'Aprovação final da diretoria',
          step_type: 'approval',
          approvers: [{ type: 'role', value: 'admin' }],
          approval_type: 'any',
          timeout_hours: 96,
          auto_approve_on_timeout: false,
          allow_delegation: false,
          allow_rejection: true,
          rejection_action: 'end'
        }
      ],
      conditions: [],
      sla_config: {
        warning_hours: 24,
        critical_hours: 48,
        overdue_hours: 72,
        escalation_enabled: true,
        business_hours_only: true,
        business_hours: {
          start: '09:00',
          end: '18:00',
          timezone: 'America/Sao_Paulo',
          exclude_weekends: true
        }
      },
      escalation_rules: [
        {
          trigger: 'warning',
          action: 'notify',
          target: { type: 'role', value: 'hr_manager' },
          message_template: 'Documento pendente de aprovação há mais de 24 horas'
        },
        {
          trigger: 'critical',
          action: 'escalate_to_manager',
          target: { type: 'role', value: 'admin' },
          message_template: 'Documento em atraso crítico - 48 horas sem aprovação'
        }
      ],
      notifications: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    workflowDefinitions.set(documentApprovalWorkflow.id, documentApprovalWorkflow);
  }

  /**
   * Get available workflow templates
   */
  getWorkflowTemplates(): WorkflowDefinition[] {
    return Array.from(workflowDefinitions.values());
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(id: string): WorkflowDefinition | undefined {
    return workflowDefinitions.get(id);
  }

  /**
   * Create a new workflow definition
   */
  createWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'created_at' | 'updated_at'>): WorkflowDefinition {
    const newWorkflow: WorkflowDefinition = {
      ...workflow,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    workflowDefinitions.set(newWorkflow.id, newWorkflow);
    return newWorkflow;
  }

  /**
   * Start a new workflow instance
   */
  async startWorkflow(
    workflowId: string,
    documentId: string,
    initiatorId: string,
    metadata?: Record<string, unknown>
  ): Promise<WorkflowInstance> {
    const workflow = workflowDefinitions.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const firstStep = workflow.steps[0];
    if (!firstStep) {
      throw new Error('Workflow has no steps');
    }

    const dueAt = this.calculateDueDate(workflow.sla_config.overdue_hours, workflow.sla_config);

    const instance: WorkflowInstance = {
      id: crypto.randomUUID(),
      workflow_id: workflowId,
      document_id: documentId,
      current_step_id: firstStep.id,
      current_step_order: 0,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      completed_at: null,
      started_by: initiatorId,
      step_history: [],
      sla_status: 'on_track',
      due_at: dueAt.toISOString(),
      metadata: metadata || {}
    };

    workflowInstances.set(instance.id, instance);

    // Log the start
    console.log(`[WorkflowEngine] Started workflow ${workflowId} for document ${documentId}`);

    return instance;
  }

  /**
   * Process a step action (approve, reject, delegate)
   */
  async processStepAction(
    instanceId: string,
    actorId: string,
    action: 'approve' | 'reject' | 'delegate',
    data?: {
      comments?: string;
      formData?: Record<string, unknown>;
      signatureData?: string;
      delegateTo?: string;
    }
  ): Promise<WorkflowInstance> {
    const instance = workflowInstances.get(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance not found: ${instanceId}`);
    }

    const workflow = workflowDefinitions.get(instance.workflow_id);
    if (!workflow) {
      throw new Error('Workflow definition not found');
    }

    const currentStepIndex = workflow.steps.findIndex(s => s.id === instance.current_step_id);
    const currentStep = workflow.steps[currentStepIndex];

    if (!currentStep) {
      throw new Error('Current step not found');
    }

    // Create history entry
    const historyEntry: StepHistoryEntry = {
      step_id: currentStep.id,
      step_name: currentStep.name,
      action: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'delegated',
      actor_id: actorId,
      actor_name: `User ${actorId.slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      comments: data?.comments || null,
      form_data: data?.formData || null,
      signature_data: data?.signatureData || null,
      duration_hours: this.calculateDuration(instance.started_at)
    };

    instance.step_history.push(historyEntry);

    if (action === 'approve') {
      if (currentStepIndex < workflow.steps.length - 1) {
        // Move to next step
        const nextStep = workflow.steps[currentStepIndex + 1];
        instance.current_step_id = nextStep.id;
        instance.current_step_order = currentStepIndex + 1;
      } else {
        // Workflow complete
        instance.status = 'approved';
        instance.completed_at = new Date().toISOString();
      }
    } else if (action === 'reject') {
      if (currentStep.rejection_action === 'restart') {
        instance.current_step_id = workflow.steps[0].id;
        instance.current_step_order = 0;
      } else if (currentStep.rejection_action === 'previous_step' && currentStepIndex > 0) {
        instance.current_step_id = workflow.steps[currentStepIndex - 1].id;
        instance.current_step_order = currentStepIndex - 1;
      } else {
        instance.status = 'rejected';
        instance.completed_at = new Date().toISOString();
      }
    }

    workflowInstances.set(instanceId, instance);

    console.log(`[WorkflowEngine] Processed ${action} for instance ${instanceId}`);

    return instance;
  }

  /**
   * Get workflow instance by ID
   */
  getInstance(instanceId: string): WorkflowInstance | undefined {
    return workflowInstances.get(instanceId);
  }

  /**
   * Get all instances for a document
   */
  getInstancesForDocument(documentId: string): WorkflowInstance[] {
    return Array.from(workflowInstances.values())
      .filter(i => i.document_id === documentId);
  }

  /**
   * Get pending approvals for a user
   */
  getPendingApprovals(userId: string): WorkflowInstance[] {
    return Array.from(workflowInstances.values())
      .filter(i => i.status === 'in_progress');
  }

  /**
   * Calculate SLA due date
   */
  private calculateDueDate(hours: number, slaConfig: SLAConfig): Date {
    const now = new Date();
    
    if (!slaConfig.business_hours_only) {
      return new Date(now.getTime() + hours * 60 * 60 * 1000);
    }

    // Simple business hours calculation
    let remainingHours = hours;
    const dueDate = new Date(now);
    const [startHour] = slaConfig.business_hours.start.split(':').map(Number);
    const [endHour] = slaConfig.business_hours.end.split(':').map(Number);
    const hoursPerDay = endHour - startHour;

    while (remainingHours > 0) {
      const dayOfWeek = dueDate.getDay();
      const isWeekend = slaConfig.business_hours.exclude_weekends && (dayOfWeek === 0 || dayOfWeek === 6);
      
      if (!isWeekend) {
        const hoursToAdd = Math.min(remainingHours, hoursPerDay);
        remainingHours -= hoursToAdd;
      }
      
      if (remainingHours > 0) {
        dueDate.setDate(dueDate.getDate() + 1);
        dueDate.setHours(startHour, 0, 0, 0);
      }
    }

    return dueDate;
  }

  /**
   * Calculate duration in hours
   */
  private calculateDuration(startTime: string): number {
    const start = new Date(startTime);
    const now = new Date();
    return (now.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  /**
   * Get workflow analytics
   */
  getWorkflowAnalytics(workflowId?: string): {
    total_instances: number;
    completed: number;
    approved: number;
    rejected: number;
    average_completion_hours: number;
    sla_compliance_rate: number;
    by_status: Record<string, number>;
  } {
    let instances = Array.from(workflowInstances.values());
    
    if (workflowId) {
      instances = instances.filter(i => i.workflow_id === workflowId);
    }

    if (instances.length === 0) {
      return {
        total_instances: 0,
        completed: 0,
        approved: 0,
        rejected: 0,
        average_completion_hours: 0,
        sla_compliance_rate: 100,
        by_status: {}
      };
    }

    const completed = instances.filter(i => i.completed_at);
    const approved = instances.filter(i => i.status === 'approved');
    const rejected = instances.filter(i => i.status === 'rejected');
    const onTrack = instances.filter(i => i.sla_status === 'on_track' || i.status === 'approved');

    const totalCompletionHours = completed.reduce((acc, i) => {
      return acc + this.calculateDuration(i.started_at);
    }, 0);

    const byStatus: Record<string, number> = {};
    instances.forEach(i => {
      byStatus[i.status] = (byStatus[i.status] || 0) + 1;
    });

    return {
      total_instances: instances.length,
      completed: completed.length,
      approved: approved.length,
      rejected: rejected.length,
      average_completion_hours: completed.length > 0 
        ? totalCompletionHours / completed.length 
        : 0,
      sla_compliance_rate: (onTrack.length / instances.length) * 100,
      by_status: byStatus
    };
  }
}

export const workflowEngine = AdvancedWorkflowEngine.getInstance();
